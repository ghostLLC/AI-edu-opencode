import type { LanguageModelUsage } from 'ai';

export type Stage = 'intake' | 'learn' | 'practice' | 'assess';
export type ModelTier = 'flash' | 'pro';
export type ModelName = 'deepseek-v4-flash' | 'deepseek-v4-pro' | 'deepseek-v4-embedding';

export interface RunStageInput {
  userId: string;
  planId: string;
  stage: Stage;
  nodeId?: string;
  assessmentId?: string;
  userMessage: string;
  citation?: { keyword: string; nodeId: string };
}

export interface NeedProfile {
  goal: string;
  context: string;
  constraints: string[];
  success_criteria: string[];
  domain: string;
  language: 'en' | 'zh';
  ai_collab_type?: 'vibe_coding' | 'human_ai_collab' | 'ai_assisted';
}

export interface RubricItem {
  criterion: string;
  weight: number;
  pass_threshold: number;
}

export interface KBEntry {
  id: string;
  domain: string;
  language: 'en' | 'zh';
  title: string;
  description: string | null;
  schema_json: unknown;
  ref_answer_json: unknown | null;
  rubric_json: RubricItem[] | null;
  quality_score: number;
  usage_count: number;
  status: 'active' | 'deprecated' | 'draft';
}

export interface StreamChunk {
  type: 'message' | 'tool_call' | 'tool_result' | 'error' | 'done';
  content?: string;
  name?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  message?: string;
  trace_id?: string;
  tokens?: LanguageModelUsage;
}

export interface PlanNodeContent {
  paragraphs: string[];
  keywords: { term: string; definition: string }[];
  examples: { scenario: string; explanation: string }[];
  common_misconceptions: string[];
}
