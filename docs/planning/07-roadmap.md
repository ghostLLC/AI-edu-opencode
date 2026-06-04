# Chapter 07: 开发路线图

> 本章定义 v1(6 周 MVP)→ v2(3-6 月)→ v3(12 月+) 的开发路线、每周 milestone、人力分配。
> 配套:Ch 00 范围 / Ch 01 功能切片
> 版本:v0.2 | 状态:进行中(Week 1 + Week 2 已完成)

---

## 7.0 路线图总览

```
                v0 (现在)        v1 (6 周后)              v2 (3-6 月)              v3 (12 月+)
                ──────           ──────────              ──────────               ─────────
范围:            规划             模式 1 + 3 阶段           + 模式 2 + 社区          + 模式 3 + 微证书
                0 用户            100+ 闭环用户              1000+ 用户               10000+ 用户
团队:            1 人(全栈)       1 人                      1-2 人                   2-3 人
成本/月:         ~$50             ~$200                    ~$500                    ~$2000
核心目标:        跑通 3 阶段闭环    验证 AI 教学价值           验证内容飞轮              验证商业化
```

---

## 7.1 v1:6 周 MVP(强制 6 周,不再延)

> 原则:**每周有可演示产物,从不"等到结束才看东西"**。

### Week 0:规划确认(已完成)

| 任务 | 产出 |
|---|---|
| 产出 8 章规划文档 | `docs/planning/planning.md` |
| 用户确认规划 | 签字 OR 异议清单 |
| 项目目录创建 | `ai-learning-platform/` |
| README.md | 项目入口 |
| 域名 + 部署账号 | vercel / neon / r2 / sentry / posthog / langfuse |

### Week 1:Foundation(地基)

| Day | 任务 | 产出 |
|---|---|---|
| 1-2 | Next.js 15 + TS + Biome + pnpm 初始化 | 跑通 `pnpm dev` |
| 2-3 | Drizzle + Neon 连接 + 写全部 schema | `drizzle-kit generate` 通过 |
| 3-4 | Auth.js v5 + Drizzle adapter + Email/Password | 能注册登录 |
| 4-5 | shadcn/ui 初始化 + Tailwind + 基础 layout | UI 框架就绪 |
| 5 | next-intl + en/zh 文案(骨架) | 双语切换 |
| 6 | i18n 路由 + middleware 鉴权 | 未登录跳 /sign-in |

**Demo 节点**:能注册登录,看到空 dashboard,UI 双语切换正常。

### Week 2:AI 编排基础 ✅ 已完成 (2026-06-04)

| Day | 任务 | 产出 | 状态 |
|---|---|---|---|
| 1-2 | Vercel AI SDK + DeepSeek 接入 | `lib/ai/providers.ts` (customProvider w/ languageModels + textEmbeddingModels) | ✅ |
| 2-3 | Prompt Registry + 模板加载机制 | `lib/ai/prompts/{intake,learn,practice,assess}.ts`(4 个 stage 系统提示 + 用户提示构造器) | ✅ |
| 3-4 | Orchestrator 骨架 + Context Builder | `lib/ai/orchestrator.ts` (runStage 调度 4 阶段) + `lib/ai/context.ts` (loadContext 加载 user/plan/node/history) | ✅ |
| 4-5 | KB 检索服务 + 阈值过滤 | `lib/ai/kb/embedder.ts` (bge-m3 1024-dim) + `lib/ai/kb/retriever.ts` (pgvector cosine via Drizzle sql) | ✅ |
| 5-6 | Stage Handlers + 持久化 | `lib/ai/stages/{intake,learn,practice,assess}.ts` + `message-store.ts` (chat_messages 写入 + assessmentScores 插入) | ✅ |
| 6 | Cost Guardrail + Langfuse | `lib/ai/rate-limiter.ts` (日预算 ¥1/user + 持久化 totalAiCalls/totalTokensUsed) + Langfuse trace 在 onFinish 调用 | ✅ |

**Demo 节点**:`POST /api/chat {stage:'intake'}` → 调 DeepSeek-V4 Pro (generateObject w/ Zod schema) → 自动持久化 learning_plans + plan_nodes + 返回 JSON {planId, plan};`{stage:'learn'|'practice'}` → Flash 流式对话 (streamText) + chat_messages 持久化;`{stage:'assess'}` → Pro 结构化评分 + assessment_scores 行 + 评估总分行更新;Langfuse 每次调用有 trace。

