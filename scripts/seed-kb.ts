/**
 * Seed the curated KB tier with a few sample entries.
 * Used for local dev and for resetting the demo data.
 *
 * Usage:
 *   pnpm db:seed
 *
 * Idempotent: skips entries with a title that already exists.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import { kbEntries } from '../lib/db/schema';

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

interface SampleEntry {
  domain: string;
  language: string;
  title: string;
  description: string;
  schema: Record<string, unknown>;
  source: 'curated';
}

const SAMPLES: SampleEntry[] = [
  {
    domain: 'frontend',
    language: 'en',
    title: 'React Hooks - useState & useEffect',
    description: 'Foundation hooks for local state and side effects.',
    schema: { type: 'concept', tags: ['react', 'hooks', 'frontend'] },
    source: 'curated',
  },
  {
    domain: 'language',
    language: 'en',
    title: 'Spanish B2 - subjunctive mood',
    description: 'Advanced Spanish grammar for B2-level learners.',
    schema: { type: 'grammar', tags: ['spanish', 'grammar'] },
    source: 'curated',
  },
  {
    domain: 'cloud',
    language: 'en',
    title: 'AWS Solutions Architect - VPC basics',
    description: 'VPC, subnets, route tables, internet gateways.',
    schema: { type: 'concept', tags: ['aws', 'vpc', 'networking'] },
    source: 'curated',
  },
];

async function main(): Promise<void> {
  loadEnvLocal();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set. Add it to .env.local');
    process.exit(1);
  }

  console.log('🌱 Seeding curated KB ...');
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  let inserted = 0;
  let skipped = 0;

  for (const sample of SAMPLES) {
    const existing = await db
      .select({ id: kbEntries.id })
      .from(kbEntries)
      .where(sql`${kbEntries.title} = ${sample.title}`)
      .limit(1);

    if (existing.length > 0) {
      console.log(`  · skip (exists): ${sample.title}`);
      skipped += 1;
      continue;
    }

    await db.insert(kbEntries).values({
      domain: sample.domain,
      language: sample.language,
      title: sample.title,
      description: sample.description,
      schemaJson: sample.schema,
      source: sample.source,
    });
    console.log(`  ✓ inserted: ${sample.title}`);
    inserted += 1;
  }

  await client.end();
  console.log(`✅ Seed complete: ${inserted} inserted, ${skipped} skipped.`);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
