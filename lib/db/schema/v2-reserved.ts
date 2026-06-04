import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { learningPlans } from './plans';
import { users } from './users';

// v2 预留:模式 2(无目标)对话历史
export const intakeSessions = pgTable('intake_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  messages: jsonb('messages').notNull(),
  suggestedDirections: jsonb('suggested_directions'),
  selectedDirection: jsonb('selected_direction'),

  generatedPlanId: uuid('generated_plan_id').references(() => learningPlans.id),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

// v2 预留:模式 3(技能重塑)能力评估
export const capabilityAssessments = pgTable('capability_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  domain: text('domain').notNull(),
  currentState: jsonb('current_state').notNull(),

  targetCapabilityId: uuid('target_capability_id'),
  generatedPlanId: uuid('generated_plan_id').references(() => learningPlans.id),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// v2 预留:目标能力模板
export const targetCapabilities = pgTable('target_capabilities', {
  id: uuid('id').primaryKey().defaultRandom(),

  domain: text('domain').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  requiredSkills: jsonb('required_skills').notNull(),
  reskillingPath: jsonb('reskilling_path'),

  language: text('language').notNull().default('en'),
  status: text('status').notNull().default('active'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
