import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { getNewsBySlug, getNewsList } from '@/services/news.service';
import { CldImage } from '@/components/ui/CldImage';
import { GalleryGrid } from '@/components/ui/GalleryGrid';
import { ArrowLeft, Calendar, Eye, Share2 } from 'lucide-react';
import { formatDate } from '@/lib/utils/dates';
import { Placeholder } from '@/components/ui/Placeholder';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};
  const news = await getNewsBySlug(slug, locale as Locale);
  if (!news) return {};
  return {
    title: news.title,
    description: news.excerpt,
    openGraph: {
      title: news.title,
      description: news.excerpt,
      type: 'article',
      publishedTime: news.publishedAt?.toISOString(),
      images: news.coverImage ? [news.coverImage] : undefined,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();
  const typedLocale = locale as Locale;

  const [t, news] = await Promise.all([
    getTranslations({ locale, namespace: 'news' }),
    getNewsBySlug(slug, typedLocale),
  ]);

  if (!news) notFound();

  return (
    <article>
      {/* Hero image */}
      {news.coverImage && (
        <div className="relative h-[40vh] min-h-[280px] w-full overflow-hidden bg-primary-900 md:h-[50vh]">
          <CldImage
            publicId={news.coverImage}
            alt={news.title}
            fill
            priority
            className="object-cover opacity-90"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950/95 via-primary-900/40 to-transparent" />
        </div>
      )}

      <div className="container-tight -mt-32 relative z-10 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-ink-100 bg-white p-8 shadow-xl md:p-12">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-accent-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToList')}
          </Link>

          <header className="mt-6">
            <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
              {news.publishedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(news.publishedAt, typedLocale)}
                </span>
              )}
              {news.category && (
                <span className="chip-accent">{news.category}</span>
              )}
              {news.isPinned && <span className="chip">📌 Pinned</span>}
            </div>
            <h1 className="mt-3 text-balance text-3xl font-bold text-primary-800 md:text-4xl lg:text-5xl">
              {news.title}
            </h1>
            {news.excerpt && (
              <p className="mt-4 text-pretty text-lg text-ink-600">{news.excerpt}</p>
            )}
          </header>

          <div className="prose-lyceum mt-10">
            {news.body ? (
              <div dangerouslySetInnerHTML={{ __html: news.body }} />
            ) : (
              <Placeholder text="Текст новости будет добавлен" />
            )}
          </div>

          {/* Gallery */}
          {news.images.length > 0 && (
            <div className="mt-12">
              <GalleryGrid
                images={news.images.map((publicId, idx) => ({
                  id: `${idx}`,
                  publicId,
                  alt: `${news.title} — фото ${idx + 1}`,
                  order: idx,
                }))}
                albumTitle={news.title}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
