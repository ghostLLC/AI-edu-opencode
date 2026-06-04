import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userStats = pgTable('user_stats', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),

  totalPlans: integer('total_plans').notNull().default(0),
  completedPlans: integer('completed_plans').notNull().default(0),
  totalAssessments: integer('total_assessments').notNull().default(0),
  passedAssessments: integer('passed_assessments').notNull().default(0),
  totalAiCalls: integer('total_ai_calls').notNull().default(0),
  totalTokensUsed: integer('total_tokens_used').notNull().default(0),

  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type UserStats = typeof userStats.$inferSelect;
