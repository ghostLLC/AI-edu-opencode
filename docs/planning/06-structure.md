# Chapter 06: 模块/文件结构

> 本章定义 v1 项目目录结构、关键文件职责、模块依赖、命名规范。
> 配套:Ch 02 技术栈 / Ch 03 架构
> 版本:v0.1 | 状态:草稿

---

## 6.0 组织原则

1. **Colocation** — 组件、样式、测试放一起,不要分离
2. **按特性分,不只是按类型分** — `app/[locale]/learn/` 而不是 `app/learn/ + components/learn/ + lib/learn/`
3. **Server-first 分层** — Server Action / RSC / Client Component 各司其职
4. **每个 lib 模块独立可测** — 不依赖具体 UI,可在测试中 mock
5. **配置外置** — 所有环境变量、feature flag 在 `.env` / `config/`

---

## 6.1 完整目录树

```
ai-learning-platform/
│
├── app/                                    # Next.js App Router
│   ├── [locale]/                           # 国际化路由(en/zh)
│   │   ├── layout.tsx                      # 根 layout(字体、theme、provider)
│   │   ├── page.tsx                        # 首页(营销/介绍)
│   │   ├── (marketing)/                    # 公开页路由组
│   │   │   ├── about/
│   │   │   ├── pricing/                    # v2
│   │   │   └── docs/
│   │   ├── (auth)/                         # 认证路由组(无 layout)
│   │   │   ├── sign-in/
│   │   │   ├── sign-up/
│   │   │   └── forgot-password/
│   │   ├── (app)/                          # 登录后路由组(带侧边栏 layout)
│   │   │   ├── layout.tsx                  # 侧边栏 + 顶栏 layout
│   │   │   ├── dashboard/                  # 仪表盘
│   │   │   ├── intake/                     # 需求采集(模式 1)
│   │   │   │   ├── new/
│   │   │   │   └── [sessionId]/
│   │   │   ├── plans/                      # 方案列表 + 详情
│   │   │   │   ├── page.tsx
│   │   │   │   └── [planId]/
│   │   │   │       ├── page.tsx            # 方案总览
│   │   │   │       ├── learn/              # 阶段 1
│   │   │   │       │   └── [nodeId]/
│   │   │   │       ├── practice/           # 阶段 2
│   │   │   │       │   └── [nodeId]/
│   │   │   │       └── assess/             # 阶段 3
│   │   │   │           └── [assessmentId]/
│   │   │   ├── kb/                         # KB 浏览(v2)
│   │   │   └── settings/
│   │   │       ├── profile/
│   │   │       ├── language/
│   │   │       └── data-export/            # GDPR
│   │   └── api/                            # Route Handlers
│   │       ├── chat/
│   │       │   └── route.ts                # SSE 流式对话
│   │       ├── assess/
│   │       │   ├── score/route.ts
│   │       │   └── appeal/route.ts
│   │       ├── kb/
│   │       │   └── search/route.ts
│   │       ├── artifact/
│   │       │   └── upload/route.ts         # R2 签名 URL
│   │       └── auth/
│   │           └── [...nextauth]/route.ts  # Auth.js
│   ├── error.tsx                           # 全局错误 boundary
│   ├── not-found.tsx
│   ├── globals.css
│   └── icon.tsx / apple-icon.tsx
│
├── components/                             # 共享 UI 组件
│   ├── ui/                                 # shadcn/ui 复制进来(可改)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── toast.tsx
│   │   └── ... (其他需要的)
│   ├── chat/                               # 业务组件:对话
│   │   ├── chat-panel.tsx
│   │   ├── message-bubble.tsx
│   │   ├── citation-chip.tsx               # 引用关键词
│   │   └── streaming-indicator.tsx
│   ├── plan/                               # 业务组件:方案
│   │   ├── plan-card.tsx
│   │   ├── plan-confirm-dialog.tsx
│   │   └── node-tree.tsx
│   ├── learn/                              # 业务组件:学习阶段
│   │   ├── knowledge-node-card.tsx
│   │   ├── reference-panel.tsx
│   │   └── progress-bar.tsx
│   ├── practice/                           # 业务组件:实践阶段
│   │   ├── prompt-card.tsx
│   │   └── readiness-check.tsx
│   ├── assess/                             # 业务组件:考核阶段
│   │   ├── task-card.tsx
│   │   ├── artifact-uploader.tsx
│   │   ├── rubric-display.tsx
│   │   ├── score-report.tsx
│   │   └── appeal-form.tsx
│   ├── intake/                             # 业务组件:需求采集
│   │   ├── need-input.tsx
│   │   └── clarify-dialog.tsx
│   └── shared/                             # 通用业务组件
│       ├── nav-sidebar.tsx
│       ├── user-menu.tsx
│       ├── language-switcher.tsx
│       └── empty-state.tsx
│
├── lib/                                    # 业务逻辑层(无 UI)
│   ├── ai/                                 # AI 编排
│   │   ├── orchestrator.ts                 # 核心:runStage()
│   │   ├── providers.ts                    # DeepSeek / Anthropic 配置
│   │   ├── context-builder.ts              # RAG + 用户上下文组装
│   │   ├── stream-protocol.ts              # SSE 事件类型
│   │   ├── tools/                          # Tool Registry
│   │   │   ├── index.ts
│   │   │   ├── search-kb.ts
│   │   │   ├── update-node-progress.ts
│   │   │   ├── submit-artifact.ts
│   │   │   └── appeal-score.ts
│   │   ├── prompts/                        # Prompt 模板(版本化)
│   │   │   ├── intake/
│   │   │   ├── learn/
│   │   │   ├── practice/
│   │   │   ├── assess/
│   │   │   └── schema/
│   │   ├── cost-calculator.ts              # ¥ 估算
│   │   ├── rate-limiter.ts                 # 预算熔断
│   │   └── types.ts
│   │
│   ├── auth/                               # 认证
│   │   ├── config.ts                       # Auth.js v5 config
│   │   ├── middleware.ts                   # 路由保护
│   │   └── permissions.ts                  # 权限检查
│   │
│   ├── db/                                 # 数据库
│   │   ├── client.ts                       # Drizzle client(单例)
│   │   ├── schema/                         # 拆分 schema 文件
│   │   │   ├── users.ts
│   │   │   ├── plans.ts
│   │   │   ├── nodes.ts
│   │   │   ├── progress.ts
│   │   │   ├── messages.ts
│   │   │   ├── assessments.ts
│   │   │   ├── kb.ts
│   │   │   ├── stats.ts
│   │   │   └── index.ts                    # 统一导出
│   │   ├── migrations/                     # Drizzle 生成的迁移
│   │   ├── seed/                           # 种子数据
│   │   │   ├── kb-entries.ts               # 初始 KB 10 条
│   │   │   └── dev-users.ts
│   │   └── repositories/                   # Repository 模式(可选,按需)
│   │       ├── plan-repo.ts
│   │       ├── kb-repo.ts
│   │       └── assessment-repo.ts
│   │
│   ├── kb/                                 # 知识库业务
│   │   ├── search.ts                       # RAG 检索
│   │   ├── indexer.ts                      # 重建 embedding
│   │   ├── tier-manager.ts                 # Tier 1/2/3 流转
│   │   └── types.ts
│   │
│   ├── plan/                               # 方案业务
│   │   ├── generator.ts                    # AI 方案生成
│   │   ├── confirmer.ts                    # 方案确认
│   │   ├── node-builder.ts                 # 节点构建
│   │   └── types.ts
│   │
│   ├── assess/                             # 考核业务
│   │   ├── task-builder.ts                 # 任务卡 + Rubric 生成
│   │   ├── artifact-handler.ts             # 产物上传/读取
│   │   ├── scorer.ts                       # 调用 AI 评分
│   │   ├── appeal.ts                       # 复议
│   │   ├── stuck-helper.ts                 # 卡壳兜底
│   │   └── types.ts
│   │
│   ├── progress/                           # 进度业务
│   │   ├── tracker.ts                      # 进度更新
│   │   └── stats-aggregator.ts             # user_stats 同步
│   │
│   ├── i18n/                               # 国际化
│   │   ├── config.ts                       # locales list
│   │   ├── request.ts                      # next-intl server config
│   │   └── locale-detector.ts
│   │
│   ├── observability/                      # 观测
│   │   ├── langfuse.ts                     # AI trace
│   │   ├── sentry.ts                       # 错误
│   │   ├── posthog.ts                      # 产品分析
│   │   └── usage-tracker.ts                # AI 调用计量
│   │
│   ├── storage/                            # 存储
│   │   ├── r2-client.ts                    # S3 SDK + R2
│   │   └── upload.ts                       # 签名 URL
│   │
│   ├── validation/                         # Zod schemas
│   │   ├── plan.ts
│   │   ├── assessment.ts
│   │   ├── kb.ts
│   │   └── user.ts
│   │
│   └── utils/                              # 工具
│       ├── cn.ts                           # className 合并
│       ├── date.ts
│       ├── tokens.ts                       # token 估算
│       ├── retry.ts                        # 重试工具
│       └── errors.ts                       # 错误类型
│
├── messages/                               # i18n 文案
│   ├── en.json
│   └── zh.json
│
├── public/                                 # 静态资源
│   ├── logo.svg
│   ├── favicon.ico
│   └── og-image.png
│
├── tests/                                  # 测试
│   ├── unit/
│   │   ├── ai/
│   │   │   ├── orchestrator.test.ts
│   │   │   └── rubric-builder.test.ts
│   │   ├── kb/
│   │   │   └── search.test.ts
│   │   └── plan/
│   │       └── generator.test.ts
│   ├── integration/                        # 用真实 DB(Neon 分支)
│   │   └── plan-flow.test.ts
│   └── e2e/                                # Playwright
│       ├── auth.spec.ts
│       ├── plan-flow.spec.ts               # 端到端:注册→方案→学→练→考
│       └── assess-appeal.spec.ts
│
├── scripts/                                # 一次性脚本
│   ├── seed-kb.ts
│   ├── migrate.ts                          # Drizzle migrate wrapper
│   └── eval-prompts.ts                     # Prompt offline eval
│
├── docs/                                   # 项目文档
│   ├── planning/                           # 本规划
│   │   ├── 00-overview.md
│   │   ├── 01-features.md
│   │   ├── 02-tech-stack.md
│   │   ├── 03-architecture.md
│   │   ├── 04-data-model.md
│   │   ├── 05-ai-system.md
│   │   ├── 06-structure.md
│   │   ├── 07-roadmap.md
│   │   ├── 08-risks.md
│   │   └── planning.md                     # 合并版
│   ├── adr/                                # Architecture Decision Records
│   │   ├── 0001-why-nextjs.md
│   │   ├── 0002-why-postgres-pgvector.md
│   │   └── 0003-why-deepseek.md
│   └── runbooks/                           # 运维手册
│       ├── deploy.md
│       ├── db-migration.md
│       └── ai-incident.md
│
├── .env.example                            # 环境变量模板
├── .env.local                              # 本地(不提交)
├── .gitignore
├── biome.json                              # 代码规范
├── drizzle.config.ts                       # Drizzle 配置
├── next.config.ts                          # Next.js 配置
├── package.json
├── pnpm-lock.yaml
├── playwright.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## 6.2 关键文件职责

| 文件 | 职责 | 关键依赖 |
|---|---|---|
| `app/[locale]/(app)/layout.tsx` | 应用区 layout:侧边栏 + 顶栏 + 鉴权校验 | Auth.js, next-intl |
| `app/[locale]/(app)/plans/[planId]/learn/[nodeId]/page.tsx` | 学习节点页:知识卡片 + 对话 | RSC, ChatPanel |
| `app/api/chat/route.ts` | SSE 流式对话入口 | runStage(), Langfuse |
| `lib/ai/orchestrator.ts` | **AI 总入口**:load context → pick model → streamText | Vercel AI SDK, Langfuse |
| `lib/ai/context-builder.ts` | 组装 system prompt + history + KB hits | Drizzle, KB search |
| `lib/ai/prompts/learn/node_conversation.v1.md` | Learn 阶段 prompt(版本化) | 无 |
| `lib/ai/tools/index.ts` | 工具注册表(AI 可调用) | Drizzle |
| `lib/db/client.ts` | Drizzle 单例(Neon connection) | Drizzle, Neon |
| `lib/db/schema/plans.ts` | learning_plans 表定义 | Drizzle |
| `lib/kb/search.ts` | 向量检索 + 重排序 | pgvector, bge-m3 |
| `lib/plan/generator.ts` | 调 AI 生成方案(Pro 模型) | runStage('schema_generate') |
| `lib/assess/scorer.ts` | 调 AI 评分(Pro 模型 + Zod 校验) | runStage('assess_score') |
| `lib/auth/config.ts` | Auth.js v5 配置 | Auth.js, Drizzle adapter |
| `middleware.ts` | 全局中间件:鉴权 + i18n 路由 | Auth.js, next-intl |
| `messages/en.json` | 英文文案 | next-intl |

---

## 6.3 模块依赖图

```
                    ┌─────────────────┐
                    │   app/ (UI)     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ↓                    ↓                    ↓
   ┌─────────┐         ┌──────────┐         ┌──────────┐
   │  Auth   │         │   AI     │         │ Components│
   └────┬────┘         └─────┬────┘         └──────────┘
        │                    │
        │           ┌────────┼────────┐
        │           ↓        ↓        ↓
        │      ┌────────┐ ┌────┐ ┌──────┐
        │      │ Prompts│ │Tools│ │Context│
        │      └────┬───┘ └──┬─┘ └──┬───┘
        │           │        │     │
        └───────────┴────────┴─────┘
                    │
        ┌───────────┼───────────┬──────────────┐
        ↓           ↓           ↓              ↓
   ┌────────┐  ┌────────┐  ┌────────┐   ┌──────────┐
   │  DB    │  │  KB    │  │ Plan   │   │ Assess   │
   └────┬───┘  └────┬───┘  └────┬───┘   └────┬─────┘
        │           │           │             │
        └───────────┴───────────┴─────────────┘
                    │
                    ↓
            ┌──────────────┐
            │  Drizzle     │
            └──────┬───────┘
                   ↓
            ┌──────────────┐
            │   Postgres   │
            └──────────────┘

   (侧链) lib/storage (R2)
   (侧链) lib/observability (Langfuse/Sentry/PostHog)
   (侧链) lib/i18n (next-intl)
