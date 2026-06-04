/**
 * ASSESS stage page: shows the task + a submission form.
 * Submission posts to /api/chat with stage='assess' and assessmentId.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';
import { assessmentScores, assessments, learningPlans, planNodes } from '@/lib/db/schema';
import { findOrCreateAssessmentForNode } from '@/lib/db/queries/assessments';
import { AssessForm } from './assess-form';
import { Button } from '@/components/ui/button';

export default async function AssessNodePage({
  params,
}: {
  params: Promise<{ locale: string; planId: string; nodeId: string }>;
}) {
  const { locale, planId, nodeId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) return null;

  const t = await getTranslations('assess');

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

  const { id: assessmentId, taskTitle, taskDescription } = await findOrCreateAssessmentForNode({
    planId,
    nodeId,
    userId: session.user.id!,
  });

  // If already scored, show the score report
  const [assessment] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);

  const scores = await db
    .select()
    .from(assessmentScores)
    .where(eq(assessmentScores.assessmentId, assessmentId));

  if (assessment && (assessment.status === 'passed' || assessment.status === 'failed') && scores.length > 0) {
    return (
      <ScoreReport
        locale={locale}
        planId={planId}
        planTitle={plan.title}
        nodeTitle={node.title}
        taskTitle={taskTitle}
        totalScore={assessment.totalScore ?? 0}
        maxScore={assessment.maxScore ?? 100}
        passed={assessment.status === 'passed'}
        scores={scores.map((s) => ({
          criterion: s.criterion,
          score: s.score,
          weight: s.weight,
          reasoning: s.reasoning,
        }))}
        overallFeedback={scores[scores.length - 1]?.reasoning ?? ''}
        resubmitLabel={t('resubmit')}
        backLabel={t('back_to_plan')}
      />
    );
  }

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
        </div>
        <Button asChild variant="ghost">
          <Link href={`/${locale}/plans/${planId}`}>{t('back_to_plan')}</Link>
        </Button>
      </div>

      <div className="rounded-md border bg-muted/30 p-4">
        <h2 className="text-lg font-semibold">{taskTitle}</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
          {taskDescription}
        </p>
      </div>

      <AssessForm
        planId={planId}
        nodeId={nodeId}
        assessmentId={assessmentId}
        submitLabel={t('submit')}
        submittingLabel={t('submitting')}
        inputLabel={t('submission_label')}
        inputPlaceholder={t('submission_placeholder')}
        errorEmptyLabel={t('error_empty')}
        errorBudgetLabel={t('error_budget')}
      />
    </div>
  );
}

interface ScoreReportProps {
  locale: string;
  planId: string;
  planTitle: string;
  nodeTitle: string;
  taskTitle: string;
  totalScore: number;
  maxScore: number;
  passed: boolean;
  scores: Array<{ criterion: string; score: number; weight: number; reasoning: string }>;
  overallFeedback: string;
  resubmitLabel: string;
  backLabel: string;
}

function ScoreReport(props: ScoreReportProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/${props.locale}/plans/${props.planId}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← {props.planTitle}
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{props.taskTitle}</h1>
        </div>
        <div>
          <Button asChild variant="ghost">
            <Link href={`/${props.locale}/plans/${props.planId}`}>{props.backLabel}</Link>
          </Button>
        </div>
      </div>

      <div
        className={
          props.passed
            ? 'rounded-md border border-green-600 bg-green-50 p-4 dark:bg-green-950'
            : 'rounded-md border border-red-600 bg-red-50 p-4 dark:bg-red-950'
        }
      >
        <div className="text-3xl font-bold">
          {props.totalScore} / {props.maxScore}
        </div>
        <div className="text-sm text-muted-foreground">
          {props.passed ? '✓ Passed' : '✗ Needs improvement'}
        </div>
      </div>

      <div className="space-y-2">
        {props.scores.map((s) => (
          <div key={s.criterion} className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{s.criterion}</span>
              <span className="text-sm text-muted-foreground">
                {s.score} / 100 (weight {s.weight}%)
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{s.reasoning}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
