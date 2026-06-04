'use client';

import posthog from 'posthog-js';

/**
 * PostHog event tracking. Safe to call when PostHog is not configured —
 * it becomes a no-op (no `posthog-js/react` provider required).
 *
 * Wire 4 high-value events:
 *   - sign_up_completed      (auth)
 *   - intake_submitted       (intake form)
 *   - learn_message_sent     (chat interface)
 *   - assess_submitted       (assess form)
 *
 * Usage:
 *   import { track } from '@/lib/observability/track';
 *   track('sign_up_completed', { method: 'email' });
 */

type EventName =
  | 'sign_up_completed'
  | 'sign_in_completed'
  | 'intake_submitted'
  | 'learn_message_sent'
  | 'practice_message_sent'
  | 'assess_submitted'
  | 'node_marked_complete'
  | 'plan_viewed';

type EventProps = Record<string, string | number | boolean | null | undefined>;

const ENABLED =
  typeof process !== 'undefined' && Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

export function track(event: EventName, props?: EventProps): void {
  if (!ENABLED) return;
  try {
    posthog.capture(event, props);
  } catch (err) {
    // Tracking must never break the app.
    console.warn('[track] failed:', err);
  }
}

export function identify(userId: string, traits?: EventProps): void {
  if (!ENABLED) return;
  try {
    posthog.identify(userId, traits);
  } catch (err) {
    console.warn('[track] identify failed:', err);
  }
}

export function reset(): void {
  if (!ENABLED) return;
  try {
    posthog.reset();
  } catch (err) {
    console.warn('[track] reset failed:', err);
  }
}
