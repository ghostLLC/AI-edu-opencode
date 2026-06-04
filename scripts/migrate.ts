/**
 * Run pending Drizzle migrations against DATABASE_URL.
 *
 * Usage:
 *   pnpm db:migrate
 *
 * Prerequisite:
 *   - DATABASE_URL set in .env.local (or your shell env)
 *   - Migration files generated via `pnpm db:generate`
 *
 * The script auto-loads .env.local if DATABASE_URL is not already in process.env.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

function loadEnvLocal(): void {
  if (process.env.DATABASE_URL) return;
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf-8');
  for (const rawLine of content.split('\n')) {
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

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set. Add it to .env.local');
    process.exit(1);
  }

  console.log('🔄 Running migrations from lib/db/migrations ...');
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  await client.end();
  console.log('✅ Migrations complete.');
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
