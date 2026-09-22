import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
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
    { value: 'FOREIGN', label: t('filter.foreign') },
    { value: 'OTHER', label: t('filter.other') },
  ];

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