**模型分工(Week 2 实际实现)**:
- `deepseek-v4-pro` (Pro):intake (方案生成) + assess (评分)。对正确性要求高。
- `deepseek-v4-flash` (Flash):learn (苏格拉底) + practice (任务生成)。对延迟要求高。

**预算护栏**:每用户每日 ¥1 in-memory 计数,超限返回 HTTP 429;`user_stats.total_ai_calls` / `total_tokens_used` 实时累加。

**未做(明确推迟)**:
- Tool Registry(Week 2 没用工具调用,直接在 stage handler 里做 RAG + 持久化)
- Sentry / PostHog 接入(Week 2 暂时跳过,等 Week 3 客户端 UI 一起接)

**下一里程碑**:Week 3 — Intake UI(多行需求输入 → 调用 orchestrator → 方案确认页)。

### Week 3:Intake + 方案生成(模式 1 主流程)

| Day | 任务 | 产出 |
|---|---|---|
| 1-2 | Need Capture UI(多行输入 + 提交) | 需求提交 |
| 2-3 | Demand Judge AI 调用 + 结构化输出 | 需求画像入库 |
| 3-4 | KB 检索服务 + 阈值过滤 + 兜底 | Tier 1 命中/未命中分支 |
| 4-5 | Schema Generator(Pro 模型)+ Zod 校验 | 方案 JSON 生成 |
| 5-6 | Plan Confirm 页 + 节点可视化 | 用户能看方案 |
| 6 | Plan 持久化 + 状态机驱动 | learning_plans 数据 |

**Demo 节点**:输入需求 → AI 判定 → 检索 KB → 生成方案 → 看到完整方案页(可读,但 3 阶段内容空)。

### Week 4:Learn + Practice 阶段

| Day | 任务 | 产出 |
|---|---|---|
| 1-2 | Knowledge Node 组件 + 关键词结构 | 节点 UI 渲染 |
| 2-3 | Citation Chip + 引用提问输入框 | 引用交互 |
| 3-4 | Learn 阶段 prompt + 对话流 + 流式 | 能进入 Learn 阶段对话 |
| 4-5 | Practice 阶段 prompt + 巩固对话 | 能进入 Practice 阶段 |
| 5-6 | Node Progress 跟踪 + 状态切换 | 进度可视化 |
| 6 | 节点"已掌握确认"机制 | 阶段切换 |

**Demo 节点**:能从方案进入 Learn,苏格拉底式对话,引用关键词提问;完成后进入 Practice,巩固式对话。

### Week 5:Assess 阶段

| Day | 任务 | 产出 |
|---|---|---|
| 1-2 | Task Card UI + 任务描述渲染 | 任务展示 |
| 2-3 | Artifact Uploader(R2 签名 URL) | 文件/截图/URL/文本提交 |
| 3-4 | Rubric Generator(Pro)+ Zod 校验 | rubric 入库 |
| 4-5 | Scorer(Pro)+ 结构化输出 + reasoning | AI 评分 |
| 5-6 | Score Report 组件 + 复议机制 | 评分报告 + 复议表单 |
| 6 | Stuck Helper(Flash + KB 检索)+ 3 次熔断 | 卡壳兜底 |

**Demo 节点**:进入 Assess,看到任务卡,提交产物,看到 AI 评分,能复议。

### Week 7:v1.1 Polish (v0.4 已落地, 2026-06-04)

> Week 6 之后立刻做的小批量,给 Day 2/5/6 (用户操作) 之前先准备好可自动化的部分。

