import { prisma } from '@/lib/db/prisma';
import type { Locale } from '@/lib/i18n/config';
import { stripHtml } from '@/lib/utils/text';

/**
 * SiteContent row used to store the "О лицее" hero image.
 * The public_id (Cloudinary) or local path (`/uploads/...`) is stored in
 * the `data` JSON field under `image`. We keep the schema unchanged by
 * reusing the existing `data` column instead of adding a new one.
 */
export const ABOUT_HERO_KEY = 'about.hero_image';

export interface AboutHeroImage {
  /** Cloudinary public_id or `/uploads/...` path. */
  src: string;
  /** Optional caption shown in the lightbox. */
  caption?: string;
}

/**
 * Read the hero image for the public About section.
 *
 * Returns `null` when no image has been uploaded yet — callers should
 * fall back to a placeholder so the layout still renders correctly.
 */
export async function getAboutHeroImage(
  locale: Locale
): Promise<AboutHeroImage | null> {
  const record = await prisma.siteContent.findFirst({
    where: { key: ABOUT_HERO_KEY, locale, isActive: true },
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

/**
 * Save the hero image (called by admin actions). Creates or updates the
 * SiteContent row for the given locale.
 */
export async function setAboutHeroImage(
  locale: Locale,
  image: AboutHeroImage | null
): Promise<void> {
  if (image === null) {
    await prisma.siteContent.deleteMany({
      where: { key: ABOUT_HERO_KEY, locale },
    });
    return;
  }
  await prisma.siteContent.upsert({
    where: { key_locale: { key: ABOUT_HERO_KEY, locale } },
    create: {
      key: ABOUT_HERO_KEY,
      locale,
      title: image.caption ?? null,
      body: '',
      data: { image: image.src, caption: image.caption ?? null },
      isActive: true,
    },
    update: {
      title: image.caption ?? null,
      data: { image: image.src, caption: image.caption ?? null },
      isActive: true,
    },
  });
}

export interface AboutSectionPreview {
  /** Section key, e.g. "about.general". */
  key: string;
  /** Section title (from `SiteContent.title`), falls back to a default. */
  title: string;
  /** Plain-text preview (HTML stripped + truncated). */
  preview: string;
}

const DEFAULT_SECTION_LABELS: Record<string, string> = {
  'about.history': 'История',
  'about.general': 'Общая информация',
  'about.mission': 'Миссия и задачи',
  'about.features': 'Особенности обучения',
  'about.advantages': 'Преимущества',
  'about.environment': 'Образовательная среда',
};

/**
 * Get the first non-empty section for the homepage preview.
 *
 * Tries sections in narrative order (history → general → mission → …).
 * Used by the homepage "О лицее" block to render real content instead of
 * a placeholder, even before the user has edited the section.
 */
export async function getAboutSectionPreview(
  locale: Locale
): Promise<AboutSectionPreview | null> {
  const blocks = await prisma.siteContent.findMany({
    where: {
      locale,
      isActive: true,
      key: { startsWith: 'about.' },
      NOT: { key: ABOUT_HERO_KEY },
    },
    orderBy: { key: 'asc' },
  });

  // Prefer narrative order: history → general → mission → …
  const priority = [
    'about.history',
    'about.general',
    'about.mission',
    'about.features',
    'about.advantages',
    'about.environment',
  ];
  const byKey = new Map(blocks.map((b) => [b.key, b] as const));
  for (const key of priority) {
    const block = byKey.get(key);
    if (block && block.body.trim()) {
      const preview = stripHtml(block.body).trim();
      if (preview) {
        return {
          key,
          title: block.title?.trim() || DEFAULT_SECTION_LABELS[key] || key,
          preview,
        };
      }
    }
  }
  return null;
}