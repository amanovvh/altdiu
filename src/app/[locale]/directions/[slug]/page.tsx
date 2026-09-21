import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { getDirectionBySlug, getDirections } from '@/services/direction.service';
import { Placeholder } from '@/components/ui/Placeholder';
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};
  const dir = await getDirectionBySlug(slug, locale as Locale);
  if (!dir) return {};
  return {
    title: dir.title,
    description: dir.description?.slice(0, 160),
  };
}

export default async function DirectionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();
  const typedLocale = locale as Locale;

  const [tNav, tDirections, tCommon, direction] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'directions' }),
    getTranslations({ locale, namespace: 'common' }),
    getDirectionBySlug(slug, typedLocale),
  ]);

  if (!direction) notFound();

  const isEconomics = direction.slug === 'economics';
  const subjectsTitle = isEconomics
    ? tDirections('economics.subjectsTitle')
    : tDirections('languages.subjectsTitle');

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-brand py-20 text-white md:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"
        />
        <div className="container-tight relative">
          <Link
            href="/directions"
            className="inline-flex items-center gap-1.5 text-sm text-ink-200 hover:text-accent-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {tNav('directions')}
          </Link>
          <span className="mt-6 block text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
            {direction.shortTitle ?? direction.title}
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            {direction.title}
          </h1>
        </div>
      </section>

      <section className="section">
        <div className="container-tight grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-primary-800 md:text-3xl">
              {subjectsTitle}
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {direction.subjects.length > 0 ? (
                direction.subjects.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                      <BookOpen className="h-5 w-5" />
                    </span>
                    <span className="font-semibold text-primary-800">{s.name}</span>
                  </div>
                ))
              ) : (
                <div className="sm:col-span-2">
                  <Placeholder text={tCommon('noData')} />
                </div>
              )}
            </div>

            <h2 className="mt-12 font-display text-2xl font-bold text-primary-800 md:text-3xl">
              О направлении
            </h2>
            <div className="prose-lyceum mt-4">
              {direction.description ? (
                <div dangerouslySetInnerHTML={{ __html: direction.description }} />
              ) : (
                <Placeholder text={tCommon('placeholder')} />
              )}
            </div>

            {direction.highlights.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-2xl font-bold text-primary-800 md:text-3xl">
                  Особенности
                </h2>
                <ul className="mt-4 space-y-3">
                  {direction.highlights.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" />
                      <span className="text-ink-700">{h}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-gradient-brand p-6 text-white">
              <h3 className="font-display text-xl font-bold">{tNav('contacts')}</h3>
              <p className="mt-2 text-sm text-ink-200">
                {tDirections('contactPrompt')}
              </p>
              <Link
                href="/contacts"
                className="btn-accent mt-4 w-full group"
              >
                {tCommon('contactUs')}
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
