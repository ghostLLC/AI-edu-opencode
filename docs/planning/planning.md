# AI Learning Platform — 完整规划文档

> **版本**: v0.3(Week 1 + Week 2 + Week 3 + Week 4 + Week 5 + Week 6 部分已实施)
> **生成时间**: 2026-06-04
> **用途**: 1 人项目完整规划,周度 review
> **状态**: 骨架 100% + AI 编排 100% + Intake/Plan/Learn/Practice/Assess UI 100% + KB 10 条 seed + Landing + i18n 错误页 + Toaster 已落地
>
> **v0.3 实际进展(2026-06-04)**:
> - ✅ Week 1 骨架(Next.js 15 + Drizzle + Auth.js v5 + bcrypt + i18n + shadcn-ui)
> - ✅ Week 2 AI 编排(4 stage + RAG + cost guardrail + Langfuse trace)
> - ✅ Week 3 Intake UI + 方案确认页(整页 + 状态机推进)
> - ✅ Week 4 Learn + Practice UI(server shells + ChatInterface 流式对话)
> - ✅ Week 5 Assess UI(server shells + AssessForm + ScoreReport)
> - ✅ Week 6 Day 1/3/4 (KB 10 条 seed + Landing 重写 + 错误页 + Toaster)
> - ⏳ Week 6 Day 2/5/6 推迟到 v1.1 (E2E / 真实部署 / 监控)
> - 详细 day-by-day 见 `07-roadmap.md` 的对应章节(已用实际产出更新)

## 目录

| 章节 | 标题 | 关键产出 |
|---|---|---|
| Ch 00 | 项目概述 & 目标 | 愿景/范围/成功指标 |
| Ch 01 | 核心功能设计 | 3 模式 × 3 阶段行为契约 |
| Ch 02 | 技术栈选型 | 19 项选型 + 理由 + 成本 |
| Ch 03 | 系统架构 | 高层/低层/时序图 |
| Ch 04 | 数据模型 | 11 张表 + 3 张 v2 预留 |
| Ch 05 | AI 系统设计 | 模型分工 + Prompt 框架 + RAG |
| Ch 06 | 模块/文件结构 | 完整目录树 + 关键文件 |
| Ch 07 | 开发路线图 | 6 周 MVP + 30/60/90 天 |
| Ch 08 | 风险 & 应对 | 11 项风险 + 应急预案 |

---
# Chapter 00: 项目概述 & 目标

> 本文档是 `ai-learning-platform` 项目规划的第一章。后续章节:核心功能、技术栈、架构、数据模型、AI 系统、文件结构、路线图、风险。
> 版本:v0.1 | 状态:草稿(待用户确认)

---

## 0.1 项目标识

| 字段 | 值 |
|---|---|
| 项目代号 | `ai-learning-platform` (工作名,后续可重命名) |
| 项目目录 | `C:\Users\EDY\ai-learning-platform\` |
| 文档目录 | `C:\Users\EDY\ai-learning-platform\docs\planning\` |
| 目标用户优先级 | P0 海外(英)、P1 国内(中)、P2 企业培训 |
| 首发市场 | 海外(免备案,英文为主),中文 v1.1 跟进 |
| 团队 | 1 人(全栈 + AI + 运营) |
| 启动日期 | 2026-06 |

---

## 0.2 愿景 (Vision)

> **在 AI 时代重新定义"学习"** —— 让每个人都能通过 AI 协作,把知识真正转化为"能交付成果的能力"。

在知识随时可被 AI 调用的时代,教育的核心不再是"记住什么",而是"能做什么"。本平台通过"AI 引导式学习 + 真实任务考核",把学习者从"知识的被动消费者"变成"AI 时代的主动协作者"。

---

## 0.3 目标用户

### P0 - 海外学习者 (v1 首发)

- **画像**:18-30 岁的国际学生 / 早期职场人 / 自由职业者
- **学习特征**:对 AI 工具有基础认知(Copilot/ChatGPT/Claude 至少用过),希望系统性升级自己的工作流
- **痛点**:
  1. 传统 MOOC 完课率 < 5%,学了不知道能不能用
  2. AI 工具变化太快,半年前学的今天已经过时
  3. 知道 AI 强大,但不知道**怎么**把它嵌进自己的实际工作
- **典型场景**:在读研究生想转 AI 产品方向 / 设计师想学 vibe-coding / 文科生想做内容创作

### P1 - 国内学习者 (v1.1 跟进)

- 与 P0 类似,但需要中文 UI / 中文 KB / 国内访问友好的 LLM
- 政策/合规:暂不上线需要 ICP 备案的教育服务,先做"工具"定位

### P2 - 企业内训 (v3 之后)

B2B 销售链路完全不同,先验证 P0/P1,再考虑。

---

## 0.4 核心问题(我们解决什么)

| 现状 | 问题 | 本平台的回答 |
|---|---|---|
| 学完课程不知道"用得上用不上" | 学用脱节 | 学-练-考闭环,产出可验证 |
| 知识更新比学习速度快 | 学完已过时 | AI 时代方法论 + KB 三层(预设/AI/社区)+ 实时更新 |
| 不知道自己该学什么 | 路径迷失 | 3 种入口模式(明确目标/无目标/技能重塑)全覆盖 |
| 学的知识无法迁移到 AI 协作 | 学 AI 工具不深 | 3 阶段强制 AI 融合,毕业即"会+ AI 干活" |
| 老师/课程不知道"学生真的会了" | 评估不闭环 | 真实任务 + AI rubric 评分,产物可审查 |

---

## 0.5 核心方法论(3 模式 × 3 阶段)

### 3 种入口模式

| 模式 | 用户状态 | AI 行为 |
|---|---|---|
| **1. 明确目标** | 知道想学什么具体内容/方向 | 检索已有方案库 → 命中即用 / 未命中则定制 |
| **2. 无目标** | 不知道学什么,需要梳理 | AI 对话访谈,逐步收敛到方向,再进入模式 1 流程 |
| **3. 技能重塑** | 有基础,想升级 AI 时代工作流 | 评估当前能力 → 设计升级路径 → 全 3 阶段(模式 3 是 v2 重点) |

> **v1 切片**:只做模式 1,但数据模型/UI 框架为模式 2/3 预留。

### 3 个学习阶段(每阶段 1 个 AI 行为模板)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  1. 学    │ ──→ │  2. 练    │ ──→ │  3. 考    │
│  Learn   │     │ Practice │     │  Assess  │
└──────────┘     └──────────┘     └──────────┘
   苏格拉底式        巩固式           评估式
   AI 引导提问      AI 复述/变形      真实任务交付
   不给答案        不拓展,巩固       结构化 rubric
```

**v1 最小版**:
- **学**:1 个学习计划 / 3~5 个知识节点 / AI 引导式对话 / 节点引用提问
- **练**:基于已学节点的 Q&A 对话 / 用户自评"准备好了"才能进入考核
- **考**:1 个真实任务(可部署网页/可分发应用/可提交文件)/ AI rubric 评分

### 需求判定逻辑(进入流程前的关键节点)

```
用户输入需求
  ↓
[AI 判断] 这个需求是否适合 vibe-coding / Human-AI 协作?
  ├─ 适合 → 设计"AI 协作"型方案(用户学会如何与 AI 高效合作)
  └─ 不适合 → 设计"AI 辅助"型方案(AI 是工具,人是主导)
  ↓
设计方案(可量化的能力目标 + 3 阶段分步)
```

---

## 0.6 v1 切片(明确范围)

### ✅ v1 包含
- 模式 1(明确目标)全流程
- 3 阶段最小版(学/练/考各 1 个最小可用版本)
- 用户系统(注册/登录/进度同步)
- KB 三层机制(预设层初始化为空,AI 当场为主,社区 v1 关闭入口)
- DeepSeek-V4 对接(Flash + Pro 分工)
- 中英双语 UI(英文为主,中文 v1.0 同步上线)
- 基础观测(Langfuse 或类似工具)

### ❌ v1 不包含(为 v2/v3 预留)
- 模式 2(无目标)UI 流程 — 数据模型预留
- 模式 3(技能重塑) — v2 重点
- 社区贡献入口 — v2 开放
- 移动端 / 桌面端
- 支付 / 会员
- 微证书 / 区块链凭证
- 直播 / 录播 / 1v1 教练

---

## 0.7 成功指标(上线 3 个月)

| 指标 | 目标 | 测量方式 |
|---|---|---|
| **完成 1 个完整闭环的用户** | 100+ | 后台统计 |
| 学习计划完成率 | > 30% | 完成计划 / 开始计划 |
| 考核通过率 | > 60% | 通过 / 提交考核 |
| 7 日留存 | > 25% | 7 日内回访 / 注册 |
| 平均每用户 AI 调用次数 | 50+ | 后台统计(反映真实学习深度) |

**北极星指标**:**完成 1 个完整学-练-考闭环的活跃用户数** — 这是"用户真的学会了一件事"的代理指标,比 DAU/MAU 更有意义。

---

## 0.8 非目标(明确不做什么)

1. **不做内容平台** — 不做"用户发布内容,其他用户消费"的 UGC 平台
2. **不做社交** — 没有关注/动态/Feed(社区贡献 ≠ 社交,它是结构化资产沉淀)
3. **不做直播/录播课** — 那是传统教育形态,违背"AI 时代"理念
4. **不做证书认证** — 暂不考虑微证书/学历对接,v3 再说
5. **不做多语言(中英之外)** — v1 中英双语足够,小语种 v3+
6. **不做企业 SSO / RBAC** — P2 用户,v3 之后

---

## 0.9 范围演进(v1 → v2 → v3)

```
v1 (现在)        v2 (3-6 月后)         v3 (12 月后)
─────────        ──────────────        ─────────────
模式 1            模式 2                模式 3
KB 预设/AI       社区贡献开放           社区飞轮
英文为主         中文同步打磨            企业内训
基础评估         多模态评估(图/音/视频)  微证书/凭证
```

---

## 0.10 高层风险 & 假设

| 假设 | 风险 | 应对 |
|---|---|---|
| 用户愿意被 AI 评判 | 用户抵触 | 给申诉/重考/复议机制 |
| AI 评判足够准确 | 误判/不公平 | 评分要可解释,允许复议,抽样人工审核 |
| 用户能完成真实任务 | 难度太高放弃 | 任务难度自适应 + 提供脚手架 |
| AI 调用成本可控 | v1 烧钱 | 缓存 + 简单任务用 Flash / 复杂用 Pro |
| DeepSeek-V4 海外可访问 | 网络/支付问题 | Vercel Edge 部署 + 备用 Anthropic API 兜底 |
| 1 人能交付 v1 | 范围蔓延 | 严格 v1 切片,任何"想要"必须等下一版本 |

---

## 0.11 本章产出物确认

- [x] 项目代号 & 目录
- [x] 愿景
- [x] 目标用户分级
- [x] 核心问题陈述
- [x] 核心方法论
- [x] v1 切片范围
- [x] 成功指标
- [x] 非目标
- [x] 范围演进
- [x] 高层风险

**下一章预告**:`01-features.md` — 核心功能设计(详细到每个模式的对话流、3 阶段的 AI 行为契约、KB 三层机制的可视化)


---

# Chapter 01: 核心功能设计

> 本章详细描述 3 模式 × 3 阶段的具体行为、AI 契约、关键交互。
> 配套:Ch 02 技术栈 / Ch 04 数据模型 / Ch 05 AI 系统
> 版本:v0.1 | 状态:草稿

---

## 1.0 总览:3 模式 × 3 阶段矩阵

