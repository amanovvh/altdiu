import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { getNewsList, getNewsCategories } from '@/services/news.service';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { NewsCard } from '@/components/ui/NewsCard';
import { Placeholder } from '@/components/ui/Placeholder';
import { Pagination } from '@/components/ui/Pagination';

export const dynamic = 'force-dynamic';

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  if (!isValidLocale(locale)) notFound();
  const typedLocale = locale as Locale;

  const t = await getTranslations({ locale, namespace: 'news' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const category = sp.category || undefined;
  const { items, total, pageSize } = await getNewsList(typedLocale, { page, pageSize: 9, category });
  const categories = await getNewsCategories(typedLocale);

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
          {items.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((n) => (
                  <NewsCard key={n.id} news={n} />
                ))}
              </div>
              <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                basePath="/news"
                searchParams={{ category }}
                className="mt-12"
              />
            </>
          ) : (
            <Placeholder text={t('empty')} />
          )}
        </div>
      </section>
    </>
  );
}
