import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { learningPlans } from './plans';
import { users } from './users';

export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id')
    .notNull()
    .references(() => learningPlans.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  taskTitle: text('task_title').notNull(),
  taskDescription: text('task_description').notNull(),
  deliverableType: text('deliverable_type').notNull(), // 'web' | 'app' | 'doc' | 'code' | 'other'
  timeEstimate: text('time_estimate'),

  rubric: jsonb('rubric').notNull(),
  // RubricItem[]

  refKbEntryId: uuid('ref_kb_entry_id'),

  status: text('status').notNull().default('pending'),
  // 'pending' | 'in_progress' | 'submitted' | 'scored' | 'passed' | 'failed' | 'appealed'

  totalScore: integer('total_score'),
  maxScore: integer('max_score'),
  passedAt: timestamp('passed_at', { withTimezone: true }),

  appealCount: integer('appeal_count').notNull().default(0),
  stuckCount: integer('stuck_count').notNull().default(0),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  scoredAt: timestamp('scored_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const assessmentArtifacts = pgTable('assessment_artifacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  type: text('type').notNull(), // 'file' | 'screenshot' | 'url' | 'text'
  r2Key: text('r2_key'),
  mimeType: text('mime_type'),
  sizeBytes: integer('size_bytes'),
  textContent: text('text_content'),

  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
});

export const assessmentScores = pgTable('assessment_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),

  criterion: text('criterion').notNull(),
  weight: integer('weight').notNull(),
  score: integer('score').notNull(),
  reasoning: text('reasoning').notNull(),
  evidence: text('evidence'),

  isAppealed: text('is_appealed').notNull().default('false'),
  appealResult: text('appeal_result'), // 'upheld' | 'revised' | null

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Assessment = typeof assessments.$inferSelect;
export type AssessmentArtifact = typeof assessmentArtifacts.$inferSelect;
export type AssessmentScore = typeof assessmentScores.$inferSelect;
