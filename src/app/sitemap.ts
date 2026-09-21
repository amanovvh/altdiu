import type { MetadataRoute } from 'next';
import { routing } from '@/lib/i18n/routing';
import { prisma } from '@/lib/db/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const now = new Date();

  // Static routes
  const staticPaths = [
    '',
    '/about',
    '/administration',
    '/teachers',
    '/directions',
    '/achievements',
    '/news',
    '/gallery',
    '/contacts',
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: path === '' ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${baseUrl}/${l}${path}`])
          ),
        },
      });
    }
  }

  // Dynamic news
  try {
    const news = await prisma.newsTranslation.findMany({
      where: { news: { status: 'PUBLISHED' } },
      select: { locale: true, slug: true, news: { select: { updatedAt: true } } },
    });
    for (const n of news) {
      entries.push({
        url: `${baseUrl}/${n.locale}/news/${n.slug}`,
        lastModified: n.news.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }

    // Dynamic gallery albums
    const albums = await prisma.galleryAlbum.findMany({
      where: { status: 'PUBLISHED', isActive: true },
      select: { slug: true, updatedAt: true, translations: { select: { locale: true } } },
    });
    for (const a of albums) {
      for (const tr of a.translations) {
        entries.push({
          url: `${baseUrl}/${tr.locale}/gallery/${a.slug}`,
          lastModified: a.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.5,
        });
      }
    }
  } catch {
    // DB unavailable (build-time) — return static entries only
  }

  return entries;
}
