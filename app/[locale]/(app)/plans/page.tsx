import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { db } from '@/lib/db/client';
import { learningPlans } from '@/lib/db/schema';
import { and, eq, isNull, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { Button } from '@/components/ui/button';

export default async function PlansPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('plans');

  const session = await auth();
  if (!session?.user) return null;

  const plans = await db
    .select()
    .from(learningPlans)
    .where(and(eq(learningPlans.userId, session.user.id!), isNull(learningPlans.deletedAt)))
    .orderBy(desc(learningPlans.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Button asChild>
          <Link href={`/${locale}/intake/new`}>{t('new_cta')}</Link>
        </Button>
      </div>

      {/* TODO: 列出所有方案 + 过滤/排序 */}
      <p className="text-muted-foreground">{t('skeleton_placeholder')}</p>
    </div>
  );
}
