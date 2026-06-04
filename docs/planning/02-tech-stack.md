# Chapter 02: 技术栈选型

> 本章列出 v1 推荐技术栈,每项含"为什么选 / 什么时候不选"。
> 配套:Ch 03 架构 / Ch 04 数据模型 / Ch 05 AI 系统
> 版本:v0.1 | 状态:草稿

---

## 2.0 总览:技术栈矩阵

| 层 | 选型 | 一句话理由 |
|---|---|---|
| **框架** | Next.js 15 (App Router + RSC) | 一体化、SSR 友好、AI 流式原生 |
| **UI 库** | shadcn/ui + Tailwind CSS | 不锁定、可复制粘贴、定制自由 |
| **状态管理** | Zustand + Server Components | 局部 Zustand,服务端状态靠 RSC |
| **API 风格** | Server Actions + Route Handlers | 写起来快,流式友好 |
| **数据库** | PostgreSQL 16 + pgvector | 一库两用(关系+向量) |
| **ORM** | Drizzle ORM | 轻、类型安全、SQL 透明 |
| **认证** | Auth.js v5 (NextAuth) | 开源、灵活、零供应商锁定 |
| **AI 编排** | Vercel AI SDK v4 + 自研调度层 | 流式一流 + 业务编排灵活 |
| **LLM 主模型** | DeepSeek-V4 Flash(对话/实践/学习) | 性价比高、流式快 |
| **LLM 强模型** | DeepSeek-V4 Pro(方案生成/考核评分) | 推理稳,关键路径用 |
| **Embedding** | bge-m3 或 Qwen3-Embedding | 多语言支持好 |
| **向量检索** | pgvector(HNSW 索引) | 复用 Postgres,无额外组件 |
| **文件存储** | Cloudflare R2 | S3 兼容,出流量免费 |
| **部署** | Vercel(主) + Cloudflare(备) | 海外零运维 + Edge 加速 |
| **观测** | Langfuse(AI) + Sentry(代码) + PostHog(产品) | 各自领域最佳 |
| **i18n** | next-intl | Next.js 15 官方推荐 |
| **测试** | Vitest(单元) + Playwright(E2E) | 现代、快速 |
| **包管理** | pnpm | 快、节省空间、monorepo 友好 |
| **代码规范** | Biome(替代 ESLint+Prettier) | 零配置、10x 快 |

---

## 2.1 框架:Next.js 15 (App Router + RSC)

### 为什么选
1. **一体化** — 前端 + API + Server 渲染,1 个项目搞定
2. **流式 AI 原生** — Vercel AI SDK 和 Next.js 是一家人,Server Components + Suspense for Streaming 是为 AI 流式输出设计的
3. **Server Actions** — 写后端逻辑不用再开 Express/FastAPI,前端直接 `await serverAction()`
4. **部署最简** — Vercel 一键部署、预览环境、自动扩缩容
5. **生态最广** — 招人/招 contributor/找参考都容易

### 什么时候不选
- 需要复杂的后台任务编排(用 Server Actions 不够) → 配 Inngest / Trigger.dev
- 需要长期运行的进程 → 用 Railway/Fly.io 单独跑 worker

### 关键决策
- ✅ App Router(不是 Pages Router)— RSC 是未来
- ✅ Server Actions(主) + Route Handlers(辅助,用于 webhook/公开 API)
- ✅ TypeScript strict 模式
- ❌ 不上 turbopack(虽然 GA 但偶尔有边界 bug,先 webpack 稳)

---

## 2.2 UI:shadcn/ui + Tailwind CSS

### 为什么选
1. **不锁定** — 组件源码复制到项目里,自己改,不是依赖项
2. **设计感** — 默认就比手写好看 3 个档次
3. **可访问性** — 基于 Radix UI,默认 a11y 友好
4. **定制自由** — Tailwind 让"设计 token"和"组件实现"解耦

### 替代方案对比
- **Mantine/Chakra/MUI** — 完整组件库,但定制需要 hack,样式污染风险
- **Ant Design** — 风格偏企业,设计感弱
- **手写** — 1 人项目不现实

---

## 2.3 状态管理:Zustand + Server Components

### 为什么选
- **Server Components** 是默认,数据从服务端来,客户端不再需要"fetch + 存 state"
- **Zustand** 处理客户端的瞬时状态(对话框开/关、tab 切换、引用关键词缓冲)
- 不上 Redux(过度工程)、不上 Jotai(粒度太细反而乱)

### 数据流原则
```
Server (DB) ──→ RSC ──→ 客户端组件(只读)
                              ↓ 交互
                         Server Action ──→ DB
                              ↓
                         重新 RSC 渲染
```

---

## 2.4 数据库:PostgreSQL 16 + pgvector

### 为什么选
1. **一库两用** — 关系数据 + 向量检索,1 个事务搞定
2. **成熟** — Postgres 是世界上最好的开源 DB
3. **pgvector 0.7+** — HNSW 索引,千万级向量毫秒级
4. **生态** — Drizzle、Prisma、Supabase、Neon 都支持
5. **成本** — 不用额外维护 Pinecone/Qdrant,hosted Postgres 也便宜

