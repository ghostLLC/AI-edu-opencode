import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { learningPlans } from './plans';
import { users } from './users';

export const chatMessages = pgTable(
  'chat_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id').references(() => learningPlans.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    role: text('role').notNull(), // 'user' | 'assistant' | 'system'
    content: text('content').notNull(),

    stage: text('stage').notNull(), // 'intake' | 'learn' | 'practice' | 'assess'
    nodeId: uuid('node_id'),
    assessmentId: uuid('assessment_id'),

    // AI 元数据
    model: text('model'),
    promptTokens: integer('prompt_tokens'),
    completionTokens: integer('completion_tokens'),
    latencyMs: integer('latency_ms'),
    traceId: text('trace_id'),

    feedback: text('feedback'), // 'good' | 'bad' | null

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('messages_plan_stage_idx').on(t.planId, t.stage, t.createdAt),
    index('messages_user_idx').on(t.userId, t.createdAt.desc()),
    index('messages_trace_idx').on(t.traceId),
  ],
);

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