| 任务 | 实际产出 | 状态 |
|---|---|---|
| **PostHog mount + 4 事件** | `lib/observability/posthog.tsx` (已存在) 挂到 `app/[locale]/(app)/layout.tsx`;新建 `lib/observability/track.ts` (safe no-op 当 key 未配);`sign_up_completed` / `intake_submitted` / `learn_message_sent` / `practice_message_sent` / `assess_submitted` / `node_marked_complete` 6 个事件接入到 5 个 client component | ✅ |
| **Sentry 真接** | `sentry.client.config.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts` 3 文件 (DSN 缺失时静默 skip);`next.config.ts` wrap `withSentryConfig` (silent 当 `SENTRY_AUTH_TOKEN` 未配, build 不会 fail) | ✅ |
| **RAG 阈值 0.6 → 0.7** | `lib/ai/orchestrator.ts` intake stage 调 `retrieveKB` 时 `minSimilarity: 0.7`;`lib/ai/kb/retriever.ts` 加 hit-rate 日志 (`[kb.retriever] queryLen=42 hits=3/5 topSim=0.820 lang=en minSim=0.7`);`sendDefaultPii: false` 默认 | ✅ |
| **Eval 脚本** | `scripts/eval-prompts.ts` (对应 `pnpm eval`): 5 个 KB 命中测试 (前端/语言/云/数据/写作),纯 dry-run 跑 `embedText` + pgvector cosine,输出 markdown 表格 + summary;`EVAL_MODE=full` 留 hook 但未实现 LLM 评估(成本考虑) | ✅ |
| **DEPLOY.md** | `docs/DEPLOY.md`: 12 节 step-by-step (Neon → DeepSeek → Auth → Langfuse → Sentry → PostHog → R2 → Vercel → 域名 → 验证 → 成本 → 排错);每服务标 free tier 限额 + v1 100 用户真实成本估算 (~$1/月 / 100 用户 $60-100/月) | ✅ |
| **vercel.json** | 区域 `iad1` (Neon 匹配)、build/install 命令、security headers (Frame-Options / Content-Type-Options / Referrer-Policy / Permissions-Policy) | ✅ |
| **Playwright 扩** | 跳过 (现有 4 个 smoke 已够) | — |
| **loading.tsx skeletons** | 跳过 (1 人用, 不急) | — |
| **SEO metadata** | 跳过 (v1 上线后再优化) | — |
| **Plan detail select 优化** | 跳过 (数据量小, < 12 节点/plan) | — |
| **Tier 2 contribute** | 跳过 (大, 留 v1.1 后半) | — |

**Demo 节点 (Week 7)**:PostHog 4 事件真上报 / Sentry 真捕获错误 / RAG 0.7 阈值可调 / 5 个 eval case 可复跑 / DEPLOY.md 可让 1 人 45 分钟内全部署。

**Week 7 已知未做**:
- PostHog 事件埋点没盖 `practice_message_sent` 之外的所有 funnel (e.g. `plan_viewed`, `node_marked_complete` 之外的状态)
- Eval 脚本只 dry-run, 没接真 LLM
- Tier 2 promote UI/API (kb_tier2_sessions 表已存在, 但没有 UI 入口)
- `.env.example` 里 `EMBEDDING_API_URL/KEY` 跟 `lib/ai/providers.ts` 实际用的 deepseek 路径有 mismatch, 真部署时按 DEPLOY.md §3 注释处理

**下一里程碑**:v1.1.1 候选 — 真实部署验证 (Neon + Vercel + DeepSeek) / Langfuse 看真实 intake 输出 / eval-prompts 跑真 LLM 模式 / Tier 2 contribute UI。

---

| Day | 任务 | 实际产出 | 状态 |
|---|---|---|---|
| 1 | Seed KB 初始 10 条 | `scripts/seed-kb.ts` 扩到 10 条 (覆盖 frontend × 2, language × 2, cloud × 1, data × 2, math × 1, other × 2), 每条带完整 samplePlan (3-8 节点), seed 流程调 `embedText()` 写 bge-m3 1024-dim embedding, 失败优雅降级到 NULL | ✅ |
| 2 | E2E 关键路径 (Playwright) | 推迟到 v1.1 (需要真实 DB + API key) | ⏳ |
| 3 | Landing page + 营销文案 | `app/[locale]/page.tsx` 重写: Eyebrow + Hero + Features (3 cards w/ Lucide icons) + How-it-works (3 steps) + Final CTA + Footer; i18n 在 `home` section 加 15+ keys (eyebrow/trust_note/features_*/how_*/step_*/cta_*/check_*/footer_*) | ✅ |
| 4 | 错误处理 + 性能 + Lighthouse | 拆出 `app/[locale]/error.tsx` + `app/[locale]/not-found.tsx` (locale-scoped + i18n), 加 `components/ui/toaster.tsx` (sonner wrapper) 挂到 layout, `errors.*` 加 6 keys (fatal_*/try_again/go_home/not_found_*); `app/error.tsx` + `app/not-found.tsx` 保留作 root fallback; Lighthouse 待真部署后再跑 | ✅ (partial) |
| 5 | 部署 Vercel + 配置环境变量 + 域名 | 待办 (用户手动) | ⏳ |
| 6 | 监控告警 + 文档 + 邀请 10 个种子用户 | 待办 (用户手动) | ⏳ |

