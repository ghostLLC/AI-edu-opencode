import { relations } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const learningPlans = pgTable(
  'learning_plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    title: text('title').notNull(),
    description: text('description'),

    // 模式与入口
    mode: text('mode').notNull(), // 'goal_clear' | 'goal_unclear' | 'reskill'
    intakeType: text('intake_type').notNull(),
    aiCollabType: text('ai_collab_type').notNull(), // 'vibe_coding' | 'human_ai_collab' | 'ai_assisted'

    // 需求画像
    needProfile: jsonb('need_profile').notNull(),

    // 状态
    status: text('status').notNull().default('draft'),
    // 'draft' | 'confirmed' | 'in_learn' | 'in_practice' | 'in_assess' | 'completed' | 'archived'

    // KB 来源
    kbEntryId: uuid('kb_entry_id'),
    isAIGenerated: boolean('is_ai_generated').notNull().default(true),

    // 语言
    language: text('language').notNull().default('en'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('plans_user_status_idx').on(t.userId, t.status, t.createdAt.desc()),
    index('plans_kb_idx').on(t.kbEntryId),
    index('plans_completed_idx').on(t.status, t.completedAt),
  ],
);

export type LearningPlan = typeof learningPlans.$inferSelect;
export type NewLearningPlan = typeof learningPlans.$inferInsert;
