/**
 * PRACTICE stage: Generate a practice task (or give feedback on a
 * submission) for the current node. Streaming text.
 */

import { streamText, type LanguageModelUsage } from 'ai';
import { modelProvider } from '../providers';
import { buildPracticeUserPrompt, PRACTICE_SYSTEM } from '../prompts/practice';
import { calculateCost } from '../cost-calculator';
import { recordSpend } from '../rate-limiter';
import { getLangfuse } from '@/lib/observability/langfuse';
import { saveAssistantMessage, saveUserMessage } from './message-store';
import type { ModelName } from '../types';
import type { RunContext } from '../context';

export interface PracticeStageOptions {
  userId: string;
  model: ModelName;
  context: RunContext;
  userMessage: string;
}

export async function runPracticeStage(opts: PracticeStageOptions) {
  if (!opts.context.currentNode) {
    throw new Error('Practice stage requires a current node (nodeId must be set)');
  }
  if (!opts.context.plan) {
    throw new Error('Practice stage requires an existing plan (planId must be set)');
  }

  const model = modelProvider.languageModel(opts.model);
  const trace = getLangfuse()?.trace({
    name: 'stage:practice',
    userId: opts.userId,
    metadata: {
      model: opts.model,
      nodeId: opts.context.currentNode.id,
      planId: opts.context.plan.id,
    },
  });

  await saveUserMessage({
    userId: opts.userId,
    planId: opts.context.plan.id,
    nodeId: opts.context.currentNode.id,
    stage: 'practice',
    content: opts.userMessage,
  });

  const result = streamText({
    model,
    system: PRACTICE_SYSTEM,
    prompt: buildPracticeUserPrompt({
      nodeTitle: opts.context.currentNode.title,
      nodeSummary: opts.context.currentNode.summary,
      userMessage: opts.userMessage,
      history: opts.context.history,
    }),
    onFinish: async ({ text, usage, finishReason }) => {
      try {
        const typedUsage = usage as LanguageModelUsage;
        const cost = calculateCost(opts.model, typedUsage);

        await saveAssistantMessage({
          userId: opts.userId,
          planId: opts.context.plan!.id,
          nodeId: opts.context.currentNode!.id,
          stage: 'practice',
          content: text,
          model: opts.model,
          usage: typedUsage,
          traceId: trace?.id,
        });

        await recordSpend(opts.userId, cost, typedUsage);

        trace?.update({
          output: text,
          metadata: { finishReason, cost, promptTokens: typedUsage.promptTokens, completionTokens: typedUsage.completionTokens },
        });
      } catch (err) {
        console.error('[practice] onFinish persistence failed:', err);
        trace?.update({ metadata: { onFinishError: String(err) } });
      }
    },
  });

  return result;
}
