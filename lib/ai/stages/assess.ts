/**
 * ASSESS stage: Score the user's submission against a rubric, persist
 * per-criterion scores + the assessment outcome.
 *
 * Non-streaming structured output (generateObject): the user is waiting
 * for a verdict, not chatting. A single JSON response with all the
 * scores is the right shape.
 */

import { generateObject, type LanguageModelUsage } from 'ai';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { modelProvider } from '../providers';
import { buildAssessUserPrompt, ASSESS_SYSTEM } from '../prompts/assess';
import { calculateCost } from '../cost-calculator';
import { recordSpend } from '../rate-limiter';
import { db } from '@/lib/db/client';
import { assessmentScores, assessments, chatMessages } from '@/lib/db/schema';
import { getLangfuse } from '@/lib/observability/langfuse';
import type { ModelName, RubricItem } from '../types';
import type { RunContext } from '../context';

export const SCORE_SCHEMA = z.object({
  criterionScores: z.array(
    z.object({
      criterion: z.string().min(1),
      score: z.number().int().min(0).max(100),
      reasoning: z.string().min(10).max(500),
      evidence: z.string().optional(),
    }),
  ),
  totalScore: z.number().int().min(0).max(100),
  passed: z.boolean(),
  overallFeedback: z.string().min(30).max(1000),
});

export type ScoredAssessment = z.infer<typeof SCORE_SCHEMA>;

export interface AssessStageOptions {
  userId: string;
  model: ModelName;
  context: RunContext;
  assessmentId: string;
  rubric: RubricItem[];
  taskTitle: string;
  taskDescription: string;
  submission: string;
}

export interface AssessResult {
  result: ScoredAssessment;
  toDataStreamResponse: () => Response;
}

export async function runAssessStage(opts: AssessStageOptions): Promise<AssessResult> {
  const model = modelProvider.languageModel(opts.model);
  const trace = getLangfuse()?.trace({
    name: 'stage:assess',
    userId: opts.userId,
    metadata: {
      model: opts.model,
      assessmentId: opts.assessmentId,
      planId: opts.context.plan?.id,
    },
  });

  // Persist user's submission as a chat message
  if (opts.context.plan) {
    await db.insert(chatMessages).values({
      userId: opts.userId,
      planId: opts.context.plan.id,
      assessmentId: opts.assessmentId,
      role: 'user',
      content: `[Assessment submission]\n\n${opts.submission}`,
      stage: 'assess',
    });
  }

  // Generate scoring
  let scored: ScoredAssessment;
  let usage: LanguageModelUsage;
  try {
    const result = await generateObject({
      model,
      schema: SCORE_SCHEMA,
      system: ASSESS_SYSTEM,
      prompt: buildAssessUserPrompt({
        taskTitle: opts.taskTitle,
        taskDescription: opts.taskDescription,
        rubric: opts.rubric,
        submission: opts.submission,
      }),
    });
    scored = result.object;
    usage = result.usage as LanguageModelUsage;
  } catch (err) {
    console.error('[assess] generateObject failed:', err);
    trace?.update({ metadata: { error: String(err) } });
    throw err;
  }

  // Persist per-criterion scores
  if (scored.criterionScores.length > 0) {
    await db.insert(assessmentScores).values(
      scored.criterionScores.map((s) => {
        const rubricItem = opts.rubric.find((r) => r.criterion === s.criterion);
        return {
          assessmentId: opts.assessmentId,
          criterion: s.criterion,
          weight: rubricItem?.weight ?? 0,
          score: s.score,
          reasoning: s.reasoning,
          evidence: s.evidence ?? null,
        };
      }),
    );
  }

  // Update assessment row with outcome
  await db
    .update(assessments)
    .set({
      totalScore: scored.totalScore,
      maxScore: 100,
      status: scored.passed ? 'passed' : 'failed',
      scoredAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(assessments.id, opts.assessmentId));

  // Persist overall feedback as assistant chat message
  if (opts.context.plan) {
    await db.insert(chatMessages).values({
      userId: opts.userId,
      planId: opts.context.plan.id,
      assessmentId: opts.assessmentId,
      role: 'assistant',
      content: scored.overallFeedback,
      stage: 'assess',
      model: opts.model,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      traceId: trace?.id ?? null,
    });
  }

  // Cost
  const cost = calculateCost(opts.model, usage);
  await recordSpend(opts.userId, cost, usage);

  trace?.update({
    output: { totalScore: scored.totalScore, passed: scored.passed },
    metadata: { cost, promptTokens: usage.promptTokens, completionTokens: usage.completionTokens },
  });

  return {
    result: scored,
    toDataStreamResponse() {
      return new Response(JSON.stringify(scored), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  };
}
