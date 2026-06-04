/**
 * Deploy to Vercel: push env vars from .env.production + run --prod deploy.
 *
 * Usage:
 *   1. Copy .env.example to .env.production and fill in real values.
 *   2. Run: pnpm dlx vercel@latest login   (one-time, browser OAuth)
 *   3. Run: pnpm deploy
 *
 * This script:
 *   - Validates required env vars are present
 *   - Runs `vercel link` to ensure the project is linked
 *   - Pushes each var via `vercel env add NAME production --value "..."`
 *   - Triggers `vercel deploy --prod`
 *
 * Safe to re-run: `vercel env add` updates existing values.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const ENV_FILE = '.env.production';
const PROJECT_NAME = 'ai-edu-opencode';

function parseEnv(path: string): Record<string, string> {
  if (!existsSync(path)) {
    console.error(`❌ ${path} not found.\n`);
    console.error(`   1. Copy .env.example to ${path}`);
    console.error(`   2. Fill in real values (DATABASE_URL, DeepSeek, Langfuse, PostHog)`);
    console.error(`   3. Run: pnpm deploy`);
    process.exit(1);
  }
  const result: Record<string, string> = {};
  for (const rawLine of readFileSync(path, 'utf-8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (key) result[key] = value;
  }
  return result;
}

function sh(cmd: string, opts: { silent?: boolean } = {}): string {
  try {
    return execSync(cmd, {
      stdio: opts.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Command failed: ${cmd}\n${msg}`);
  }
}

function escapeForShell(value: string): string {
  // On Windows cmd.exe: escape ^ | & < > ( ) " by prepending ^
  // We use --value "..." wrapping, so only " needs escaping
  if (process.platform === 'win32') {
    return value.replace(/"/g, '""').replace(/[&|<>^()]/g, '^$&');
  }
  // POSIX shell
  return value.replace(/(["'$`\\])/g, '\\$1');
}

async function main(): Promise<void> {
  console.log(`📦 Reading ${ENV_FILE}...`);
  const env = parseEnv(resolve(process.cwd(), ENV_FILE));
  const entries = Object.entries(env).filter(([, v]) => v.length > 0);
  console.log(`   Found ${entries.length} non-empty env vars`);

  const REQUIRED = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'AUTH_URL',
    'AUTH_TRUST_HOST',
    'DEEPSEEK_API_KEY',
    'LANGFUSE_HOST',
    'LANGFUSE_PUBLIC_KEY',
    'LANGFUSE_SECRET_KEY',
    'NEXT_PUBLIC_POSTHOG_KEY',
    'NEXT_PUBLIC_POSTHOG_HOST',
    'NEXT_PUBLIC_APP_URL',
  ];
  // DEEPSEEK_BASE_URL has a default in code (lib/ai/providers.ts) — optional.
  const missing = REQUIRED.filter((k) => !env[k]);
  if (missing.length > 0) {
    console.error(`\n❌ Missing required env vars:`);
    for (const k of missing) console.error(`   - ${k}`);
    console.error(`\nEdit ${ENV_FILE} and re-run.`);
    process.exit(1);
  }

  // Verify Vercel CLI auth
  console.log('\n🔐 Checking Vercel auth...');
  try {
    const whoami = sh('vercel whoami', { silent: true }).trim();
    console.log(`   Logged in as: ${whoami}`);
  } catch {
    console.error('❌ Not logged in to Vercel.');
    console.error('   Run: pnpm dlx vercel@latest login');
    process.exit(1);
  }

  // Link project
  console.log(`\n🔗 Linking to project "${PROJECT_NAME}"...`);
  try {
    sh(`vercel link --yes --project ${PROJECT_NAME}`, { silent: true });
    console.log('   Linked.');
  } catch {
    // If project doesn't exist, try creating
    console.log('   Project not found, creating...');
    try {
      sh(`vercel link --yes --project ${PROJECT_NAME} --create`, { silent: true });
      console.log('   Created + linked.');
    } catch (err) {
      console.error('❌ Failed to link project. Run manually:');
      console.error('   pnpm dlx vercel@latest link --create');
      throw err;
    }
  }

  // Push env vars
  console.log(`\n🚀 Pushing ${entries.length} env vars to Vercel (production)...`);
  let pushed = 0;
  let failed = 0;
  for (const [name, value] of entries) {
    process.stdout.write(`   → ${name} ... `);
    const escaped = escapeForShell(value);
    try {
      sh(
        `vercel env add ${name} production --value "${escaped}" --yes`,
        { silent: true },
      );
      console.log('✓');
      pushed += 1;
    } catch (err) {
      console.log('✗');
      console.error(`     ${err instanceof Error ? err.message.split('\n')[0] : err}`);
      failed += 1;
    }
  }
  console.log(`   Pushed: ${pushed} / Failed: ${failed}`);
  if (failed > 0) {
    console.error('❌ Some env vars failed to push. Check values and re-run.');
    process.exit(1);
  }

  // Deploy
  console.log('\n🚀 Deploying to production (this takes 2-3 min)...');
  const output = sh('vercel deploy --prod --yes', { silent: false });

  // Extract URL from output
  const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.vercel\.app/i);
  const url = urlMatch ? urlMatch[0] : '(see Vercel dashboard)';
  console.log(`\n✅ Deployed: ${url}`);
  console.log(`\nNext: visit ${url} and run through docs/DEPLOY.md §11 verification checklist.`);
}

main().catch((err) => {
  console.error('\n❌ Deploy failed:', err);
  process.exit(1);
});
