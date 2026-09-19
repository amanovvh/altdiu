import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { getDirections } from '@/services/direction.service';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DirectionCard } from '@/components/ui/DirectionCard';
import { Placeholder } from '@/components/ui/Placeholder';

export const dynamic = 'force-dynamic';

export default async function DirectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const typedLocale = locale as Locale;

  const [tNav, tDirections, directions] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'directions' }),
    getDirections(typedLocale),
  ]);

  const taglines: Record<string, string> = {
    economics: tDirections('economics.tagline'),
    languages: tDirections('languages.tagline'),
  };

  return (
    <>
      <section className="bg-gradient-soft py-16 md:py-20">
        <div className="container-tight">
          <SectionHeader
            eyebrow={tNav('directions')}
            title={tDirections('pageTitle')}
            subtitle={tDirections('pageSubtitle')}
            align="left"
          />
        </div>
      </section>

      <section className="section">
        <div className="container-tight">
          {directions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {directions.map((d) => (
                <DirectionCard
                  key={d.id}
                  direction={d}
                  tagline={taglines[d.slug]}
                />
              ))}
            </div>
          ) : (
            <Placeholder text="Информация о направлениях будет добавлена" />
          )}
        </div>
      </section>
    </>
  );
}
