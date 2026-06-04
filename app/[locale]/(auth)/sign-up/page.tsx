'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { track } from '@/lib/observability/track';

export default function SignUpPage() {
  const t = useTranslations('auth.signup');
  const tErrors = useTranslations('errors');
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';

  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorKey(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    };

    const res = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setErrorKey(data.error === 'email_taken' ? 'email_taken' : 'signup_failed');
      setLoading(false);
      return;
    }

    track('sign_up_completed', { method: 'email' });
    router.push(`/${locale}/sign-in?registered=1`);
  }

  return (
    <div className="container flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input id="name" name="name" type="text" autoComplete="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {errorKey ? (
            <p className="text-sm text-destructive">
              {errorKey === 'email_taken' ? tErrors('email_taken') : tErrors('signup_failed')}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('submitting') : t('submit')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t('have_account')}{' '}
          <Link href={`/${locale}/sign-in`} className="font-medium text-primary hover:underline">
            {t('sign_in_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
