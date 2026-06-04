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
| Database (Postgres + pgvector) | [Neon](https://neon.tech) | Free (512 MB) |
| Domain | Cloudflare / Namecheap | ~$10/yr |
| AI (LLM) | [DeepSeek](https://platform.deepseek.com) | Pay-as-you-go (~$0.50/M tokens) |
| Embedding (bge-m3) | DeepSeek / 自托管 | ~$0.10/M tokens |
| Observability (traces) | [Langfuse Cloud](https://cloud.langfuse.com) | Free (50K traces/mo) |
| Error tracking | [Sentry](https://sentry.io) | Free (5K events/mo) |
| Product analytics | [PostHog Cloud](https://posthog.com) | Free (1M events/mo) |
| Object storage (artifacts) | [Cloudflare R2](https://cloudflare.com) | Free (10 GB) |

---

## 1. Pre-flight checklist

Make sure you have:

- [ ] A working local install (`pnpm dev` starts on :3000)
- [ ] GitHub account with admin access to the repo
- [ ] Vercel account (sign up via GitHub)
- [ ] A credit card on file in Vercel (free tier is fine, but they ask)
- [ ] Email for service sign-ups (use a dedicated `ops@yourdomain.com`)

---

## 2. Neon (Postgres + pgvector)

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

> **Important**: Use the **pooled** connection string on Vercel. The direct connection string is only for migrations.

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

## 6. Sentry (errors)

1. Sign up at [sentry.io](https://sentry.io) → **Create project** → platform = **Next.js**.
2. Copy the DSN. Save as `SENTRY_DSN` (and optionally `NEXT_PUBLIC_SENTRY_DSN` if you want it auto-injected client-side).
3. (Optional) Create an auth token under **Settings → Auth Tokens** for source-map upload. Save as `SENTRY_AUTH_TOKEN`.
4. (Optional) Get the org slug and project slug. Save as `SENTRY_ORG` and `SENTRY_PROJECT`.

> Source-map upload is auto-wired in `next.config.ts` via `withSentryConfig`. If you skip `SENTRY_AUTH_TOKEN`, the build won't fail (the wrapper is silent).

---

## 7. PostHog (product analytics)

1. Sign up at [posthog.com](https://posthog.com) → **Cloud EU or US** (free tier covers v1).
2. Create a project. Copy the **Project API Key** (starts with `phc_`).
3. Save as `NEXT_PUBLIC_POSTHOG_KEY`.
4. Save host: `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com` (or `https://eu.i.posthog.com` for EU).
5. The `PostHogProvider` in `app/[locale]/(app)/layout.tsx` auto-mounts when this key is set.

---

## 8. Cloudflare R2 (artifact storage) — *optional in v1*

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

## 9. Vercel (hosting)

1. Go to [vercel.com/new](https://vercel.com/new) → import `ghostLLC/AI-edu-opencode`.
2. **Configure Project**:
   - Framework preset: **Next.js** (auto-detected)
   - Build command: `pnpm build` (default is fine)
   - Install command: `pnpm install --frozen-lockfile` (default is fine)
   - Output directory: `.next` (default)
   - Root directory: `./`
   - Node version: **20.x** (Settings → General → Node.js Version)
3. **Environment Variables** — paste all of these (mark `Production` + `Preview` + `Development` as needed):
   ```
   DATABASE_URL=postgresql://...neon...pooler...sslmode=require
   AUTH_SECRET=<openssl rand -base64 32>
   AUTH_URL=https://ai-edu.yourdomain.com
   AUTH_TRUST_HOST=true

   DEEPSEEK_API_KEY=sk-...
   DEEPSEEK_BASE_URL=https://api.deepseek.com

   LANGFUSE_PUBLIC_KEY=pk-lf-...
   LANGFUSE_SECRET_KEY=sk-lf-...
   LANGFUSE_HOST=https://cloud.langfuse.com

   SENTRY_DSN=https://...@sentry.io/...
   SENTRY_AUTH_TOKEN=sntrys_...        (optional)
   SENTRY_ORG=your-org                  (optional)
   SENTRY_PROJECT=ai-edu-opencode       (optional)

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

## 10. Custom domain

1. Buy a domain (e.g. `yourdomain.com`) on Cloudflare or Namecheap.
2. In Vercel → **Project Settings → Domains** → add `ai-edu.yourdomain.com` (or your preferred subdomain).
3. Vercel will show DNS records to add. Go to your registrar's DNS panel, add:
   - `CNAME` `ai-edu` → `cname.vercel-dns.com`
4. Wait for DNS propagation (usually < 5 minutes).
5. Vercel auto-issues a Let's Encrypt TLS cert.
6. Update `AUTH_URL` and `NEXT_PUBLIC_APP_URL` env vars to use the new domain. **Redeploy**.

---

## 11. Post-deploy verification

Run through this 10-item checklist before inviting users:

- [ ] Landing page loads, hero + features + CTA visible
- [ ] Sign-up → sign-in → dashboard flow works
- [ ] `/intake/new` → submit goal → plan generated (check Langfuse trace exists)
- [ ] Plan detail shows 3 stage groups with locked/unlocked badges
- [ ] Click into a Learn node → chat streams (check Langfuse trace)
- [ ] Mark a Learn node complete → return to plan → Practice now unlocked
- [ ] Submit an Assess → score report renders (check Langfuse trace)
- [ ] `/en/404` and `/zh/404` show locale-specific 404
- [ ] PostHog dashboard shows 1+ events for each of the 4 wired events
- [ ] Sentry has zero new errors in the last hour (besides expected)

---

## 12. Cost reality check

| Component | v1 (10 users, 1 month) | v1 (100 users, 1 month) |
|---|---|---|
| Vercel | $0 (Hobby) | $20 (Pro, when you hit limits) |
| Neon | $0 (free 512MB) | $19 (Launch, 10GB) |
| DeepSeek | ~$1 (¥5) | ~$15 (¥100) |
| Langfuse | $0 (50K traces free) | $0 → $59 (Pro) |
| Sentry | $0 (5K events) | $0 → $26 (Team) |
| PostHog | $0 (1M events) | $0 |
| R2 | $0 (10GB free) | $0 |
| **Total** | **~$1/month** | **~$60-100/month** |

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

### Sentry source maps not uploading

Set `SENTRY_AUTH_TOKEN` to a token with `project:releases` and `project:source-maps` scopes. Or accept the warning — runtime error capture still works without source maps.

### Langfuse not receiving traces

Check `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` are **both** set. The async flush happens at end of request — wait 30 seconds after an AI call before checking the dashboard.

---

## Next steps after v1 is live

- **Week 7 (post-launch)**: monitor Langfuse for intake quality, iterate prompts
- **Day 0-30**: invite 10 seed users, run feedback interviews
- **Day 30-60**: optimize based on completion-rate data
- **Day 60-90**: decide on v2 (mode 2 / community KB) — see `07-roadmap.md` §7.2
