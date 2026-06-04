import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Locale-scoped 404. Rendered inside [locale] layout so it CAN use i18n.
export default async function LocaleNotFound() {
  // We can't read params here directly (this is a "not-found" boundary, not a page),
  // so we read the locale from the request via setRequestLocale/getLocale.
  // The active locale is preserved by the layout, but to be safe, we use the
  // default. In practice, this page is rendered with the request's locale already
  // injected by next-intl.
  // (next-intl provides `getLocale` from 'next-intl/server' which we can use here)
  const { getLocale } = await import('next-intl/server');
  const locale = await getLocale();
  setRequestLocale(locale);
  const t = await getTranslations('errors');

  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <FileQuestion className="h-10 w-10 text-muted-foreground" />
      <h2 className="text-4xl font-bold">404</h2>
      <p className="text-muted-foreground">{t('not_found_desc')}</p>
      <Button asChild>
        <Link href={`/${locale}`}>{t('go_home')}</Link>
      </Button>
    </main>
  );
}
