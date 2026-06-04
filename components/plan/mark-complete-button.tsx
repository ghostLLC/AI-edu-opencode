/**
 * Client button: POST /api/node-progress to mark a node's stage as complete.
 * On success, navigates back to the plan detail page.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/observability/track';

export interface MarkCompleteButtonProps {
  planId: string;
  nodeId: string;
  stage: 'learn' | 'practice';
  status: 'in_progress' | 'learned' | 'practiced' | 'mastered';
  label: string;
}

export function MarkCompleteButton(props: MarkCompleteButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/node-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: props.planId,
          nodeId: props.nodeId,
          stage: props.stage,
          status: props.status,
        }),
      });
      if (!res.ok) {
        setError(`Failed (${res.status})`);
        return;
      }
      track('node_marked_complete', { nodeId: props.nodeId, stage: props.stage });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1 text-right">
      <Button onClick={onClick} disabled={busy} variant="default">
        {busy ? '...' : props.label}
      </Button>
      {error ? <div className="text-xs text-destructive">{error}</div> : null}
    </div>
  );
}
