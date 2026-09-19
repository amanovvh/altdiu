import { Link } from '@/lib/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { getContactInfo, getSocialLinks } from '@/services/contact.service';
import { Logo } from './Logo';
import { Instagram, Send, Mail, Phone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Locale } from '@/lib/i18n/config';

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  TELEGRAM: Send,
  INSTAGRAM: Instagram,
  FACEBOOK: Instagram,
  YOUTUBE: Instagram,
  TWITTER: Instagram,
  LINKEDIN: Instagram,
};

const platformColors: Record<string, string> = {
  TELEGRAM: 'hover:bg-[#229ED9] hover:text-white hover:border-[#229ED9]',
  INSTAGRAM:
    'hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af] hover:text-white hover:border-transparent',
};

export async function Footer({ locale }: { locale: Locale }) {
  const [t, tNav, tCommon, contact, socials] = await Promise.all([
    getTranslations({ locale, namespace: 'footer' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
    getContactInfo(locale),
    getSocialLinks(),
  ]);

  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-primary-900 text-ink-100">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent" />
      <div className="pointer-events-none absolute -right-32 top-0 h-72 w-72 rounded-full bg-accent-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-primary-600/30 blur-3xl" />

      <div className="container-wide relative grid gap-12 py-16 md:grid-cols-12 lg:py-20">
        <div className="md:col-span-5 lg:col-span-5">
          <div className="flex items-center gap-3">
            <Logo />
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-300">
            {t('about')}
          </p>

          {socials.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.18em] text-accent-400">
                {t('social')}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {socials.map((s) => {
                  const Icon = platformIcons[s.platform] ?? Send;
                  return (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      className={cn(
                        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-ink-200 transition-all duration-300',
                        platformColors[s.platform] ?? 'hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-3 lg:col-span-3">
          <p className="text-xs uppercase tracking-[0.18em] text-accent-400">
            {t('navigation')}
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              { href: '/about', label: tNav('about') },
              { href: '/directions', label: tNav('directions') },
              { href: '/teachers', label: tNav('teachers') },
              { href: '/news', label: tNav('news') },
              { href: '/achievements', label: tNav('achievements') },
              { href: '/why-us', label: tNav('whyUs') },
              { href: '/community', label: tNav('community') },
              { href: '/contacts', label: tNav('contacts') },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href as any}
                  className="inline-flex text-ink-300 transition-colors hover:text-accent-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4 lg:col-span-4">
          <p className="text-xs uppercase tracking-[0.18em] text-accent-400">
            {t('contacts')}
          </p>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
              <span className="text-ink-300">
                {contact?.address ?? tCommon('placeholder')}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
              <a
                href={contact?.phone ? `tel:${contact.phone.replace(/[^\d+]/g, '')}` : '#'}
                className="text-ink-300 transition-colors hover:text-accent-400"
              >
                {contact?.phone ?? tCommon('placeholder')}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
              <a
                href={contact?.email ? `mailto:${contact.email}` : '#'}
                className="text-ink-300 transition-colors hover:text-accent-400 break-all"
              >
                {contact?.email ?? tCommon('placeholder')}
              </a>
            </li>
            {contact?.schedule && (
              <li className="text-ink-400 text-xs italic">{contact.schedule}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container-wide flex flex-col items-center justify-between gap-3 py-6 text-xs text-ink-400 md:flex-row">
          <p>
            © {year} {tNav('home')} — {t('rights')}
          </p>
          <p>{t('developedBy')}</p>
        </div>
      </div>
    </footer>
  );
}
