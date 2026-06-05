/**
 * Enable the pgvector extension on the Neon database.
 * Run once after provisioning: pnpm tsx scripts/enable-pgvector.ts
 *
 * Vercel Postgres / Neon marketplace integrations don't auto-enable pgvector.
 * The pgvector extension must be created before running migrations (the
 * migration SQL uses `vector(1024)` and HNSW indexes which require it).
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postgres from 'postgres';

function loadEnvLocal(): void {
  if (process.env.DATABASE_URL) return;
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  for (const rawLine of readFileSync(envPath, 'utf-8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = value;
  }
}

async function main(): Promise<void> {
  loadEnvLocal();
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL not set (run `vercel env pull` first)');
    process.exit(1);
  }
  const sql = postgres(url, { max: 1, connect_timeout: 10, ssl: 'require' });
  try {
    console.log('🔌 Connecting to Neon...');
    await sql.unsafe('CREATE EXTENSION IF NOT EXISTS vector');
    console.log('✅ CREATE EXTENSION vector OK');
    const ext = await sql<{ extname: string; extversion: string }[]>`
      SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'
    `;
    console.log('   Extension:', ext);
    await sql.end();
  } catch (e) {
    console.error('❌ FAIL:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}

main();
