import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { customProvider } from 'ai';

// DeepSeek API 兼容 OpenAI 格式
const deepseek = createOpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// 备用
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const modelProvider = customProvider({
  languageModels: {
    'deepseek-v4-flash': deepseek('deepseek-v4-flash'),
    'deepseek-v4-pro': deepseek('deepseek-v4-pro'),
    'claude-sonnet': anthropic('claude-sonnet-4-5'),
  },
  textEmbeddingModels: {
    'deepseek-embedding': deepseek.textEmbeddingModel('bge-m3'),
  },
  fallbackProvider: anthropic,
});

export type ModelId = keyof typeof modelProvider.languageModel;
