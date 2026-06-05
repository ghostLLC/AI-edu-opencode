# AI-Edu-OpenCode v1 - Deployment Status

**Last updated**: 2026-06-04 (LIVE with full DB functionality)

## Live URL
- **Primary**: https://ai-edu-opencode.vercel.app
- **Vercel project**: `liulechun04-7634s-projects/ai-edu-opencode`
- **Status**: 🟢 **LIVE — full functionality verified**

## Smoke test results (re-verified 2026-06-04)
| Route | HTTP | Status |
|---|---|---|
| `/` | 200 | ✅ Landing renders |
| `/en/sign-in` | 200 | ✅ Form |
| `/en/sign-up` | 200 | ✅ Form |
| `/en/404`, `/zh/404` | 404 | ✅ Locale-scoped |
| `/en/dashboard` | 200 | ✅ Auth redirect |
| `POST /api/auth/sign-up` | **201** | ✅ **DB WORKS — user `4ad080c1-fc9b-4c4b-961e-1700f3b887a0` created in Neon** |

## What's working NOW
- ✅ All 17 tables created (accounts, users, sessions, intake_sessions, learning_plans, plan_nodes, node_progress, chat_messages, kb_entries, assessments, assessment_scores, assessment_artifacts, capability_assessments, target_capabilities, user_stats, verification_tokens, kb_tier2_sessions)
- ✅ pgvector extension enabled (v0.8.0)
- ✅ 10 KB entries seeded (curated tier across 6 domains: frontend, language, cloud, data, math, other)
- ✅ Sign-up flow works end-to-end (Vercel → Next.js API → Drizzle → Neon)
- ✅ Auth.js v5 (NextAuth) configured
- ✅ PostHog / Langfuse env vars live
- ✅ Landing, sign-in, sign-up, 404, error pages all render

## Final v1 service stack
| Service | Purpose | Status |
|---|---|---|
| Vercel (Hobby) | Hosting + serverless | ✅ live |
| **Vercel Neon integration** (`neon-cinnabar-bucket`) | DB + pgvector | ✅ **provisioned + migrated + seeded** |
| DeepSeek | LLM (Flash + Pro) | ✅ key live |
| Langfuse Cloud | LLM traces | ✅ keys live |
| PostHog Cloud | Product analytics | ✅ key live |
| ~~Sentry~~ | ~~Error tracking~~ | Skipped (user couldn't register) |

**Monthly cost (10 users)**: ~$1 (¥7) — mostly DeepSeek API. Neon free tier covers 256MB.

## Deployment journey (final)
1. User accepted Neon marketplace terms (1 click)
2. `vercel integration add neon` created `neon-cinnabar-bucket` database
3. `scripts/enable-pgvector.ts` enabled vector extension
4. `pnpm db:migrate` created 17 tables
5. `pnpm db:seed` inserted 10 KB entries
6. `vercel deploy --prod` redeployed with Neon env vars
7. Sign-up test: HTTP 201 ✅

## Known minor issues (v1.1+)
- Embeddings in KB are NULL (embedder uses OpenAI by default, not DeepSeek). TODO: wire DeepSeek embeddings in `lib/ai/kb/embedder.ts`. KB retrieval falls back to title-based lookup for now.
- 6 PostHog events need real user traffic to verify (instrumented but not yet fired)
- Sentry error tracking skipped (v1.1+)
- Full authenticated E2E flow (intake → plan → learn chat stream → assess submit) needs browser session via Playwright for thorough verification

## Recent commits
- `7a9dd5d` enable-pgvector.ts + check-tables.ts
- `dc9fab9` watch-postgres.ps1
- `2b6448c` STATUS.md (initial handoff doc)
- `214f068` postgres-ready.ps1 (env pull + migrate + seed one-shot)
- `baa510a` deploy.ts: DATABASE_URL optional
- `bd88266` POSTGRES_URL fallback chain (Vercel Postgres / Neon compat)
