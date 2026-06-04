'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface LanguageSwitcherProps {
  currentLocale: string;
}

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
] as const;

type LocaleCode = (typeof LOCALES)[number]['code'];

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('languageSwitcher');

  const switchLocale = (newLocale: string) => {
    if (newLocale === currentLocale) return;
    const segments = pathname.split('/');
    if (segments[1] === currentLocale) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const newPath = segments.join('/') || '/';
    router.replace(newPath);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('label')}>
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {LOCALES.map((locale) => {
            const isActive = locale.code === currentLocale;
            return (
              <DropdownMenu.Item
                key={locale.code}
                className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent"
                onSelect={() => switchLocale(locale.code as LocaleCode)}
              >
                <span className={isActive ? 'font-medium' : undefined}>{locale.label}</span>
                {isActive ? <Check className="h-4 w-4 text-primary" /> : null}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