```
              │ 阶段 1: 学     │ 阶段 2: 练      │ 阶段 3: 考
──────────────┼────────────────┼─────────────────┼──────────────
模式 1        │ ✅ v1 实现     │ ✅ v1 实现       │ ✅ v1 实现
(明确目标)    │                │                 │
──────────────┼────────────────┼─────────────────┼──────────────
模式 2        │ 🔒 v1 数据预留  │ 🔒 v1 数据预留   │ 🔒 v1 数据预留
(无目标)      │ (UI v2 启用)   │ (UI v2 启用)     │ (UI v2 启用)
──────────────┼────────────────┼─────────────────┼──────────────
模式 3        │ 🔒 v2 重点      │ 🔒 v2 重点       │ 🔒 v2 重点
(技能重塑)    │                │                 │
```

> **关键设计哲学**:v1 只做模式 1,但用户表/方案表/进度表都用"模式"字段预留,v2 模式 2/3 启用时,无 schema 迁移。

---

## 1.1 模式 1 详细流程(明确目标)— v1 主流程

### 1.1.1 入口与状态机

```mermaid
stateDiagram-v2
    [*] --> Onboarding
    Onboarding --> NeedCapture: 用户登录后
    NeedCapture --> NeedClarify: AI 检测到需求模糊
    NeedClarify --> NeedCapture: 用户补充信息
    NeedCapture --> DemandJudge: AI 确认需求清晰
    DemandJudge --> SchemaSearch: 判定为 AI 协作/辅助型
    DemandJudge --> RejectNotice: 判定为不适合(政策/伦理)
    SchemaSearch --> SchemaHit: 预设库命中
    SchemaSearch --> SchemaGenerate: 预设库未命中
    SchemaHit --> PlanConfirm: 用户确认/微调
    SchemaGenerate --> PlanConfirm: AI 生成方案
    RejectNotice --> [*]: 退出
    PlanConfirm --> Learn: 用户开始
    Learn --> Practice: 学完
    Practice --> Assess: 用户自评准备好
    Assess --> Pass: 评分通过
    Assess --> Retry: 评分未过
    Retry --> Practice: 重新巩固
    Pass --> [*]: 完成
```

### 1.1.2 关键节点说明

| 节点 | 输入 | AI 行为 | 输出 |
|---|---|---|---|
| **NeedCapture** | 用户文本/语音/上传材料 | 多模态解析(初期仅文本) | 结构化"需求画像" |
| **NeedClarify** | 模糊需求 | 反问澄清(1~3 轮) | 清晰需求 |
| **DemandJudge** | 清晰需求 | 判定"AI 协作型 vs AI 辅助型 vs 拒绝" | 标记 + 解释 |
| **SchemaSearch** | 需求画像 | 检索预设 KB(向量匹配) | 命中候选 / 未命中 |
| **SchemaGenerate** | 需求画像 | AI 现场定制方案(Pro 模型) | 完整方案 |
| **PlanConfirm** | 方案 | 用户可微调/接受 | 最终学习计划 |

### 1.1.3 "需求画像" 结构(关键)

```typescript
interface NeedProfile {
  goal: string;              // 用户想达成什么
  context: string;           // 当前情况(背景/水平/资源)
  constraints: string[];     // 约束(时间/预算/技术)
  ai_collab_type: 'vibe_coding' | 'human_ai_collab' | 'ai_assisted';
  success_criteria: string[];// 用户认可的"算学会了"标准
  domain: string;            // 领域标签(用于 KB 检索)
  language: 'en' | 'zh';
}
```

---

## 1.2 模式 2 详细流程(无目标)— v1 不实现,设计预留

### 1.2.1 入口与状态机(描述性)

```
[用户描述情况] 
    ↓
[AI 对话访谈] ← 用"五个为什么"式的对话收敛
    ↓ (5~10 轮对话)
[方向收敛] → AI 给出 1~3 个可能方向
    ↓
[用户选择方向] 
    ↓
[转入模式 1 流程](共享同一套方案生成器)
```

### 1.2.2 v1 数据预留

- `users.mode = 'goal_clear' | 'goal_unclear' | 'reskill'`
- `learning_plans.intake_type = 'goal_clear' | 'goal_unclear' | 'reskill`(影响方案生成器输入)
- `intake_sessions` 表:存模式 2 的对话历史(虽然 UI 不开放)

---

## 1.3 模式 3 详细流程(技能重塑)— v2 重点,v1 不实现

### 1.3.1 入口与状态机(描述性)

```
[用户描述当前能力] (例如:我是设计师,会 Figma,不懂代码)
    ↓
[AI 评估当前能力] → 用既有评估模板(可由 KB 提供)
    ↓
[目标映射] → 设计"AI 时代新工作流"目标(可由 KB 提供)
    ↓
[差距分析] → 列出"现有"和"目标"之间的桥接步骤
    ↓
[生成学习计划] → 进入 3 阶段(共享)
```

### 1.3.2 v1 数据预留

- `capability_assessments` 表:存用户当前能力快照
- `target_capabilities` 表:存目标能力模板
- `reskilling_paths` 表:v2 启用

---

## 1.4 阶段 1:Learn(学习)— AI 行为契约

### 1.4.1 目的
让用户**理解**知识节点(不是记忆),AI 引导用户主动建构认知。

### 1.4.2 入口
- 用户从方案确认页点击"开始学习"
- 系统生成 N 个知识节点(每个节点 1 个核心概念 + 1~3 个子点)

### 1.4.3 AI 行为契约(苏格拉底式)

**禁止**:
- ❌ 直接给答案
- ❌ 一次讲超过 1 个核心点
- ❌ 引用未在前端展示过的内容

**必须**:
- ✅ 每次回复以提问/反问/确认开始
- ✅ 等待用户回复后,基于用户理解调整下一步
- ✅ 在合适时机提示用户"用前端引用功能精准提问"

**示例对话**:
```
User: 这个方案开始了
AI:   好的。第一个节点是"用户研究"。在开始前,我想先确认一下:
      你能用自己的话,说说"用户研究"和"市场调研"的区别吗?
      (如果说不清,不用着急,可以先试着想想)
User: 用户研究是看用户怎么用产品,市场调研是看市场有多大
AI:   ✅ 基本对了!但还差一层:用户研究更关注"行为和动机",市场调研
      更关注"规模和趋势"。
      现在,我们进入第一个子点:用户画像 vs 用户 persona。
      引用本节点任意关键词,我会给你解释或出题。
```

### 1.4.4 关键交互:知识节点"引用"提问

```
前端 UI 设计:
┌─────────────────────────────┐
│ 📚 知识节点: 用户画像        │
├─────────────────────────────┤
│ 用户画像是基于研究数据...     │
│ 关键词:[定量研究][定性研究]   │  ← 可点击"引用"按钮
│       [行为模式][痛点]        │
├─────────────────────────────┤
│ 💬 提问框:                   │
│ [引用"定量研究"] 是什么意思?  │  ← 用户点击关键词后自动插入
└─────────────────────────────┘
```

**技术实现**:
- 节点内容是结构化 JSON(段落 + 关键词索引)
- 前端在用户点击关键词时,自动在提问框插入 `[引用:节点名] 关键词` 格式
- 后端 prompt 收到引用标记后,只允许 AI 在该节点范围内回答

### 1.4.5 出口条件
- 用户完成所有知识节点对话
- AI 在每个节点结尾给出"已掌握确认"(用户可接受/重学)
- 全部节点通过 → 进入阶段 2

---

## 1.5 阶段 2:Practice(实践)— AI 行为契约

### 1.5.1 目的
让用户**巩固**已学知识(不是拓展),AI 通过复述/变形考核用户是否能"用自己的话讲清楚"。

### 1.5.2 入口
- 用户从 Learn 阶段完成页进入
- 系统展示"实践模式开启"提示

### 1.5.3 AI 行为契约(巩固式)

**禁止**:
- ❌ 引入新知识(用户没学过的内容)
- ❌ 直接评判"你会不会"(必须用问题引导)
- ❌ 拓展深度(只在本节点范围内)

**必须**:
- ✅ 每次回复以"请你试着..."开始
- ✅ 用户答错时,不直接纠正,而是用反例/再提问引导
- ✅ 难度自适应(用户多次答对后,可加入跨节点综合题)
- ✅ 准备度评估:每 3~5 轮,问用户"你觉得自己准备好进入考核了吗?"

**示例对话**:
```
User: 进入实践
AI:   好的,实践模式开启。规则:我会基于你已经学的内容提问,你用
      自己的话回答。我不会评判对错,而是用问题帮你确认。
      开始:请用 1~2 句话,向一位完全不懂的朋友解释"用户画像"
      是什么。
User: 用户画像就是给典型用户画一张脸,知道他在想什么
AI:   ✅ 形象!不过"画脸"只是形式,核心是"理解动机和行为"。
      那我们换个角度:你做的用户画像,会和所有用户一样吗?为什么?
User: 不会,不同用户有不同需求
AI:   ✅ 对!这就是"分群"的起点。
      ...
      [每 3~5 轮]
      AI: 你觉得自己准备好进入考核了吗?如果有不确定的节点,
          可以回到学习阶段再过一遍。
```

### 1.5.4 出口条件
- 用户主动声明"准备好了"
- OR AI 评估用户已展示足够掌握度(自动提示可进入)
- 进入阶段 3

---

## 1.6 阶段 3:Assess(考核)— AI 行为契约

### 1.6.1 目的
让用户在**真实任务**中交付,AI 用结构化 rubric 评分,产出可被验证。

### 1.6.2 入口
- 用户从 Practice 阶段完成页进入
- 系统展示考核任务卡

### 1.6.3 任务卡设计

```typescript
interface AssessmentTask {
  id: string;
  title: string;        // 例如:为 [X 产品] 做一个可部署的落地页
  deliverable: 'web' | 'app' | 'doc' | 'code' | 'other';
  rubric: RubricItem[];
  reference_kb_id?: string;  // 可选:绑定预设 KB
  time_estimate: string;     // 例如:2-4 小时
}

interface RubricItem {
  criterion: string;   // 例如:"能完整覆盖 5 个核心用户场景"
  weight: number;      // 0-100,总和 100
  pass_threshold: number; // 通过最低分
}
```

### 1.6.4 AI 行为契约(评估式)

**禁止**:
- ❌ 给提示(用户在考核中,AI 不引导)
- ❌ 模糊评分(必须基于 rubric 项给出 0~weight 的具体分数)
- ❌ 隐藏评分依据(每次评分后必须给出 reasoning)

**必须**:
- ✅ 评分有 reasoning(逐项解释)
- ✅ 评分可被复议(用户可质疑某项,AI 重评)
- ✅ 参考答案 KB 在用户卡壳时**仅作为兜底,不主动给出**(避免成为"作弊"工具)
- ✅ 最终判定:加权得分 ≥ 60% = 通过(可在配置中调整)

**卡壳兜底机制**:
```
用户在考核中卡壳 → 用户主动点击"我卡住了"
    ↓
[AI 行为切换] 从"评估模式" → "诊断模式"
    ↓
AI 用预设 KB 检索相关知识,提供 minimal hint(不超过 3 句话)
    ↓
用户继续完成(或再次卡壳 → 再次 hint,累计 3 次后强制退出考核)
```

### 1.6.5 提交与评分流程

```
用户提交(上传文件 / 截图 / URL / 文本)
    ↓
后端接收 + 存储产物
    ↓
[AI 评分] 加载 rubric + 加载方案节点 + 评估产物
    ↓
生成结构化评分报告(分项分数 + 总分 + reasoning)
    ↓
展示给用户
    ↓
[复议机制] 用户可对某项提出质疑,AI 重新评分(可换 Pro 模型,或人工)
```

---

