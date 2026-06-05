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
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }
  const sql = postgres(url, { max: 1, connect_timeout: 10, ssl: 'require' });
  try {
    const tables = await sql<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log(`📊 Public tables (${tables.length}):`);
    for (const t of tables) console.log(`  - ${t.table_name}`);

    const kbCount = await sql<{ n: number }[]>`SELECT count(*)::int as n FROM kb_entries`;
    console.log(`\n📚 kb_entries count: ${kbCount[0]?.n ?? 0}`);

    await sql.end();
  } catch (e) {
    console.error('❌ FAIL:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}

main();
