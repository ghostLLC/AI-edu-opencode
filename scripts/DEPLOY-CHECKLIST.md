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

## 4 个外部服务 sign-up（每 2-3 分钟）+ 1 个 Vercel dashboard 点击

> **Vercel Postgres**: 不用新注册 — 在 Vercel 项目里直接点 1 下就创建, `POSTGRES_URL` 自动注入。
> **Sentry**: v1 跳过（你注册遇到问题, v1 不强制）。

为了快, 用一个**专用邮箱**注册所有服务 (e.g. `ops@yourdomain.com` 或新建一个 Gmail)。这样万一要回收也方便。

| # | 服务 | URL | 拿到什么 | 写到 .env.production 的字段 |
|---|---|---|---|---|
| 1 | **DeepSeek** | https://platform.deepseek.com/sign-up | API key (`sk-...`) | `DEEPSEEK_API_KEY` |
| 2 | **Langfuse** | https://cloud.langfuse.com/sign-up | Public key + Secret key | `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` |
| 3 | **PostHog** | https://posthog.com/sign-up | Project API key (`phc_...`) | `NEXT_PUBLIC_POSTHOG_KEY` |
| 4 | (可选) **Neon** | https://console.neon.tech/sign-up | Pooled connection string | `DATABASE_URL` *(只在不选 Vercel Postgres 时用)* |

> **Vercel Postgres 替代 Neon**：你已有 Vercel 账号, 在 https://vercel.com/dashboard/stores → **Create Database** → **Postgres**, region 选 `US East (iad1)`, 1 click 搞定。Vercel 自动注入 `POSTGRES_URL` env var, 不用复制。

每个 sign-up 步骤:

### 1. DeepSeek (LLM)
1. Sign up (手机 or 邮箱)
2. **API Keys** → Create new secret key → name: `ai-edu-prod` → 复制 → = `DEEPSEEK_API_KEY`
3. (可选) 充值 ¥20

### 2. Langfuse (LLM traces)
1. Sign up
2. **New project** → name: `ai-edu-prod`, region: **US**
3. **Settings → API Keys** → Create new key (Public + Secret 都有)
4. 复制 Public key → `LANGFUSE_PUBLIC_KEY`
5. 复制 Secret key → `LANGFUSE_SECRET_KEY`

### 3. PostHog (产品分析)
1. Sign up
2. **Create project** → type: **Web**
3. 复制 **Project API Key** (格式 `phc_...`) → = `NEXT_PUBLIC_POSTHOG_KEY`
4. **Project settings → Host** → 复制 (默认 `https://us.i.posthog.com`) → = `NEXT_PUBLIC_POSTHOG_HOST`

### (可选) 4. Neon — 仅当你不想用 Vercel Postgres
1. Sign up (GitHub OAuth 最快)
2. **Create project** → name: `ai-edu-opencode`, region: **AWS US East (Virginia)**
3. Dashboard → **Settings → Extensions** → 启用 `pgvector`
4. **Connection string** → 选 **Pooled** (关键!) → 复制 → = `DATABASE_URL`

---

## 填 .env.production（一个文件）

回到项目根目录, 复制模板:

```powershell
cd C:\Users\EDY\Desktop\AI-edu-opencode
copy .env.example .env.production
```

用文本编辑器打开 `.env.production`, 填入上面 3 个外部服务的值, 加:

```
AUTH_SECRET=<运行: [System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 })) >
AUTH_URL=https://ai-edu-opencode.vercel.app
AUTH_TRUST_HOST=true
DEEPSEEK_BASE_URL=https://api.deepseek.com
LANGFUSE_HOST=https://cloud.langfuse.com
```

> **Database**: 如果你选了 Vercel Postgres, `DATABASE_URL` 不用填 — Vercel 自动注入 `POSTGRES_URL`, 代码 fallback 链会接住。只有用 Neon 时才填 `DATABASE_URL`。

**关键字段清单** (必须填的):
- [ ] `AUTH_SECRET` (32 字符 random)
- [ ] `AUTH_URL` (你最终的域名, 可以先用 vercel.app)
- [ ] `AUTH_TRUST_HOST=true`
- [ ] `DEEPSEEK_API_KEY`
- [ ] `DEEPSEEK_BASE_URL=https://api.deepseek.com`
- [ ] `LANGFUSE_PUBLIC_KEY`
- [ ] `LANGFUSE_SECRET_KEY`
- [ ] `LANGFUSE_HOST=https://cloud.langfuse.com`
- [ ] `NEXT_PUBLIC_POSTHOG_KEY`
- [ ] `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] *(可选)* `DATABASE_URL` (仅 Neon 路径)

---

## 告诉我 "ready" — 我接管

你在 chat 里说 **"ready"**, 我会:
1. 跑 `pnpm deploy` (Vercel link + push 10+ env vars + 触发 prod build)
2. 等 build 完 (~2-3 min), 拿 URL
3. 帮你做 docs/DEPLOY.md §11 的 10 项 verification
4. 有问题我立刻 fix