## 1.7 KB 三层机制详细实现

### 1.7.1 数据流

```
┌────────────────────────────────────────────────────────┐
│                     知识库 (KB)                          │
├────────────────────────────────────────────────────────┤
│ Tier 1: 预设库 (pre-vetted)                              │
│   - 来源:团队/专家策划 + AI 生成后人工审核               │
│   - 存储:Postgres + pgvector                            │
│   - 字段:{id, domain, schema_json, ref_answer_json,    │
│          quality_score, contributor_id, status}         │
│                                                          │
│ Tier 2: AI 当场生成 (session-generated)                  │
│   - 触发:SchemaSearch 未命中时                           │
│   - 存储:每方案/每任务的临时 session_data               │
│   - 生命周期:随方案/任务结束而归档                       │
│                                                          │
│ Tier 3: 社区贡献 (community-curated)                     │
│   - 触发:用户完成学习/考核后主动提交                     │
│   - 流程:用户提交 → AI 初筛 → 抽样人工复审 → 准入 Tier 1│
│   - v1 不开放用户提交入口(仅数据模型预留)                │
└────────────────────────────────────────────────────────┘
```

### 1.7.2 检索逻辑

```typescript
async function retrieveKB(needProfile: NeedProfile): Promise<KBHit[]> {
  // 1. 向量检索(主路径)
  const embedding = await embed(needProfile.goal + needProfile.context);
  const hits = await vectorSearch(embedding, {
    topK: 5,
    filter: { domain: needProfile.domain, status: 'active' }
  });
  
  // 2. 重排序
  const reranked = await rerank(hits, needProfile);
  
  // 3. 阈值过滤
  return reranked.filter(h => h.score > 0.75);
}
```

### 1.7.3 沉淀路径(v1 → v2 → v3)

```
v1: Tier 2 为主,边运行边记录"哪些方案被多次复用"
v2: 复用率高的 Tier 2 方案 → AI 优化 → 人工审核 → 准入 Tier 1
    开放 Tier 3 入口
v3: 飞轮自转,Tier 1 占比 > 60%
```

---

## 1.8 关键交互设计总结

| 交互 | 阶段 | 作用 |
|---|---|---|
| **节点引用提问** | Learn | 用户精准提问,AI 范围受限,避免跑题 |
| **苏格拉底式引导** | Learn | 主动建构认知,不是被动接收 |
| **复述/变形巩固** | Practice | 用自己的话讲清,验证真懂 |
| **难度自适应** | Practice | 答对升级,答错降级,不离不弃 |
| **真实任务交付** | Assess | 能力可验证,不是"会考试" |
| **结构化 rubric** | Assess | 评分可解释,允许复议 |
| **卡壳兜底** | Assess | 避免死循环/幻觉,有底线 |
| **3 层 KB 检索** | 全流程 | 质量优先 + 覆盖面广 + 社区共建 |

---

## 1.9 数据流总图

```
用户输入 ──→ [NeedCapture] ──→ NeedProfile
                                    │
                                    ↓
                            [DemandJudge]
                                    │
                            ┌───────┴───────┐
                            ↓               ↓
                       [SchemaSearch]   [RejectNotice]
                            │
                    ┌───────┴───────┐
                    ↓               ↓
              [SchemaHit]    [SchemaGenerate]
                    └───────┬───────┘
                            ↓
                    [PlanConfirm] ──→ LearningPlan
                                        │
                            ┌───────────┼───────────┐
                            ↓           ↓           ↓
                        [Learn]    [Practice]   [Assess]
                            │           │           │
                            │      [用户卡壳?]      │
                            │           │       [诊断模式]
                            │           ↓           │
                            │       [Hint KB]       │
                            │                       ↓
                            │              [Rubric 评分]
                            │                       │
                            └───────────┬───────────┘
                                        ↓
                                   [Pass/Retry]
```

---

## 1.10 本章产出物确认

- [x] 3 模式 × 3 阶段矩阵
- [x] 模式 1 状态机 + 关键节点
- [x] 模式 2/3 描述 + 数据预留
- [x] 3 阶段 AI 行为契约
- [x] 关键交互设计(引用提问 / 苏格拉底 / rubric)
- [x] KB 三层机制数据流
- [x] 全局数据流图

**下一章预告**:`02-tech-stack.md` — 技术栈选型(每项含"为什么",重点是 AI 编排、流式输出、向量检索、部署)


---

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


---

# Chapter 03: 系统架构

> 本章描述 v1 系统的高层模块、低层部署、关键时序、错误处理。
> 配套:Ch 02 技术栈 / Ch 04 数据模型 / Ch 05 AI 系统
> 版本:v0.1 | 状态:草稿

---

## 3.0 架构原则(架构的"宪法")

1. **Server-first** — 默认服务端逻辑,客户端只渲染和交互
2. **流式优先** — AI 输出必须流式,任何"等 30 秒再弹"的设计都拒绝
3. **可观测** — 每个关键路径都有 trace,出问题能定位到行
4. **降级优雅** — 任何外部依赖挂掉,核心功能(浏览已生成方案)不能挂
5. **单人可维护** — 不引入 1 人 hold 不住的复杂度(无 K8s、无微服务、无 GraphQL federation)

---

## 3.1 高层模块图

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端 (Browser)                       │
│  Next.js Client Components + shadcn/ui + Tailwind            │
│  useChat hook (Vercel AI SDK) for streaming                  │
└────────────┬────────────────────────────────────────────────┘
             │ HTTPS / SSE
             ↓
┌─────────────────────────────────────────────────────────────┐
│                   Vercel Edge Network (CDN)                    │
│  - Static assets (R2-backed)                                  │
│  - Edge Middleware (auth check, i18n routing)                 │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│              Next.js Server (Node.js Runtime)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  App Router (RSC + Server Actions + Route Handlers)  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐    │
│  │  Auth.js v5  │ │  Drizzle ORM │ │  Vercel AI SDK   │    │
│  │  (sessions)  │ │  (data)      │ │  (LLM streaming) │    │
│  └──────────────┘ └──────────────┘ └──────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         AI Orchestrator (lib/ai/orchestrator.ts)     │   │
│  │  - Stage selector (Learn/Practice/Assess)            │   │
│  │  - RAG (KB retrieval)                                 │   │
│  │  - Tool registry                                      │   │
│  │  - User context injection                             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐    │
│  │  Langfuse    │ │   Sentry     │ │   PostHog        │    │
│  │  (AI trace)  │ │   (errors)   │ │   (analytics)    │    │
│  └──────────────┘ └──────────────┘ └──────────────────┘    │
└────────────┬──────────────────────┬────────────────────────┘
             │                      │
             ↓                      ↓
   ┌────────────────────┐  ┌────────────────────────┐
   │  Neon Postgres     │  │  Cloudflare R2         │
   │  + pgvector        │  │  (S3-compatible)       │
   │  - User data       │  │  - User artifacts      │
   │  - Plans/progress  │  │  - Screenshots         │
   │  - KB Tier 1       │  │  - Code zips           │
   │  - Embeddings      │  │                        │
   └────────────────────┘  └────────────────────────┘
                                      │
                                      ↓
                            ┌────────────────────────┐
                            │  DeepSeek API          │
                            │  - V4 Flash            │
                            │  - V4 Pro              │
                            │  - Embedding API       │
                            └────────────────────────┘
```

---

## 3.2 核心模块清单

| 模块 | 路径 | 职责 |
|---|---|---|
| **App Router** | `app/` | 路由 + 页面 + Server Actions |
| **Auth Module** | `lib/auth/` | Auth.js 配置、session、middleware |
| **AI Orchestrator** | `lib/ai/` | AI 行为编排、prompt 模板、tool 注册 |
| **KB Module** | `lib/kb/` | 向量检索、KB CRUD、Tier 管理 |
| **Plan Module** | `lib/plan/` | 方案生成、节点管理、进度跟踪 |
| **Assessment Module** | `lib/assess/` | 任务卡、产物接收、rubric 评分 |
| **i18n** | `i18n/`, `messages/` | next-intl 配置 + 文案 |
| **UI Components** | `components/` | shadcn/ui 复制 + 业务组件 |
| **DB Schema** | `db/schema/` | Drizzle schema 定义 |
| **Workers/Background** | (v2) | 长任务、re-rank、定时清理 |

---

## 3.3 低层部署图

```
                           ┌─────────────────────┐
                           │   GitHub (main)     │
                           └──────────┬──────────┘
                                      │ push
                                      ↓
                           ┌─────────────────────┐
                           │   Vercel Build      │
                           │   (CI/CD)           │
                           └──────────┬──────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                ↓                     ↓                     ↓
        ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
        │ Preview Env  │    │ Production   │    │ (Staging,    │
        │ (per PR)     │    │ (main)       │    │  on demand)  │
        └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
               │                   │                   │
               └─────────┬─────────┴─────────┬─────────┘
                         ↓                   ↓
                ┌─────────────────────────────────────┐
                │   Vercel Edge Network              │
                │   (CDN, Middleware, Image Opt)     │
                └────────────────┬────────────────────┘
                                 ↓
                ┌─────────────────────────────────────┐
                │   Next.js Server (Functions)       │
                │   - RSC                             │
                │   - Server Actions                  │
                │   - Route Handlers (webhook)        │
                │   - Streaming Responses             │
                └────┬────────────────────────┬───────┘
                     │                        │
          ┌──────────┴──────────┐    ┌────────┴─────────┐
          ↓                     ↓    ↓                  ↓
   ┌──────────────┐    ┌──────────────┐    ┌─────────────────┐
   │  Neon DB     │    │  Cloudflare  │    │  DeepSeek API   │
   │  (us-east-1) │    │  R2          │    │  (via Vercel    │
   │              │    │  (us-east)   │    │   AI SDK)       │
   └──────────────┘    └──────────────┘    └─────────────────┘
          │                     │                    │
          └──────────┬──────────┘                    │
                     ↓                                ↓
            ┌─────────────────┐              ┌──────────────┐
            │  自动备份(Neon)  │              │ Langfuse     │
            │  7 天 PITR       │              │ (us-east)    │
            └─────────────────┘              └──────────────┘
```

### 地域策略(v1)
- **数据库**:Neon us-east-1(海外用户主要)
- **Vercel Functions**:Edge + 区域(自动)
- **R2**:us-east(默认)
- **延迟预算**:首字节 < 500ms(P95),AI 流式首字 < 2s(P95)

---

## 3.4 关键时序图

### 3.4.1 用户进入"学习"模式(Learn Stage)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Edge as Vercel Edge
    participant Server as Next.js Server
    participant DB as Postgres
    participant AI as DeepSeek-V4 Flash
    participant LF as Langfuse

    User->>Browser: 访问 /learn/[planId]
    Browser->>Edge: GET /learn/[planId]
    Edge->>Server: (cache miss) RSC render
    Server->>DB: 加载 plan + progress + nodes
    DB-->>Server: plan data
    Server-->>Browser: 渲染页面(含历史消息)
    User->>Browser: 在引用框提问
    Browser->>Server: POST /api/chat (Server Action)
    Server->>DB: 加载用户上下文 + 节点内容
    Server->>LF: trace start
    Server->>AI: streamText(prompt + context)
    AI-->>Server: SSE stream (token by token)
    Server-->>Browser: SSE stream
    LF-->>LF: 记录 token/延迟
    Browser-->>User: 流式渲染 AI 回复
    User->>Browser: 结束对话
    Browser->>Server: Server Action: save message
    Server->>DB: 持久化消息 + 更新进度
```

### 3.4.2 方案生成(Schema Generation,Pro 模型)

