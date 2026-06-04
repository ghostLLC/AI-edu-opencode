import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, BookOpen, Brain, CheckCircle2, ListChecks, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  const features = [
    { key: 'feature_1', icon: Sparkles },
    { key: 'feature_2', icon: Brain },
    { key: 'feature_3', icon: ListChecks },
  ] as const;

  const steps = ['step_1', 'step_2', 'step_3'] as const;

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="container flex flex-col items-center gap-6 py-20 text-center md:py-28">
        <span className="rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {t('eyebrow')}
        </span>
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
          {t('title')}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{t('subtitle')}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild size="lg">
            <Link href={`/${locale}/sign-up`}>
              {t('cta_primary')} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/${locale}/sign-in`}>{t('cta_secondary')}</Link>
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t('trust_note')}</p>
      </section>

      {/* Features */}
      <section className="container border-t py-16 md:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('features_title')}
          </h2>
          <p className="mt-2 text-muted-foreground">{t('features_subtitle')}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ key, icon: Icon }) => (
            <Card key={key}>
              <CardHeader>
                <Icon className="h-6 w-6 text-primary" />
                <CardTitle className="mt-3">{t(`${key}_title`)}</CardTitle>
                <CardDescription>{t(`${key}_desc`)}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30 py-16 md:py-20">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t('how_title')}
            </h2>
            <p className="mt-2 text-muted-foreground">{t('how_subtitle')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((key, idx) => (
              <div key={key} className="relative rounded-lg border bg-background p-6">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {idx + 1}
                </div>
                <h3 className="font-semibold">{t(`${key}_title`)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(`${key}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container border-t py-16 text-center md:py-20">
        <BookOpen className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('cta_title')}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{t('cta_subtitle')}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href={`/${locale}/sign-up`}>
              {t('cta_primary')} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> {t('check_free')}
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> {t('check_no_cc')}
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> {t('check_cancel')}
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
          <span>{t('footer_brand')}</span>
          <span>{t('footer_tagline')}</span>
        </div>
      </footer>
    </main>
  );
}
