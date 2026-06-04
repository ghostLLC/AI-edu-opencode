/**
 * AI Orchestrator: single entry point for all 4 stages.
 *
 * Contract:
 *   runStage(input) -> { toDataStreamResponse(): Response }
 *
 * The API route at app/api/chat/route.ts relies on this shape.
 *
 * Dispatch:
 *   intake  -> generateObject (Pro)        -> JSON plan + planId
 *   learn   -> streamText     (Flash)       -> streaming Socratic reply
 *   practice-> streamText     (Flash)       -> streaming task/feedback
 *   assess  -> generateObject (Pro)        -> JSON scores + verdict
 */

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { assessments } from '@/lib/db/schema';
import { loadContext } from './context';
import type { RunContext } from './context';
import { retrieveKB } from './kb/retriever';
import { runIntakeStage } from './stages/intake';
import { runLearnStage } from './stages/learn';
import { runPracticeStage } from './stages/practice';
import { runAssessStage } from './stages/assess';
import { BudgetExceededError, checkBudget } from './rate-limiter';
import { flushLangfuse } from '@/lib/observability/langfuse';
import type { ModelName, RunStageInput, Stage } from './types';

const PRO_MODEL: ModelName = 'deepseek-v4-pro';
const FLASH_MODEL: ModelName = 'deepseek-v4-flash';

function pickModel(stage: Stage): ModelName {
  // Pro for high-stakes planning and assessment; Flash for interactive tutoring.
  return stage === 'intake' || stage === 'assess' ? PRO_MODEL : FLASH_MODEL;
}

export async function runStage(input: RunStageInput) {
  // 1. Budget gate (throws BudgetExceededError)
  try {
    await checkBudget(input.userId);
  } catch (err) {
    if (err instanceof BudgetExceededError) {
      return budgetExceededResponse(err.message);
    }
    throw err;
  }

  // 2. Load per-run context (user, plan?, node?, history)
  const context = await loadContext({
    userId: input.userId,
    planId: input.planId || undefined,
    nodeId: input.nodeId || undefined,
  });

  // 3. Pick model
  const model = pickModel(input.stage);

  try {
    switch (input.stage) {
      case 'intake':
        return await runIntakeWithKB(input, context, model);

      case 'learn':
        return await runLearnStage({
          userId: input.userId,
          model,
          context,
          userMessage: input.userMessage,
        });

      case 'practice':
        return await runPracticeStage({
          userId: input.userId,
          model,
          context,
          userMessage: input.userMessage,
        });

      case 'assess':
        return await runAssessWithAssessment(input, context, model);

      default: {
        const _exhaustive: never = input.stage;
        throw new Error(`Unknown stage: ${String(_exhaustive)}`);
      }
    }
  } finally {
    // Best-effort flush for any Langfuse events created during the call.
    void flushLangfuse();
  }
}

async function runIntakeWithKB(
  input: RunStageInput,
  context: RunContext,
  model: ModelName,
) {
  // Pre-retrieve KB inspiration based on the user's goal.
  // If the embedding API or pgvector is unavailable, we just run without KB hints.
  const kbHits = await retrieveKB({
    query: input.userMessage,
    language: context.user.language,
    topK: 5,
    minSimilarity: 0.6,
  });

  return runIntakeStage({
    userId: input.userId,
    goal: input.userMessage,
    context: null,
    mode: context.user.mode,
    language: context.user.language,
    kbSnippets: kbHits.map((k) => ({ title: k.title, description: k.description })),
    model,
  });
}

async function runAssessWithAssessment(
  input: RunStageInput,
  context: RunContext,
  model: ModelName,
) {
  if (!input.assessmentId) {
    throw new Error('Assess stage requires assessmentId');
  }

  const [assessment] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, input.assessmentId))
    .limit(1);

  if (!assessment) {
    throw new Error(`Assessment not found: ${input.assessmentId}`);
  }

  return runAssessStage({
    userId: input.userId,
    model,
    context,
    assessmentId: input.assessmentId,
    rubric: assessment.rubric as unknown as import('./types').RubricItem[],
    taskTitle: assessment.taskTitle,
    taskDescription: assessment.taskDescription,
    // For assess, the userMessage IS the submission text.
    submission: input.userMessage,
  });
}

function budgetExceededResponse(message: string) {
  return {
    toDataStreamResponse() {
      return new Response(JSON.stringify({ error: 'budget_exceeded', message }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  };
}

export type { RunStageInput } from './types';
export type { RunContext } from './context';
export { BudgetExceededError };
