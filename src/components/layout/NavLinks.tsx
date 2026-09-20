'use client';

import { Link, usePathname } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  Newspaper,
  Handshake,
  Trophy,
  GraduationCap,
  Building2,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const ICONS: Record<string, LucideIcon> = {
  '/news': Newspaper,
  '/community': Handshake,
  '/achievements': Trophy,
  '/teachers': GraduationCap,
  '/about': Building2,
};

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const items: { href: string; label: string }[] = [
    { href: '/news', label: t('news') },
    { href: '/community', label: t('community') },
    { href: '/achievements', label: t('achievements') },
    { href: '/teachers', label: t('teachers') },
    { href: '/about', label: t('about') },
  ];

  return (
    <ul
      className={cn(
        // Mobile (drawer): vertical stack with icons + big touch targets.
        'flex flex-col items-stretch gap-1.5 px-2 py-2',
        // Desktop: centered pill ribbon with bordered bg so it stands out
        // from the page instead of floating thin text.
        'lg:flex-row lg:items-center lg:gap-0.5 lg:rounded-full lg:border lg:border-ink-200/80 lg:bg-white/70 lg:px-1.5 lg:py-1.5 lg:mx-auto lg:shadow-soft lg:backdrop-blur-md'
      )}
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = ICONS[item.href];

        return (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href as any}
              onClick={onNavigate}
              className={cn(
                // Mobile: big touch target with icon + label.
                'group relative flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-base font-medium transition-all',
                // Desktop: smaller pill, stronger hover/active contrast so
                // the nav is impossible to miss.
                'lg:gap-1.5 lg:rounded-full lg:px-4 lg:py-2 lg:text-sm lg:font-semibold lg:tracking-wide',
                active
                  ? // Mobile: light navy bg + dark text. Desktop: filled dark
                    // navy pill — maximum contrast against the light bg.
                    'bg-primary-100 text-primary-900 lg:bg-primary-800 lg:text-white lg:shadow-md'
                  : 'text-ink-700 hover:bg-primary-50 hover:text-primary-800 lg:hover:bg-white lg:hover:text-primary-900 lg:hover:shadow-sm'
              )}
            >
              {Icon && (
                <Icon
                  className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110 lg:hidden"
                  strokeWidth={2}
                />
              )}
              <span className="flex-1">{item.label}</span>
              {/* Drawer-only: trailing arrow signals the link is tappable */}
              <ChevronRight
                className="h-4 w-4 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5 lg:hidden"
                strokeWidth={2}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
