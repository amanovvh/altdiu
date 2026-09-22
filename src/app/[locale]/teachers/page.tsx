import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Globe, ArrowRight } from 'lucide-react';
import { Link } from '@/lib/i18n/routing';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { getTeachers } from '@/services/teacher.service';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Placeholder } from '@/components/ui/Placeholder';
import { TeachersFilter } from './TeachersFilter';
import { TeachersListWithModal } from './TeacherListWithModal';

export const dynamic = 'force-dynamic';

export default async function TeachersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  if (!isValidLocale(locale)) notFound();
  const typedLocale = locale as Locale;

  const t = await getTranslations({ locale, namespace: 'teachers' });
  const teachers = await getTeachers(typedLocale);

  const categories = [
    { value: 'ALL', label: t('filter.all') },
    { value: 'ECONOMICS', label: t('filter.economics') },
    { value: 'LANGUAGES', label: t('filter.languages') },
    { value: 'MATHEMATICS', label: t('filter.mathematics') },
    { value: 'NATURAL_SCIENCES', label: t('filter.naturalSciences') },
    { value: 'HUMANITIES', label: t('filter.humanities') },
    { value: 'OTHER', label: t('filter.other') },
  ];

const foreignCount =
    teachers.filter((t) => t.category === 'FOREIGN').length;

  const counts = teachers.reduce<Record<string, number>>((acc, teacher) => {
    acc[teacher.category] = (acc[teacher.category] ?? 0) + 1;
    return acc;
  }, {});

  const selected = (sp.category ?? 'ALL').toUpperCase();
  const filtered =
    selected === 'ALL' ? teachers : teachers.filter((t) => t.category === selected);

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

      {/* Visiting Faculty — standalone banner, NOT part of the filter row. */}
        {selected === 'ALL' && (
          <div className="mt-10 flex flex-col items-stretch overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-sky-100/60 p-5 shadow-soft md:flex-row md:items-center md:gap-4">
            <div className="flex shrink-0 items-center gap-3 md:border-r md:border-sky-200 md:pr-5">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md">
                <Globe className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                  {t('filter.foreign')}
                </p>
                <p className="mt-0.5 text-lg font-bold text-sky-900">
                  Visiting Faculty
                </p>
              </div>
            </div>
            <p className="mt-3 text-pretty text-sm text-ink-700 md:mt-0 md:flex-1">
              Преподаватели из зарубежных университетов, приглашённые для обмена опытом и совместных программ.
            </p>
            <Link
              href={'/teachers?category=foreign' as any}
              className="mt-3 inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 md:mt-0"
            >
              Показать {foreignCount} › 
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

      <section className="section">
        <div className="container-tight">
          <TeachersFilter
            categories={categories.map((c) => ({
              ...c,
              count: c.value === 'ALL' ? teachers.length : counts[c.value] ?? 0,
            }))}
            active={selected}
          />

          {filtered.length > 0 ? (
            <div className="mt-10">
              <TeachersListWithModal teachers={filtered} />
            </div>
          ) : (
            <div className="mt-10">
              <Placeholder text={t('placeholder')} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
