import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { getPartners } from '@/services/partner.service';
import { getPartnershipEvents } from '@/services/partnership-event.service';
import { getAllSiteContent } from '@/services/site-content.service';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PartnersSection } from '@/components/home/PartnersSection';
import { CldImage } from '@/components/ui/CldImage';
import { Calendar, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const typedLocale = locale as Locale;

  const [t, partners, events, content] = await Promise.all([
    getTranslations({ locale, namespace: 'community' }),
    getPartners(typedLocale),
    getPartnershipEvents(),
    getAllSiteContent(typedLocale),
  ]);

  const introContent = content.find((c) => c.key === 'community.intro');
  const introHtml =
    introContent?.body?.trim() ||
    `<p>Лицей активно сотрудничает с ведущими университетами, лицеями и образовательными организациями. На этой странице — наши партнёры, документы о сотрудничестве и фотоотчёты с совместных мероприятий.</p>`;

  return (
    <>
      <section className="bg-gradient-soft py-16 md:py-20">
        <div className="container-tight">
          <SectionHeader
            eyebrow={t('pageSubtitle')}
            title={t('pageTitle')}
            align="left"
          />
          <div
            className="prose-lyceum mt-6 max-w-3xl text-pretty text-base text-ink-700 md:text-lg"
            dangerouslySetInnerHTML={{ __html: introHtml }}
          />
        </div>
      </section>

      {/* Partners grid (clickable → opens modal with photos + document) */}
      <PartnersSection partners={partners} variant="full" />

      {/* Events — дебаты, встречи, форумы */}
      {events.length > 0 && (
        <section className="section bg-surface-alt">
          <div className="container-wide">
            <SectionHeader
              eyebrow="Мероприятия"
              title="Дебаты, встречи и форумы"
              align="center"
              className="mb-10"
            />
            <div className="space-y-12">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft"
                >
                  <div className="relative aspect-[21/9] overflow-hidden bg-surface-alt">
                    {event.coverImage ? (
                      <CldImage
                        publicId={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 1200px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ink-400">
                        <Calendar className="h-16 w-16 opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary-900/85 via-primary-900/40 to-transparent p-6 text-white md:p-8">
                      <h3 className="text-balance text-2xl font-bold md:text-3xl">
                        {event.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-100">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Intl.DateTimeFormat('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }).format(event.date)}
                        </span>
                        {event.location && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {event.description && (
                    <div className="px-6 py-5 md:px-8">
                      <p className="text-pretty text-base text-ink-700">
                        {event.description}
                      </p>
                    </div>
                  )}
                  {event.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 px-2 pb-2 md:grid-cols-4 md:gap-2 md:px-3 md:pb-3">
                      {event.photos.slice(0, 8).map((photo, i) => (
                        <div
                          key={i}
                          className="relative aspect-square overflow-hidden rounded-xl bg-surface-alt"
                        >
                          <CldImage
                            publicId={photo}
                            alt={`${event.title} — фото ${i + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {partners.length === 0 && events.length === 0 && (
        <section className="section">
          <div className="container-tight text-center text-ink-500">
            Информация будет добавлена администрацией.
          </div>
        </section>
      )}
    </>
  );
}