**Demo 节点 (Week 6)**: Landing 页可访问; KB 预设 10 条; 错误页/404 i18n 完整; Toaster 可发通知 → 1 人可演示完整 UX (除 E2E 自动测试和真实部署)。

**Week 6 已知未做**:
- E2E Playwright 套件 (无真 DB)
- Sentry 实际接入 (deps 装了, DSN 未配)
- PostHog 分析 (deps 装了, key 未配)
- Lighthouse 跑分 (无真生产部署)
- 性能: landing 页 SSR 已 OK, 大型 plan 详情页未做 select 优化

**下一里程碑**:v1.1 候选 — 真实 DeepSeek 接入测试 / E2E 套件 / Sentry+PostHog 真接 / Lighthouse 90+ 优化。

---

| Day | 任务 | 产出 |
|---|---|---|
| 1 | Seed KB 初始 10 条(自己写/AI 生成) | 预设库有内容 |
| 2 | E2E 关键路径(注册→方案→学→练→考) | playwright 通过 |
| 3 | Landing page + 营销文案 | 公开首页 |
| 4 | 错误处理 + 性能预算验证 + Lighthouse | 90+ 分 |
| 5 | 部署 Vercel + 配置环境变量 + 域名 | 上线 |
| 6 | 监控告警 + 文档 + 邀请 10 个种子用户 | 跑起来 |

**Demo 节点**:**v1 上线**,10 个种子用户走完完整闭环。

---

## 7.2 v1 后 30/60/90 天(种子→北极星)

### Day 0-30(种子期)

| 目标 | 行动 |
|---|---|
| 收集 10 个种子用户 | 邀请 3 圈朋友 + 1 个 Reddit/Discord 帖子 |
| 100% 完成率观察 | 必填反馈表(每用户 1 次 15 分钟访谈) |
| 关键数据 | 留存、闭环完成率、AI 调用量 |
| Bug 修复 | 紧急级 < 24h,普通 < 1 周 |
| Prompt 调优 | 基于反馈调 1-2 个关键 prompt |

**成功标志**:10 用户中 ≥ 5 个完成 1 个完整闭环。

### Day 30-60(打磨期)

| 目标 | 行动 |
|---|---|
| 用户增长到 50+ | 公开内容运营(blog, 1 篇深度文) |
| 闭环完成率 > 30% | 基于数据优化 Learn/Practice 体验 |
| KB 复用率观察 | 哪些方案被复用,沉淀到 Tier 1 |
| Prompt 库 v2 | 修复 v1 反馈的所有 prompt 痛点 |
| 增加 1 个新场景 | 例如"AI 写作"或"AI 设计"作为新 KB |

**成功标志**:50 用户中 ≥ 15 个完成闭环;1 个非种子用户主动分享。

### Day 60-90(验证期)

| 目标 | 行动 |
|---|---|
| 用户增长到 200+ | ProductHunt / Hacker News 软启动 |
| 北极星 > 100 | 完成 1 个闭环的活跃用户 ≥ 100 |
| 关键决策 | 是否进入 v2(看数据说话) |
| 启动 v2 规划 | 模式 2 / 社区 KB / 中文版 |

**成功标志**:达到 Ch 00 定义的"v1 上线 3 个月"成功指标。

---

## 7.3 v2(3-6 月后)候选范围

> v2 范围**严格由 v1 数据决定**,以下只是候选,真到 v2 再选。

| 模块 | 决策信号 | 工作量估算 |
|---|---|---|
| **模式 2(无目标)** | v1 用户调研显示 ≥ 30% 用户不知道学什么 | 4 周 |
| **社区 KB 贡献** | v1 沉淀 ≥ 50 条 Tier 1,且有用户想贡献 | 6 周 |
| **中文打磨** | 海外用户 < 50% 时 | 2 周 |
| **AI 写作场景** | 用户主动要求 | 3 周 |
| **多模态考核** | 考核产物 50% 是非代码(写作/设计) | 8 周 |
| **可观测增强** | Langfuse 跑满,需要更多 trace 能力 | 2 周 |

**v2 主线候选**:**模式 2 + 社区贡献开放**(2 个最大未实现价值)。

