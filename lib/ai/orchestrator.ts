import { streamText, type LanguageModelUsage } from 'ai';
import { modelProvider } from './providers';
import type { ModelTier, RunStageInput, StreamChunk } from './types';
import { calculateCost, type ModelName } from './cost-calculator';
import { checkBudget } from './rate-limiter';
import { getLangfuse } from '@/lib/observability/langfuse';

function pickModel(stage: RunStageInput['stage'], isCritical: boolean): { id: import('./types').ModelName; tier: ModelTier } {
  const criticalStages: RunStageInput['stage'][] = ['intake', 'assess'];
  if (isCritical || criticalStages.includes(stage)) {
    return { id: 'deepseek-v4-pro', tier: 'pro' };
  }
  return { id: 'deepseek-v4-flash', tier: 'flash' };
}

export async function runStage(input: RunStageInput) {
  // 预算检查
  await checkBudget(input.userId);

  const { id: modelId, tier } = pickModel(input.stage, false);
  const model = modelProvider.languageModel(modelId);

  // Langfuse trace
  const lf = getLangfuse();
  const trace = lf?.trace({
    name: `stage:${input.stage}`,
    userId: input.userId,
    metadata: {
      planId: input.planId,
      stage: input.stage,
      nodeId: input.nodeId,
      assessmentId: input.assessmentId,
      modelId,
      tier,
    },
  });

  // TODO: 加载 context (needProfile + 节点 + KB hits + history)
  // 当前是骨架,直接 echo
  const systemPrompt = `You are an AI tutor in the ${input.stage} stage. User said: ${input.userMessage}`;

  const result = streamText({
    model,
    system: systemPrompt,
    prompt: input.userMessage,
    onFinish: async ({ usage, text, finishReason }) => {
      const cost = calculateCost(modelId as ModelName, usage as LanguageModelUsage);

      if (trace) {
        trace.update({
          output: text,
          metadata: { finishReason, cost },
        });
      }
    },
  });

  return result;
}

export type { StreamChunk, RunStageInput };