### 部署方案
- **首选**:Neon(分支数据库 + 自动休眠,v1 流量小,成本 < $20/月)
- **备选**:Supabase(海外访问有地域问题,不一定)
- **自建**:Railway/Fly.io(运维成本高,1 人不推荐)

### 什么时候不选
- 向量数据 > 5000 万条 → 拆到专用向量 DB(Qdrant/Turbopuffer)
- 多区域部署 → 考虑 PlanetScale/Neon 多 region

---

## 2.5 ORM:Drizzle

### 为什么选
1. **类型安全** — schema 改了,TS 类型自动改
2. **SQL 透明** — 不藏 SQL,复杂查询可写 raw SQL
3. **轻量** — 编译期生成,运行时小
4. **支持 pgvector** — 自定义类型 OK

### 替代方案对比
- **Prisma** — 体验好但 bundle 大、pgvector 支持弱
- **Kysely** — 太"裸",1 人项目不友好
- **手写 SQL** — type-safety 差

---

## 2.6 认证:Auth.js v5 (NextAuth)

### 为什么选
1. **开源、零锁定** — 不像 Clerk 那样绑死
2. **多 provider** — 邮箱/OAuth/credentials 都支持
3. **数据库 adapter** — Drizzle adapter 完善
4. **中英友好** — 文案可改,无语言绑架

### 配置
- Email + Password(主,v1 基础)
- Google OAuth(v1.1,海外用户)
- 暂时不上 GitHub OAuth(避免开发语义混淆)
- 微信/手机号验证码 — v2 国内版再加

### 替代方案对比
- **Clerk** — 体验好但贵、绑定深、用户数据在 Clerk
- **Supabase Auth** — 和 Supabase DB 强绑定,我们不用 Supabase
- **Better-Auth** — 新兴,有潜力,v1 之后再观察

---

## 2.7 AI 编排:Vercel AI SDK v4 + 自研调度层

### 为什么选 Vercel AI SDK
1. **流式一流** — `streamText` / `useChat` 是行业标杆
2. **多 provider 适配** — OpenAI/Anthropic/DeepSeek 统一接口
3. **Edge runtime 支持** — 全球低延迟
4. **工具调用** — function calling 简洁

### 为什么要自研调度层
Vercel AI SDK 不做"业务级编排",而我们有:
- 多阶段 AI 行为切换(Learn/Practice/Assess 3 套 prompt)
- KB 检索增强(RAG)
- 用户上下文(模式/进度/历史)注入
- 工具调用(评分、KB 写入、提交)

我们的调度层在 `lib/ai/orchestrator.ts`,封装成 1 个 `runStage(userId, stage, input)` 接口。

### DeepSeek 接入
- Vercel AI SDK 通过 `customProvider` 接入 DeepSeek API
- 注意 DeepSeek API 兼容 OpenAI 格式,无需重写

---

## 2.8 LLM 模型分工

| 任务 | 模型 | 理由 |
|---|---|---|
| **学习对话(Learn)** | DeepSeek-V4 Flash | 高频、流式、对话连贯即可 |
| **实践对话(Practice)** | DeepSeek-V4 Flash | 同上,量大,Flash 够用 |
| **方案生成(SchemaGen)** | DeepSeek-V4 Pro | 关键路径,质量优先 |
| **需求判定(DemandJudge)** | DeepSeek-V4 Flash | 结构化输出,Flash 即可 |
| **考核评分(Assess)** | DeepSeek-V4 Pro | 必须严谨,Pro 兜底 |
| **Embedding** | bge-m3 | 多语言、1024 维、性价比高 |
| **重排序(可选)** | bge-reranker-v2-m3 | 提升检索质量 |

### 成本估算(1000 用户场景)

| 模型 | 输入/输出价 | 单次调用平均 | 每天调用 | 月成本 |
|---|---|---|---|---|
| DeepSeek-V4 Flash | ~¥0.5/M input, ~¥2/M output | 2K input + 1K output | 50K | ~¥150 |
| DeepSeek-V4 Pro | ~¥2/M input, ~¥8/M output | 2K input + 1K output | 5K | ~¥100 |
| Embedding | ~¥0.1/M | 200 tokens | 5K | ~¥1 |
| **合计** | | | | **~¥250/月** |

> 海外用户用 Vercel + DeepSeek 国际 API,价格按 USD 结算但量级相同。

---

## 2.9 文件存储:Cloudflare R2

### 为什么选
1. **S3 兼容** — 任何 S3 SDK 都能用
2. **出流量免费** — 这是 R2 杀手锏,Egress $0
3. **存储便宜** — $0.015/GB/月
4. **Vercel 集成好** — `@aws-sdk/client-s3` 配合 R2 endpoint 即可

### 用在哪
- 用户提交的考核产物(网页截图、代码 zip、应用构建产物)
- 后续:v2 视频提交(虽然 v1 不做,但 bucket 提前建好)

### 替代
- **AWS S3** — 出流量贵
- **Vercel Blob** — 简单但贵
- **Supabase Storage** — 我们不用 Supabase

---

## 2.10 部署:Vercel(主)

