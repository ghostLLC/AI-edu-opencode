# AI-Edu-OpenCode v1 - Deployment Status

**Last updated**: 2026-06-04

## Live URL
- **Primary**: https://ai-edu-opencode.vercel.app
- **Vercel project**: `liulechun04-7634s-projects/ai-edu-opencode`
- **Status**: 🟢 LIVE (static pages), 🟡 awaiting DB click (DB routes 500 with placeholder)

## What's working NOW
- ✅ Landing page (en + zh locales)
- ✅ Sign-in / sign-up forms
- ✅ 404 / error pages (locale-scoped)
- ✅ Auth middleware redirect (dashboard → sign-in)
- ✅ Static asset serving (CSS, JS, fonts)
- ✅ PostHog / Langfuse env vars live (analytics dormant until first real request)

## What's blocked on user action (1 minute)
- ❌ Vercel Postgres database (1 click in dashboard UI)

**Vercel platform hard limit**: No CLI, REST API, or marketplace API exists to create a Postgres store programmatically. Verified by 7+ REST endpoint probes + CLI command survey + OAuth token tests. This is a 1-minute user action:

1. Open https://vercel.com/dashboard/stores
2. Click "Create Database" → "Postgres" on `ai-edu-opencode` project
3. Region: `US East (iad1)`, name: `ai-edu-db`
4. Click Create, wait 1-2 min for provisioning

## After user click (1 command, ~3 min)
```powershell
# From project root
.\scripts\postgres-ready.ps1
```

This script (committed at `214f068`):
1. Pulls `POSTGRES_URL` from Vercel to local `.env.local`
2. Runs Drizzle migrations (17 tables, pgvector + HNSW)
3. Seeds 10 KB entries across 6 domains
4. Smoke tests `SELECT count(*) FROM kb_entries` returns 10

After that, Vercel auto-injects `POSTGRES_URL` and all DB routes work within ~30s (cold start).

## Final v1 service stack
| Service | Purpose | Status |
|---|---|---|
| Vercel (Hobby) | Hosting + serverless | ✅ live |
| Vercel Postgres | DB + pgvector | ⏳ user 1 click |
| DeepSeek | LLM (Flash + Pro) | ✅ key live |
| Langfuse Cloud | LLM traces | ✅ keys live |
| PostHog Cloud | Product analytics | ✅ key live |
| ~~Sentry~~ | ~~Error tracking~~ | Skipped (user couldn't register) |

**Monthly cost (10 users)**: ~$1 (¥7) — mostly DeepSeek API.

## Smoke test results (re-verified 2026-06-04)
| Route | HTTP | Status |
|---|---|---|
| `/` | 200 | ✅ |
| `/en` | 200 | ✅ |
| `/en/sign-in` | 200 | ✅ |
| `/en/sign-up` | 200 | ✅ |
| `/en/404` | 404 | ✅ |
| `/zh/404` | 404 | ✅ |
| `/en/dashboard` | 200 (redirected to sign-in) | ✅ |
| `POST /api/auth/sign-up` | 500 | ⚠ Expected (placeholder DB) |
