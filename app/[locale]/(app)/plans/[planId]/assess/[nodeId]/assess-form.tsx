/**
 * Assess submission form: posts to /api/chat with stage='assess'.
 * On success, navigates to a refresh of the assess page (which will then
 * show the score report branch in the server component).
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export interface AssessFormProps {
  planId: string;
  nodeId: string;
  assessmentId: string;
  submitLabel: string;
  submittingLabel: string;
  inputLabel: string;
  inputPlaceholder: string;
  errorEmptyLabel: string;
  errorBudgetLabel: string;
}

export function AssessForm(props: AssessFormProps) {
  const router = useRouter();
  const [submission, setSubmission] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!submission.trim()) {
      setError(props.errorEmptyLabel);
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: props.planId,
          stage: 'assess',
          nodeId: props.nodeId,
          assessmentId: props.assessmentId,
          userMessage: submission,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          setError(props.errorBudgetLabel);
        } else {
          setError(`Submission failed (${res.status})`);
        }
        return;
      }

      // The assess stage returns a JSON body. Consume it so the response
      // stream is drained, then refresh the page to render the score report.
      await res.json();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="submission">{props.inputLabel}</Label>
        <Textarea
          id="submission"
          value={submission}
          onChange={(e) => setSubmission(e.target.value)}
          placeholder={props.inputPlaceholder}
          rows={8}
          disabled={submitting}
          required
        />
      </div>
      {error ? <div className="text-sm text-destructive">{error}</div> : null}
      <Button type="submit" disabled={submitting || !submission.trim()}>
        {submitting ? props.submittingLabel : props.submitLabel}
      </Button>
    </form>
  );
}
