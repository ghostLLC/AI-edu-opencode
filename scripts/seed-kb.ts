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
import { embedText } from '../lib/ai/kb/embedder';

function loadEnvLocal(): void {
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) return;
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
  // === Frontend ===
  {
    domain: 'frontend',
    language: 'en',
    title: 'React Hooks - useState & useEffect',
    description: 'Foundation hooks for local state and side effects. Cover dependency arrays, cleanup, and stale closures.',
    schema: {
      type: 'concept',
      tags: ['react', 'hooks', 'frontend'],
      estimatedHours: 4,
      samplePlan: {
        title: 'Master React Hooks Fundamentals',
        nodes: [
          { stage: 'learn', title: 'useState: local state and immutability', estimatedMinutes: 30 },
          { stage: 'learn', title: 'useEffect: side effects and cleanup', estimatedMinutes: 45 },
          { stage: 'learn', title: 'Dependency array semantics and stale closures', estimatedMinutes: 30 },
          { stage: 'learn', title: 'Custom hooks: extract reusable logic', estimatedMinutes: 45 },
          { stage: 'practice', title: 'Build a counter with persistence', estimatedMinutes: 30 },
          { stage: 'practice', title: 'Build a debounced search input', estimatedMinutes: 45 },
          { stage: 'practice', title: 'Build a useFetch custom hook', estimatedMinutes: 60 },
          { stage: 'assess', title: 'Refactor a class component to hooks', estimatedMinutes: 60 },
        ],
      },
    },
    source: 'curated',
  },
  {
    domain: 'frontend',
    language: 'en',
    title: 'Vue 3 Composition API - ref, computed, watch',
    description: 'Reactive primitives and lifecycle in Vue 3. Compare with React hooks mental model.',
    schema: {
      type: 'concept',
      tags: ['vue', 'composition-api', 'frontend'],
      estimatedHours: 5,
      samplePlan: {
        title: 'Vue 3 Composition API in Practice',
        nodes: [
          { stage: 'learn', title: 'ref vs reactive: when to use which', estimatedMinutes: 30 },
          { stage: 'learn', title: 'computed: derived state with caching', estimatedMinutes: 30 },
          { stage: 'learn', title: 'watch and watchEffect: side effects', estimatedMinutes: 45 },
          { stage: 'learn', title: 'Composables: composable functions', estimatedMinutes: 45 },
          { stage: 'practice', title: 'Build a todo app with composables', estimatedMinutes: 60 },
          { stage: 'practice', title: 'Build a form composable with validation', estimatedMinutes: 60 },
          { stage: 'assess', title: 'Migrate an Options API component', estimatedMinutes: 60 },
        ],
      },
    },
    source: 'curated',
  },
  // === Language ===
  {
    domain: 'language',
    language: 'en',
    title: 'Spanish B2 - subjunctive mood',
    description: 'Advanced Spanish grammar for B2-level learners. Cover WEIRDO trigger phrases and common errors.',
    schema: {
      type: 'grammar',
      tags: ['spanish', 'grammar', 'b2'],
      estimatedHours: 6,
      samplePlan: {
        title: 'Master Spanish Subjunctive',
        nodes: [
          { stage: 'learn', title: 'Indicative vs subjunctive: core distinction', estimatedMinutes: 30 },
          { stage: 'learn', title: 'WEIRDO trigger phrases (Wish, Emotion, Influence...)', estimatedMinutes: 45 },
          { stage: 'learn', title: 'Past subjunctive: imperfect and pluperfect', estimatedMinutes: 45 },
          { stage: 'learn', title: 'Common errors: indicative contamination', estimatedMinutes: 30 },
          { stage: 'practice', title: 'Fill-in-the-blank: 30 trigger sentences', estimatedMinutes: 45 },
          { stage: 'practice', title: 'Rewrite email using subjunctive in 5 places', estimatedMinutes: 45 },
          { stage: 'practice', title: 'Role-play: convince a friend to travel', estimatedMinutes: 30 },
          { stage: 'assess', title: 'Write a 200-word opinion piece using 8+ subjunctive forms', estimatedMinutes: 45 },
        ],
      },
    },
    source: 'curated',
  },
  {
    domain: 'language',
    language: 'zh',
    title: 'Mandarin HSK 4 - 成语 (Chinese idioms)',
    description: 'Top 50 four-character idioms for HSK 4. Cover story origins, common usage, and tone variations.',
    schema: {
      type: 'vocabulary',
      tags: ['mandarin', 'idioms', 'hsk4'],
      estimatedHours: 8,
      samplePlan: {
        title: '掌握 50 个 HSK 4 必备成语',
        nodes: [
          { stage: 'learn', title: '成语结构: 典故型 + 比喻型 + 谐音型', estimatedMinutes: 45 },
          { stage: 'learn', title: '前 10 个高频成语: 画蛇添足、对牛弹琴...', estimatedMinutes: 60 },
          { stage: 'learn', title: '中间 20 个: 卧虎藏龙、塞翁失马...', estimatedMinutes: 60 },
          { stage: 'learn', title: '后 20 个: 守株待兔、杯弓蛇影...', estimatedMinutes: 60 },
          { stage: 'practice', title: '每日造句 5 个成语,坚持 10 天', estimatedMinutes: 60 },
          { stage: 'practice', title: '阅读短文,标出所有成语并解释', estimatedMinutes: 45 },
          { stage: 'assess', title: '写作 300 字,必须用 8 个以上成语', estimatedMinutes: 60 },
        ],
      },
    },
    source: 'curated',
  },
  // === Cloud ===
  {
    domain: 'cloud',
    language: 'en',
    title: 'AWS Solutions Architect - VPC basics',
    description: 'VPC, subnets (public/private), route tables, internet gateways, NAT. Hands-on: build a 3-tier VPC.',
    schema: {
      type: 'concept',
      tags: ['aws', 'vpc', 'networking'],
      estimatedHours: 6,
      samplePlan: {
        title: 'Build a Production-Grade AWS VPC',
        nodes: [
          { stage: 'learn', title: 'VPC CIDR planning and IP allocation', estimatedMinutes: 30 },
          { stage: 'learn', title: 'Subnets: public, private, isolated', estimatedMinutes: 45 },
          { stage: 'learn', title: 'Route tables and Internet Gateway', estimatedMinutes: 30 },
          { stage: 'learn', title: 'NAT Gateway vs NAT Instance', estimatedMinutes: 30 },
          { stage: 'learn', title: 'Network ACLs vs Security Groups', estimatedMinutes: 30 },
          { stage: 'practice', title: 'Design a /16 VPC for 3 AZs', estimatedMinutes: 60 },
          { stage: 'practice', title: 'Deploy a 3-tier web app across public/private subnets', estimatedMinutes: 90 },
          { stage: 'assess', title: 'Architecture review: identify VPC design flaws in a sample diagram', estimatedMinutes: 60 },
        ],
      },
    },
    source: 'curated',
  },
  // === Data ===
  {
    domain: 'data',
    language: 'en',
    title: 'SQL fundamentals - JOINs & window functions',
    description: 'INNER/LEFT/RIGHT/FULL JOIN, GROUP BY, ROW_NUMBER, RANK, LAG/LEAD. 20 practice queries on a sample schema.',
    schema: {
      type: 'skill',
      tags: ['sql', 'joins', 'window-functions'],
      estimatedHours: 8,
      samplePlan: {
        title: 'SQL for Data Analysis',
        nodes: [
          { stage: 'learn', title: 'JOIN fundamentals: INNER, LEFT, RIGHT, FULL', estimatedMinutes: 45 },
          { stage: 'learn', title: 'GROUP BY and HAVING', estimatedMinutes: 30 },
          { stage: 'learn', title: 'Window functions: ROW_NUMBER, RANK, DENSE_RANK', estimatedMinutes: 60 },
          { stage: 'learn', title: 'LAG, LEAD, NTILE for time-series analysis', estimatedMinutes: 45 },
          { stage: 'practice', title: 'Write 10 JOIN queries on a sample e-commerce schema', estimatedMinutes: 60 },
          { stage: 'practice', title: 'Solve 5 window function challenges', estimatedMinutes: 60 },
          { stage: 'practice', title: 'Optimize a slow query using EXPLAIN ANALYZE', estimatedMinutes: 45 },
          { stage: 'assess', title: 'Write 5 analytical queries from a business spec', estimatedMinutes: 90 },
        ],
      },
    },
    source: 'curated',
  },
  {
    domain: 'data',
    language: 'en',
    title: 'Python pandas - data cleaning pipeline',
    description: 'Load CSVs/Parquet, handle nulls, types, duplicates, joins, groupby, export. Real Kaggle dataset.',
    schema: {
      type: 'skill',
      tags: ['python', 'pandas', 'data-cleaning'],
      estimatedHours: 10,
      samplePlan: {
        title: 'Build a Robust Data Cleaning Pipeline',
        nodes: [
          { stage: 'learn', title: 'Loading data: read_csv, read_parquet, read_sql', estimatedMinutes: 30 },
          { stage: 'learn', title: 'DataFrame inspection: head, info, describe, dtypes', estimatedMinutes: 30 },
          { stage: 'learn', title: 'Handling nulls: dropna, fillna, interpolate', estimatedMinutes: 45 },
          { stage: 'learn', title: 'Type conversion and categorical encoding', estimatedMinutes: 45 },
          { stage: 'learn', title: 'Merging, joining, concatenating', estimatedMinutes: 45 },
          { stage: 'practice', title: 'Clean a messy Kaggle dataset (10k+ rows)', estimatedMinutes: 90 },
          { stage: 'practice', title: 'Build a reusable cleaning function with validation', estimatedMinutes: 60 },
          { stage: 'assess', title: 'Take a dirty CSV to clean analysis-ready Parquet', estimatedMinutes: 90 },
        ],
      },
    },
    source: 'curated',
  },
  // === Math ===
  {
    domain: 'math',
    language: 'en',
    title: 'Linear algebra - eigenvalues & eigenvectors',
    description: 'Geometric intuition, characteristic polynomial, diagonalization. Application to PCA.',
    schema: {
      type: 'concept',
      tags: ['linear-algebra', 'eigenvalues', 'math'],
      estimatedHours: 5,
      samplePlan: {
        title: 'Eigenvalues and Eigenvectors from Scratch',
        nodes: [
          { stage: 'learn', title: 'Linear transformations: matrix as a function', estimatedMinutes: 30 },
          { stage: 'learn', title: 'Eigenvectors: vectors that keep their direction', estimatedMinutes: 45 },
          { stage: 'learn', title: 'Characteristic polynomial det(A - λI) = 0', estimatedMinutes: 45 },
          { stage: 'learn', title: 'Diagonalization and its meaning', estimatedMinutes: 45 },
          { stage: 'learn', title: 'PCA: how eigenvectors become principal components', estimatedMinutes: 30 },
          { stage: 'practice', title: 'Compute eigenvalues for 5 small matrices by hand', estimatedMinutes: 60 },
          { stage: 'practice', title: 'Implement PCA from scratch in NumPy', estimatedMinutes: 60 },
          { stage: 'assess', title: 'Apply PCA to a 5D dataset, explain top 2 components', estimatedMinutes: 60 },
        ],
      },
    },
    source: 'curated',
  },
  // === Writing / Communication ===
  {
    domain: 'other',
    language: 'en',
    title: 'Technical writing - structure & clarity',
    description: 'Audience analysis, outline-first writing, plain-language rewrite, code comment hygiene. PR descriptions, design docs, runbooks.',
    schema: {
      type: 'skill',
      tags: ['writing', 'technical', 'communication'],
      estimatedHours: 4,
      samplePlan: {
        title: 'Write Clear, Useful Technical Documents',
        nodes: [
          { stage: 'learn', title: 'Audience analysis: who reads this and why', estimatedMinutes: 30 },
          { stage: 'learn', title: 'Outline-first writing: structure before prose', estimatedMinutes: 30 },
          { stage: 'learn', title: 'Plain language: replace jargon with concrete words', estimatedMinutes: 30 },
          { stage: 'learn', title: 'Code comments: why, not what', estimatedMinutes: 30 },
          { stage: 'practice', title: 'Rewrite a 200-word technical paragraph for clarity', estimatedMinutes: 45 },
          { stage: 'practice', title: 'Write a design doc for a hypothetical feature', estimatedMinutes: 60 },
          { stage: 'assess', title: 'Edit a real README to industry-clarity standards', estimatedMinutes: 45 },
        ],
      },
    },
    source: 'curated',
  },
  {
    domain: 'other',
    language: 'en',
    title: 'Public speaking - storytelling structure',
    description: 'Hook, problem, journey, insight, call-to-action. 5-min and 20-min variants. Confident delivery, handling Q&A.',
    schema: {
      type: 'skill',
      tags: ['public-speaking', 'storytelling', 'communication'],
      estimatedHours: 4,
      samplePlan: {
        title: 'Speak with a Clear Story Arc',
        nodes: [
          { stage: 'learn', title: 'The 5-act story arc for technical talks', estimatedMinutes: 30 },
          { stage: 'learn', title: 'Hook in 30 seconds: open with a question or surprising fact', estimatedMinutes: 30 },
          { stage: 'learn', title: 'Pacing: pauses, emphasis, breathing', estimatedMinutes: 30 },
          { stage: 'learn', title: 'Q&A survival: bridge, defer, redirect', estimatedMinutes: 30 },
          { stage: 'practice', title: 'Record a 2-min pitch, watch, iterate', estimatedMinutes: 45 },
          { stage: 'practice', title: 'Give a 5-min technical talk to a friend', estimatedMinutes: 45 },
          { stage: 'assess', title: 'Deliver a 10-min talk, get peer feedback, revise', estimatedMinutes: 60 },
        ],
      },
    },
    source: 'curated',
  },
];

async function main(): Promise<void> {
  loadEnvLocal();

  const connectionString =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL or POSTGRES_URL is not set. Add it to .env.local');
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

    // Try to embed title + description. If embed fails (no API key, etc.),
    // insert with NULL embedding — the row is still useful for title lookup.
    const text = `${sample.title}. ${sample.description}`;
    const embedding = await embedText(text);
    if (!embedding) {
      console.warn(`  ⚠ no embedding for: ${sample.title}`);
    }

    await db.insert(kbEntries).values({
      domain: sample.domain,
      language: sample.language,
      title: sample.title,
      description: sample.description,
      schemaJson: sample.schema,
      source: sample.source,
      embedding,
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
