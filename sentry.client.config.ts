// Sentry browser init. Loaded automatically by @sentry/nextjs from project root.
// Activates only when SENTRY_DSN (or NEXT_PUBLIC_SENTRY_DSN) is set.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Don't send PII (emails, names) to Sentry.
    sendDefaultPii: false,
  });
}
