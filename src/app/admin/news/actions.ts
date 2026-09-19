'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdmin, logAdminAction } from '@/server/auth';
import { slug as slugifyText, plainExcerpt } from '@/lib/utils/text';
import { parseImagesField } from '@/lib/forms';
import type { Locale, NewsStatus } from '@prisma/client';

const TranslationSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  title: z.string().min(2).max(200),
  excerpt: z.string().max(500).optional(),
  body: z.string().min(2),
});

const CreateNewsSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  isPinned: z.coerce.boolean().default(false),
  category: z.string().optional(),
  coverImage: z.string().nullable().optional(),
  images: z.string().optional(), // comma-separated Cloudinary public_ids
  publishedAt: z.string().optional(),
  translations: z.array(TranslationSchema).min(1),
});

export interface NewsFormState {
  error?: string;
}

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');
  return admin;
}
export async function createNews(
  _prev: NewsFormState,
  formData: FormData
): Promise<NewsFormState> {
  const admin = await requireAdmin();

  let translations: any[] = [];
  try {
    translations = JSON.parse(String(formData.get('translations') ?? '[]'));
  } catch {
    return { error: 'Ошибка в данных переводов' };
  }

  const parsed = CreateNewsSchema.safeParse({
    status: formData.get('status') ?? 'DRAFT',
    isPinned: formData.get('isPinned') ?? false,
    category: formData.get('category') || undefined,
    coverImage: formData.get('coverImage') || null,
    images: formData.get('images') || undefined,
    publishedAt: formData.get('publishedAt') || undefined,
    translations,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' };
  }

  const primary = parsed.data.translations[0];
  const baseSlug = slugifyText(primary.title, primary.locale);
  let newsSlug = baseSlug;
  let n = 1;
  while (await prisma.news.findUnique({ where: { slug: newsSlug } })) {
    newsSlug = `${baseSlug}-${n++}`;
  }

  const news = await prisma.news.create({
    data: {
      slug: newsSlug,
      status: parsed.data.status as NewsStatus,
      isPinned: parsed.data.isPinned,
      category: parsed.data.category ?? null,
      coverImage: parsed.data.coverImage || null,
      images: parseImagesField(parsed.data.images),
      publishedAt: parsed.data.publishedAt
        ? new Date(parsed.data.publishedAt)
        : parsed.data.status === 'PUBLISHED'
          ? new Date()
          : null,
      translations: {
        create: parsed.data.translations.map((t, idx) => ({
          locale: t.locale as Locale,
          title: t.title,
          excerpt: t.excerpt || plainExcerpt(t.body, 220),
          body: t.body,
          slug: idx === 0 ? newsSlug : `${newsSlug}-${t.locale}`,
        })),
      },
    },
  });

  await logAdminAction(admin.id, 'news.create', 'news', news.id);
  revalidatePath('/admin/news');
  revalidatePath('/ru');
  revalidatePath('/ru/news');
  redirect('/admin/news');
}

const UpdateNewsSchema = z.object({
  id: z.string(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  isPinned: z.coerce.boolean().optional(),
  category: z.string().optional(),
  coverImage: z.string().nullable().optional(),
  images: z.string().optional(),
  publishedAt: z.string().nullable().optional(),
  translations: z.array(TranslationSchema).optional(),
});

export async function updateNews(
  id: string,
  _prev: NewsFormState,
  formData: FormData
): Promise<NewsFormState> {
  const admin = await requireAdmin();

  let translations: any[] | undefined = undefined;
  const trRaw = formData.get('translations');
  if (typeof trRaw === 'string' && trRaw.length > 0) {
    try {
      translations = JSON.parse(trRaw);
    } catch {
      return { error: 'Ошибка в данных переводов' };
    }
  }

  const parsed = UpdateNewsSchema.safeParse({
    id,
    status: formData.get('status') || undefined,
    isPinned: formData.get('isPinned') ?? undefined,
    category: formData.get('category') || undefined,
    coverImage: formData.get('coverImage') || undefined,
    images: formData.get('images') || undefined,
    publishedAt: formData.get('publishedAt') || undefined,
    translations,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' };
  }

  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) return { error: 'Новость не найдена' };

  const updates: any = {};
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.isPinned !== undefined) updates.isPinned = parsed.data.isPinned;
  if (parsed.data.category !== undefined) updates.category = parsed.data.category;
  if (parsed.data.coverImage !== undefined) updates.coverImage = parsed.data.coverImage;
  if (parsed.data.images !== undefined)
    updates.images = parseImagesField(parsed.data.images);
  if (parsed.data.publishedAt !== undefined) {
    updates.publishedAt = parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null;
  }

  if (parsed.data.translations) {
    for (const tr of parsed.data.translations) {
      await prisma.newsTranslation.upsert({
        where: {
          newsId_locale: { newsId: id, locale: tr.locale as Locale },
        },
        create: {
          newsId: id,
          locale: tr.locale as Locale,
          title: tr.title,
          excerpt: tr.excerpt || plainExcerpt(tr.body, 220),
          body: tr.body,
          slug: `${existing.slug}-${tr.locale}`,
        },
        update: {
          title: tr.title,
          excerpt: tr.excerpt || plainExcerpt(tr.body, 220),
          body: tr.body,
        },
      });
    }
  }

  await prisma.news.update({ where: { id }, data: updates });
  await logAdminAction(admin.id, 'news.update', 'news', id);
  revalidatePath('/admin/news');
  revalidatePath('/admin/news/' + id);
  revalidatePath('/ru');
  revalidatePath('/ru/news');
  redirect('/admin/news');
}

export async function togglePublishNews(id: string): Promise<void> {
  const admin = await requireAdmin();
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) return;
  const newStatus = news.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
  await prisma.news.update({
    where: { id },
    data: {
      status: newStatus,
      publishedAt: newStatus === 'PUBLISHED' ? news.publishedAt ?? new Date() : news.publishedAt,
    },
  });
  await logAdminAction(admin.id, `news.${newStatus.toLowerCase()}`, 'news', id);
  revalidatePath('/admin/news');
}

export async function togglePinNews(id: string): Promise<void> {
  const admin = await requireAdmin();
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) return;
  await prisma.news.update({
    where: { id },
    data: { isPinned: !news.isPinned },
  });
  await logAdminAction(admin.id, 'news.pin-toggle', 'news', id);
  revalidatePath('/admin/news');
}

export async function deleteNews(id: string): Promise<void> {
  const admin = await requireAdmin();
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) return;
  await prisma.news.delete({ where: { id } });
  await logAdminAction(admin.id, 'news.delete', 'news', id);
  revalidatePath('/admin/news');
  revalidatePath('/ru');
  revalidatePath('/ru/news');
}