```mermaid
sequenceDiagram
    actor User
    participant Server
    participant KB as KB Module
    participant DB
    participant AI as DeepSeek-V4 Pro
    participant LF as Langfuse

    User->>Server: 提交需求画像
    Server->>KB: retrieveKB(needProfile)
    KB->>DB: 向量检索 topK=5
    DB-->>KB: 候选方案
    KB-->>Server: 过滤后命中
    alt 命中
        Server->>AI: 基于命中方案生成定制化版本
    else 未命中
        Server->>AI: 从零生成(Pro, 长 prompt)
    end
    AI-->>Server: 完整方案 (JSON)
    Server->>DB: 持久化方案 + 节点
    Server->>LF: trace: plan generated
    Server-->>User: 展示方案(进入确认页)
```

### 3.4.3 考核评分(Assessment,Pro 模型 + Rubric)

```mermaid
sequenceDiagram
    actor User
    participant Server
    participant R2 as Cloudflare R2
    participant AI as DeepSeek-V4 Pro
    participant DB
    participant LF as Langfuse

    User->>Server: 提交产物(file/screenshot/url)
    Server->>R2: 上传产物
    R2-->>Server: artifact URL
    Server->>Server: 加载 rubric + 方案节点
    Server->>AI: 结构化评估 prompt(rubric 注入)
    AI-->>Server: 评估 JSON(分项分数 + reasoning)
    Server->>DB: 持久化评估结果
    Server->>LF: trace: assess score
    Server-->>User: 评分报告
    alt 通过
        Server->>DB: plan.status = 'completed'
    else 未通过
        User->>Server: 申请复议
        Server->>AI: 复议重评(用 Pro + 不同 prompt)
    end
```

### 3.4.4 用户卡壳兜底(Assess Stuck Path)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Server
    participant KB
    participant AI as DeepSeek-V4 Flash

    User->>Browser: 考核中卡壳,点击"我卡住了"
    Browser->>Server: Server Action: stuck_help
    Server->>KB: 检索与当前任务相关的 KB
    KB-->>Server: 命中 hint
    Server->>AI: 生成 minimal hint (≤3 句)
    AI-->>Server: hint text
    Server-->>Browser: 显示 hint
    Note over Server: 记录 hint 次数<br/>>= 3 强制退出考核
```

---

## 3.5 数据流(写路径)

```
用户输入(对话/产物/操作)
    ↓
[Server Action 入口] — 参数校验 + 权限检查
    ↓
[业务层] — lib/[module]/action.ts
    ↓
[DB 写入] — Drizzle transaction
    ↓
[缓存失效] — revalidatePath / revalidateTag
    ↓
