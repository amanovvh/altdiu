'use client';

import { Link, usePathname } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

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
        // Mobile (drawer): vertical stack with full-width rows.
        // lg+ : centered horizontal ribbon with consistent spacing.
        'flex flex-col items-stretch gap-0.5 px-3 py-2',
        'lg:flex-row lg:items-center lg:gap-1 lg:px-5 lg:py-3 lg:mx-auto'
      )}
    >
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href as any}
              onClick={onNavigate}
              className={cn(
                // whitespace-nowrap keeps each label on a single line
                'group relative inline-flex w-full items-center whitespace-nowrap rounded-full px-3 py-1.5 text-[15px] font-medium tracking-wide transition-colors',
                'lg:hover:bg-primary-50',
                active
                  ? 'text-accent-700 lg:text-primary-800 lg:font-semibold lg:bg-primary-50'
                  : 'text-ink-700 hover:text-primary-800'
              )}
            >
              <span>{item.label}</span>
              <span
                aria-hidden
                className={cn(
                  'absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-accent-500 transition-transform duration-300 origin-left lg:hidden',
                  active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}