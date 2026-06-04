import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema/*',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      process.env.POSTGRES_URL ??
      process.env.POSTGRES_PRISMA_URL ??
      '',
  },
  verbose: true,
  strict: true,
  schemaFilter: ['public'],
  // pgvector 是 customType, 不通过 extensionsFilters 处理
  // HNSW 索引需要在生成的迁移 SQL 里手动追加(见 lib/db/schema/kb.ts 注释)
});
