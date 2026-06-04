import { customType, index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// pgvector 自定义类型
const vector = (name: string, dimensions: number) =>
  customType<{ data: number[]; driverData: string }>({
    dataType() {
      return `vector(${dimensions})`;
    },
    toDriver(value: number[]) {
      return `[${value.join(',')}]`;
    },
    fromDriver(value: string) {
      return value.slice(1, -1).split(',').map(Number);
    },
  })(name);

export const kbEntries = pgTable(
  'kb_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    domain: text('domain').notNull(),
    language: text('language').notNull(),

    title: text('title').notNull(),
    description: text('description'),

    schemaJson: jsonb('schema_json').notNull(),
    refAnswerJson: jsonb('ref_answer_json'),
    rubricJson: jsonb('rubric_json'),

    embedding: vector('embedding', 1024),

    qualityScore: integer('quality_score').notNull().default(70),
    usageCount: integer('usage_count').notNull().default(0),
    contributorId: uuid('contributor_id'),
    source: text('source').notNull().default('curated'), // 'curated' | 'ai_promoted' | 'community'

    status: text('status').notNull().default('active'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // 注意: HNSW 索引需要在迁移 SQL 里手动加(见 drizzle 文档)
    // CREATE INDEX kb_entries_embedding_hnsw ON kb_entries USING hnsw (embedding vector_cosine_ops);
    index('kb_domain_lang_status_idx').on(t.domain, t.language, t.status),
    index('kb_usage_idx').on(t.usageCount.desc()),
    index('kb_quality_idx').on(t.qualityScore.desc()),
  ],
);

export const kbTier2Sessions = pgTable('kb_tier2_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').notNull(),

  schemaJson: jsonb('schema_json').notNull(),
  refAnswerJson: jsonb('ref_answer_json'),
  rubricJson: jsonb('rubric_json'),

  promoteCandidate: text('promote_candidate').notNull().default('false'),
  promotionScore: integer('promotion_score'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});

export type KBEntry = typeof kbEntries.$inferSelect;
export type NewKBEntry = typeof kbEntries.$inferInsert;
export type KBTier2Session = typeof kbTier2Sessions.$inferSelect;
