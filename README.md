# AI-Edu-OpenCode

> **AI 时代的学习平台** — 在知识随时可被 AI 调用的时代,把"记住什么"重新定义为"能做什么"。

[![Status](https://img.shields.io/badge/status-v0.1%20skeleton-yellow)]()
[![Stage](https://img.shields.io/badge/stage-week%201%20foundation-orange)]()
[![License](https://img.shields.io/badge/license-TBD-lightgrey)]()

## 项目简介

本项目旨在为 AI 时代重新设计"学习"。通过 **3 模式入口 × 3 阶段闭环** 的方法论,让学习者从"知识消费者"转变为"AI 时代的协作者"。

- **3 种入口模式**:明确目标 / 无目标探索 / 技能重塑(v2)
- **3 个学习阶段**:Learn(苏格拉底式)→ Practice(巩固式)→ Assess(真实任务评估)
- **核心护城河**:KB 三层机制(预设库 + AI 当场 + 社区贡献)

## 当前状态

**v0.1 — 骨架阶段(Week 1 Foundation)**

| 阶段 | 状态 | 备注 |
|---|---|---|
| 规划文档 | ✅ 完成 | `docs/planning/planning.md`(8 章合并,138 KB) |
| 骨架文件 | ✅ 完成 | Next.js 15 + Drizzle + Auth.js v5 + i18n |
| pnpm install | 📋 待验证 | 见下方"本地启动" |
| v1 MVP | 📋 计划中 | 6 周后 |

### 骨架包含

- **配置层**:package.json / tsconfig / biome / drizzle / tailwind / vitest / playwright
- **数据层**:11 张 Drizzle schema(users / auth / plans / nodes / progress / messages / assessments / kb / stats / v2-reserved)
- **路由层**:i18n 中间件 + App Router 页面(locale 感知)+ 鉴权保护
- **AI 层**:orchestrator stub + 模型选型 + cost calculator + rate limiter
- **UI 层**:shadcn-ui 基础组件(Button/Input/Label/Card/Textarea)+ 共享组件(nav-sidebar / user-menu / language-switcher)
- **i18n**:en/zh 翻译文件,所有页面已接入
- **观测层**:Langfuse / Sentry / PostHog 接入桩
- **测试**:Vitest 单测示例 + Playwright E2E 烟雾测试
- **脚本**:Drizzle migrate + KB 种子脚本

## 本地启动

### 前置条件

- Node.js >= 20.0.0
- pnpm 9.x(`npm install -g pnpm`)
- 一个 Postgres 数据库(推荐 [Neon](https://neon.tech) 免费档,需要 pgvector 支持)
- 各种 API key(见 `.env.example`)

### 步骤

```bash
# 1. 克隆
git clone https://github.com/ghostLLC/AI-edu-opencode.git
cd AI-edu-opencode

# 2. 安装依赖
pnpm install

# 3. 配环境变量
cp .env.example .env.local
# 编辑 .env.local,至少填 DATABASE_URL 和 AUTH_SECRET
# AUTH_SECRET 生成: openssl rand -base64 32

# 4. 生成并执行 Drizzle 迁移
pnpm db:generate
pnpm db:migrate

# 5. (可选) 种子数据
pnpm db:seed

# 6. 启动开发服务器
pnpm dev
# → http://localhost:3000
```

### 脚本一览

| 命令 | 作用 |
|---|---|
| `pnpm dev` | 启动 Next.js 开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` / `pnpm lint:fix` | Biome 检查 / 自动修复 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm test` | Vitest 单测 |
| `pnpm test:e2e` | Playwright E2E(需要 dev server 运行) |
| `pnpm db:generate` | 从 schema 生成迁移 SQL |
| `pnpm db:migrate` | 执行迁移 |
| `pnpm db:push` | 跳过迁移直接同步(开发用) |
| `pnpm db:studio` | Drizzle Studio(数据库 GUI) |
| `pnpm db:seed` | 种子 KB 预设库 |

### 注意

- **Embedding**:KB 的 HNSW 索引需在迁移 SQL 中手动加(见 `lib/db/schema/kb.ts` 注释)
- **Vercel 部署**:准备用 Neon 时,把 `lib/db/client.ts` 改用 `@neondatabase/serverless` 适配
- **Auth.js password 存储**:当前 authorize() 是 stub,Week 2 接 bcryptjs 完整流程
- **AI 编排**:runStage() 当前是 echo stub,Week 2 接入完整 RAG + history

## 文档导航

完整规划在 [`docs/planning/planning.md`](./docs/planning/planning.md)(138 KB 合并版)。

| 章节 | 标题 | 关键产出 |
|---|---|---|
| [Ch 00](./docs/planning/00-overview.md) | 项目概述 & 目标 | 愿景/范围/成功指标 |
| [Ch 01](./docs/planning/01-features.md) | 核心功能设计 | 3 模式 × 3 阶段行为契约 |
| [Ch 02](./docs/planning/02-tech-stack.md) | 技术栈选型 | 19 项选型 + 成本估算 |
| [Ch 03](./docs/planning/03-architecture.md) | 系统架构 | 高层/低层/时序图 |
| [Ch 04](./docs/planning/04-data-model.md) | 数据模型 | 11 张表 + 索引策略 |
| [Ch 05](./docs/planning/05-ai-system.md) | AI 系统设计 | 模型分工 + Prompt + RAG |
| [Ch 06](./docs/planning/06-structure.md) | 模块/文件结构 | 完整目录树 |
| [Ch 07](./docs/planning/07-roadmap.md) | 开发路线图 | 6 周 MVP + 30/60/90 天 |
| [Ch 08](./docs/planning/08-risks.md) | 风险 & 应对 | 11 项风险 + 应急预案 |

## 技术栈速览

- **框架**:Next.js 15 (App Router + RSC) + React 19
- **数据库**:PostgreSQL 16 + pgvector(Neon 托管)
- **ORM**:Drizzle
- **AI**:DeepSeek-V4 (Flash/Pro) + Vercel AI SDK + bge-m3 embeddings
- **认证**:Auth.js v5 + Drizzle adapter(Credentials + v1 加 OAuth)
- **i18n**:next-intl v3(英文为主,中文为辅)
- **UI**:shadcn-ui + Tailwind CSS 3 + Radix UI
- **部署**:Vercel(海外先跑)
- **观测**:Langfuse / Sentry / PostHog
- **测试**:Vitest(单测)+ Playwright(E2E)

详细选型 + 理由:[Ch 02](./docs/planning/02-tech-stack.md)

## 范围

### v1(6 周 MVP)

- 模式 1(明确目标)+ 全 3 阶段最小版
- 用户系统(Auth.js + Postgres)
- KB 三层机制(预设层初始化为空,AI 当场为主,社区 v1 关闭)
- DeepSeek-V4 对接(Flash + Pro 分工)
- 中英双语 UI(英文为主)
- 基础观测(Langfuse)

### 不做(v1 明确排除)

- 模式 2(无目标)UI / 模式 3(技能重塑)— 数据预留,v2 启用
- 社区贡献入口
- 移动端 / 桌面端
- 支付 / 会员 / 证书
- 直播 / 录播

## 团队

- 1 人(全栈 + AI + 运营)

## 关键决策摘要

| 维度 | 决策 |
|---|---|
| 平台 | Web 优先,Next.js 全栈 |
| AI 后端 | 纯 API(国内偏好:DeepSeek-V4 Pro/Flash) |
| 部署 | 海外先跑(Vercel) |
| 国际化 | 中英双语(英文为主) |
| 答案 KB | 预设 + AI 当场 + 社区(3 层机制) |
| 北极星指标 | 完成 1 个完整学-练-考闭环的活跃用户数 |

## 贡献

项目目前为 1 人所有。规划欢迎讨论 — 请开 issue 标注 `discussion` 标签。

## 许可证

TBD(将在 v1 上线前确定)

## 联系方式

- GitHub: [@ghostLLC](https://github.com/ghostLLC)
- 项目主页:https://github.com/ghostLLC/AI-edu-opencode

---

> **状态快照**:规划完成度 100% | 骨架代码 100% | 用户 0
> **下一里程碑**:Week 1 末 — `pnpm dev` 跑通,注册登录流程联通
