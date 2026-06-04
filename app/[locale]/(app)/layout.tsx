import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth/config';
import { AppSidebar } from '@/components/shared/nav-sidebar';
import { UserMenu } from '@/components/shared/user-menu';
import { LanguageSwitcher } from '@/components/shared/language-switcher';

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/sign-in`);
  }

  const t = await getTranslations('app');

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <aside className="border-r bg-muted/40">
        <div className="flex h-14 items-center border-b px-4 font-semibold">
          {t('brand')}
        </div>
        <AppSidebar locale={locale} />
      </aside>
      <div className="flex flex-col">
        <header className="flex h-14 items-center justify-between border-b px-6">
          <h1 className="text-sm text-muted-foreground">{t('welcome', { name: session.user.name ?? 'User' })}</h1>
          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} />
            <UserMenu user={session.user} />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
