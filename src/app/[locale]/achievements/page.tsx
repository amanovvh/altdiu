import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { getAchievements } from '@/services/achievement.service';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AchievementCard } from '@/components/ui/AchievementCard';
import { Placeholder } from '@/components/ui/Placeholder';
import { AchievementsFilter } from './AchievementsFilter';

export const dynamic = 'force-dynamic';

export default async function AchievementsPage({
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

  const t = await getTranslations({ locale, namespace: 'achievements' });
  const items = await getAchievements(typedLocale);

  const tabs = [
    { value: 'ALL', label: t('categories.all') },
    { value: 'OLYMPIAD', label: t('categories.olympiad') },
    { value: 'CERTIFICATE', label: t('categories.certificate') },
    { value: 'COMPETITION', label: t('categories.competition') },
    { value: 'SPORT', label: t('categories.sport') },
    { value: 'OTHER', label: t('categories.other') },
  ];

  const counts: Record<string, number> = { ALL: items.length };
  for (const it of items) counts[it.category] = (counts[it.category] ?? 0) + 1;

  const active = (sp.category ?? 'ALL').toUpperCase();
  const filtered =
    active === 'ALL' ? items : items.filter((a) => a.category === active);

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
          <AchievementsFilter
            tabs={tabs.map((tab) => ({ ...tab, count: counts[tab.value] ?? 0 }))}
            active={active}
          />

          {filtered.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <AchievementCard key={a.id} achievement={a} locale={typedLocale} />
              ))}
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
