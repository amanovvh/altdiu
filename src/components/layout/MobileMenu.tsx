'use client';

import { useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { NavLinks } from './NavLinks';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import type { Locale } from '@/lib/i18n/config';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils/cn';

interface Props {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  locale: Locale;
}

/**
 * Mobile drawer (slide-in panel from the right).
 *
 * The trigger button lives in the Header (top-right corner on mobile),
 * so this component only renders the panel + backdrop.
 *
 * Sections inside the drawer:
 *  1. Header  — logo + close button
 *  2. Nav     — 5 primary links (vertical, with icons)
 *  3. Footer  — language switcher + "Контакты" CTA
 */
export function MobileMenu({ isOpen, onClose, locale }: Props) {
  const t = useTranslations('common');
  const tNav = useTranslations('nav');
  const tMeta = useTranslations('metadata');

  // Lock body scroll while drawer is open (restores previous overflow value).
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Escape key closes the drawer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-primary-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer */}
      <aside
        className={cn(
          // h-screen + overflow-hidden guarantees the flex-1 nav expands
          // even when the parent has no defined height. inset-y-0 alone can
          // be flaky in some browsers / Tailwind setups.
          'fixed inset-y-0 right-0 z-50 flex h-screen w-full max-w-sm flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out-soft lg:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={tNav('menu')}
      >
        {/* 1. Header — logo + close, dark navy background so the drawer has
            a clear "top" identity instead of plain white. */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-primary-800 via-primary-800 to-primary-900 px-5 py-4 text-white">
          {/* Decorative glow accents */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent-500/20 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-primary-500/30 blur-2xl"
          />
          <div className="relative flex items-center justify-between gap-3">
            <Link href="/" onClick={onClose} aria-label="Home" className="flex items-center">
              {/* Logo on dark bg — invert the seal ring color */}
              <span className="[&_img]:ring-white/20">
                <Logo variant="compact" />
              </span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-800"
              aria-label={t('closeMenu')}
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
          <p className="relative mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent-300">
            {tNav('menu')}
          </p>
          <p className="relative mt-0.5 line-clamp-2 text-xs text-white/70">{tMeta('siteFullName')}</p>
        </div>

        {/* 2. Nav links — vertical stack with icons, big touch targets.
            min-h-0 + flex-1 + overflow-y-auto lets it scroll if items don't fit. */}
        <nav className="min-h-0 flex-1 overflow-y-auto bg-surface-alt/30 px-2 py-3">
          <NavLinks onNavigate={onClose} />
        </nav>

        {/* 3. Footer — language + CTA */}
        <div className="shrink-0 space-y-3 border-t border-ink-100 bg-surface-alt/40 px-4 py-4">
          <LanguageSwitcher currentLocale={locale} className="w-full" />
          <Link
            href="/contacts"
            onClick={onClose}
            className="btn-accent group flex w-full items-center justify-center gap-1.5"
          >
            {tNav('contacts')}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </aside>
    </>
  );
}
