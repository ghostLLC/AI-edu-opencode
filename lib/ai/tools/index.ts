import { tool } from 'ai';
import { z } from 'zod';

// Tool Registry: AI 可调用的工具
// 完整实现见 Week 2(配合 lib/kb, lib/progress, lib/assess)

export const tools = {
  search_kb: tool({
    description: '搜索知识库(预设 + 当前会话)',
    parameters: z.object({
      query: z.string().describe('搜索关键词或问题'),
      topK: z.number().int().min(1).max(10).default(3),
    }),
    execute: async ({ query, topK }) => {
      // TODO: 接 lib/kb/search.ts
      return { hits: [], query, topK };
    },
  }),

  update_node_progress: tool({
    description: '更新节点进度',
    parameters: z.object({
      nodeId: z.string().uuid(),
      status: z.enum(['learned', 'practiced', 'mastered']),
      masteryScore: z.number().int().min(0).max(100).optional(),
    }),
    execute: async () => {
      // TODO: 接 lib/progress/tracker.ts
      return { success: true };
    },
  }),

  submit_assessment_artifact: tool({
    description: '提交考核产物',
    parameters: z.object({
      assessmentId: z.string().uuid(),
      type: z.enum(['file', 'screenshot', 'url', 'text']),
      content: z.string().describe('文件 key / URL / 文本内容'),
    }),
    execute: async () => {
      // TODO: 接 lib/assess/artifact-handler.ts
      return { success: true };
    },
  }),

  appeal_assessment_score: tool({
    description: '对某项评分提出复议',
    parameters: z.object({
      scoreId: z.string().uuid(),
      reason: z.string().min(20).describe('复议理由'),
    }),
    execute: async () => {
      // TODO: 接 lib/assess/appeal.ts
      return { success: true };
    },
  }),
};

export type ToolName = keyof typeof tools;
