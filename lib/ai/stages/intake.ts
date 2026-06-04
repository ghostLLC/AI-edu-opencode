/**
 * INTAKE stage: Generate a learning plan from a user's goal, persist
 * the plan + all nodes, return a JSON response (no streaming).
 *
 * Why non-streaming: the client (intake form) wants the final planId
 * + plan JSON, then navigates. Streaming a structured object adds
 * complexity for no UX win at this stage.
 */

import { generateObject, type LanguageModelUsage } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { learningPlans, planNodes } from '@/lib/db/schema';
import { modelProvider } from '../providers';
import { buildIntakeUserPrompt, INTAKE_SYSTEM } from '../prompts/intake';
import { calculateCost } from '../cost-calculator';
import { recordSpend } from '../rate-limiter';
import { getLangfuse } from '@/lib/observability/langfuse';
import type { ModelName } from '../types';

export const INTAKE_NODE_SCHEMA = z.object({
  sequence: z.number().int().min(1).max(50),
  title: z.string().min(5).max(200),
  summary: z.string().min(20).max(500),
  stage: z.enum(['learn', 'practice', 'assess']),
  estimatedMinutes: z.number().int().min(10).max(180),
});

export const INTAKE_PLAN_SCHEMA = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(20).max(1000),
  domain: z.string().min(2).max(50),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedHours: z.number().int().min(5).max(200),
  nodes: z.array(INTAKE_NODE_SCHEMA).min(3).max(12),
});

export type GeneratedPlan = z.infer<typeof INTAKE_PLAN_SCHEMA>;
export type GeneratedNode = z.infer<typeof INTAKE_NODE_SCHEMA>;

export interface IntakeStageOptions {
  userId: string;
  goal: string;
  context?: string | null;
  mode: 'goal_clear' | 'goal_unclear' | 'reskill';
  language: 'en' | 'zh';
  kbSnippets: Array<{ title: string; description: string | null }>;
  model: ModelName;
}

export interface IntakeResult {
  planId: string;
  plan: GeneratedPlan;
  toDataStreamResponse: () => Response;
}

export async function runIntakeStage(opts: IntakeStageOptions): Promise<IntakeResult> {
  const model = modelProvider.languageModel(opts.model);
  const trace = getLangfuse()?.trace({
    name: 'stage:intake',
    userId: opts.userId,
    metadata: { model: opts.model, mode: opts.mode, language: opts.language },
  });

  let plan: GeneratedPlan;
  let usage: LanguageModelUsage;
  try {
    const result = await generateObject({
      model,
      schema: INTAKE_PLAN_SCHEMA,
      system: INTAKE_SYSTEM,
      prompt: buildIntakeUserPrompt({
        goal: opts.goal,
        context: opts.context,
        kbSnippets: opts.kbSnippets,
      }),
    });
    plan = result.object;
    usage = result.usage as LanguageModelUsage;
  } catch (err) {
    console.error('[intake] generateObject failed:', err);
    trace?.update({ metadata: { error: String(err) } });
    throw err;
  }

  // Persist plan + nodes
  const { planId } = await persistPlan({
    userId: opts.userId,
    plan,
    mode: opts.mode,
    language: opts.language,
  });

  // Record cost
  const cost = calculateCost(opts.model, usage);
  await recordSpend(opts.userId, cost, usage);

  // Langfuse
  trace?.update({
    output: { planId, title: plan.title, nodeCount: plan.nodes.length },
    metadata: { cost, promptTokens: usage.promptTokens, completionTokens: usage.completionTokens },
  });

  return {
    planId,
    plan,
    toDataStreamResponse() {
      return new Response(JSON.stringify({ planId, plan }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  };
}

export async function persistPlan(opts: {
  userId: string;
  plan: GeneratedPlan;
  mode: 'goal_clear' | 'goal_unclear' | 'reskill';
  language: 'en' | 'zh';
}): Promise<{ planId: string }> {
  const needProfile = {
    goal: opts.plan.title,
    description: opts.plan.description,
    domain: opts.plan.domain,
    difficulty: opts.plan.difficulty,
    estimatedHours: opts.plan.estimatedHours,
    language: opts.language,
  };

  const [created] = await db
    .insert(learningPlans)
    .values({
      userId: opts.userId,
      title: opts.plan.title,
      description: opts.plan.description,
      mode: opts.mode,
      intakeType: 'goal_clear', // v1 only supports mode 1
      aiCollabType: 'ai_assisted', // default
      needProfile,
      status: 'confirmed', // auto-confirm; user can edit later
      isAIGenerated: true,
      language: opts.language,
    })
    .returning({ id: learningPlans.id });

  if (!created) {
    throw new Error('Failed to create learning plan');
  }

  if (opts.plan.nodes.length > 0) {
    await db.insert(planNodes).values(
      opts.plan.nodes.map((node) => ({
        planId: created.id,
        sequence: node.sequence,
        title: node.title,
        // Embed stage + estimatedMinutes in content jsonb since
        // plan_nodes has no dedicated columns for them.
        content: {
          paragraphs: [node.summary],
          keywords: [],
          examples: [],
          common_misconceptions: [],
          stage: node.stage,
          estimatedMinutes: node.estimatedMinutes,
        },
        keyTakeaways: [],
      })),
    );
  }

  return { planId: created.id };
}