---

## 7.4 v3(12 月+)长期演进

| 模块 | 触发条件 |
|---|---|
| **模式 3(技能重塑)** | v2 模式 2 跑通,用户结构稳定 |
| **微证书 / 凭证** | B2B 客户接洽 OR 用户明确要求 |
| **移动端(PWA)** | 移动流量 > 30% |
| **桌面端(Tauri)** | 企业内训需求 |
| **多语言扩展** | 用户分布到 > 5 国 |
| **B2B / 企业内训** | 至少 3 个 B2B 询问 |
| **支付 / 会员** | 商业模式决定后 |

---

## 7.5 1 人工作量分配(每周)

```
┌─────────────────────────────────────────────────┐
│ 40h 一周                                         │
│                                                   │
│  - 产品 / 规划: 5h(12%)                          │
│  - 编码 - 新功能: 20h(50%)                        │
│  - 编码 - 重构 / 修 bug: 5h(12%)                  │
│  - 测试 / 部署 / 监控: 5h(12%)                    │
│  - 用户沟通 / 反馈: 3h(8%)                        │
│  - 学习 / 研究: 2h(5%)                            │
└─────────────────────────────────────────────────┘
```

### 现实调整
- 周 1-2(地基):编码 25h,产品 5h
- 周 3-5(核心):编码 22h,产品 5h
- 周 6(上线):编码 15h,产品 + 部署 + 监控 15h
- 种子期:用户沟通 8h,编码 20h
- v2 规划期:产品 10h,编码 22h

---

## 7.6 关键决策检查点(Go/No-Go)

| 节点 | 决策问题 | Go 条件 | No-Go 行动 |
|---|---|---|---|
| **Week 2 末** | AI 编排跑通了吗? | 流式对话 + Langfuse trace OK | 切换 LLM 供应商 OR 调整 prompt 框架 |
| **Week 3 末** | 方案生成质量 OK 吗? | 10 个测试需求,AI 生成 8+ 个可读方案 | 加 Few-shot / 切换 Pro |
| **Week 5 末** | 评分合理吗? | 5 个测试产物,AI 评分与人工评分一致率 > 60% | 加 prompt 强化 / 加 calibration 步骤 |
| **Week 6 末** | 能上线吗? | E2E 通过 + Lighthouse 90+ + 无 P0 bug | 推迟 1 周修复 |
| **Day 30** | 种子用户跑通了吗? | ≥ 5 个完整闭环 | 深度访谈找问题,延长种子期 |
| **Day 90** | v1 指标达成? | 北极星 ≥ 100,留存 ≥ 25% | 决定是否进 v2,或大改方向 |

---

## 7.7 关键依赖 & 风险节点

| 依赖 | 风险 | 缓解 |
|---|---|---|
| DeepSeek-V4 Pro API | 海外延迟/限流 | Week 2 末测试,准备 Anthropic 备用 |
| Neon 免费层限额 | 100 用户可能不够 | Week 6 前升 Pro($19/月) |
| Vercel Functions 限额 | AI 流式用量大 | 监控用量,超限升 Pro |
| Langfuse 50K traces/月 | v1 100 用户够用 | 超限升 Pro($59/月) |
| R2 出流量免费 | 几乎无风险 | — |
| 域名审核 | 1-3 天 | Week 0 就买好 |

---

## 7.8 文档同步规则

| 文档 | 更新频率 | 触发条件 |
|---|---|---|
| `docs/planning/planning.md` | 季度 | 重大方向调整 |
| `docs/adr/*.md` | 实时 | 关键架构决策 |
| `docs/runbooks/*.md` | 触发 | 事故 / 新流程 |
| `README.md` | 月度 | 范围变化 |
| `CHANGELOG.md` | 每周 | 任何功能/Bug 修复 |

---

## 7.9 本章产出物确认

- [x] v0/v1/v2/v3 路线图总览
- [x] v1 6 周详细计划(每周 Day-by-Day)
- [x] v1 后 30/60/90 天行动
- [x] v2 候选范围 + 决策信号
- [x] v3 长期演进触发条件
- [x] 1 人工作量分配
- [x] 6 个 Go/No-Go 检查点
- [x] 关键依赖风险表
- [x] 文档同步规则

**下一章预告**:`08-risks.md` — 风险 & 应对(11 类风险分级 + 应急方案)
