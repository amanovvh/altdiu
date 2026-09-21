import { prisma } from '@/lib/db/prisma';
import type { Locale } from '@/lib/i18n/config';

/**
 * SiteContent row used to store the homepage hero background image.
 *
 * Same pattern as `about.hero_image` (see about-media.service.ts) — the
 * `data` JSON column holds `{ image: string, caption?: string }`. We reuse
 * the existing schema instead of adding new columns.
 *
 * The image is normally uploaded to Vercel Blob via /admin/about (or via
 * the seed endpoint below for one-off setup). Once written here, the
 * homepage automatically picks it up — no rebuild needed, because the
 * URL is read at request time from the DB.
 */
export const HOME_HERO_KEY = 'home.hero_image';

export interface HomeHeroImage {
  /** Vercel Blob absolute URL (or `/uploads/...` path or Cloudinary id). */
  src: string;
  /** Optional caption / alt text. */
  caption?: string;
}

export async function getHomeHeroImage(
  locale: Locale
): Promise<HomeHeroImage | null> {
  const record = await prisma.siteContent.findFirst({
    where: { key: HOME_HERO_KEY, locale, isActive: true },
  });
  if (!record) return null;
  const data = (record.data as Record<string, unknown> | null) ?? null;
  const src = typeof data?.image === 'string' ? data.image : null;
  if (!src) return null;
  const caption =
    typeof data?.caption === 'string'
      ? data.caption
      : record.title ?? undefined;
  return { src, caption };
}

export async function setHomeHeroImage(
  locale: Locale,
  image: HomeHeroImage | null
): Promise<void> {
  if (image === null) {
    await prisma.siteContent.deleteMany({
      where: { key: HOME_HERO_KEY, locale },
    });
    return;
  }

  const data = { image: image.src, caption: image.caption ?? null };
  await prisma.siteContent.upsert({
    where: { key_locale: { key: HOME_HERO_KEY, locale } },
    create: {
      key: HOME_HERO_KEY,
      locale,
      title: image.caption ?? null,
      body: '',
      data,
      isActive: true,
    },
    update: {
      title: image.caption ?? null,
      data,
      isActive: true,
    },
  });
}
