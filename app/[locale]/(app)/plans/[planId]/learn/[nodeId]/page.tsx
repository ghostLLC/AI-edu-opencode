/**
 * LEARN stage page: Socratic chat for a single node.
 *
 * Loads the node + recent history, then renders the shared ChatInterface.
 * "Mark complete" calls markNodeStage (learn -> learned) and bounces to plan.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { and, desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';
import { chatMessages, learningPlans, planNodes } from '@/lib/db/schema';
import { ChatInterface, type ChatMessage } from '@/components/chat/chat-interface';
import { MarkCompleteButton } from '@/components/plan/mark-complete-button';
import { Button } from '@/components/ui/button';

export default async function LearnNodePage({
  params,
}: {
  params: Promise<{ locale: string; planId: string; nodeId: string }>;
}) {
  const { locale, planId, nodeId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) return null;

  const t = await getTranslations('learn');

  // Load plan + node
  const [plan] = await db
    .select()
    .from(learningPlans)
    .where(and(eq(learningPlans.id, planId), eq(learningPlans.userId, session.user.id!)))
    .limit(1);

  if (!plan) notFound();

  const [node] = await db
    .select()
    .from(planNodes)
    .where(eq(planNodes.id, nodeId))
    .limit(1);

  if (!node) notFound();

  // Load recent chat history (chronological, last 20)
  const historyRows = await db
    .select({
      id: chatMessages.id,
      role: chatMessages.role,
      content: chatMessages.content,
    })
    .from(chatMessages)
    .where(
      and(eq(chatMessages.planId, planId), eq(chatMessages.nodeId, nodeId)),
    )
    .orderBy(desc(chatMessages.createdAt))
    .limit(20);

  const initialMessages: ChatMessage[] = historyRows.reverse().map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  }));

  const nodeContent = node.content as { paragraphs?: string[] } | null;
  const nodeSummary = nodeContent?.paragraphs?.[0] ?? '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/${locale}/plans/${planId}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← {plan.title}
          </Link>
          <h1 className="mt-1 text-2xl font-bold">
            {node.sequence}. {node.title}
          </h1>
          {nodeSummary ? (
            <p className="mt-1 text-sm text-muted-foreground">{nodeSummary}</p>
          ) : null}
        </div>
        <Button asChild variant="ghost">
          <Link href={`/${locale}/plans/${planId}`}>{t('back_to_plan')}</Link>
        </Button>
      </div>

      <ChatInterface
        planId={planId}
        stage="learn"
        nodeId={nodeId}
        nodeTitle={node.title}
        emptyHint={t('empty_hint', { title: node.title })}
        inputPlaceholder={t('input_placeholder')}
        submitLabel={t('submit')}
        submittingLabel={t('submitting')}
        initialMessages={initialMessages}
        onMarkComplete={undefined}
        completeLabel={t('mark_complete')}
        completeConfirmMessage={t('mark_complete_confirm')}
      />

      <div className="flex justify-end">
        <MarkCompleteButton
          planId={planId}
          nodeId={nodeId}
          stage="learn"
          status="learned"
          label={t('mark_complete')}
        />
      </div>
    </div>
  );
}