### 为什么选
1. **Next.js 一家人** — 零配置部署
2. **预览环境** — 每个 PR 自动预览
3. **Edge runtime** — 全球低延迟
4. **自动扩缩容** — v1 流量小,基本免费
5. **环境变量管理** — dev/staging/prod 隔离清晰

### 部署架构
```
GitHub push
    ↓
Vercel 自动 build
    ↓
[Preview] PR 环境(每个 PR 独立 URL)
    ↓
[Production] main 分支
    ↓
    ├─→ Vercel Edge Network(全球 CDN)
    ├─→ Serverless Functions(API 路由)
    └─→ Static Assets(R2 + Image Optimization)
```

### 成本估算
- Hobby plan:$0(适合 v1 早期)
- Pro plan:$20/月(团队/正式上线)
- 实际项目资源(functions 执行时间、bandwidth)超额才加钱

### 备选
- **Cloudflare Pages + Workers** — 更便宜但 Next.js 兼容性差
- **Railway / Fly.io** — 更灵活但运维成本高
- **AWS Amplify** — 太复杂

---

## 2.11 观测:三件套

### Langfuse(AI 观测)— 必须
1. **trace** 每次 AI 调用(输入、输出、token、延迟)
2. **评估** 用户反馈(点赞/点踩/重做)
3. **数据集** 积累好的 prompt-template,做 offline eval
4. **开源** — 海外可自部署,数据自己掌控
5. **价格** — SaaS 免费 50K traces/月,v1 够用

### Sentry(代码观测)— 必须
- 错误捕获、堆栈、性能
- 1 人项目必备,出问题能马上知道

### PostHog(产品分析)— 必须
- 用户行为、转化漏斗、留存
- 比 GA4 强在事件细粒度 + 不采样

---

## 2.12 i18n:next-intl

### 为什么选
1. **Next.js 15 官方推荐**
2. **App Router 原生支持**
3. **类型安全** — 文案 key 有 TS 类型
4. **轻量** — 编译时处理,无运行时大包

### 落地策略
- 文案:放 `messages/en.json` / `messages/zh.json`
- AI prompt:动态选择 system prompt 模板
- KB:用 `language` 字段筛选(英文 KB 给英文用户)

---

## 2.13 测试:Vitest + Playwright

### Vitest(单元/集成)
- 速度快(Vite 生态)
- TS 友好
- AI 编排层是关键测试目标

### Playwright(E2E)
- 关键用户路径(注册→方案→学→练→考)
- 跨浏览器
- 视觉回归(可选,v1 后期)

### v1 测试策略
- AI 编排层:覆盖率 > 80%
- 关键业务逻辑:覆盖率 > 60%
- UI:不写单元测试(性价比低),靠 E2E
- AI 输出:不写断言(LLM 输出不稳定),靠 eval 数据集

---

## 2.14 包管理:pnpm

### 为什么选
1. **快** — 比 npm/yarn 快 2-3x
2. **节省空间** — 硬链接共享 store
3. **monorepo 友好** — workspace 协议简单
4. **strict** — phantom dependency 检测

---

## 2.15 代码规范:Biome

### 为什么选
1. **零配置** — 开箱即用
2. **10x 快** — Rust 写的,比 ESLint+Prettier 快 10 倍
3. **合并 lint+format** — 一个工具搞定
4. **TS 友好** — 内置 TS 支持

### 替代
- ESLint+Prettier — 配置地狱,慢
- dprint — 也不错,但生态小

---

## 2.16 备选技术栈(什么时候切换)

| 当前选型 | 切换信号 | 切换到 |
|---|---|---|
| Next.js 15 | 需要重 CPU 后台任务 | + Inngest / Trigger.dev |
| Postgres + pgvector | 向量 > 5000 万 | + Qdrant / Turbopuffer |
| Vercel | 月成本 > $500 | + Cloudflare + Railway 混合 |
| Auth.js | 需要 B2B SSO | WorkOS |
| DeepSeek | 海外访问不稳 | 备用 Anthropic Claude |
| Zustand | 全局状态爆炸 | Jotai / Redux Toolkit |

---

## 2.17 v1 技术栈采购清单

### 服务(订阅)
- Vercel Pro:$20/月
- Neon Postgres:$0~19/月(v1 用 free 或 launch)
- Cloudflare R2:$0~5/月
- Langfuse Cloud:$0(v1 用 free tier)
- Sentry:$0(v1 用 free tier)
- PostHog Cloud:$0(v1 用 free tier)
- DeepSeek API:按量,~¥250/月(1000 用户估算)

**月成本估算**:**¥300-500/月(1000 用户),¥50/月(100 用户早期)**

### 一次性
- 域名:$10-15/年
- 可能的 logo/设计外包:$0(用开源资源 + AI 生成)

---

## 2.18 本章产出物确认

- [x] 19 项技术选型
- [x] 每项"为什么选 / 什么时候不选"
- [x] 模型分工 + 成本估算
- [x] 备选切换信号
- [x] 月度成本估算

**下一章预告**:`03-architecture.md` — 系统架构(高层模块图、低层部署图、关键时序图、错误处理)
