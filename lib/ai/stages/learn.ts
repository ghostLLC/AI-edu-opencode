/**
 * LEARN stage: Socratic dialogue for the current learning node.
 *
 * Streaming text response (streamText) so the tutor types in real time.
 * Persistence happens in onFinish (fire-and-forget from the client's view).
 */

import { streamText, type LanguageModelUsage } from 'ai';
import { modelProvider } from '../providers';
import { buildLearnUserPrompt, LEARN_SYSTEM } from '../prompts/learn';
import { calculateCost } from '../cost-calculator';
import { recordSpend } from '../rate-limiter';
import { getLangfuse } from '@/lib/observability/langfuse';
import { saveAssistantMessage, saveUserMessage } from './message-store';
import type { ModelName } from '../types';
import type { RunContext } from '../context';

export interface LearnStageOptions {
  userId: string;
  model: ModelName;
  context: RunContext;
  userMessage: string;
}

export async function runLearnStage(opts: LearnStageOptions) {
  if (!opts.context.currentNode) {
    throw new Error('Learn stage requires a current node (nodeId must be set)');
  }
  if (!opts.context.plan) {
    throw new Error('Learn stage requires an existing plan (planId must be set)');
  }

  const model = modelProvider.languageModel(opts.model);
  const trace = getLangfuse()?.trace({
    name: 'stage:learn',
    userId: opts.userId,
    metadata: {
      model: opts.model,
      nodeId: opts.context.currentNode.id,
      planId: opts.context.plan.id,
    },
  });

  // Persist the user's message first (so even if the AI fails we have
  // a record of what was asked).
  await saveUserMessage({
    userId: opts.userId,
    planId: opts.context.plan.id,
    nodeId: opts.context.currentNode.id,
    stage: 'learn',
    content: opts.userMessage,
  });

  const result = streamText({
    model,
    system: LEARN_SYSTEM,
    prompt: buildLearnUserPrompt({
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
          stage: 'learn',
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
        console.error('[learn] onFinish persistence failed:', err);
        trace?.update({ metadata: { onFinishError: String(err) } });
      }
    },
  });

  return result;
}
