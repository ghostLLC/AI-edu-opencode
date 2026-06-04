import type { LanguageModelUsage } from 'ai';
import type { ModelName } from './types';

// 估算 token 成本(单位:¥,需要按实际 DeepSeek 报价校准)
// DeepSeek-V4 Flash 假设: ¥0.5/M input, ¥2/M output
// DeepSeek-V4 Pro 假设:  ¥2/M input,   ¥8/M output
// Embedding: ¥0.1/M tokens

const PRICING: Record<ModelName, { input: number; output: number }> = {
  'deepseek-v4-flash': { input: 0.5, output: 2 },
  'deepseek-v4-pro': { input: 2, output: 8 },
  'deepseek-v4-embedding': { input: 0.1, output: 0 },
};

export function calculateCost(model: ModelName, usage: LanguageModelUsage): number {
  const pricing = PRICING[model];
  if (!pricing) return 0;
  const inputCost = (usage.promptTokens / 1_000_000) * pricing.input;
  const outputCost = (usage.completionTokens / 1_000_000) * pricing.output;
  return Math.round((inputCost + outputCost) * 10000) / 10000;
}