```

**依赖规则**:
- `app/` 可以依赖任何 `lib/`
- `lib/` 之间通过 Repository / Service 接口解耦
- `lib/ai/orchestrator.ts` 不直接 import 具体业务模块,通过 context-builder 注入
- 任何 `lib/` 模块都可以单独测试

---

## 6.4 命名规范

### 6.4.1 文件命名
- 组件:`kebab-case.tsx` (例:`chat-panel.tsx`)
- 工具:`kebab-case.ts`
- Schema/类型:`kebab-case.ts`
- 页面:`page.tsx` / `layout.tsx` / `route.ts` (Next.js 约定)
- 测试:`*.test.ts` 或 `*.spec.ts`

### 6.4.2 命名
- 变量/函数:`camelCase`
- 类型/接口/类:`PascalCase`
- 常量:`UPPER_SNAKE_CASE`
- 数据库表:`snake_case` (Drizzle 自动)
- DB 字段:`snake_case` (Drizzle 自动)
- TS 字段:`camelCase`(Drizzle 自动转换)
- 组件:`PascalCase`
- 路由段:`kebab-case`

### 6.4.3 导入
- 路径别名:`@/lib/...`, `@/components/...`, `@/app/...`
- 不用相对路径跨目录(`../../`)

### 6.4.4 Server vs Client
- 默认 Server Component
- Client Component 文件名加 `client` 后缀?不,加 `'use client'` 指令在文件顶部
- 例外:`components/chat/chat-panel.tsx` 是 client(因为 useChat),目录上下文已说明

---

## 6.5 关键配置文件说明

### 6.5.1 `package.json` 关键 scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx scripts/migrate.ts",
    "db:seed": "tsx scripts/seed-kb.ts",
    "db:studio": "drizzle-kit studio",
    "eval": "tsx scripts/eval-prompts.ts"
  }
}
```

