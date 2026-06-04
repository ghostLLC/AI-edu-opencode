import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-8 py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{t('title')}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href={`/${locale}/sign-up`}>{t('cta_primary')}</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={`/${locale}/sign-in`}>{t('cta_secondary')}</Link>
        </Button>
      </div>

      <div className="mt-16 grid max-w-4xl gap-8 sm:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">{t('feature_1_title')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('feature_1_desc')}</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">{t('feature_2_title')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('feature_2_desc')}</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">{t('feature_3_title')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('feature_3_desc')}</p>
        </div>
      </div>
    </main>
  );
}
