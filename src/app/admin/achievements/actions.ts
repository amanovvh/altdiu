'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdmin, logAdminAction } from '@/server/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { parseImagesField } from '@/lib/forms';
import type { Locale, AchievementCategory } from '@prisma/client';

const TranslationSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
});

const CreateSchema = z.object({
  category: z.enum(['OLYMPIAD', 'CERTIFICATE', 'COMPETITION', 'SPORT', 'OTHER']),
  image: z.string().nullable().optional(),
  images: z.string().optional(), // comma-separated Cloudinary public_ids
  date: z.string(),
  isActive: z.coerce.boolean().default(true),
  translations: z.array(TranslationSchema).min(1),
});

export interface FormState {
  error?: string;
}

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');
  return admin;
}

export async function createAchievement(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();
  let translations: any[];
  try { translations = JSON.parse(String(formData.get('translations') ?? '[]')); }
  catch { return { error: 'Ошибка в переводах' }; }

  const parsed = CreateSchema.safeParse({
    category: formData.get('category'),
    image: formData.get('image') || null,
    images: formData.get('images') || undefined,
    date: formData.get('date'),
    isActive: formData.get('isActive') ?? true,
    translations,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };

  const a = await prisma.achievement.create({
    data: {
      category: parsed.data.category as AchievementCategory,
      image: parsed.data.image || null,
      images: parseImagesField(parsed.data.images),
      date: new Date(parsed.data.date),
      isActive: parsed.data.isActive,
      translations: { create: parsed.data.translations.map((t) => ({
        locale: t.locale as Locale,
        title: t.title,
        description: t.description || null,
      })) },
    },
  });
  await logAdminAction(admin.id, 'achievement.create', 'achievement', a.id);
  revalidatePath('/admin/achievements');
  revalidatePath('/ru/achievements');
  redirect('/admin/achievements');
}

export async function updateAchievement(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();
  let translations: any[] | undefined;
  const tr = formData.get('translations');
  if (typeof tr === 'string' && tr.length > 0) {
    try { translations = JSON.parse(tr); } catch { return { error: 'Ошибка в переводах' }; }
  }
  const parsed = CreateSchema.safeParse({
    category: formData.get('category'),
    image: formData.get('image') || null,
    images: formData.get('images') || undefined,
    date: formData.get('date'),
    isActive: formData.get('isActive') ?? true,
    translations,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };

  const updates: any = {
    category: parsed.data.category as AchievementCategory,
    image: parsed.data.image || null,
    images: parseImagesField(parsed.data.images),
    date: new Date(parsed.data.date),
    isActive: parsed.data.isActive,
  };

  if (parsed.data.translations) {
    for (const t of parsed.data.translations) {
      await prisma.achievementTranslation.upsert({
        where: { achievementId_locale: { achievementId: id, locale: t.locale as Locale } },
        create: { achievementId: id, locale: t.locale as Locale, title: t.title, description: t.description || null },
        update: { title: t.title, description: t.description || null },
      });
    }
  }

  await prisma.achievement.update({ where: { id }, data: updates });
  await logAdminAction(admin.id, 'achievement.update', 'achievement', id);
  revalidatePath('/admin/achievements');
  redirect('/admin/achievements');
}

export async function deleteAchievement(id: string): Promise<void> {
  const admin = await requireAdmin();
  const a = await prisma.achievement.findUnique({ where: { id } });
  if (!a) return;
  await prisma.achievement.delete({ where: { id } });
  if (a.image) await deleteFromCloudinary(a.image).catch(() => {});
  await logAdminAction(admin.id, 'achievement.delete', 'achievement', id);
  revalidatePath('/admin/achievements');
  revalidatePath('/ru/achievements');
}

export async function toggleAchievementActive(id: string): Promise<void> {
  const admin = await requireAdmin();
  const a = await prisma.achievement.findUnique({ where: { id } });
  if (!a) return;
  await prisma.achievement.update({ where: { id }, data: { isActive: !a.isActive } });
  await logAdminAction(admin.id, 'achievement.toggle', 'achievement', id);
  revalidatePath('/admin/achievements');
}
