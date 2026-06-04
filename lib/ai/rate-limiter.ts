import { db } from '@/lib/db/client';
import { userStats } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

// 每用户日预算(¥)
const DAILY_BUDGET_YUAN = 1.0;

// 用内存做日预算追踪(单进程)
// 多实例部署时改用 Redis/Upstash
const dailySpend = new Map<string, { date: string; spent: number }>();

export async function checkBudget(userId: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const record = dailySpend.get(userId);

  if (!record || record.date !== today) {
    dailySpend.set(userId, { date: today, spent: 0 });
  } else if (record.spent >= DAILY_BUDGET_YUAN) {
    throw new BudgetExceededError(
      `今日 AI 调用预算已达上限(¥${DAILY_BUDGET_YUAN}),请明天再来`,
    );
  }
}

export function recordSpend(userId: string, cost: number): void {
  const today = new Date().toISOString().slice(0, 10);
  const record = dailySpend.get(userId);
  if (!record || record.date !== today) {
    dailySpend.set(userId, { date: today, spent: cost });
  } else {
    record.spent += cost;
  }

  // 同步到 userStats(异步,不阻塞)
  void db
    .update(userStats)
    .set({
      totalAiCalls: sql`${userStats.totalAiCalls} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(userStats.userId, userId));
}

export class BudgetExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BudgetExceededError';
  }
}
