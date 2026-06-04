'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Global error boundary.
// Note: this is rendered OUTSIDE the [locale] layout, so it cannot use next-intl.
// We hardcode English here. Week 2 will add locale detection via cookies.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: wire to Sentry once SENTRY_DSN is configured
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="container flex min-h-screen flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground">We&apos;ve recorded this issue. Please try again.</p>
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
