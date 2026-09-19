'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/lib/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Logo } from './Logo';
import { NavLinks } from './NavLinks';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import { ChevronRight, Menu } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Locale } from '@/lib/i18n/config';

export function Header() {
  const tNav = useTranslations('nav');
  const locale = useLocale() as Locale;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-primary-800 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          scrolled
            ? 'border-b border-ink-100/80 bg-white/90 backdrop-blur-md shadow-soft'
            : 'border-b border-transparent bg-white/60 backdrop-blur-sm'
        )}
      >
        <div className="container-wide flex h-16 items-center gap-3 lg:h-20 lg:gap-4">
          {/* Logo — shrink-0 keeps it at natural width, never overlaps nav */}
          <Link href="/" className="flex shrink-0 items-center" aria-label="Home">
            {/* Full logo (with subtitle) only on very wide screens ≥2xl (1536px).
                Elsewhere compact variant — saves space and lets the nav scroll
                without the logo getting cramped. */}
            <span className="hidden 2xl:inline-flex">
              <Logo variant="full" />
            </span>
            <span className="2xl:hidden">
              <Logo variant="compact" />
            </span>
          </Link>

          {/* Centered horizontal nav. */}
          <nav
            className="relative hidden min-w-0 flex-1 lg:block"
            aria-label="Primary"
          >
            <NavLinks />
          </nav>

          {/* Right-side controls — shrink-0, always at natural width */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex lg:gap-3">
            <LanguageSwitcher currentLocale={locale} />
            <Link href="/contacts" className="btn-accent group">
              {tNav('contacts')}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile-only burger menu — RIGHT corner, opens the drawer.
              ml-auto pushes it to the far right; on lg+ it's hidden so the
              centered nav + right CTA take over. */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="ml-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800 transition hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-accent-400 lg:hidden"
            aria-label={tNav ? tNav('menu') : 'Меню'}
          >
            <Menu className="h-6 w-6" strokeWidth={2.25} />
          </button>

          <MobileMenu
            isOpen={mobileOpen}
            onOpen={() => setMobileOpen(true)}
            onClose={() => setMobileOpen(false)}
            locale={locale}
          />
        </div>
      </header>
    </>
  );
}