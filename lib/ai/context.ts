/**
 * Load the per-run context for the AI orchestrator.
 *
 * Pulls: user profile, plan (if any), current node (if any),
 * recent chat history for this plan. Cheap selects, no joins.
 */

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { chatMessages, learningPlans, planNodes, users } from '@/lib/db/schema';

export interface RunContext {
  user: {
    id: string;
    email: string;
    name: string | null;
    language: 'en' | 'zh';
    mode: 'goal_clear' | 'goal_unclear' | 'reskill';
  };
  // Note: domain and difficulty are stored inside needProfile (jsonb),
  // not as dedicated columns on learning_plans. Callers that need them
  // can pull from needProfile.
  plan: {
    id: string;
    title: string;
    description: string | null;
    mode: string;
    status: string;
    needProfile: unknown;
  } | null;
  currentNode: {
    id: string;
    sequence: number;
    title: string;
    summary: string;
  } | null;
  history: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: Date;
  }>;
}

export async function loadContext(opts: {
  userId: string;
  planId?: string;
  nodeId?: string;
  historyLimit?: number;
}): Promise<RunContext> {
  const { userId, planId, nodeId, historyLimit = 20 } = opts;

  // User
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      language: users.language,
      mode: users.mode,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Plan (only if planId truthy)
  let plan: RunContext['plan'] = null;
  if (planId) {
    const [p] = await db
      .select()
      .from(learningPlans)
      .where(and(eq(learningPlans.id, planId), eq(learningPlans.userId, userId)))
      .limit(1);

    if (p) {
      plan = {
        id: p.id,
        title: p.title,
        description: p.description,
        mode: p.mode,
        status: p.status,
        needProfile: p.needProfile,
      };
    }
  }

  // Current node (only if nodeId truthy)
  let currentNode: RunContext['currentNode'] = null;
  if (nodeId) {
    const [n] = await db
      .select({
        id: planNodes.id,
        sequence: planNodes.sequence,
        title: planNodes.title,
        content: planNodes.content,
      })
      .from(planNodes)
      .where(eq(planNodes.id, nodeId))
      .limit(1);

    if (n) {
      // planNodes.content is jsonb { paragraphs, keywords, examples, ... }
      // The "summary" for prompts is the first paragraph.
      const content = n.content as { paragraphs?: unknown } | null;
      const firstPara = Array.isArray(content?.paragraphs)
        ? (content.paragraphs[0] as string | undefined)
        : undefined;
      currentNode = {
        id: n.id,
        sequence: n.sequence,
        title: n.title,
        summary: firstPara ?? '',
      };
    }
  }

  // History (most recent first, then reverse for chronological order)
  let history: RunContext['history'] = [];
  if (planId) {
    const rows = await db
      .select({
        role: chatMessages.role,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(and(eq(chatMessages.planId, planId), eq(chatMessages.userId, userId)))
      .orderBy(desc(chatMessages.createdAt))
      .limit(historyLimit);

    history = rows.reverse().map((r) => ({
      role: r.role as 'user' | 'assistant' | 'system',
      content: r.content,
      createdAt: r.createdAt,
    }));
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      language: (user.language as 'en' | 'zh') ?? 'en',
      mode: (user.mode as 'goal_clear' | 'goal_unclear' | 'reskill') ?? 'goal_clear',
    },
    plan,
    currentNode,
    history,
  };
}
