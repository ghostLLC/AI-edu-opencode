import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 单例 postgres-js 连接
// 在 Vercel 上用 Neon HTTP 时,需改用 @neondatabase/serverless 的 drizzle 适配
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Connection pool
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Neon 不支持 prepared statements
});

export const db = drizzle(client, { schema, logger: process.env.NODE_ENV === 'development' });

export type Database = typeof db;
export { schema };
