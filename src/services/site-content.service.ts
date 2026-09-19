import { prisma } from '@/lib/db/prisma';
import type { Locale } from '@prisma/client';

export interface SiteContentBlock {
  key: string;
  title: string | null;
  body: string;
  data: Record<string, unknown> | null;
}

/**
 * Fetch multiple content blocks by key prefix, with locale fallback.
 */
export async function getSiteContent(
  locale: Locale,
  keys: string[]
): Promise<Record<string, SiteContentBlock | null>> {
  const records = await prisma.siteContent.findMany({
    where: { key: { in: keys }, locale, isActive: true },
  });
  const map: Record<string, SiteContentBlock | null> = {};
  for (const key of keys) {
    const r = records.find((rec) => rec.key === key);
    map[key] = r
      ? {
          key: r.key,
          title: r.title,
          body: r.body,
          data: (r.data as Record<string, unknown> | null) ?? null,
        }
      : null;
  }
  return map;
}

export async function getSiteContentByKey(
  key: string,
  locale: Locale
): Promise<SiteContentBlock | null> {
  const r = await prisma.siteContent.findUnique({
    where: { key_locale: { key, locale } },
  });
  if (!r || !r.isActive) return null;
  return {
    key: r.key,
    title: r.title,
    body: r.body,
    data: (r.data as Record<string, unknown> | null) ?? null,
  };
}

export async function getAllSiteContent(
  locale: Locale
): Promise<SiteContentBlock[]> {
  const records = await prisma.siteContent.findMany({
    where: { locale, isActive: true },
    orderBy: { key: 'asc' },
  });
  return records.map((r) => ({
    key: r.key,
    title: r.title,
    body: r.body,
    data: (r.data as Record<string, unknown> | null) ?? null,
  }));
}