### 6.5.2 `.env.example` 关键变量

```bash
# === Database ===
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# === Auth.js ===
AUTH_SECRET=               # 32+ char random
AUTH_URL=http://localhost:3000

# === AI ===
DEEPSEEK_API_KEY=
ANTHROPIC_API_KEY=         # 备用
EMBEDDING_API_URL=         # bge-m3 endpoint

# === Storage ===
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=ai-learning-artifacts
R2_PUBLIC_URL=

# === Observability ===
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# === App ===
NEXT_PUBLIC_APP_URL=
NODE_ENV=
```

### 6.5.3 `drizzle.config.ts`

```typescript
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema/*',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### 6.5.4 `biome.json`(简化)

```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": { "useExhaustiveDependencies": "error" }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

---

## 6.6 关键约定

### 6.6.1 Server Action 命名

```typescript
// 命名: <verb><Entity>Action
'use server';
export async function createPlanAction(input: CreatePlanInput) { /* ... */ }
export async function submitArtifactAction(input: SubmitArtifactInput) { /* ... */ }
export async function appealScoreAction(input: AppealScoreInput) { /* ... */ }
```

### 6.6.2 错误处理

```typescript
// 业务错误:抛 BusinessError
throw new BusinessError('PLAN_NOT_FOUND', '方案不存在');

// 外部错误:重试 + 降级
const result = await retry(() => deepseek.chat(prompt));

// 致命错误:让 Sentry 捕获,返回 500
```

