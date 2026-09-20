import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { getAllSiteContent } from '@/services/site-content.service';
import { getAboutHeroImage } from '@/services/about-media.service';
import { Placeholder } from '@/components/ui/Placeholder';
import { AboutHeroImage } from '@/components/home/AboutHeroImage';
import { Sparkles, Target, BookOpen, Award, Users, Building } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'about' });
  const typedLocale = locale as Locale;
  const [content, aboutHero] = await Promise.all([
    getAllSiteContent(typedLocale),
    getAboutHeroImage(typedLocale),
  ]);

  const byKey: Record<string, { title: string | null; body: string }> = {};
  for (const c of content) {
    if (c.key.startsWith('about.hero')) continue; // skip the hero image row
    byKey[c.key] = { title: c.title, body: c.body };
  }

  // The history section is always rendered as a preview in the hero
  // (either as real DB content or as a "История лицея" placeholder),
  // so we skip it from the lower list to avoid duplication.
  const allSections = [
    { key: 'about.history', icon: BookOpen, label: t('sections.history') },
    { key: 'about.general', icon: Building, label: t('sections.general') },
    { key: 'about.mission', icon: Target, label: t('sections.mission') },
    { key: 'about.features', icon: Sparkles, label: t('sections.features') },
    { key: 'about.advantages', icon: Award, label: t('sections.advantages') },
    { key: 'about.environment', icon: Users, label: t('sections.environment') },
  ];
  const sections = allSections.filter((s) => s.key !== 'about.history');

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-soft py-16 md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-0 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl"
        />

        <div className="container-tight">
          {/* Centered title block */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">
              {t('pageSubtitle')}
            </span>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-primary-900 md:text-5xl lg:text-6xl">
              {t('pageTitle')}
            </h1>
          </div>

          {/* Photo + first section preview */}
          <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              {aboutHero?.src ? (
                <AboutHeroImage
                  src={aboutHero.src}
                  alt={aboutHero.caption ?? t('pageTitle')}
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-surface-alt">
                  <div className="text-center text-ink-500">
                    <p className="text-sm">Главное фото раздела</p>
                    <p className="mt-1 text-xs">
                      Загрузите в&nbsp;
                      <a
                        href="/admin/about"
                        className="text-primary-700 underline decoration-dotted underline-offset-2 hover:text-primary-800"
                      >
                        админке
                      </a>
                      .
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* First non-empty section preview (skipped from list below) */}
            <div>
              {previewKey ? (
                (() => {
                  const data = byKey[previewKey];
                  return (
                    <article>
                      <h2 className="font-display text-2xl font-bold text-primary-800 md:text-3xl">
                        {data.title?.trim() ||
                          allSections.find((s) => s.key === previewKey)?.label}
                      </h2>
                      <div
                        className="prose-lyceum mt-4 text-pretty leading-relaxed text-ink-700 md:text-lg"
                        dangerouslySetInnerHTML={{
                          __html: data.body.length > 800
                            ? data.body.slice(0, 800).replace(/\s+\S*$/, '') + '…'
                            : data.body,
                        }}
                      />
                    </article>
                  );
                })()
              ) : (
                <Placeholder text={t('placeholder')} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* All sections */}
      <section className="section">
        <div className="container-tight space-y-12">
          {sections.map((section) => {
            const Icon = section.icon;
            const data = byKey[section.key];
            return (
              <article
                key={section.key}
                className="grid items-start gap-6 md:grid-cols-[200px_1fr]"
              >
                <div className="flex items-center gap-3 md:sticky md:top-24">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-800">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="font-display text-xl font-bold text-primary-800 md:text-2xl">
                    {data?.title?.trim() || section.label}
                  </h2>
                </div>
                <div>
                  {data?.body ? (
                    <div
                      className="prose-lyceum"
                      dangerouslySetInnerHTML={{ __html: data.body }}
                    />
                  ) : (
                    <Placeholder text={t('placeholder')} />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}