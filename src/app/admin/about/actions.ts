'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdmin, logAdminAction } from '@/server/auth';
import type { Locale } from '@prisma/client';
import { ABOUT_HERO_KEY, setAboutHeroImage } from '@/services/about-media.service';

export interface FormState {
  error?: string;
  ok?: boolean;
  /** Per-locale validation result for inline error display. */
  fieldErrors?: Record<string, string>;
}

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');
  return admin;
}

const LOCALES = ['ru', 'uz', 'en'] as const;
type LocaleCode = (typeof LOCALES)[number];

interface SectionPayload {
  key: string;
  locales: Partial<Record<LocaleCode, { title: string; body: string }>>;
}

/**
 * Save all 3 locales of a section in one Server Action.
 *
 * Each field is prefixed with `<locale>__title` or `<locale>__body` so a
 * single form submission carries every language at once. We then upsert
 * one SiteContent row per (key, locale).
 *
 * Per-locale validation: any locale with a non-empty body is saved;
 * empty bodies are kept as-is (not deleted) to preserve existing content.
 * Per-locale errors are returned to the form for inline display.
 */
export async function saveAboutBlock(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();
  const key = String(formData.get('key') ?? '').trim();
  if (!key) return { error: 'Не указан ключ секции' };

  const fieldErrors: Record<string, string> = {};
  const section: SectionPayload = { key, locales: {} };

  for (const locale of LOCALES) {
    const title = String(formData.get(`${locale}__title`) ?? '').trim();
    const body = String(formData.get(`${locale}__body`) ?? '').trim();
    // Body is required for any locale that's being edited. Title is optional.
    if (!body && title) {
      fieldErrors[`${locale}__body`] = 'Заполните текст или оставьте оба поля пустыми';
      continue;
    }
    if (!body && !title) {
      // Both empty: skip this locale (don't overwrite existing).
      continue;
    }
    section.locales[locale] = { title, body };
  }

  if (Object.keys(section.locales).length === 0) {
    return { error: 'Заполните хотя бы одну локаль (заголовок и/или текст)' };
  }

  // Persist each locale.
  for (const [locale, payload] of Object.entries(section.locales)) {
    if (!payload) continue;
    await prisma.siteContent.upsert({
      where: { key_locale: { key, locale: locale as Locale } },
      create: {
        key,
        locale: locale as Locale,
        title: payload.title ?? null,
        body: payload.body,
        isActive: true,
      },
      update: {
        title: payload.title ?? null,
        body: payload.body,
        isActive: true,
      },
    });
  }

  await logAdminAction(admin.id, 'about.save', 'about', key);
  revalidatePath('/admin/about');
  for (const loc of LOCALES) {
    revalidatePath(`/${loc}`);
    revalidatePath(`/${loc}/about`);
  }
  return { ok: true, fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined };
}

const LOCALES_HERO = ['ru', 'uz', 'en'] as const;

/**
 * Save (or remove) hero images for all 3 locales in one submission.
 *
 * Each field is prefixed with `<locale>__image` so a single form
 * submission carries all languages at once. Empty values for a locale
 * clear its SiteContent row (image removed from public site).
 */
export async function saveAboutHero(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();

  let anyChange = false;
  for (const locale of LOCALES_HERO) {
    const raw = formData.get(`${locale}__image`);
    const imageSrc = typeof raw === 'string' ? raw.trim() : '';
    if (!imageSrc) {
      // Empty for this locale → remove its hero row.
      await setAboutHeroImage(locale as Locale, null);
      anyChange = true;
    } else {
      await setAboutHeroImage(locale as Locale, { src: imageSrc, caption: '' });
      anyChange = true;
    }
  }

  if (!anyChange) {
    return { error: 'Загрузите хотя бы одно фото' };
  }

  await logAdminAction(admin.id, 'about.hero.save', 'about', ABOUT_HERO_KEY);
  revalidatePath('/admin/about');
  for (const loc of LOCALES_HERO) {
    revalidatePath(`/${loc}`);
    revalidatePath(`/${loc}/about`);
  }
  return { ok: true };
}
