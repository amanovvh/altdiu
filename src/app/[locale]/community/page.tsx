import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { FileText, MapPin, Calendar } from 'lucide-react';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { getPartners } from '@/services/partner.service';
import { getPartnerDocuments } from '@/services/partner-document.service';
import { getPartnershipEvents } from '@/services/partnership-event.service';
import { getAllSiteContent } from '@/services/site-content.service';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PartnersSection } from '@/components/home/PartnersSection';
import { CldImage } from '@/components/ui/CldImage';
import { Link } from '@/lib/i18n/routing';

export const dynamic = 'force-dynamic';

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const typedLocale = locale as Locale;

  const [t, partners, documents, events, content] = await Promise.all([
    getTranslations({ locale, namespace: 'community' }),
    getPartners(typedLocale),
    getPartnerDocuments(),
    getPartnershipEvents(),
    getAllSiteContent(typedLocale),
  ]);

  // Optional editor-managed intro block (SiteContent key "community.intro").
  // Falls back to a generic placeholder if not set.
  const introContent = content.find((c) => c.key === 'community.intro');
  const introHtml =
    introContent?.body?.trim() ||
    `<p>Лицей активно сотрудничает с ведущими университетами, лицеями и образовательными организациями. На этой странице — наши партнёры, документы о сотрудничестве и фотоотчёты с совместных мероприятий.</p>`;

  return (
    <>
      {/* Hero / intro */}
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

      {/* Partners grid (existing) */}
      <PartnersSection partners={partners} variant="full" />

      {/* Documents — договоры, соглашения, PDF */}
      {documents.length > 0 && (
        <section className="section bg-surface-alt">
          <div className="container-wide">
            <SectionHeader
              eyebrow="Документы"
              title="Договоры и соглашения о сотрудничестве"
              align="center"
              className="mb-10"
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                      <FileText className="h-6 w-6" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 font-semibold text-primary-800 group-hover:text-primary-900">
                        {doc.title}
                      </h3>
                      {doc.description && (
                        <p className="mt-2 line-clamp-3 text-sm text-ink-500">
                          {doc.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-xs text-ink-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Intl.DateTimeFormat('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }).format(doc.date)}
                        </span>
                        {doc.fileSize && (
                          <span>· {(doc.fileSize / 1024).toFixed(0)} KB</span>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events — дебаты, встречи, форумы с фото */}
      {events.length > 0 && (
        <section className="section bg-white">
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
                  {/* Cover */}
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

                  {/* Description */}
                  {event.description && (
                    <div className="px-6 py-5 md:px-8">
                      <p className="text-pretty text-base text-ink-700">
                        {event.description}
                      </p>
                    </div>
                  )}

                  {/* Photos grid */}
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

      {/* Empty state */}
      {partners.length === 0 && documents.length === 0 && events.length === 0 && (
        <section className="section">
          <div className="container-tight text-center text-ink-500">
            Информация будет добавлена администрацией.
          </div>
        </section>
      )}
    </>
  );
}