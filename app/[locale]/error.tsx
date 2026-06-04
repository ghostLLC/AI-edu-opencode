'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Locale-scoped error boundary.
// Triggered for errors in routes under [locale]. For errors that bubble to the
// root layout (rare), app/error.tsx is the fallback.
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');
  const locale = useLocale();

  useEffect(() => {
    // TODO: wire to Sentry once SENTRY_DSN is configured
    console.error('[locale error]', error);
  }, [error]);

  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <h2 className="text-2xl font-bold">{t('fatal_title')}</h2>
      <p className="max-w-md text-muted-foreground">{t('fatal_desc')}</p>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">
          {t('fatal_digest', { digest: error.digest })}
        </p>
      ) : null}
      <div className="flex gap-3">
        <Button onClick={() => reset()}>
          <RotateCcw className="h-4 w-4" /> {t('try_again')}
        </Button>
        <Button asChild variant="outline">
          <Link href={`/${locale}`}>{t('go_home')}</Link>
        </Button>
      </div>
    </main>
  );
}
