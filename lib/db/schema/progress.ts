import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { learningPlans } from './plans';
import { planNodes } from './nodes';
import { users } from './users';

export const nodeProgress = pgTable(
  'node_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => learningPlans.id, { onDelete: 'cascade' }),
    nodeId: uuid('node_id')
      .notNull()
      .references(() => planNodes.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    stage: text('stage').notNull(), // 'learn' | 'practice'
    status: text('status').notNull().default('in_progress'),
    // 'in_progress' | 'learned' | 'practiced' | 'mastered'

    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),

    masteryScore: integer('mastery_score'),

    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('progress_unique_idx').on(t.userId, t.planId, t.nodeId),
    index('progress_plan_status_idx').on(t.planId, t.status),
  ],
);

export type NodeProgress = typeof nodeProgress.$inferSelect;
export type NewNodeProgress = typeof nodeProgress.$inferInsert;
