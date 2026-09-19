import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { getPartners } from '@/services/partner.service';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PartnersSection } from '@/components/home/PartnersSection';

export const dynamic = 'force-dynamic';

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const typedLocale = locale as Locale;

  const [t, partners] = await Promise.all([
    getTranslations({ locale, namespace: 'community' }),
    getPartners(typedLocale),
  ]);

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

      <PartnersSection partners={partners} variant="full" />

      {partners.length === 0 && (
        <section className="section">
          <div className="container-tight text-center text-ink-500">
            Информация будет добавлена администрацией.
          </div>
        </section>
      )}
    </>
  );
}
