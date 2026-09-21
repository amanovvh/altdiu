'use client';

import { Link, usePathname } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  Newspaper,
  Handshake,
  Trophy,
  GraduationCap,
  Building2,
  Users,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const ICONS: Record<string, LucideIcon> = {
  '/news': Newspaper,
  '/community': Handshake,
  '/achievements': Trophy,
  '/teachers': GraduationCap,
  '/administration': Users,
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
    { href: '/administration', label: t('administration') },
    { href: '/about', label: t('about') },
  ];

  return (
    <ul
      className={cn(
        // Mobile (drawer): vertical stack with icons + big touch targets.
        'flex flex-col items-stretch gap-2 px-1 py-1',
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
                // Mobile: card-style touch target with icon + label.
                'group relative flex items-center gap-3 whitespace-nowrap rounded-xl border border-transparent bg-white px-4 py-3 text-base font-medium shadow-soft transition-all',
                // Desktop: smaller pill, stronger hover/active contrast so
                // the nav is impossible to miss.
                'lg:gap-1.5 lg:rounded-full lg:border-0 lg:bg-transparent lg:px-4 lg:py-2 lg:text-sm lg:font-semibold lg:tracking-wide lg:shadow-none',
                active
                  ? // Mobile: light navy card + dark text + accent border.
                    // Desktop: filled dark navy pill — maximum contrast.
                    'border-primary-200 bg-primary-100 text-primary-900 lg:border-transparent lg:bg-primary-800 lg:text-white lg:shadow-md'
                  : 'text-ink-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 lg:hover:border-transparent lg:hover:bg-white lg:hover:text-primary-900 lg:hover:shadow-sm'
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform group-hover:scale-110',
                    active ? 'text-primary-700 lg:text-white' : 'text-ink-400 lg:text-ink-500',
                    'lg:hidden'
                  )}
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
