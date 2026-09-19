import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { getContactInfo, getSocialLinks } from '@/services/contact.service';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Placeholder } from '@/components/ui/Placeholder';
import { MapPin, Phone, Mail, Clock, Instagram, Send, Facebook, Youtube, Twitter, Linkedin } from 'lucide-react';

export const dynamic = 'force-dynamic';

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  TELEGRAM: Send,
  INSTAGRAM: Instagram,
  FACEBOOK: Facebook,
  YOUTUBE: Youtube,
  TWITTER: Twitter,
  LINKEDIN: Linkedin,
};

const platformLabels: Record<string, string> = {
  TELEGRAM: 'Telegram',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  YOUTUBE: 'YouTube',
  TWITTER: 'X / Twitter',
  LINKEDIN: 'LinkedIn',
};

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const [t, tCommon, contact, socials] = await Promise.all([
    getTranslations({ locale, namespace: 'contacts' }),
    getTranslations({ locale, namespace: 'common' }),
    getContactInfo(locale as Locale),
    getSocialLinks(),
  ]);

  const hasMap = Boolean(contact?.mapEmbed || (contact?.latitude && contact?.longitude));

  return (
    <>
      <section className="bg-gradient-soft py-16 md:py-20">
        <div className="container-tight">
          <SectionHeader
            eyebrow={t('pageSubtitle')}
            title={t('pageTitle')}
            align="left"
          />
        </div>
      </section>

      <section className="section">
        <div className="container-tight grid gap-10 lg:grid-cols-5">
          {/* Contact info */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-soft">
              <h2 className="font-display text-2xl font-bold text-primary-800">
                {tCommon('address')}
              </h2>

              <ul className="mt-6 space-y-5">
                <li className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink-500">
                      {tCommon('address')}
                    </p>
                    <p className="mt-1 font-medium text-primary-800">
                      {contact?.address ?? tCommon('placeholder')}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                    <Phone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink-500">
                      {tCommon('phone')}
                    </p>
                    <a
                      href={contact?.phone ? `tel:${contact.phone.replace(/[^\d+]/g, '')}` : '#'}
                      className="mt-1 font-medium text-primary-800 hover:text-accent-700"
                    >
                      {contact?.phone ?? tCommon('placeholder')}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink-500">
                      {tCommon('email')}
                    </p>
                    <a
                      href={contact?.email ? `mailto:${contact.email}` : '#'}
                      className="mt-1 font-medium text-primary-800 break-all hover:text-accent-700"
                    >
                      {contact?.email ?? tCommon('placeholder')}
                    </a>
                  </div>
                </li>
                {contact?.schedule && (
                  <li className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                      <Clock className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-ink-500">
                        {tCommon('workingHours')}
                      </p>
                      <p className="mt-1 text-sm text-primary-800">{contact.schedule}</p>
                    </div>
                  </li>
                )}
              </ul>

              {socials.length > 0 && (
                <div className="mt-8 border-t border-ink-100 pt-6">
                  <p className="text-xs uppercase tracking-wider text-ink-500">
                    {t('followUs')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {socials.map((s) => {
                      const Icon = platformIcons[s.platform] ?? Send;
                      return (
                        <a
                          key={s.platform}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-primary-800 hover:bg-primary-800 hover:text-white"
                        >
                          <Icon className="h-4 w-4" />
                          {platformLabels[s.platform] ?? s.platform}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
              {contact?.mapEmbed ? (
                <iframe
                  src={contact.mapEmbed}
                  title="Map"
                  className="h-[480px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : contact?.latitude && contact?.longitude ? (
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${contact.longitude - 0.01},${contact.latitude - 0.01},${contact.longitude + 0.01},${contact.latitude + 0.01}&layer=mapnik&marker=${contact.latitude},${contact.longitude}`}
                  title="Map"
                  className="h-[480px] w-full"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-[480px] flex-col items-center justify-center gap-3 bg-surface-alt p-6 text-center">
                  <MapPin className="h-10 w-10 text-ink-400" />
                  <p className="text-sm text-ink-500">
                    {tCommon('placeholder')}
                  </p>
                  <p className="text-xs text-ink-400">
                    Координаты для карты будут добавлены администратором
                  </p>
                </div>
              )}

              {hasMap && (contact?.latitude && contact?.longitude) && (
                <div className="border-t border-ink-100 p-4">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${contact.latitude}&mlon=${contact.longitude}#map=17/${contact.latitude}/${contact.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary-700 hover:text-accent-700"
                  >
                    {tCommon('viewOnMap')} →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
