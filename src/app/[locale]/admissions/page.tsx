import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { getSiteContent } from '@/services/site-content.service';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Placeholder } from '@/components/ui/Placeholder';
import { ArrowRight, FileText, Users, Clock, ExternalLink, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdmissionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const [t, tCommon, content] = await Promise.all([
    getTranslations({ locale, namespace: 'admissions' }),
    getTranslations({ locale, namespace: 'common' }),
    getSiteContent(locale as Locale, [
      'admissions.intro',
      'admissions.eligibility',
      'admissions.stages',
      'admissions.process',
      'admissions.system',
      'admissions.documents',
      'admissions.conditions',
      'admissions.deadlines',
      'admissions.links',
      'admissions.recommendations',
    ]),
  ]);

  const sections = [
    {
      key: 'admissions.eligibility',
      title: t('eligibility'),
      icon: Users,
      accent: 'bg-primary-50 text-primary-800',
    },
    {
      key: 'admissions.stages',
      title: t('stages'),
      icon: CheckCircle2,
      accent: 'bg-emerald-50 text-emerald-700',
    },
    {
      key: 'admissions.process',
      title: t('process'),
      icon: BookOpen,
      accent: 'bg-accent-50 text-accent-700',
    },
    {
      key: 'admissions.system',
      title: t('system'),
      icon: FileText,
      accent: 'bg-sky-50 text-sky-700',
    },
    {
      key: 'admissions.documents',
      title: t('documents'),
      icon: FileText,
      accent: 'bg-violet-50 text-violet-700',
    },
    {
      key: 'admissions.conditions',
      title: t('conditions'),
      icon: AlertCircle,
      accent: 'bg-rose-50 text-rose-700',
    },
    {
      key: 'admissions.deadlines',
      title: t('deadlines'),
      icon: Clock,
      accent: 'bg-amber-50 text-amber-700',
    },
    {
      key: 'admissions.recommendations',
      title: t('recommendations'),
      icon: CheckCircle2,
      accent: 'bg-emerald-50 text-emerald-700',
    },
  ];

  const heroContent = content['admissions.intro'];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-brand py-20 text-white md:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"
        />
        <div className="container-tight relative max-w-4xl">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
            DTM · {t('pageSubtitle')}
          </span>
          <h1 className="mt-3 text-balance text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            {t('pageTitle')}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-ink-200 md:text-lg">
            {t('pageSubtitle')}
          </p>

          <div className="mt-8 rounded-2xl border border-accent-400/30 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" />
              <p className="text-sm text-ink-100">{t('noApplicationForm')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-tight max-w-4xl">
          {heroContent?.body && (
            <div className="prose-lyceum mb-12">
              <div dangerouslySetInnerHTML={{ __html: heroContent.body }} />
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {sections.map(({ key, title, icon: Icon, accent }) => {
              const block = content[key];
              return (
                <article
                  key={key}
                  className="group rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="font-display text-xl font-bold text-primary-800">
                      {title}
                    </h2>
                  </div>
                  <div className="mt-4">
                    {block?.body ? (
                      <div
                        className="prose-lyceum"
                        dangerouslySetInnerHTML={{ __html: block.body }}
                      />
                    ) : (
                      <Placeholder text={tCommon('placeholder')} variant="subtle" className="text-left justify-start" />
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* DTM Link */}
          <div className="mt-12 rounded-2xl bg-gradient-soft p-6 md:p-10">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-primary-800">
                  {t('links')}
                </h2>
                <p className="mt-2 max-w-xl text-pretty text-ink-600">
                  {tCommon('viewAll')} → {t('dtmLink')}
                </p>
              </div>
              <a
                href="https://dtm.uz"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent group"
              >
                {t('dtmLink')}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
