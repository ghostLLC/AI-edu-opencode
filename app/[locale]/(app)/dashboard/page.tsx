import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { db } from '@/lib/db/client';
import { learningPlans, userStats } from '@/lib/db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');

  const session = await auth();
  if (!session?.user) return null; // layout 兜底

  // 加载用户最近方案 + 统计
  const [plans, stats] = await Promise.all([
    db
      .select()
      .from(learningPlans)
      .where(and(eq(learningPlans.userId, session.user.id!), isNull(learningPlans.deletedAt)))
      .orderBy(desc(learningPlans.createdAt))
      .limit(5),
    db.query.userStats.findFirst({
      where: eq(userStats.userId, session.user.id!),
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Button asChild>
          <Link href={`/${locale}/intake/new`}>{t('new_plan_cta')}</Link>
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats_total_plans')}</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalPlans ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats_completed')}</CardDescription>
            <CardTitle className="text-3xl">{stats?.completedPlans ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats_ai_calls')}</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalAiCalls ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 最近方案 */}
      <div>
        <h2 className="mb-3 text-xl font-semibold">{t('recent_plans')}</h2>
        {plans.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              {t('no_plans_yet')}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {plans.map((plan) => (
              <Link key={plan.id} href={`/${locale}/plans/${plan.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle>{plan.title}</CardTitle>
                      <CardDescription>{plan.status}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
