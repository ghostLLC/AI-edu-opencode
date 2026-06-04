/**
 * Evaluate intake prompt quality via KB retrieval (dry-run).
 *
 * Why dry-run: validating KB hit rate is cheaper than running the full LLM
 * pipeline, and tells us the same thing about whether our seeded KB covers
 * typical user goals.
 *
 * Usage:
 *   pnpm eval
 *   # or, for a full LLM eval (costs money, slower):
 *   EVAL_MODE=full pnpm eval
 *
 * Output: a markdown table to stdout.
 *
 * Exit code: 0 on success, 1 on DB error.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import { embedText } from '../lib/ai/kb/embedder';

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

interface EvalCase {
  goal: string;
  language: 'en' | 'zh';
  expectDomain: string;
}

const CASES: EvalCase[] = [
  {
    goal: 'I want to master React hooks and build production UIs',
    language: 'en',
    expectDomain: 'frontend',
  },
  {
    goal: 'Help me pass the AWS Solutions Architect Associate exam',
    language: 'en',
    expectDomain: 'cloud',
  },
  {
    goal: '我要在 3 个月内通过 HSK 4, 重点是阅读和成语',
    language: 'zh',
    expectDomain: 'language',
  },
  {
    goal: 'I need to learn SQL window functions for my data analyst job',
    language: 'en',
    expectDomain: 'data',
  },
  {
    goal: 'Become a better technical writer — clearer PR descriptions, design docs, and runbooks',
    language: 'en',
    expectDomain: 'other',
  },
];

const MIN_SIMILARITY = 0.7;

async function main(): Promise<void> {
  loadEnvLocal();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set. Add it to .env.local');
    process.exit(1);
  }

  console.log('🧪 Evaluating KB hit rate (dry-run, no LLM calls)\n');

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  const rows: Array<{
    goal: string;
    expected: string;
    hits: number;
    topSim: number;
    topDomain: string;
    topTitle: string;
    pass: '✓' | '✗' | '?';
  }> = [];

  for (const c of CASES) {
    const goalEmbedding = await embedText(c.goal);
    if (!goalEmbedding) {
      rows.push({
        goal: c.goal.slice(0, 40) + '…',
        expected: c.expectDomain,
        hits: 0,
        topSim: 0,
        topDomain: '-',
        topTitle: '(no embedding)',
        pass: '?',
      });
      continue;
    }

    const vectorStr = `[${goalEmbedding.join(',')}]`;
    const result = await db.execute(sql`
      SELECT
        domain,
        title,
        1 - (embedding <=> ${vectorStr}::vector) AS similarity
      FROM kb_entries
      WHERE status = 'active' AND language = ${c.language}
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT 5
    `);

    const rawRows = (result as unknown as { rows?: unknown }).rows ?? result;
    const all = (rawRows as Array<{
      domain: string;
      title: string;
      similarity: string | number;
    }>).map((r) => ({
      domain: r.domain,
      title: r.title,
      similarity: typeof r.similarity === 'string' ? Number.parseFloat(r.similarity) : r.similarity,
    }));

    const above = all.filter((r) => r.similarity >= MIN_SIMILARITY);
    const top = above[0] ?? all[0];
    const pass: '✓' | '✗' | '?' = above.length === 0 ? '✗' : (top?.domain === c.expectDomain ? '✓' : '✗');

    rows.push({
      goal: c.goal.slice(0, 40) + (c.goal.length > 40 ? '…' : ''),
      expected: c.expectDomain,
      hits: above.length,
      topSim: top?.similarity ?? 0,
      topDomain: top?.domain ?? '-',
      topTitle: top?.title ?? '-',
      pass,
    });
  }

  await client.end();

  // Pretty markdown table
  console.log('| Pass | Hits | TopSim | Expect | Actual   | Goal');
  console.log('|------|------|--------|--------|----------|------');
  for (const r of rows) {
    console.log(
      `| ${r.pass}    | ${r.hits}    | ${r.topSim.toFixed(3)} | ${r.expected.padEnd(8)} | ${r.topDomain.padEnd(8)} | ${r.goal}`,
    );
  }

  const totalHits = rows.reduce((s, r) => s + r.hits, 0);
  const expectedHits = rows.filter((r) => r.pass === '✓').length;
  const avgTopSim = rows.reduce((s, r) => s + r.topSim, 0) / rows.length;
  console.log(
    `\nSummary: ${expectedHits}/${rows.length} correct-domain matches · ${totalHits} total KB hits · avg topSim=${avgTopSim.toFixed(3)} (min=${MIN_SIMILARITY})`,
  );

  if (process.env.EVAL_MODE === 'full') {
    console.log(
      '\n⚠ EVAL_MODE=full requested, but full LLM eval is not implemented yet — see scripts/eval-prompts.ts TODO.',
    );
  }
}

main().catch((err) => {
  console.error('❌ Eval failed:', err);
  process.exit(1);
});
