'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { track } from '@/lib/observability/track';

export default function IntakeNewPage() {
  const router = useRouter();
  const t = useTranslations('intake');
  const tErr = useTranslations('errors');
  const [goal, setGoal] = useState('');
  const [context, setContext] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;

    setSubmitting(true);
    setError(null);

    const fullMessage = context.trim()
      ? `${goal}\n\nBackground:\n${context}`
      : goal;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: '',
          stage: 'intake',
          userMessage: fullMessage,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          setError(t('budget_exceeded'));
        } else if (res.status === 401) {
          setError(tErr('unauthorized'));
        } else {
          setError(tErr('generate_failed', { status: res.status }));
        }
        return;
      }

      const data = (await res.json()) as { planId?: string };
      if (!data.planId) {
        setError(tErr('no_plan_id'));
        return;
      }

      track('intake_submitted', { planId: data.planId, goal_length: goal.trim().length });
      router.push(`/plans/${data.planId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goal">{t('goal_label')}</Label>
          <Textarea
            id="goal"
            name="goal"
            required
            rows={4}
            placeholder={t('goal_placeholder')}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="context">{t('context_label')}</Label>
          <Textarea
            id="context"
            name="context"
            rows={3}
            placeholder={t('context_placeholder')}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            disabled={submitting}
          />
        </div>
        {error ? (
          <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <Button type="submit" className="w-full" disabled={submitting || !goal.trim()}>
          {submitting ? t('submitting') : t('submit')}
        </Button>
      </form>
    </div>
  );
}
