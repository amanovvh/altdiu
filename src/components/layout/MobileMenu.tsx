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
 * The trigger button lives in the Header (top-left corner on mobile)
 * so the drawer is responsible only for the panel + backdrop.
 */
export function MobileMenu({ isOpen, onClose, locale }: Props) {
  const t = useTranslations('common');
  const tNav = useTranslations('nav');

  // Lock body scroll while drawer is open.
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Escape closes the drawer.
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
          // inset-y-0 instead of top-0 + h-full — more reliable across browsers
          // and avoids the drawer collapsing to its content height in some
          // mobile/responsive contexts. min-h-0 on the nav lets it scroll.
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out-soft lg:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={tNav('menu')}
      >
        {/* Header — logo + close */}
        <div className="flex shrink-0 items-center justify-between border-b border-ink-100 bg-gradient-to-b from-primary-50/40 to-transparent px-5 py-4">
          <Link href="/" onClick={onClose} aria-label="Home">
            <Logo variant="compact" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-700 transition hover:bg-primary-100 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-accent-400"
            aria-label={t('closeMenu')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section label */}
        <div className="shrink-0 border-b border-ink-100 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">
            {tNav('menu')}
          </p>
        </div>

        {/* Nav links — min-h-0 is required for overflow-y-auto inside flex */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <NavLinks onNavigate={onClose} />
        </nav>

        {/* Footer — language + CTA */}
        <div className="shrink-0 space-y-3 border-t border-ink-100 bg-surface-alt/40 px-5 py-5">
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
