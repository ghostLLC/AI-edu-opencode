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
