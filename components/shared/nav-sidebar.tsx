'use client';

import { BookOpen, ClipboardCheck, LayoutDashboard, PlusCircle, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ComponentType } from 'react';
import { cn } from '@/lib/utils/cn';

interface AppSidebarProps {
  locale: string;
}

interface NavItem {
  key: 'dashboard' | 'plans' | 'intake' | 'assessments' | 'community';
  href: string;
  icon: ComponentType<{ className?: string }>;
}

const items: readonly NavItem[] = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'plans', href: '/plans', icon: BookOpen },
  { key: 'intake', href: '/intake/new', icon: PlusCircle },
  { key: 'assessments', href: '/assessments', icon: ClipboardCheck },
  { key: 'community', href: '/community', icon: Users },
];

export function AppSidebar({ locale }: AppSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((item) => {
        const fullHref = `/${locale}${item.href}`;
        const isActive = pathname === fullHref || pathname.startsWith(`${fullHref}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={fullHref}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{t(item.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
