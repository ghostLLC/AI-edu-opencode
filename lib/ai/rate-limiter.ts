/**
 * Per-user daily budget guard + spend recorder.
 *
 * - In-memory map tracks the current day's spend per user (resets at UTC midnight).
 * - On every AI call, the stage handler calls recordSpend() which:
 *   1. Increments the in-memory counter
 *   2. Fire-and-forget persists totalAiCalls + totalTokensUsed + lastActiveAt to user_stats
 *
 * Multi-instance deployments should swap the in-memory map for Redis/Upstash.
 */

import { eq, sql } from 'drizzle-orm';
import type { LanguageModelUsage } from 'ai';
import { db } from '@/lib/db/client';
import { userStats } from '@/lib/db/schema';

const DAILY_BUDGET_YUAN = 1.0;

interface DailyRecord {
  date: string;
  spent: number;
}

const dailySpend = new Map<string, DailyRecord>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function checkBudget(userId: string): Promise<void> {
  const today = todayKey();
  const record = dailySpend.get(userId);

  if (!record || record.date !== today) {
    dailySpend.set(userId, { date: today, spent: 0 });
  } else if (record.spent >= DAILY_BUDGET_YUAN) {
    throw new BudgetExceededError(
      `Daily AI budget exceeded (¥${DAILY_BUDGET_YUAN}). Resets at 00:00 UTC.`,
    );
  }
}

export function recordSpend(
  userId: string,
  cost: number,
  usage: LanguageModelUsage,
): void {
  const today = todayKey();
  const record = dailySpend.get(userId);
  if (!record || record.date !== today) {
    dailySpend.set(userId, { date: today, spent: cost });
  } else {
    record.spent += cost;
  }

  // Persist to user_stats (fire-and-forget, do not block AI latency).
  const totalTokens = (usage.promptTokens ?? 0) + (usage.completionTokens ?? 0);
  void db
    .update(userStats)
    .set({
      totalAiCalls: sql`${userStats.totalAiCalls} + 1`,
      totalTokensUsed: sql`${userStats.totalTokensUsed} + ${totalTokens}`,
      lastActiveAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userStats.userId, userId))
    .catch((err: unknown) => {
      console.warn('[rate-limiter] failed to persist user_stats:', err);
    });
}

export function getDailySpend(userId: string): number {
  const today = todayKey();
  const record = dailySpend.get(userId);
  return record?.date === today ? record.spent : 0;
}

export function getDailyBudget(): number {
  return DAILY_BUDGET_YUAN;
}

export class BudgetExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BudgetExceededError';
  }
}
