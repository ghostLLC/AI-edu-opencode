import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { and, eq, isNull, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';
import { learningPlans, planNodes } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function PlansPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('plans');

  const session = await auth();
  if (!session?.user) return null;

  const plans = await db
    .select()
    .from(learningPlans)
    .where(and(eq(learningPlans.userId, session.user.id!), isNull(learningPlans.deletedAt)))
    .orderBy(desc(learningPlans.createdAt));

  // Fetch node counts per plan (single grouped query)
  const planIds = plans.map((p) => p.id);
  const nodeCountByPlan = new Map<string, number>();
  if (planIds.length > 0) {
    const allNodes = await db
      .select({ planId: planNodes.planId, id: planNodes.id })
      .from(planNodes);
    for (const n of allNodes) {
      if (planIds.includes(n.planId)) {
        nodeCountByPlan.set(n.planId, (nodeCountByPlan.get(n.planId) ?? 0) + 1);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Button asChild>
          <Link href={`/${locale}/intake/new`}>{t('new_cta')}</Link>
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {t('list_empty')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {plans.map((plan) => {
            const count = nodeCountByPlan.get(plan.id) ?? 0;
            return (
              <Link key={plan.id} href={`/${locale}/plans/${plan.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle>{plan.title}</CardTitle>
                      {plan.description ? (
                        <CardDescription className="line-clamp-1">
                          {plan.description}
                        </CardDescription>
                      ) : null}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('detail.nodes_count', { count })}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
