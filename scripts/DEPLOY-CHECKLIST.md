# Deploy Checklist — User Action Required

> 完整背景见 [`docs/DEPLOY.md`](./DEPLOY.md)。这份是**只给你做**的最小动作清单。
>
> **总耗时估算: 20-30 分钟**（大部分在等 sign-up 邮件）。

---

## 一次性: 装 Vercel CLI 登录（1 个浏览器 click）

```powershell
cd C:\Users\EDY\Desktop\AI-edu-opencode
pnpm dlx vercel@latest login
```

会输出类似:
```
> Visit https://vercel.com/oauth/device?user_code=ABCD-1234 in a browser to log in
```

**操作**: 复制那个 URL, 浏览器打开, 点 "Authorize"。

完成后命令行会显示 "Success! Configured".

---

## 5 个外部服务 sign-up（每 2-3 分钟）

为了快, 用一个**专用邮箱**注册所有服务 (e.g. `ops@yourdomain.com` 或新建一个 Gmail)。这样万一要回收也方便。

| # | 服务 | URL | 拿到什么 | 写到 .env.production 的字段 |
|---|---|---|---|---|
| 1 | **Neon** | https://console.neon.tech/sign-up | 项目 + Pooled connection string | `DATABASE_URL` |
| 2 | **DeepSeek** | https://platform.deepseek.com/sign-up | API key (`sk-...`) | `DEEPSEEK_API_KEY` |
| 3 | **Langfuse** | https://cloud.langfuse.com/sign-up | Public key + Secret key | `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` |
| 4 | **Sentry** | https://sentry.io/sign-up | DSN | `SENTRY_DSN` |
| 5 | **PostHog** | https://posthog.com/sign-up | Project API key (`phc_...`) | `NEXT_PUBLIC_POSTHOG_KEY` |

每个 sign-up 步骤:

### 1. Neon (Postgres + pgvector)
1. Sign up (GitHub OAuth 最快)
2. **Create project** → name: `ai-edu-opencode`, region: **AWS US East (Virginia)**
3. Dashboard → **Settings → Extensions** → 启用 `pgvector`
4. **Connection string** → 选 **Pooled** (关键!) → 复制 → = `DATABASE_URL`

### 2. DeepSeek (LLM)
1. Sign up (手机 or 邮箱)
2. **API Keys** → Create new secret key → name: `ai-edu-prod` → 复制 → = `DEEPSEEK_API_KEY`
3. (可选) 充值 ¥20

### 3. Langfuse (LLM traces)
1. Sign up
2. **New project** → name: `ai-edu-prod`, region: **US**
3. **Settings → API Keys** → Create new key (Public + Secret 都有)
4. 复制 Public key → `LANGFUSE_PUBLIC_KEY`
5. 复制 Secret key → `LANGFUSE_SECRET_KEY`

### 4. Sentry (错误监控)
1. Sign up
2. **Create project** → Platform: **Next.js** → name: `ai-edu-opencode`
3. 复制 **DSN** (格式 `https://...@...ingest.sentry.io/...`) → = `SENTRY_DSN`

### 5. PostHog (产品分析)
1. Sign up
2. **Create project** → type: **Web**
3. 复制 **Project API Key** (格式 `phc_...`) → = `NEXT_PUBLIC_POSTHOG_KEY`
4. **Project settings → Host** → 复制 (默认 `https://us.i.posthog.com`) → = `NEXT_PUBLIC_POSTHOG_HOST`

---

## 填 .env.production（一个文件）

回到项目根目录, 复制模板:

```powershell
cd C:\Users\EDY\Desktop\AI-edu-opencode
copy .env.example .env.production
```

用文本编辑器打开 `.env.production`, 填入上面 5 个服务的值, 加:

```
AUTH_SECRET=<运行: [System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 })) >
AUTH_URL=https://ai-edu-opencode.vercel.app
AUTH_TRUST_HOST=true
DEEPSEEK_BASE_URL=https://api.deepseek.com
LANGFUSE_HOST=https://cloud.langfuse.com
```

**关键字段清单** (必须填的):
- [ ] `DATABASE_URL` (Neon pooled)
- [ ] `AUTH_SECRET` (32 字符 random)
- [ ] `AUTH_URL` (你最终的域名, 可以先用 vercel.app)
- [ ] `DEEPSEEK_API_KEY`
- [ ] `LANGFUSE_PUBLIC_KEY`
- [ ] `LANGFUSE_SECRET_KEY`
- [ ] `SENTRY_DSN`
- [ ] `NEXT_PUBLIC_POSTHOG_KEY`
- [ ] `NEXT_PUBLIC_POSTHOG_HOST`
- [ ] `NEXT_PUBLIC_APP_URL`

---

## 告诉我 "ready" — 我接管

你在 chat 里说 **"ready"**, 我会:
1. 跑 `pnpm deploy` (Vercel link + push 10+ env vars + 触发 prod build)
2. 等 build 完 (~2-3 min), 拿 URL
3. 帮你做 docs/DEPLOY.md §11 的 10 项 verification
4. 有问题我立刻 fix
