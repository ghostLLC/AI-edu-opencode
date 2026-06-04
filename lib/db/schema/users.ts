import { sql } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  name: text('name'),
  image: text('image'),

  // 用户偏好
  language: text('language').notNull().default('en'), // 'en' | 'zh'
  mode: text('mode').notNull().default('goal_clear'), // 'goal_clear' | 'goal_unclear' | 'reskill'

  // 状态
  isActive: boolean('is_active').notNull().default(true),
  onboardedAt: timestamp('onboarded_at', { withTimezone: true }),

  // v2 预留
  tenantId: uuid('tenant_id'),
  capabilitySnapshot: jsonb('capability_snapshot'),

  // 凭证(Credentials provider 用)
  passwordHash: text('password_hash'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
