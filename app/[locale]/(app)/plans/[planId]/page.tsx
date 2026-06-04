import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { and, asc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';
import { learningPlans, nodeProgress, planNodes } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type NodeStage = 'learn' | 'practice' | 'assess';

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ locale: string; planId: string }>;
}) {
  const { locale, planId } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('plans.detail');
  const tStage = await getTranslations('node_stage');
  const tStatus = await getTranslations('node_status');

  const session = await auth();
  if (!session?.user) return null;

  const [plan] = await db
    .select()
    .from(learningPlans)
    .where(and(eq(learningPlans.id, planId), eq(learningPlans.userId, session.user.id!)))
    .limit(1);

  if (!plan) notFound();

  const [nodes, progress] = await Promise.all([
    db
      .select()
      .from(planNodes)
      .where(eq(planNodes.planId, planId))
      .orderBy(asc(planNodes.sequence)),
    db.select().from(nodeProgress).where(eq(nodeProgress.planId, planId)),
  ]);

  const progressByNode = new Map(progress.map((p) => [p.nodeId, p]));

  // Group nodes by stage (read from content.stage, default 'learn')
  const byStage: Record<NodeStage, typeof nodes> = { learn: [], practice: [], assess: [] };
  for (const n of nodes) {
    const c = n.content as { stage?: NodeStage } | null;
    const stage = c?.stage ?? 'learn';
    byStage[stage].push(n);
  }

  const isNodeUnlocked = (node: (typeof nodes)[number]): boolean => {
    const c = node.content as { stage?: NodeStage } | null;
    const stage = c?.stage ?? 'learn';
    if (stage === 'learn') return true;
    if (stage === 'practice') {
      // All learn nodes must be learned/mastered
      return byStage.learn.every((ln) => {
        const p = progressByNode.get(ln.id);
        return p?.status === 'learned' || p?.status === 'mastered';
      });
    }
    // assess
    return (
      byStage.learn.every((ln) => {
        const p = progressByNode.get(ln.id);
        return p?.status === 'learned' || p?.status === 'mastered';
      }) &&
      byStage.practice.every((pn) => {
        const p = progressByNode.get(pn.id);
        return p?.status === 'practiced' || p?.status === 'mastered';
      })
    );
  };

  const statusLabel = (status: string | undefined): string => {
    switch (status) {
      case 'learned':
        return tStatus('learned');
      case 'practiced':
        return tStatus('practiced');
      case 'mastered':
        return tStatus('mastered');
      case 'in_progress':
        return tStatus('in_progress');
      default:
        return tStatus('pending');
    }
  };

  const planStatusLabel = (() => {
    switch (plan.status) {
      case 'draft':
        return t('status_draft');
      case 'confirmed':
        return t('status_confirmed');
      case 'in_learn':
        return t('status_in_learn');
      case 'in_practice':
        return t('status_in_practice');
      case 'in_assess':
        return t('status_in_assess');
      case 'completed':
        return t('status_completed');
      case 'archived':
        return t('status_archived');
      default:
        return plan.status;
    }
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{plan.title}</h1>
        {plan.description ? (
          <p className="mt-2 text-muted-foreground">{plan.description}</p>
        ) : null}
        <div className="mt-2 text-sm text-muted-foreground">
          {t('status_label')}: <span className="font-medium">{planStatusLabel}</span>
          {' · '}
          {t('nodes_count', { count: nodes.length })}
        </div>
      </div>

      <div className="space-y-6">
        {(['learn', 'practice', 'assess'] as NodeStage[]).map((stage) => {
          const stageNodes = byStage[stage];
          if (stageNodes.length === 0) return null;
          return (
            <section key={stage}>
              <h2 className="mb-3 text-xl font-semibold">{tStage(stage)}</h2>
              <div className="space-y-2">
                {stageNodes.map((node) => {
                  const p = progressByNode.get(node.id);
                  const unlocked = isNodeUnlocked(node);
                  return (
                    <Card key={node.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {node.sequence}. {node.title}
                            </CardTitle>
                            <CardDescription>
                              {t('status')}: {statusLabel(p?.status)}
                            </CardDescription>
                          </div>
                          <Button asChild size="sm" disabled={!unlocked}>
                            <Link
                              href={
                                unlocked
                                  ? `/${locale}/plans/${planId}/${stage}/${node.id}`
                                  : '#'
                              }
                            >
                              {unlocked ? t('open') : t('locked')}
                            </Link>
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
