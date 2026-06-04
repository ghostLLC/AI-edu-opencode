import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { and, asc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';
import { learningPlans, planNodes } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ locale: string; planId: string }>;
}) {
  const { locale, planId } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('plans.detail');
  const session = await auth();
  if (!session?.user) return null;

  const [plan] = await db
    .select()
    .from(learningPlans)
    .where(and(eq(learningPlans.id, planId), eq(learningPlans.userId, session.user.id!)))
    .limit(1);

  if (!plan) notFound();

  const nodes = await db
    .select()
    .from(planNodes)
    .where(eq(planNodes.planId, planId))
    .orderBy(asc(planNodes.sequence));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{plan.title}</h1>
        {plan.description ? (
          <p className="mt-2 text-muted-foreground">{plan.description}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('stage_learn')}</CardTitle>
            <CardDescription>{t('learn_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={`/${locale}/plans/${planId}/learn/${nodes[0]?.id ?? ''}`}>
                {t('start_learning')}
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('stage_practice')}</CardTitle>
            <CardDescription>{t('practice_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full" variant="outline">
              {t('complete_to_unlock')}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('stage_assess')}</CardTitle>
            <CardDescription>{t('assess_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full" variant="outline">
              {t('complete_to_unlock')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-semibold">
          {t('node_list')} <span className="text-muted-foreground text-sm">({t('nodes_count', { count: nodes.length })})</span>
        </h2>
        <div className="space-y-2">
          {nodes.map((node) => (
            <Card key={node.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {node.sequence}. {node.title}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
