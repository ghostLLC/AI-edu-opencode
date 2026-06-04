import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default async function IntakeNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('intake');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goal">{t('goal_label')}</Label>
          <Textarea
            id="goal"
            name="goal"
            required
            rows={4}
            placeholder={t('goal_placeholder')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="context">{t('context_label')}</Label>
          <Textarea
            id="context"
            name="context"
            rows={3}
            placeholder={t('context_placeholder')}
          />
        </div>
        <Button type="submit" className="w-full" disabled>
          {t('submit')}
        </Button>
      </form>
    </div>
  );
}
