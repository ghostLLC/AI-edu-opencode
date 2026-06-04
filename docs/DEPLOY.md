# Deployment Guide

> Step-by-step guide to take AI-Edu-OpenCode from local dev to production.
> Estimated total time: **20–30 minutes** (mostly waiting for sign-ups).
>
> **Fast path**: For a fully automated deploy driven by us, see [`scripts/DEPLOY-CHECKLIST.md`](../scripts/DEPLOY-CHECKLIST.md) — that's the minimum 5 sign-ups + 1 OAuth click, then `pnpm deploy` does the rest.

---

## Overview

| What | Where | Cost (v1) |
|---|---|---|
| App hosting | [Vercel](https://vercel.com) | Free (Hobby) |
| Database (Postgres + pgvector) | [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (recommended) / [Neon](https://neon.tech) (fallback) | Free (256 MB / 512 MB) |
| Domain | Cloudflare / Namecheap | ~$10/yr |
| AI (LLM) | [DeepSeek](https://platform.deepseek.com) | Pay-as-you-go (~$0.50/M tokens) |
| Embedding (bge-m3) | DeepSeek / 自托管 | ~$0.10/M tokens |
| Observability (traces) | [Langfuse Cloud](https://cloud.langfuse.com) | Free (50K traces/mo) |
| Product analytics | [PostHog Cloud](https://posthog.com) | Free (1M events/mo) |
| Object storage (artifacts) | [Cloudflare R2](https://cloudflare.com) | Free (10 GB) — *optional in v1* |

---

## 1. Pre-flight checklist

Make sure you have:

- [ ] A working local install (`pnpm dev` starts on :3000)
- [ ] GitHub account with admin access to the repo
- [ ] Vercel account (sign up via GitHub)
- [ ] A credit card on file in Vercel (free tier is fine, but they ask)
- [ ] Email for service sign-ups (use a dedicated `ops@yourdomain.com`)

---

## 2. Database (Postgres + pgvector)

You have two options for v1. **Vercel Postgres is recommended** — it lives inside your Vercel project, auto-injects `POSTGRES_URL`, and supports pgvector out of the box.

### Option A: Vercel Postgres (recommended, 0 new signups)

1. Go to your Vercel project dashboard → **Storage** tab → **Create Database** → **Postgres**.
2. Region: **US East (iad1)** (matches Vercel default deployment region).
3. Database name: `ai-edu-db`.
4. Vercel will auto-inject these env vars into all environments:
   - `POSTGRES_URL` (pooled, for runtime)
   - `POSTGRES_PRISMA_URL` (pooled, for Prisma-style apps)
   - `POSTGRES_URL_NON_POOLING` (direct, for migrations)
5. Pull these locally so you can run migrations and seed:
   ```bash
   pnpm dlx vercel@latest env pull .env.local --environment production
   ```
   This downloads `POSTGRES_URL` (and others) into `.env.local`. The code's fallback chain `DATABASE_URL → POSTGRES_URL → POSTGRES_PRISMA_URL` will pick it up automatically.
6. Run migrations + seed:
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```
7. Verify: Vercel Dashboard → Storage → your DB → SQL Editor → run `SELECT count(*) FROM kb_entries;` — should return **10**.

### Option B: Neon (if you already have a Neon project)

1. Sign up at [console.neon.tech](https://console.neon.tech).
2. Create a project: name = `ai-edu-opencode`, region = **AWS US East (Virginia)** (matches Vercel default `iad1`).
3. In the project dashboard, click **Enable pgvector** under Settings → Extensions.
4. Copy the **pooled connection string** (it looks like `postgresql://user:pwd@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`). Save as `DATABASE_URL`.
5. Run migrations against the new DB locally:
   ```bash
   # In .env.local, paste the Neon DATABASE_URL
   pnpm db:migrate
   pnpm db:seed
   ```
6. Verify: open [Neon SQL Editor](https://console.neon.tech/app/projects) → run `SELECT count(*) FROM kb_entries;` — should return **10**.

> **Important**: For Neon, use the **pooled** connection string in production. The direct connection string is only for migrations.

---

## 3. DeepSeek (LLM + Embedding)

1. Sign up at [platform.deepseek.com](https://platform.deepseek.com).
2. Create an API key under **API Keys** → name = `ai-edu-opencode-prod`.
3. Save as `DEEPSEEK_API_KEY`.
4. Confirm the base URL: `https://api.deepseek.com` (default). Override with `DEEPSEEK_BASE_URL` only if you're using a proxy.
5. Top up at least **¥20** ($3) for v1 launch (covers ~1000 intake calls or 5000 learn/practice turns).

> **Embedding note**: As of v1.1, we assume DeepSeek exposes a `bge-m3` model under `textEmbeddingModel('bge-m3')`. If their catalog changes, you can swap in a self-hosted bge-m3 endpoint by setting `EMBEDDING_API_URL` and `EMBEDDING_API_KEY` (this requires a small code change in `lib/ai/kb/embedder.ts` — see TODO there).

---

## 4. Auth.js v5

Generate a strong secret:

```bash
openssl rand -base64 32
```

Save as `AUTH_SECRET`. Also set:

- `AUTH_URL=https://ai-edu.yourdomain.com` (your final production URL)
- `AUTH_TRUST_HOST=true` (required for Vercel — trust the host header)

---

## 5. Langfuse (LLM traces)

1. Sign up at [cloud.langfuse.com](https://cloud.langfuse.com).
2. Create a project: name = `ai-edu-opencode-prod`, region = **US**.
3. Go to **Settings → API Keys** → create new keys (Public + Secret).
4. Save as:
   - `LANGFUSE_PUBLIC_KEY=pk-lf-...`
   - `LANGFUSE_SECRET_KEY=sk-lf-...`
   - `LANGFUSE_HOST=https://cloud.langfuse.com`

---

---

## 6. PostHog (product analytics)

1. Sign up at [posthog.com](https://posthog.com) → **Cloud EU or US** (free tier covers v1).
2. Create a project. Copy the **Project API Key** (starts with `phc_`).
3. Save as `NEXT_PUBLIC_POSTHOG_KEY`.
4. Save host: `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com` (or `https://eu.i.posthog.com` for EU).
5. The `PostHogProvider` in `app/[locale]/(app)/layout.tsx` auto-mounts when this key is set.

---

## 7. Cloudflare R2 (artifact storage) — *optional in v1*

Only needed when v1.1 ships artifact uploads (currently the assess flow is text-only).

1. Sign up at [cloudflare.com](https://cloudflare.com).
2. R2 → **Create bucket** → name = `ai-learning-artifacts`, region = **Automatic**.
3. R2 → **Manage R2 API Tokens** → create token with Object Read & Write scope on this bucket.
4. Save:
   - `R2_ACCOUNT_ID=...`
   - `R2_ACCESS_KEY_ID=...`
   - `R2_SECRET_ACCESS_KEY=...`
   - `R2_BUCKET=ai-learning-artifacts`
   - `R2_PUBLIC_URL=https://artifacts.yourdomain.com` (optional, set up a custom domain)

---

## 8. Vercel (hosting)

1. Go to [vercel.com/new](https://vercel.com/new) → import `ghostLLC/AI-edu-opencode`.
2. **Configure Project**:
   - Framework preset: **Next.js** (auto-detected)
   - Build command: `pnpm build` (default is fine)
   - Install command: `pnpm install --frozen-lockfile` (default is fine)
   - Output directory: `.next` (default)
   - Root directory: `./`
   - Node version: **20.x** (Settings → General → Node.js Version)
3. **Environment Variables** — paste all of these (mark `Production` + `Preview` + `Development` as needed). If you're using **Vercel Postgres** (recommended), `POSTGRES_URL` is auto-injected — skip the `DATABASE_URL` line below.
   ```
   # If using Vercel Postgres: POSTGRES_URL is auto-injected, do not set.
   # If using Neon or another external Postgres: paste pooled connection string.
   # DATABASE_URL=postgresql://...pooled...sslmode=require
   AUTH_SECRET=<openssl rand -base64 32>
   AUTH_URL=https://ai-edu.yourdomain.com
   AUTH_TRUST_HOST=true

   DEEPSEEK_API_KEY=sk-...
   DEEPSEEK_BASE_URL=https://api.deepseek.com

   LANGFUSE_PUBLIC_KEY=pk-lf-...
   LANGFUSE_SECRET_KEY=sk-lf-...
   LANGFUSE_HOST=https://cloud.langfuse.com

   NEXT_PUBLIC_POSTHOG_KEY=phc_...
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   NEXT_PUBLIC_APP_URL=https://ai-edu.yourdomain.com
   ```
4. Click **Deploy**. The first build will fail at the `db:generate` step if you don't have migrations — that's fine for the first build. Once it succeeds, **open a Vercel Shell** (or use the Neon SQL editor) and run:
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```
5. After the first successful deploy, Vercel will give you a `*.vercel.app` URL. Smoke test:
   - `/` → landing renders
   - `/en/sign-up` → form works
   - `/en/dashboard` → redirects to sign-in
   - `/en/intake/new` → form submits → plan created (if you have DB seeded)

---

## 9. Custom domain

1. Buy a domain (e.g. `yourdomain.com`) on Cloudflare or Namecheap.
2. In Vercel → **Project Settings → Domains** → add `ai-edu.yourdomain.com` (or your preferred subdomain).
3. Vercel will show DNS records to add. Go to your registrar's DNS panel, add:
   - `CNAME` `ai-edu` → `cname.vercel-dns.com`
4. Wait for DNS propagation (usually < 5 minutes).
5. Vercel auto-issues a Let's Encrypt TLS cert.
6. Update `AUTH_URL` and `NEXT_PUBLIC_APP_URL` env vars to use the new domain. **Redeploy**.

---

## 10. Post-deploy verification

Run through this 10-item checklist before inviting users:

- [ ] Landing page loads, hero + features + CTA visible
- [ ] Sign-up → sign-in → dashboard flow works
- [ ] `/intake/new` → submit goal → plan generated (check Langfuse trace exists)
- [ ] Plan detail shows 3 stage groups with locked/unlocked badges
- [ ] Click into a Learn node → chat streams (check Langfuse trace)
- [ ] Mark a Learn node complete → return to plan → Practice now unlocked
- [ ] Submit an Assess → score report renders (check Langfuse trace)
- [ ] `/en/404` and `/zh/404` show locale-specific 404
- [ ] PostHog dashboard shows 1+ events for each of the 6 wired events
- [ ] No 500s in Vercel Runtime Logs for the last 10 minutes

---

## 11. Cost reality check

| Component | v1 (10 users, 1 month) | v1 (100 users, 1 month) |
|---|---|---|
| Vercel (hosting) | $0 (Hobby) | $20 (Pro, when you hit limits) |
| Vercel Postgres (or Neon) | $0 (256 MB / 512 MB free) | $0 → $20 (Vercel Pro storage) or $19 (Neon Launch) |
| DeepSeek | ~$1 (¥5) | ~$15 (¥100) |
| Langfuse | $0 (50K traces free) | $0 → $59 (Pro) |
| PostHog | $0 (1M events) | $0 |
| R2 (v1.1) | $0 (10GB free) | $0 |
| **Total** | **~$1/month** | **~$40-80/month** |

---

## Troubleshooting

### "fetch failed" on `/api/chat`

Check `DATABASE_URL` is the **pooled** string from Neon. Direct connections break under Vercel Functions.

### "Unauthorized" on intake

Check `AUTH_SECRET` is set and `AUTH_TRUST_HOST=true`. Auth.js v5 is strict about these.

### Plan generation times out

Vercel Hobby has a 10s function timeout. AI intake can take 8-12s with Pro model. Upgrade to Vercel Pro ($20/mo) for 60s timeout, OR move the call to a background job.

### PostHog events not showing

1. Open browser console — look for `[track] failed:` warnings
2. Check `NEXT_PUBLIC_POSTHOG_KEY` is set in Vercel env (must be exposed to client)
3. Check the key starts with `phc_` (project key, not personal API key)

### Langfuse not receiving traces

Check `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` are **both** set. The async flush happens at end of request — wait 30 seconds after an AI call before checking the dashboard.

---

## Next steps after v1 is live

- **Week 7 (post-launch)**: monitor Langfuse for intake quality, iterate prompts
- **Day 0-30**: invite 10 seed users, run feedback interviews
- **Day 30-60**: optimize based on completion-rate data
- **Day 60-90**: decide on v2 (mode 2 / community KB) — see `07-roadmap.md` §7.2
