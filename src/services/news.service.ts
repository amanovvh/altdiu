import { prisma } from '@/lib/db/prisma';
import type { Locale, NewsStatus } from '@prisma/client';
import { plainExcerpt, slug as slugifyText } from '@/lib/utils/text';

export interface NewsListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  category: string | null;
  publishedAt: Date | null;
  isPinned: boolean;
}

export interface NewsDetail extends NewsListItem {
  body: string;
  images: string[];
  views: number;
}

const TRANSLATION_SELECT = {
  id: true,
  title: true,
  excerpt: true,
  body: true,
  slug: true,
  locale: true,
} as const;

/**
 * Get pinned + latest news for the homepage hero.
 */
export async function getHomepageNews(locale: Locale, limit = 5): Promise<{
  latest: NewsDetail | null;
  recent: NewsListItem[];
}> {
  const baseWhere = { status: 'PUBLISHED' as NewsStatus };

  const pinned = await prisma.news.findFirst({
    where: { ...baseWhere, isPinned: true },
    orderBy: { publishedAt: 'desc' },
    include: {
      translations: { where: { locale }, select: TRANSLATION_SELECT },
    },
  });

  const latestRecord = pinned ?? (await prisma.news.findFirst({
    where: baseWhere,
    orderBy: { publishedAt: 'desc' },
    include: {
      translations: { where: { locale }, select: TRANSLATION_SELECT },
    },
  }));

  const recentRecords = await prisma.news.findMany({
    where: {
      ...baseWhere,
      ...(latestRecord ? { id: { not: latestRecord.id } } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: {
      translations: { where: { locale }, select: TRANSLATION_SELECT },
    },
  });

  const latest = latestRecord?.translations[0]
    ? mapDetail(latestRecord, latestRecord.translations[0])
    : null;

  const recent = recentRecords
    .filter((r) => r.translations[0])
    .map((r) => mapListItem(r, r.translations[0]));

  return { latest, recent };
}

/**
 * Get paginated news list.
 */
export async function getNewsList(
  locale: Locale,
  options: { page?: number; pageSize?: number; category?: string } = {}
): Promise<{
  items: NewsListItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, options.pageSize ?? 12);
  const skip = (page - 1) * pageSize;

  const where = {
    status: 'PUBLISHED' as NewsStatus,
    ...(options.category ? { category: options.category } : {}),
  };

  const [records, total] = await Promise.all([
    prisma.news.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      skip,
      take: pageSize,
      include: {
        translations: { where: { locale }, select: TRANSLATION_SELECT },
      },
    }),
    prisma.news.count({ where }),
  ]);

  return {
    items: records
      .filter((r) => r.translations[0])
      .map((r) => mapListItem(r, r.translations[0])),
    total,
    page,
    pageSize,
  };
}

export async function getNewsBySlug(
  slug: string,
  locale: Locale
): Promise<NewsDetail | null> {
  const translation = await prisma.newsTranslation.findFirst({
    where: { slug, locale },
    include: { news: true },
  });
  if (!translation || translation.news.status !== 'PUBLISHED') return null;
  return mapDetail(translation.news, translation);
}

export async function getNewsCategories(locale: Locale): Promise<string[]> {
  const items = await prisma.news.findMany({
    where: { status: 'PUBLISHED', category: { not: null } },
    distinct: ['category'],
    select: { category: true, translations: { where: { locale }, select: { title: true } } },
  });
  return items
    .map((i) => i.category)
    .filter((c): c is string => Boolean(c));
}

/* ===== mappers ===== */

function mapListItem(record: any, t: any): NewsListItem {
  return {
    id: record.id,
    slug: t.slug,
    title: t.title,
    excerpt: t.excerpt || plainExcerpt(t.body, 180),
    coverImage: record.coverImage,
    category: record.category,
    publishedAt: record.publishedAt,
    isPinned: record.isPinned,
  };
}

function mapDetail(record: any, t: any): NewsDetail {
  return {
    ...mapListItem(record, t),
    body: t.body,
    images: record.images ?? [],
    views: record.views ?? 0,
  };
}

export function generateSlug(title: string, locale: Locale): string {
  return slugifyText(title, locale);
}