[RSC 重渲染] — 客户端自动看到新数据
```

**事务原则**:任何"业务状态变更"必须包在 transaction 里。
- 创建方案:plan + nodes 在同一事务
- 完成学习:progress + stats 在同一事务
- 考核评分:artifact + assessment + plan.status 在同一事务

---

## 3.6 错误处理策略

### 3.6.1 错误分类

| 错误类型 | 处理 | 用户感知 |
|---|---|---|
| **用户输入错误** | 表单层校验 + Server Action 二次校验 | 友好提示 |
| **权限错误** | Middleware 拦截 | 重定向到登录 |
| **业务规则错误** | 业务层抛 `BusinessError` | Toast 友好提示 |
| **外部 API 错误** | 重试 + 降级 + 上报 | 降级提示("AI 暂时忙,请稍后") |
| **数据库错误** | Transaction 回滚 + Sentry 上报 | "系统开了小差" |
| **未捕获错误** | Sentry 上报 + 全局 error.tsx | "页面出错了" |

### 3.6.2 外部 API 错误处理(DeepSeek)

```typescript
async function callAI(prompt: string): Promise<string> {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await deepseek.chat(prompt);
    } catch (err) {
      if (err.code === 'rate_limit' && i < maxRetries - 1) {
        await sleep(2 ** i * 1000);
        continue;
      }
      if (err.code === 'context_length_exceeded') {
        // 自动截断历史
        return await deepseek.chat(truncate(prompt));
      }
      throw err;
    }
  }
  throw new AIServiceUnavailableError();
}
```

### 3.6.3 降级策略

| 场景 | 降级方案 |
|---|---|
| DeepSeek 不可用 | 切备用模型(Anthropic Claude) |
| Langfuse 不可用 | 本地日志兜底,事后补传 |
| R2 不可用 | 临时存 DB,定时重试上传 |
| 向量检索慢 | 加 timeout 兜底,返回"无相关 KB" |
| AI 输出含敏感词 | 内容审核层拦截,要求重答 |

---

## 3.7 性能预算

| 指标 | 目标 |
|---|---|
| 首屏加载 (LCP) | < 2.5s |
| 交互可用 (TTI) | < 3s |
| AI 流式首字 | < 2s (P95) |
| API 响应(P95) | < 500ms (非 AI) |
| 方案生成端到端 | < 30s (P95) |
| 考核评分端到端 | < 15s (P95) |
| DB 查询(P95) | < 50ms |
| 向量检索(P95) | < 100ms |

---

## 3.8 安全设计

### 3.8.1 认证 & 授权
- Auth.js v5 + Drizzle adapter
- Middleware 保护所有 `/app/*` 路由
- Server Action 内 `requireUser()` 二次校验
- API Route: 公开 API 用 API Key 签名

### 3.8.2 数据隔离
- 每个 DB 查询都带 `user_id` 过滤(Repository 模式强制)
- 防止 IDOR 攻击(永远不在客户端信任 user_id)

### 3.8.3 注入防护
- Drizzle 自动参数化 SQL(无字符串拼接)
- AI 输出经 Zod 校验后再使用
- 文件上传:类型白名单 + 大小限制 + 病毒扫描(可后置,v1 后期)

### 3.8.4 内容安全
- 用户输入层:敏感词过滤(初版用关键词列表,v2 接审核 API)
- AI 输出层:同敏感词过滤
- 用户提交产物:R2 私有 bucket + 签名 URL 访问

### 3.8.5 速率限制
- Vercel 内置 + 自定义 edge middleware
- 每用户每分钟:30 次 AI 调用
- 每 IP 每小时:100 次注册尝试
- AI 调用月预算监控(每用户 < ¥5)

---

## 3.9 扩展性考虑(为 v2/v3 留口)

| 未来需求 | 当前架构预留 |
|---|---|
| 后台长任务 | Server Actions 不够时,加 Inngest/Trigger.dev |
| 多租户 | `users.tenant_id` 字段,v1 nullable |
| WebSocket 实时 | 用 Vercel Edge + Durable Objects(若 v2 需要) |
| 移动端 | API 全部用 Server Actions/REST,原生 app 可直接调 |
| 视频/音频 | R2 已有,媒体处理用 Cloudflare Stream(可后置) |
| 区块链凭证 | 凭证表 schema 预留 `credential_id`,v3 接入 |

---

## 3.10 本章产出物确认

- [x] 架构原则(5 条)
- [x] 高层模块图
- [x] 核心模块清单(10 个)
- [x] 低层部署图
- [x] 4 个关键时序图
- [x] 数据流写路径
- [x] 错误处理策略(3 层)
- [x] 降级策略
- [x] 性能预算(8 项)
- [x] 安全设计(5 类)
- [x] 扩展性预留

**下一章预告**:`04-data-model.md` — 数据模型(ER 图 + 12 张关键表 DDL + 索引策略)


---

# Chapter 04: 数据模型

> 本章定义 v1 数据模型:ER 图、关键表 schema、索引策略、数据生命周期。
> 配套:Ch 02 技术栈(Drizzle)/ Ch 03 架构(部署图)
> 版本:v0.1 | 状态:草稿

---

## 4.0 设计原则

1. **显式外键** — 不靠应用层逻辑维护关系
2. **软删除优先** — 业务数据不真删,加 `deleted_at`
3. **审计字段** — 每张业务表都有 `created_at` / `updated_at` / `created_by`
4. **预留大于迁移** — 模式 2/3/社区/Tier 3 字段都建好,v2 启用时无 schema 迁移
5. **JSON 谨慎** — 只在"结构不确定/AI 输出"用 JSONB,业务关键字段拆列

---

## 4.1 实体关系总图(ER)

```
                 ┌──────────┐
                 │   users  │
                 └─────┬────┘
                       │ 1
        ┌──────────────┼──────────────┐
        │ N            │ N            │ N
        ↓              ↓              ↓
  ┌───────────┐  ┌────────────┐  ┌────────────┐
  │learning_  │  │  chat_     │  │ user_stats │
  │  plans    │  │  messages  │  └────────────┘
  └─────┬─────┘  └─────┬──────┘
        │ 1            │ N
        │              │
   ┌────┴─────┐        │
   │ plan_    │        │
   │ nodes    │        │
   └────┬─────┘        │
        │ 1            │
        │ N            │
   ┌────┴────────┐     │
   │node_        │     │
   │progress     │     │
   └─────────────┘     │
                      │
   ┌────────────┐     │
   │assessments │←────┘
   └─────┬──────┘
         │ 1
         ├─ N ─→ assessment_artifacts
         └─ N ─→ assessment_scores

  ┌─────────────────┐
  │   kb_entries    │ (Tier 1, 预设库)
  │  - 独立于 user  │
  └─────────────────┘
  
  ┌──────────────────┐
  │ kb_tier2_sessions│ (Tier 2, 临时生成,绑定 plan)
  └──────────────────┘
  
  [v2 预留]
  ┌──────────────────────┐  ┌──────────────────────┐
  │capability_           │  │ target_capabilities  │
  │ assessments          │  │                      │
  └──────────────────────┘  └──────────────────────┘
  ┌──────────────────────┐
  │ intake_sessions      │ (模式 2 对话历史)
  └──────────────────────┘
```

---

## 4.2 关键表 Schema

### 4.2.1 users(用户表)

```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  name: text('name'),
  image: text('image'),
  
  // 用户偏好
  language: text('language').notNull().default('en'), // 'en' | 'zh'
  mode: text('mode').notNull().default('goal_clear'), // 'goal_clear' | 'goal_unclear' | 'reskill'
  
  // 状态
  isActive: boolean('is_active').notNull().default(true),
  onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
  
  // v2 预留
  tenantId: uuid('tenant_id'), // 多租户
  capabilitySnapshot: jsonb('capability_snapshot'), // 模式 3 用
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Auth.js 标准表(adapter 模式)
export const accounts = pgTable('accounts', { /* ... */ });
export const sessions = pgTable('sessions', { /* ... */ });
export const verificationTokens = pgTable('verification_tokens', { /* ... */ });
```

**索引**:
- `users(email)` UNIQUE
- `users(tenant_id)`(v2 多租户)

---

### 4.2.2 learning_plans(学习方案表)

```typescript
export const learningPlans = pgTable('learning_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  title: text('title').notNull(),
  description: text('description'),
  
  // 模式与入口(v2 启用)
  mode: text('mode').notNull(),                // 'goal_clear' | 'goal_unclear' | 'reskill'
  intakeType: text('intake_type').notNull(),    // 决定方案生成器输入
  aiCollabType: text('ai_collab_type').notNull(), // 'vibe_coding' | 'human_ai_collab' | 'ai_assisted'
  
  // 需求画像(模式 1 入口)
  needProfile: jsonb('need_profile').notNull(),
  
  // 状态机
  status: text('status').notNull().default('draft'),
  // 'draft' | 'confirmed' | 'in_learn' | 'in_practice' | 'in_assess' | 'completed' | 'archived'
  
  // KB 来源
  kbEntryId: uuid('kb_entry_id').references(() => kbEntries.id),  // Tier 1 命中
  isAIGenerated: boolean('is_ai_generated').notNull().default(true), // Tier 2 标记
  
  // 语言
  language: text('language').notNull().default('en'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
```

**need_profile JSON 结构**:
```typescript
{
  goal: string;
  context: string;
  constraints: string[];
  success_criteria: string[];
  domain: string;
  language: 'en' | 'zh';
}
```

**索引**:
- `learning_plans(user_id, status, created_at DESC)` — 用户方案列表
- `learning_plans(kb_entry_id)` — 统计 KB 复用率
- `learning_plans(status, completed_at)` — 北极星指标查询

---

### 4.2.3 plan_nodes(方案节点表)

```typescript
export const planNodes = pgTable('plan_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').notNull().references(() => learningPlans.id, { onDelete: 'cascade' }),
  
  sequence: integer('sequence').notNull(),  // 1, 2, 3, ...
  title: text('title').notNull(),
  
  // 结构化节点内容
  content: jsonb('content').notNull(),
  /*
  {
    paragraphs: string[];
    keywords: { term: string; definition: string }[];
    examples: { scenario: string; explanation: string }[];
    common_misconceptions: string[];
  }
  */
  
  // 关联 KB 节点(可选,用于引用追溯)
  sourceKbEntryId: uuid('source_kb_entry_id').references(() => kbEntries.id),
  
  // 评估用
  keyTakeaways: jsonb('key_takeaways'),  // 用于实践阶段提问素材
  /*
  ["用户画像关注行为和动机", "市场调研关注规模和趋势", ...]
  */
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

**索引**:
- `plan_nodes(plan_id, sequence)` UNIQUE — 节点有序

---

### 4.2.4 node_progress(节点进度)

```typescript
export const nodeProgress = pgTable('node_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').notNull().references(() => learningPlans.id, { onDelete: 'cascade' }),
  nodeId: uuid('node_id').notNull().references(() => planNodes.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  stage: text('stage').notNull(),  // 'learn' | 'practice'
  status: text('status').notNull().default('in_progress'),
  // 'in_progress' | 'learned' | 'practiced' | 'mastered'
  
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  
  // AI 评估的掌握度(0-100)
  masteryScore: integer('mastery_score'),
  
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

**索引**:
- `node_progress(user_id, plan_id, node_id)` UNIQUE
- `node_progress(plan_id, status)` — 进度统计

---

### 4.2.5 chat_messages(对话消息表)

```typescript
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').references(() => learningPlans.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  role: text('role').notNull(),  // 'user' | 'assistant' | 'system'
  content: text('content').notNull(),
  
  // 上下文标签
  stage: text('stage').notNull(),           // 'intake' | 'learn' | 'practice' | 'assess'
  nodeId: uuid('node_id').references(() => planNodes.id),  // 当前节点
  assessmentId: uuid('assessment_id').references(() => assessments.id),
  
  // AI 消息元数据
  model: text('model'),            // 'deepseek-v4-flash' | 'deepseek-v4-pro'
  promptTokens: integer('prompt_tokens'),
  completionTokens: integer('completion_tokens'),
  latencyMs: integer('latency_ms'),
  traceId: text('trace_id'),       // Langfuse trace ID
  
  // 反馈
  feedback: text('feedback'),      // 'good' | 'bad' | null
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

**索引**:
- `chat_messages(plan_id, stage, created_at)` — 对话流查询
- `chat_messages(assessment_id)` — 考核对话流
- `chat_messages(trace_id)` — Langfuse 关联
- `chat_messages(user_id, created_at DESC)` — 用户历史

---

### 4.2.6 assessments(考核表)

```typescript
export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').notNull().references(() => learningPlans.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // 任务卡
  taskTitle: text('task_title').notNull(),
  taskDescription: text('task_description').notNull(),
  deliverableType: text('deliverable_type').notNull(), // 'web' | 'app' | 'doc' | 'code' | 'other'
  timeEstimate: text('time_estimate'),
  
  // Rubric(冗余存储,避免历史依赖)
  rubric: jsonb('rubric').notNull(),
  /*
  [
    { criterion: string; weight: number; pass_threshold: number }
  ]
  */
  
  // 关联 KB
  refKbEntryId: uuid('ref_kb_entry_id').references(() => kbEntries.id),
  
  // 状态
  status: text('status').notNull().default('pending'),
  // 'pending' | 'in_progress' | 'submitted' | 'scored' | 'passed' | 'failed' | 'appealed'
  
  // 评分结果
  totalScore: integer('total_score'),
  maxScore: integer('max_score'),
  passedAt: timestamp('passed_at', { withTimezone: true }),
  
  // 复议计数
  appealCount: integer('appeal_count').notNull().default(0),
  
  // 卡壳兜底
  stuckCount: integer('stuck_count').notNull().default(0),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  scoredAt: timestamp('scored_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

**索引**:
- `assessments(plan_id, status)` — 方案考核列表
- `assessments(user_id, created_at DESC)` — 用户考核历史
- `assessments(ref_kb_entry_id)` — KB 复用统计

---

### 4.2.7 assessment_artifacts(考核产物表)

```typescript
export const assessmentArtifacts = pgTable('assessment_artifacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  type: text('type').notNull(),    // 'file' | 'screenshot' | 'url' | 'text'
  r2Key: text('r2_key'),            // R2 object key
  mimeType: text('mime_type'),
  sizeBytes: integer('size_bytes'),
  textContent: text('text_content'), // type='text' 时存这里
  
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
});
```

**索引**:
- `assessment_artifacts(assessment_id)`

---

### 4.2.8 assessment_scores(考核分项评分)

```typescript
export const assessmentScores = pgTable('assessment_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
  
  criterion: text('criterion').notNull(),
  weight: integer('weight').notNull(),
  score: integer('score').notNull(),   // 0..weight
  reasoning: text('reasoning').notNull(),
  evidence: text('evidence'),          // 引用产物具体部分
  
  isAppealed: boolean('is_appealed').notNull().default(false),
  appealResult: text('appeal_result'), // 'upheld' | 'revised' | null
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

**索引**:
- `assessment_scores(assessment_id)` — 评分明细

---

### 4.2.9 kb_entries(预设库 Tier 1)

```typescript
export const kbEntries = pgTable('kb_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  domain: text('domain').notNull(),       // 'frontend' | 'writing' | 'data' | ...
  language: text('language').notNull(),   // 'en' | 'zh'
  
  title: text('title').notNull(),
  description: text('description'),
  
  // 结构化方案
  schemaJson: jsonb('schema_json').notNull(),  // 完整方案结构
  refAnswerJson: jsonb('ref_answer_json'),      // 参考答案
  rubricJson: jsonb('rubric_json'),            // 推荐 rubric
  
  // 向量
  embedding: vector('embedding', { dimensions: 1024 }),  // bge-m3
  
  // 元数据
  qualityScore: integer('quality_score').notNull().default(70),
  usageCount: integer('usage_count').notNull().default(0),
  contributorId: uuid('contributor_id').references(() => users.id),  // v2 社区用
  source: text('source').notNull().default('curated'), // 'curated' | 'ai_promoted' | 'community'
  
  status: text('status').notNull().default('active'),  // 'active' | 'deprecated' | 'draft'
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

**索引**:
- `kb_entries USING hnsw (embedding vector_cosine_ops)` — 向量检索主索引
- `kb_entries(domain, language, status)` — 过滤查询
- `kb_entries(usage_count DESC)` — 热门方案
- `kb_entries(quality_score DESC)` — 质量排序

---

### 4.2.10 kb_tier2_sessions(AI 当场生成,Tier 2)

```typescript
export const kbTier2Sessions = pgTable('kb_tier2_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').notNull().references(() => learningPlans.id, { onDelete: 'cascade' }),
  
  // 现场生成的方案
  schemaJson: jsonb('schema_json').notNull(),
  refAnswerJson: jsonb('ref_answer_json'),
  rubricJson: jsonb('rubric_json'),
  
  // 沉淀候选(v2 用)
  promoteCandidate: boolean('promote_candidate').notNull().default(false),
  promotionScore: integer('promotion_score'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});
```

**索引**:
- `kb_tier2_sessions(plan_id)` UNIQUE
- `kb_tier2_sessions(promote_candidate, promotion_score DESC)` — 沉淀候选

---

### 4.2.11 user_stats(用户聚合统计表)

```typescript
export const userStats = pgTable('user_stats', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  
  totalPlans: integer('total_plans').notNull().default(0),
  completedPlans: integer('completed_plans').notNull().default(0),
  totalAssessments: integer('total_assessments').notNull().default(0),
  passedAssessments: integer('passed_assessments').notNull().default(0),
  totalAiCalls: integer('total_ai_calls').notNull().default(0),
  totalTokensUsed: integer('total_tokens_used').notNull().default(0),
  
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

**用途**:北极星指标查询不用全表 scan,直接读这里。
**更新策略**:每次业务事务内同步更新(用 Drizzle transaction 一次性写)。

---

## 4.3 v2 预留表(schema 建好,不暴露 UI)

### 4.3.1 intake_sessions(模式 2 对话历史)

```typescript
export const intakeSessions = pgTable('intake_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // 模式 2 的多轮对话
  messages: jsonb('messages').notNull(),
  
  // AI 收敛出的方向
  suggestedDirections: jsonb('suggested_directions'),
  selectedDirection: jsonb('selected_direction'),
  
  // 转化
  generatedPlanId: uuid('generated_plan_id').references(() => learningPlans.id),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});
```

### 4.3.2 capability_assessments(模式 3 能力评估)

```typescript
export const capabilityAssessments = pgTable('capability_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  domain: text('domain').notNull(),
  currentState: jsonb('current_state').notNull(),  // { skill, level, evidence }
  
  // 关联目标
  targetCapabilityId: uuid('target_capability_id').references(() => targetCapabilities.id),
  generatedPlanId: uuid('generated_plan_id').references(() => learningPlans.id),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### 4.3.3 target_capabilities(目标能力模板)

```typescript
export const targetCapabilities = pgTable('target_capabilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  domain: text('domain').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  requiredSkills: jsonb('required_skills').notNull(),
  reskillingPath: jsonb('reskilling_path'),  // 推荐学习路径
  
  language: text('language').notNull().default('en'),
  status: text('status').notNull().default('active'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

---

## 4.4 索引策略总览

| 表 | 主要索引 | 索引类型 | 用途 |
|---|---|---|---|
| users | email | B-tree UNIQUE | 登录 |
| learning_plans | (user_id, status, created_at) | B-tree | 用户方案列表 |
| plan_nodes | (plan_id, sequence) | B-tree UNIQUE | 节点有序 |
| node_progress | (user_id, plan_id, node_id) | B-tree UNIQUE | 进度唯一 |
| chat_messages | (plan_id, stage, created_at) | B-tree | 对话流 |
| chat_messages | (user_id, created_at DESC) | B-tree | 用户历史 |
| assessments | (user_id, created_at DESC) | B-tree | 考核历史 |
| kb_entries | embedding | HNSW | 向量检索 |
| kb_entries | (domain, language, status) | B-tree | 过滤 |
| user_stats | user_id | PK | 聚合查询 |

---

## 4.5 数据生命周期

| 数据类型 | 保留期 | 清理策略 |
|---|---|---|
| 用户隐私数据(密码哈希等) | 账号存续期 | 软删即清 |
| 业务数据(plan/assessment) | 永久 | 软删,用户可恢复 |
| 对话历史 | 永久 | 软删,用于回看/训练 |
| 考核产物 R2 文件 | 永久 | 软删,同 DB 一致 |
| AI 调用 trace | 1 年 | 自动归档 Langfuse |
| 操作日志 | 90 天 | 自动清理 |
| 失败的 KB Tier 2 | 30 天 | 自动归档 |

**GDPR/CCPA 合规**(海外先跑必做):
- 用户请求导出:导出一份 JSON 含所有 user 相关表
- 用户请求删除:软删 + 30 天后硬删(给反悔期)
- 文档化"数据请求处理"流程(在 v1 上线前完成)

---

## 4.6 备份与恢复

| 数据 | 备份策略 | RPO | RTO |
|---|---|---|---|
| Postgres | Neon 自动 PITR | 1 小时 | 1 小时 |
| R2 产物 | Cloudflare R2 跨区域复制 | 1 天 | 4 小时 |
| 配置文件 | Git 仓库 | 0 | 5 分钟 |
| Langfuse traces | Langfuse Cloud 自带 | 1 天 | 1 天 |

**月度演练**:v1 上线后每月做 1 次恢复演练(用 Neon 分支数据库)。

---

## 4.7 本章产出物确认

- [x] ER 总图
- [x] 11 张 v1 关键表 schema
- [x] 3 张 v2 预留表 schema
- [x] 索引策略(11 项)
- [x] 数据生命周期(7 类)
- [x] GDPR/CCPA 合规
- [x] 备份与恢复(4 类)

**下一章预告**:`05-ai-system.md` — AI 系统设计(模型分工表、prompt 框架、KB 三层 RAG、Rubric 生成器、流式协议)


---

# Chapter 05: AI 系统设计

> 本章定义 v1 AI 系统:模型分工、Prompt 框架、RAG、Rubric 生成、流式协议、工具调用、评估。
> 配套:Ch 01 功能 / Ch 02 技术栈 / Ch 04 数据模型
> 版本:v0.1 | 状态:草稿

---

## 5.0 设计原则

1. **行为契约优先** — 每个阶段的 AI 行为必须"禁止 X / 必须 Y"明确写出
2. **Prompt 即代码** — 所有 prompt 模板进 `prompts/` 目录,版本管理,可 A/B
3. **可观测** — 每次 AI 调用有 trace,prompt/response 完整存 Langfuse
4. **可降级** — 任何 AI 故障,核心学习/考核流程不能断(可能降级为简单文本)
5. **成本可控** — 默认走 Flash,关键路径才用 Pro,实时监控 token 消耗

---

## 5.1 AI 系统总览

```
┌────────────────────────────────────────────────────────────┐
│                     AI Orchestrator                         │
│                  (lib/ai/orchestrator.ts)                   │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Stage      │  │  Prompt      │  │  Tool           │  │
│  │  Selector   │→ │  Registry    │→ │  Registry       │  │
│  │             │  │              │  │                 │  │
│  │ (intake/    │  │ (intake_*)   │  │ (search_kb)     │  │
│  │  learn/     │  │ (learn_*)    │  │ (update_node)   │  │
│  │  practice/  │  │ (practice_*) │  │ (submit_artifact)│ │
│  │  assess)    │  │ (assess_*)   │  │ (appeal_score)  │  │
│  └─────────────┘  └──────────────┘  └─────────────────┘  │
│         │                 │                    │           │
│         └─────────────────┴────────────────────┘           │
│                           ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Context Builder (RAG + User State)        │  │
│  │  - Need profile + Plan nodes + Progress              │  │
│  │  - Recent chat history (windowed)                    │  │
│  │  - KB retrieval results (topK + rerank)              │  │
│  │  - System prompt (stage-specific)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Model Dispatcher (Vercel AI SDK)          │  │
│  │  - Stage 决定 model (Flash/Pro)                       │  │
│  │  - streamingText / streamObject                       │  │
│  │  - Tool calling loop                                  │  │
│  │  - Token / latency / error → Langfuse                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**核心接口**(所有 AI 调用都通过这里):
```typescript
// lib/ai/orchestrator.ts
export interface RunStageInput {
  userId: string;
  planId: string;
  stage: 'intake' | 'learn' | 'practice' | 'assess';
  nodeId?: string;
  assessmentId?: string;
  userMessage: string;
  // 内部补充(由 orchestrator 加载)
  context?: StageContext;
}

export interface StageContext {
  needProfile: NeedProfile;
  plan: LearningPlan;
  currentNode?: PlanNode;
  progress: NodeProgress[];
  recentMessages: ChatMessage[];
  kbHits: KBEntry[];
}

export async function* runStage(input: RunStageInput): AsyncGenerator<StreamChunk> {
  // ...
}
```

---

## 5.2 模型分工矩阵

| 任务 | 模型 | 上下文 | 典型 prompt | 典型 response | 失败模式 | 备用 |
|---|---|---|---|---|---|---|
| **Intake 澄清** | Flash | 4K | 500 | 200 | 跑题/重复 | 重试 + 缩短历史 |
| **Demand Judge** | Flash | 4K | 800 | 100 | 误判 | 二次校验 + 置信度 |
| **Schema Generate** | Pro | 8K | 2K | 3K | 幻觉 / 不结构化 | Zod 校验失败重试 |
| **Learn 对话** | Flash | 8K | 3K | 500 | 直接给答案 | prompt 守卫 + 关键词检测 |
| **Practice 对话** | Flash | 8K | 3K | 500 | 拓展新知识 | prompt 守卫 + 节点范围约束 |
| **Assess 评分** | Pro | 16K | 5K | 1K | 偏松 / 偏严 | 与历史样本对比 |
| **Assess Hint** | Flash | 4K | 1.5K | 150 | 太长 | 长度截断 + 关键词计数 |
| **Rubric 生成** | Pro | 8K | 2K | 1K | 维度不全 | 节点数对齐校验 |
| **Embedding** | bge-m3 | 8K | 200 | 1.5K(向量) | 极少 | 重试 |

**Flash vs Pro 选择逻辑**:
```typescript
function pickModel(stage: StageType, isCriticalPath: boolean): ModelTier {
  if (isCriticalPath) return 'pro';
  if (['schema_generate', 'assess_score', 'rubric_generate'].includes(stage)) return 'pro';
  return 'flash';
}
```

---

## 5.3 Prompt 框架

### 5.3.1 Prompt 结构(标准)

所有 prompt 模板用 4 段式:
```
[SYSTEM]
- 角色: 你是 XXX
- 上下文: 用户/方案/节点的元信息
- 行为契约: 禁止 / 必须
- 输出格式: JSON / Markdown / Plain

[USER]
- 历史: (最近 N 轮)
- 当前输入: 用户消息
- 引用: (如有)
```

### 5.3.2 Learn 阶段 prompt(示例)

```markdown
# prompts/learn/node_conversation.v1.md

## SYSTEM
你是一位苏格拉底式的导师。当前学生在学习"{{node_title}}"。

### 节点内容
{{node.content}}

### 行为契约
**禁止**:
- 直接给出答案(必须用反问引导)
- 一次讲超过 1 个核心点
- 引用未在节点内容中出现的概念
- 替学生总结("所以 XXX 的意思是 YYY")

**必须**:
- 每次回复以提问/反问/确认开始
- 基于学生的理解深度调整下一步
- 当学生说"不理解"时,提供具体例子(从节点 examples 取)
- 当学生引用关键词时,只在该关键词范围内回答

### 输出格式
Markdown 文本(2-4 段,200-400 字)
如需要 JSON 工具调用,使用工具注册表中的工具。

## HISTORY
{{windowed_history}}

## USER_MESSAGE
{{user_input}}

## CITATION
{{#if citation}}
学生引用了关键词:"{{citation.keyword}}"
节点 ID: {{citation.node_id}}
请只基于该关键词解释,不引入新概念。
{{/if}}
```

### 5.3.3 Practice 阶段 prompt(示例)

```markdown
# prompts/practice/consolidate.v1.md

## SYSTEM
你是实践阶段的主持人。学生已完成"Learn"阶段,现在需要巩固。
当前节点:"{{node_title}}",已学核心要点:
{{node.key_takeaways}}

### 行为契约
**禁止**:
- 引入任何新概念(即使相关)
- 直接评判"对/错"(必须用问题引导)
- 拓展深度或跨节点

**必须**:
- 每次回复以"请你..."开始
- 学生答错时,先用反例或再提问
- 难度自适应:3 轮答对可升难度,3 轮答错可降难度
- 每 3-5 轮问"你觉得自己准备好进入考核了吗?"

### 输出格式
Markdown 文本(2-3 段,200-300 字)
```

### 5.3.4 Assess 阶段 prompt(示例)

```markdown
# prompts/assess/score.v1.md

## SYSTEM
你是考核评分员。学生提交了"{{task_title}}"的产物。
任务描述:{{task.description}}
可交付物类型:{{deliverable_type}}

### 评分 Rubric
{{#each rubric}}
- 标准: {{this.criterion}}
  权重: {{this.weight}}
  通过阈值: {{this.pass_threshold}}
{{/each}}

### 行为契约
**禁止**:
- 给出任何提示或引导
- 模糊评分(必须 0..weight 的整数)
- 隐藏 reasoning

**必须**:
- 逐项打分,每项给 reasoning
- reasoning 必须引用产物具体部分(用 [[artifact:part:offset]] 标记)
- 评分后输出总分(加权)

### 输出格式(强制 JSON,无 markdown)
{
  "scores": [
    {
      "criterion": "string",
      "score": 0,
      "reasoning": "string (>= 50 字)",
      "evidence": "string"
    }
  ],
  "total_score": 0,
  "max_score": 0,
  "overall_comment": "string"
}
```

### 5.3.5 Prompt 版本管理

```
prompts/
├── intake/
│   ├── clarify.v1.md
│   └── judge.v1.md
├── learn/
│   ├── node_conversation.v1.md
│   └── help_stuck.v1.md
├── practice/
│   ├── consolidate.v1.md
│   └── readiness_check.v1.md
├── assess/
│   ├── score.v1.md
│   ├── hint.v1.md
│   └── appeal_rescore.v1.md
├── schema/
│   ├── generate.v1.md
│   └── refine.v1.md
└── shared/
    ├── system_base.v1.md
    └── citation_format.v1.md
```

每次 prompt 改动:`v1.md` → `v2.md`,保留历史,可 A/B 对比。

---

## 5.4 RAG 检索增强

### 5.4.1 检索流程

```
用户需求 / 当前节点
    ↓
[1. Embedding] bge-m3 → 1024 维向量
    ↓
[2. 向量检索] pgvector HNSW, topK=20
    ↓
[3. 过滤] status='active', domain/language 匹配
    ↓
[4. 重排序] bge-reranker → topK=5
    ↓
[5. 注入 context] 写入 system prompt
```

### 5.4.2 索引策略

```sql
-- 启用 pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- HNSW 索引(查询快,适合中等规模)
CREATE INDEX kb_entries_embedding_hnsw
ON kb_entries
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 检索时设置 ef_search
SET hnsw.ef_search = 100;
```

### 5.4.3 检索质量保障

| 措施 | 作用 |
|---|---|
| 分数阈值 (cosine > 0.75) | 过滤低质量命中 |
| 关键词二次匹配 | 防止纯向量"看似相关" |
| 多查询融合 (query expansion) | 应对一词多义 |
| 冷启动兜底 | 库为空时直接走 Tier 2 |

### 5.4.4 Context Window 限制

- Flash 模型:8K 上下文 → KB 注入最多 3K(留 5K 给对话)
- Pro 模型:16K 上下文 → KB 注入最多 5K(留 11K)
- 超限策略:截断 + 提示"完整 KB 见参考链接"

---

## 5.5 Rubric 生成器

### 5.5.1 输入 vs 输出

```typescript
// 输入
interface RubricGenInput {
  plan: LearningPlan;
  node: PlanNode;
  deliverableType: 'web' | 'app' | 'doc' | 'code' | 'other';
  refAnswer?: KBEntry['refAnswerJson'];  // 来自 KB 或 Tier 2
}

// 输出
interface Rubric {
  items: RubricItem[];
  totalWeight: number;
  passThreshold: number;  // 默认 60% * totalWeight
}
```

### 5.5.2 生成流程

```
[Pro 模型] prompt = rubric_template + node + deliverable_type
    ↓
[Zod 校验] items.length >= 3, sum(weight) === 100
    ↓ (校验失败 → 重试,最多 2 次)
[持久化] assessment.rubric = generated
    ↓
[返回] 评分阶段使用
```

### 5.5.3 质量保障
- Rubric 项数:3~7 项(过多评分过细,过少不全面)
- 权重和必须 = 100(否则重试)
- 通过阈值默认 60(可在 plan 配置中调整)
- 必须包含 1 项"AI 协作能力"(v1 产品核心,不能漏)

---

## 5.6 流式协议

### 5.6.1 SSE 协议(Vercel AI SDK 标准)

```
GET /api/chat?planId=...  → Server-Sent Events

event: data
data: {"type":"message","content":"Hi"}

event: data
data: {"type":"message","content":" there"}

event: data
data: {"type":"tool_call","name":"update_node_progress","args":{...}}

event: data
data: {"type":"done","trace_id":"..."}
```

### 5.6.2 客户端 useChat

```typescript
'use client';
import { useChat } from 'ai/react';

export function ChatPanel({ planId }: { planId: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: `/api/chat?planId=${planId}`,
    onError: (err) => toast.error('AI 暂时忙,请重试'),
  });
  // 渲染 messages ...
}
```

### 5.6.3 关键事件类型

| 类型 | 数据 | 客户端处理 |
|---|---|---|
| `message` | `{ content }` | 追加到流式消息 |
| `tool_call` | `{ name, args }` | 显示工具调用指示 |
| `tool_result` | `{ result }` | 隐藏工具调用,继续 |
| `error` | `{ message }` | Toast + 终止 |
| `done` | `{ trace_id, tokens }` | 关闭 loading,保存 |

### 5.6.4 中断 & 续传

- 用户关闭页面 → abort signal 触发,后端停止调用
- 续传:不支持(对话流短,可重新发起)
- 长输出截断:客户端 buffer > 50K 字符时警告

---

## 5.7 工具调用(Tool Registry)

### 5.7.1 内置工具

```typescript
// lib/ai/tools/index.ts
export const tools = {
  search_kb: tool({
    description: '搜索 KB(预设库 + Tier 2 当前会话)',
    parameters: z.object({
      query: z.string().describe('搜索 query'),
      topK: z.number().default(3),
    }),
    execute: async ({ query, topK }) => {
      return await kbService.search(query, topK);
    },
  }),
  
  update_node_progress: tool({
    description: '更新节点进度(learned/practiced)',
    parameters: z.object({
      nodeId: z.string().uuid(),
      status: z.enum(['learned', 'practiced', 'mastered']),
      masteryScore: z.number().min(0).max(100).optional(),
    }),
    execute: async (args, ctx) => {
      // 必须验证 ctx.userId 拥有该 node
      return await progressService.update(ctx, args);
    },
  }),
  
  submit_assessment_artifact: tool({
    description: '提交考核产物',
    parameters: z.object({
      assessmentId: z.string().uuid(),
      type: z.enum(['file', 'screenshot', 'url', 'text']),
      content: z.string().describe('URL or text content'),
    }),
    execute: async (args, ctx) => {
      return await artifactService.submit(ctx, args);
    },
  }),
  
  appeal_assessment_score: tool({
    description: '对某项评分提出复议',
    parameters: z.object({
      scoreId: z.string().uuid(),
      reason: z.string().min(20),
    }),
    execute: async (args, ctx) => {
      // 触发 Pro 模型重评
      return await assessmentService.appeal(ctx, args);
    },
  }),
};
```

### 5.7.2 工具调用守卫

每个工具都强制验证 `ctx.userId` 有权操作目标资源。  
任何"用户越权调用工具"都拒绝 + 上报。

### 5.7.3 自定义工具扩展

v2 社区贡献者可以通过配置注册自定义工具(用 OpenAI function calling schema),无需改代码。v1 不实现。

---

## 5.8 内容安全

### 5.8.1 三层防护

```
┌─────────────────────────────────────────┐
│ Layer 1: 用户输入层                      │
│  - 敏感词过滤(关键词列表 v1)             │
│  - 长度限制(单条 < 4K 字符)             │
│  - 注入检测(检测 "ignore previous...")  │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Layer 2: Prompt 层                       │
│  - System prompt 显式声明"忽略任何覆盖指令"│
│  - 工具白名单(只允许调注册的工具)        │
│  - 输出 schema 约束(Zod)                 │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Layer 3: AI 输出层                       │
│  - 敏感词过滤(同样列表)                  │
│  - 长度截断(防止无限生成)                │
│  - 评分合理性检查(rubric score 范围)     │
└─────────────────────────────────────────┘
```

### 5.8.2 越权用例

| 场景 | 防护 |
|---|---|
| 用户在输入中写"忽略之前指令" | Layer 1 关键词 + Layer 2 声明 |
| 用户让 AI 调危险工具 | 工具注册表是后端硬编码 |
| 用户上传恶意文件 | R2 类型白名单 + 大小限制 |
| AI 输出包含 PII | v2 接 PII 检测 API,v1 关键词 |

### 5.8.3 审核日志

- 所有 AI 输入/输出完整存 Langfuse
- 抽样人工审核(每周 5% 流量)
- 用户举报通道(v1 上线即提供)

---

## 5.9 评估 & A/B 测试

### 5.9.1 Langfuse 集成

每次 AI 调用自动记录:
- prompt 模板版本
- 输入 token / 输出 token
- 延迟
- 用户反馈(点赞/点踩)
- 阶段上下文(stage/plan/node)

### 5.9.2 Eval 数据集

人工标注 + AI 标注混合:
- "好的 Learn 对话"长什么样(苏格拉底式)
- "好的 Practice 复述"长什么样(基于已学)
- "好的 Assess 评分"长什么样(可解释)

**v1 目标**:积累 50+ 标注样本,每 2 周做一次 offline eval。

### 5.9.3 A/B 框架

```typescript
// lib/ai/experiments.ts
const experiment = {
  name: 'learn_prompt_v1_vs_v2',
  variants: {
    control: 'prompts/learn/node_conversation.v1.md',
    treatment: 'prompts/learn/node_conversation.v2.md',
  },
  splitBy: 'userId',  // 用户粒度,保证体验一致
  metrics: ['task_completion_rate', 'mastery_score', 'user_feedback'],
};
```

v1 暂不开放用户分桶(复杂度高),内部测试为主。

---

## 5.10 错误恢复 & 重试

### 5.10.1 重试策略

```typescript
const retryConfig = {
  maxRetries: 3,
  backoff: 'exponential',  // 1s, 2s, 4s
  retryableErrors: ['rate_limit', 'timeout', 'context_length'],
  nonRetryable: ['content_policy_violation', 'invalid_request'],
};
```

### 5.10.2 降级路径

| 故障 | 降级 |
|---|---|
| DeepSeek 整体不可用 | 切 Anthropic Claude(配置备用 API key) |
| Flash 不可用,Pro 可用 | Flash 任务降级用 Pro(成本可控,v1 量小) |
| KB 检索慢/失败 | 跳过 RAG,纯 LLM 回答 |
| Langfuse 不可用 | 本地日志兜底,异步补传 |
| 流式中断 | 客户端提示"网络问题,重试" |

### 5.10.3 人工兜底

v1 不实现(v1 用户量小,失败率可控)。v2 接入"AI 失败 → 标记 → 人工审核"工作流。

---

## 5.11 成本控制

### 5.11.1 实时监控

```typescript
// 每次 AI 调用后
await usageTracker.track({
  userId,
  model,
  inputTokens,
  outputTokens,
  cost: calculateCost(model, inputTokens, outputTokens),
  stage,
});
```

### 5.11.2 预算熔断

- 每用户日预算:¥1
- 触发熔断 → AI 返回"今日 AI 调用已达上限,明天继续"
- 不影响学习(已生成方案可继续看)

### 5.11.3 优化策略

| 策略 | 节省 |
|---|---|
| Flash 替代 Pro | 80% |
| History windowing (最近 10 轮) | 30% |
| KB 结果截断 (topK=3) | 20% |
| 缓存常见 prompt | 5% |
| **合计** | **~90% 成本节省 vs 全 Pro 无优化** |

---

## 5.12 本章产出物确认

- [x] AI 系统总览图
- [x] 核心接口定义
- [x] 模型分工矩阵(9 任务)
- [x] 4 个 prompt 模板示例
- [x] Prompt 版本管理
- [x] RAG 检索流程 + 索引
- [x] Rubric 生成器
- [x] SSE 流式协议
- [x] 4 个内置工具
- [x] 三层内容安全
- [x] Langfuse 集成 + Eval 策略
- [x] 重试 + 降级 + 熔断

**下一章预告**:`06-structure.md` — 模块/文件结构(完整目录树 + 关键文件职责 + 模块依赖图)


---

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


---

# Chapter 07: 开发路线图

> 本章定义 v1(6 周 MVP)→ v2(3-6 月)→ v3(12 月+) 的开发路线、每周 milestone、人力分配。
> 配套:Ch 00 范围 / Ch 01 功能切片
> 版本:v0.1 | 状态:草稿

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

### Week 2:AI 编排基础

| Day | 任务 | 产出 |
|---|---|---|
| 1-2 | Vercel AI SDK + DeepSeek 接入 | 能流式对话(简单 prompt) |
| 2-3 | Prompt Registry + 模板加载机制 | 模板版本化 |
| 3-4 | Orchestrator 骨架 + Context Builder | runStage() 接口可调 |
| 4-5 | Tool Registry 框架(空实现) | 工具可注册可调 |
| 5-6 | Langfuse 集成 + trace 验证 | 每次调用有 trace |
| 6 | Sentry + PostHog 接入 | 错误可见,事件可见 |

**Demo 节点**:在 chat 页能跟 AI 流式对话(简单 demo,无业务逻辑),AI 调用在 Langfuse 可见。

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

### Week 6:打磨 + 上线

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


---

# Chapter 08: 风险 & 应对

> 本章枚举 v1 项目可能的风险,分级 + 应对 + 应急预案 + 监控信号。
> 配套:Ch 07 路线图 / Ch 03 架构(降级)
> 版本:v0.1 | 状态:草稿

---

## 8.0 风险评估方法

- **影响**:H(高,产品死亡级) / M(中,延期 1-2 周或体验下降) / L(低,可消化)
- **概率**:H(>50%) / M(20-50%) / L(<20%)
- **风险分** = 影响 × 概率
- **优先级** = 风险分 + 应对成本

---

## 8.1 风险登记册(11 项)

### 🔴 R01:1 人交付能力不足以 6 周内完成 v1

| 项 | 内容 |
|---|---|
| **影响** | H(6 周无法跑通,产品死) |
| **概率** | H(1 人 + AI-heavy 复杂度,极可能延期) |
| **应对** | 1) 严格 v1 切片,任何"想加"必须等 v2<br>2) Week 2 末做 Go/No-Go 检查,失败则缩范围<br>3) 用 AI 工具加速(Cursor / Copilot / v0)<br>4) 必要时砍 KB seed(只 3 条先跑通) |
| **应急** | 延期到 8 周,但必须先砍功能,不堆人 |
| **监控** | 每周日 30 分钟复盘,完成度 < 70% 即触发应急 |

---

### 🔴 R02:AI 评分不可信(用户大量投诉 / 不公平)

| 项 | 内容 |
|---|---|
| **影响** | H(产品核心价值崩塌) |
| **概率** | M(评分是公认难题) |
| **应对** | 1) Week 5 用 5 个测试产物对比 AI vs 人工评分,目标一致率 > 60%<br>2) 评分必须有 reasoning + evidence,可解释<br>3) 提供复议机制(用 Pro 模型 + 不同 prompt 重评)<br>4) 考核产物支持人工 review(v1 后台抽样) |
| **应急** | 评分争议 ≥ 30% → 暂停 AI 自动评分,改"AI 建议 + 人工确认" |
| **监控** | PostHog 跟踪"复议率"、"评分低于 60% 占比" |

---

### 🟠 R03:DeepSeek-V4 海外访问不稳定 / API 限流

| 项 | 内容 |
|---|---|
| **影响** | H(主模型挂 = 产品死) |
| **概率** | M(国产 LLM 海外可访问,但有限流风险) |
| **应对** | 1) Week 2 末做 stress test(并发 10 用户连续 1 小时)<br>2) 准备 Anthropic Claude 作为备用供应商<br>3) Edge runtime 部署,减少跨区延迟<br>4) 失败自动重试 + 降级到备用 |
| **应急** | 立即切备用,UI 顶部公告"AI 服务临时降级" |
| **监控** | Langfuse 看延迟 P95、错误率,> 5% 即告警 |

---

### 🟠 R04:AI 调用成本超预算(用户大量使用)

| 项 | 内容 |
|---|---|
| **影响** | M(用户活跃但亏损) |
| **概率** | M(LLM 成本易失控) |
| **应对** | 1) 严格 Flash/Pro 分工(参考 Ch 05)<br>2) 每用户日预算熔断 ¥1<br>3) History windowing 减少 token<br>4) 缓存常见 prompt 模板<br>5) 月度成本 review |
| **应急** | 临时下调 Pro 使用阈值 / 推出"AI 调用包"商业化 |
| **监控** | 每日 Langfuse 看总成本,周度 review 每用户成本 |

---

### 🟠 R05:范围蔓延(scope creep)

| 项 | 内容 |
|---|---|
| **影响** | H(延期,失去节奏) |
| **概率** | H(1 人最易踩,加功能很爽) |
| **应对** | 1) Ch 00 明确"非目标"<br>2) 任何新需求写 ADR,标注 v2/v3 推迟<br>3) 每周日强制 1 小时"这周没加新东西" 回顾<br>4) 用户反馈 → v1.1(2 周一次小迭代),不是 v1 |
| **应急** | 砍功能时优先砍"AI 工具不能解决"的功能 |
| **监控** | GitHub issue 标签 `v1-blocker` vs `v2-later`,严格区分 |

---

### 🟠 R06:种子用户拉不到 / 闭环完成率低

| 项 | 内容 |
|---|---|
| **影响** | H(无用户 = 无产品) |
| **概率** | M(AI 教学产品验证未充分) |
| **应对** | 1) Week 0 就开始运营(blog, 1 篇深度文)<br>2) 10 个种子用户来自"3 圈朋友 + 1 个公开帖"<br>3) Day 30 前必须 5 个完整闭环,否则深度访谈找问题<br>4) 准备"备份受众":AI 工具学习社区 / Substack 读者 |
| **应急** | 闭环率 < 30% → 重新设计 Learn/Practice 体验(可能砍 Learn,直接做 Practice) |
| **监控** | 每日看新注册、闭环完成数、访谈录音 |

---

### 🟡 R07:kb 三层机制冷启动失败

| 项 | 内容 |
|---|---|
| **影响** | M(方案质量下降) |
| **概率** | M(初始 KB 10 条覆盖度有限) |
| **应对** | 1) Week 6 前自己手写 10 条高质量 KB(从自己擅长的领域开始)<br>2) Tier 1 命中率指标监控(目标首月 > 30%)<br>3) 未命中 → 立刻走 Tier 2,体验不打折<br>4) 复用率高的 Tier 2 持续沉淀到 Tier 1 |
| **应急** | KB 全空 = Tier 2 100% 兜底,产品仍可用 |
| **监控** | Langfuse + 后台统计 Tier 1 命中率 |

---

### 🟡 R08:产品出现"作弊 / 提交 AI 生成的产物"

| 项 | 内容 |
|---|---|
| **影响** | M(评估失真,品牌受损) |
| **概率** | H(在 AI 时代几乎必然) |
| **应对** | 1) v1 不做强制反作弊(成本太高,1 人扛不住)<br>2) 评分更倾向"过程证据"(git log, 思考过程)<br>3) 用户协议明确"必须原创"<br>4) 鼓励"展示 AI 协作过程"而非禁止 AI(本就是 AI 时代产品) |
| **应急** | 收到举报 → 单账号人工 review,严重者封号 |
| **监控** | PostHog 看异常提交模式(30 秒提交 + 完美产物) |

---

### 🟡 R09:内容安全(用户输入/AI 输出违规)

| 项 | 内容 |
|---|---|
| **影响** | M(法律风险 + 平台风险) |
| **概率** | M(海外用户 1%) |
| **应对** | 1) 三层防护(Ch 05.8)<br>2) 用户协议 + 服务条款<br>3) 举报通道 v1 上线即提供<br>4) PostHog + Sentry 异常 prompt 上报 |
| **应急** | 严重违规 → 立即封号 + 通知用户 + 备查 |
| **监控** | Sentry 报警 + 人工抽检 5% 对话 |

---

### 🟡 R10:关键服务故障(Neon / Vercel / R2)

| 项 | 内容 |
|---|---|
| **影响** | M(临时不可用) |
| **概率** | L(SLA 99.9%) |
| **应对** | 1) 多供应商备用(Neon 故障 → 切 Supabase,Vercel 故障 → 切 CF Pages)<br>2) 静态资源 CDN 多源<br>3) 监控告警 + runbook<br>4) 备份恢复演练(月度) |
| **应急** | Status page 公告 + 自动 failover |
| **监控** | 外部 Uptime 监控(UptimeRobot 免费)+ Sentry |

---

### 🟡 R11:作者本人 burnout / 长期健康

| 项 | 内容 |
|---|---|
| **影响** | H(项目直接停) |
| **概率** | M(1 人高强度) |
| **应对** | 1) 严格 40h/周(不加班)<br>2) 周末强制休息<br>3) 运动 + 社交不断<br>4) 关键决策留"停 24h"缓冲<br>5) 找 1 个 accountability partner(朋友) |
| **应急** | 触发 burnout 信号 → 立即停 1 周,推迟 v1 上线 |
| **监控** | 周日自我评分:精力 1-10,< 5 连续 2 周即触发 |

---

## 8.2 风险矩阵总览

```
          影响 L            影响 M            影响 H
概率 H   -                 R08               R01, R05
概率 M   -                 R04, R07          R02, R03, R06
概率 L   -                 R09, R10          R11
```

**红色区(必须主动管理)**:R01, R05
**橙色区(重点监控)**:R02, R03, R04, R06
**黄色区(被动响应)**:R07, R08, R09, R10, R11

---

## 8.3 风险监控仪表

> v1 上线后建立监控仪表,周度 review

| 指标 | 阈值 | 风险对应 |
|---|---|---|
| 周完成度 vs 计划 | < 70% | R01 |
| AI 调用成本 / 周 | > ¥500 | R04 |
| 评分复议率 | > 30% | R02 |
| DeepSeek 错误率 | > 5% | R03 |
| Tier 1 命中率 | < 20% | R07 |
| 闭环完成数 / 周 | < 5 | R06 |
| 异常提交检测 | 任意 | R08 |
| 严重违规事件 | 任意 | R09 |
| 服务可用性 | < 99% | R10 |
| 自我精力评分 | < 5 持续 | R11 |

**监控位置**:Sentry + PostHog + Langfuse + Notion 表(周度手填)

---

## 8.4 应急预案模板

每个 R 级风险都有应急预案,触发即执行,不需要再讨论:

```markdown
### 应急预案:Rxx

**触发信号**:
- [ ] 信号 1
- [ ] 信号 2

**立即行动**(15 分钟内):
1. ...
2. ...

**短期行动**(24 小时内):
1. ...

**复盘**(1 周内):
- 写 ADR 记录决策
- 更新监控信号
- 评估是否需要永久措施
```

**v1 上线前必须就绪的预案**:R01, R02, R03, R05, R11

---

## 8.5 风险 vs 规划关联表

| 风险 | 影响章节 | 应对已落地 |
|---|---|---|
| R01 | Ch 07 路线图 | Week 2/5/6 Go/No-Go |
| R02 | Ch 01.6 / Ch 05.6 | 评分复议机制 + 评分 reasoning |
| R03 | Ch 02.7 / Ch 05.10 | 备用供应商 + 降级路径 |
| R04 | Ch 02.8 / Ch 05.11 | 模型分工 + 预算熔断 |
| R05 | Ch 00.8 / Ch 07 | 非目标清单 + 周度 review |
| R06 | Ch 00.7 / Ch 07.2 | 30/60/90 天计划 |
| R07 | Ch 01.7 / Ch 05.4 | KB 三层机制 + 沉淀路径 |
| R08 | Ch 01.6 / Ch 07.6 | 评分强调过程证据 |
| R09 | Ch 03.8 / Ch 05.8 | 三层内容安全 |
| R10 | Ch 03.10 / Ch 04.6 | 备份恢复策略 |
| R11 | Ch 07.5 | 工作量分配 + 周末强制休息 |

> 风险已"系统化"嵌入规划,不是另起炉灶。

---

## 8.6 假设清单(v1 启动前提)

任何一项被证伪 = 触发重新规划:

1. **A1**:1 人能在 6 周内完成 v1 切片
2. **A2**:AI 评分能比随机更准(60%+ 一致率)
3. **A3**:用户愿意被 AI 评判
4. **A4**:DeepSeek-V4 海外可稳定访问
5. **A5**:3 阶段方法论(学-练-考)用户能感知价值
6. **A6**:KB 三层机制(预设+AI+社区)有实际效果
7. **A7**:Vercel + Neon + R2 组合能稳定运行 AI-heavy 负载
8. **A8**:海外市场对"AI 时代学习"有付费意愿(或足够流量)

**Week 6 末验证**:A1, A2, A4, A7
**Day 90 验证**:A3, A5, A6, A8

---

## 8.7 升级路径(项目失败时)

如果 Day 90 后所有关键假设都被证伪:

| 信号 | 行动 |
|---|---|
| A1 + A2 + A7 都失败 | 技术不 work,转方向(可能做"AI 教学工具"而非"AI 教学平台") |
| A3 + A5 失败 | 价值不成立,砍项目 / 转做"AI 教学 prompt 库"(售卖) |
| A6 失败 | 内容飞轮不成立,改做"1v1 AI 教练"高单价低规模 |
| A8 失败 | 海外付费不成立,转回国内市场 + 调整定位 |

> **重要心态**:项目失败 = 数据失败 ≠ 个人失败。
> 写一个**项目 post-mortem 模板**,Day 180 必须写。

---

## 8.8 本章产出物确认

- [x] 11 项风险登记(H/M/L)
- [x] 风险矩阵总览
- [x] 风险监控仪表(10 指标)
- [x] 应急预案模板
- [x] 风险 vs 规划关联表
- [x] 8 项假设清单(Week 6 / Day 90 验证)
- [x] 失败升级路径
- [x] Post-mortem 文化

**规划文档主体完成。下一动作:合并所有章节为 `planning.md`**


---

