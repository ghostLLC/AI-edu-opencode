/**
 * Shared message-persistence helpers for the stage handlers.
 *
 * Stages save user/assistant messages to chat_messages for later
 * review and history. The schema is defined in
 * lib/db/schema/messages.ts.
 */

import { db } from '@/lib/db/client';
import { chatMessages } from '@/lib/db/schema';
import type { LanguageModelUsage } from 'ai';
import type { ModelName } from '../types';

export type StageName = 'intake' | 'learn' | 'practice' | 'assess';

export async function saveUserMessage(opts: {
  userId: string;
  planId: string;
  nodeId?: string | null;
  assessmentId?: string | null;
  stage: StageName;
  content: string;
}): Promise<void> {
  await db.insert(chatMessages).values({
    userId: opts.userId,
    planId: opts.planId,
    nodeId: opts.nodeId ?? null,
    assessmentId: opts.assessmentId ?? null,
    role: 'user',
    content: opts.content,
    stage: opts.stage,
  });
}

export async function saveAssistantMessage(opts: {
  userId: string;
  planId: string;
  nodeId?: string | null;
  assessmentId?: string | null;
  stage: StageName;
  content: string;
  model: ModelName;
  usage: LanguageModelUsage;
  traceId?: string | null;
}): Promise<void> {
  await db.insert(chatMessages).values({
    userId: opts.userId,
    planId: opts.planId,
    nodeId: opts.nodeId ?? null,
    assessmentId: opts.assessmentId ?? null,
    role: 'assistant',
    content: opts.content,
    stage: opts.stage,
    model: opts.model,
    promptTokens: opts.usage.promptTokens,
    completionTokens: opts.usage.completionTokens,
    traceId: opts.traceId ?? null,
  });
}
