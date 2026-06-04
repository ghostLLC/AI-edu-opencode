# AI-Edu-OpenCode

> **AI 时代的学习平台** — 在知识随时可被 AI 调用的时代,把"记住什么"重新定义为"能做什么"。

[![Status](https://img.shields.io/badge/status-v0.1%20planning-blue)]()
[![Stage](https://img.shields.io/badge/stage-pre--code-orange)]()
[![License](https://img.shields.io/badge/license-TBD-lightgrey)]()

## 项目简介

本项目旨在为 AI 时代重新设计"学习"。通过 **3 模式入口 × 3 阶段闭环** 的方法论,让学习者从"知识消费者"转变为"AI 时代的协作者"。

**3 种入口模式**:明确目标 / 无目标探索 / 技能重塑(v2)
**3 个学习阶段**:Learn(苏格拉底式)→ Practice(巩固式)→ Assess(真实任务评估)
**核心护城河**:KB 三层机制(预设库 + AI 当场 + 社区贡献)

## 当前状态

**v0.1 — 规划阶段(8 章完整规划)**

| 阶段 | 状态 | 时间 |
|---|---|---|
| 规划文档 | ✅ 完成 | 2026-06-04 |
| 骨架文件 | ⏳ 下一步 | Week 1 |
| v1 MVP 上线 | 📋 计划中 | 6 周后 |

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

- **框架**: Next.js 15 (App Router + RSC)
- **数据库**: PostgreSQL 16 + pgvector
- **ORM**: Drizzle
- **AI**: DeepSeek-V4 (Flash/Pro) + Vercel AI SDK
- **认证**: Auth.js v5
- **部署**: Vercel(海外先跑)
- **观测**: Langfuse + Sentry + PostHog

详细选型 + 理由: [Ch 02](./docs/planning/02-tech-stack.md)

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

## 开发状态

🚧 **当前在规划阶段**。代码即将开始(Week 1:Foundation)。

```bash
# 即将可用(Week 1 后):
git clone https://github.com/ghostLLC/AI-edu-opencode.git
cd AI-edu-opencode
pnpm install
pnpm dev
```

## 贡献

项目目前为 1 人所有。规划欢迎讨论 — 请开 issue 标注 `discussion` 标签。

## 许可证

TBD(将在 v1 上线前确定)

## 联系方式

- GitHub: [@ghostLLC](https://github.com/ghostLLC)
- 项目主页: https://github.com/ghostLLC/AI-edu-opencode

---

> **状态快照**: 规划完成度 100% | 骨架代码 0% | 用户 0
> **下一里程碑**: Week 1 末 — 跑通 `pnpm dev`,能注册登录