### 6.6.3 权限校验

```typescript
// 每个 Server Action / Route Handler 第一行
const user = await requireUser();
await requirePlanOwner(user, planId);
```

### 6.6.4 事务

```typescript
// 业务状态变更必须 transaction
await db.transaction(async (tx) => {
  await tx.update(plans).set({ status: 'completed' }).where(eq(plans.id, planId));
  await tx.update(userStats).set({ completedPlans: sql`${userStats.completedPlans} + 1` }).where(...);
});
```

---

## 6.7 测试组织

### 6.7.1 测试金字塔

```
       /\
      /  \  E2E (Playwright)
     /────\  关键用户路径,10-20 个
    /      \
   /────────\  Integration (Vitest + real DB)
  /          \  跨模块,5-10 个
 /────────────\
/   Unit (Vitest)   \
/    70%+ 覆盖率      \
/____________________\
```

### 6.7.2 必须测试的模块

- `lib/ai/orchestrator.ts` — 行为契约
- `lib/kb/search.ts` — 检索质量
- `lib/plan/generator.ts` — 输出结构
- `lib/assess/scorer.ts` — 评分逻辑
- `lib/auth/*` — 鉴权
- 关键 Server Actions

### 6.7.3 不测试的

- shadcn 复制组件
- 简单 CRUD(能用 SQL 验证的不写 TS 测试)
- AI 输出内容(不稳定,改用 eval 数据集)

---

## 6.8 v1 不创建的目录(明确不做)

- ❌ `pages/`(用 App Router)
- ❌ `src/`(用 root 布局,Next.js 15 推荐)
- ❌ `prisma/`(用 Drizzle)
- ❌ `workers/`(v1 不需要独立 worker,Server Actions 够用)
- ❌ `mocks/`(用 MSW 或 vitest mock)
- ❌ `__mocks__`(同上)

---

## 6.9 本章产出物确认

- [x] 完整目录树(8 大区块)
- [x] 15 个关键文件职责
- [x] 模块依赖图
- [x] 命名规范(4 类)
- [x] 4 个关键配置说明
- [x] 4 项代码约定
- [x] 测试组织(金字塔 + 必测 + 不测)
- [x] v1 不做项明确

**下一章预告**:`07-roadmap.md` — 开发路线图(6 周 MVP → v1 上线 → v2 演进,带每周 milestone)
