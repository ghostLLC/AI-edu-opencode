import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { db } from '@/lib/db/client';
import { learningPlans, planNodes } from '@/lib/db/schema';
import { and, eq, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function PlanDetailPage({
  params,
  children,
}: {
  params: Promise<{ locale: string; planId: string }>;
  children?: React.ReactNode;
}) {
  const { locale, planId } = await params;
  setRequestLocale(locale);

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
        {plan.description && (
          <p className="mt-2 text-muted-foreground">{plan.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Learn</CardTitle>
            <CardDescription>{nodes.length} nodes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={`/${locale}/plans/${planId}/learn/${nodes[0]?.id}`}>
                开始学习
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Practice</CardTitle>
            <CardDescription>巩固已学</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full" variant="outline">
              完成后可用
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assess</CardTitle>
            <CardDescription>真实任务</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full" variant="outline">
              完成后可用
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-semibold">节点列表</h2>
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
