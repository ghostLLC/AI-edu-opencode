import { relations } from 'drizzle-orm';
import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { learningPlans } from './plans';

export const planNodes = pgTable(
  'plan_nodes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => learningPlans.id, { onDelete: 'cascade' }),

    sequence: integer('sequence').notNull(),
    title: text('title').notNull(),

    content: jsonb('content').notNull(),
    // {
    //   paragraphs: string[];
    //   keywords: { term: string; definition: string }[];
    //   examples: { scenario: string; explanation: string }[];
    //   common_misconceptions: string[];
    // }

    sourceKbEntryId: uuid('source_kb_entry_id'),
    keyTakeaways: jsonb('key_takeaways'), // string[]

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('nodes_plan_seq_idx').on(t.planId, t.sequence)],
);

export type PlanNode = typeof planNodes.$inferSelect;
export type NewPlanNode = typeof planNodes.$inferInsert;
