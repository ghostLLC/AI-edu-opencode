import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  if (!process.env.SENTRY_DSN) return;
  if (typeof window !== 'undefined') return; // client init handled by sentry.client.config.ts

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

export function captureError(err: unknown, context?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) {
    console.error('[error]', err, context);
    return;
  }
  Sentry.captureException(err, { extra: context });
}
