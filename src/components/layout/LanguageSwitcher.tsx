'use client';

import { useState, useTransition } from 'react';
import { usePathname, useRouter } from '@/lib/i18n/routing';
import { ChevronDown, Globe } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils/cn';

interface Props {
  currentLocale: Locale;
  className?: string;
}

export function LanguageSwitcher({ currentLocale, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const onSelect = (next: Locale) => {
    setOpen(false);
    startTransition(() => {
      router.replace(pathname as any, { locale: next });
    });
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:border-primary-300 hover:bg-primary-50/50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4 text-primary-700" aria-hidden />
        <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
        <span className="sm:hidden">{localeFlags[currentLocale]}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-ink-500 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Close language menu"
          />
          <ul
            role="listbox"
            className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-lg animate-fade-in"
          >
            {locales.map((loc) => (
              <li key={loc}>
                <button
                  type="button"
                  onClick={() => onSelect(loc)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors',
                    loc === currentLocale
                      ? 'bg-primary-50 text-primary-800 font-semibold'
                      : 'text-ink-700 hover:bg-ink-50'
                  )}
                  role="option"
                  aria-selected={loc === currentLocale}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden>{localeFlags[loc]}</span>
                    <span>{localeNames[loc]}</span>
                  </span>
                  {loc === currentLocale && (
                    <span className="text-accent-500">●</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
