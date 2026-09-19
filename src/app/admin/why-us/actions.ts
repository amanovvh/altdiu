'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdmin, logAdminAction } from '@/server/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import type { Locale } from '@prisma/client';

const TranslationSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  title: z.string().min(2).max(200),
  description: z.string().min(2).max(500),
});

const CreateSchema = z.object({
  icon: z.string().optional(),
  image: z.string().nullable().optional(),
  order: z.coerce.number().int().default(0),
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

export async function createWhyUsCard(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();
  let translations: any[];
  try { translations = JSON.parse(String(formData.get('translations') ?? '[]')); }
  catch { return { error: 'Ошибка в переводах' }; }

  const parsed = CreateSchema.safeParse({
    icon: formData.get('icon') || undefined,
    image: formData.get('image') || null,
    order: formData.get('order') || 0,
    isActive: formData.get('isActive') ?? true,
    translations,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };

  const card = await prisma.whyChooseUsCard.create({
    data: {
      icon: parsed.data.icon || null,
      image: parsed.data.image || null,
      order: parsed.data.order,
      isActive: parsed.data.isActive,
      translations: { create: parsed.data.translations.map((t) => ({
        locale: t.locale as Locale,
        title: t.title,
        description: t.description,
      })) },
    },
  });
  await logAdminAction(admin.id, 'whyUs.create', 'whyChooseUsCard', card.id);
  revalidatePath('/admin/why-us');
  revalidatePath('/ru');
  revalidatePath('/ru/why-us');
  redirect('/admin/why-us');
}

export async function updateWhyUsCard(
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
    icon: formData.get('icon') || undefined,
    image: formData.get('image') || null,
    order: formData.get('order') || 0,
    isActive: formData.get('isActive') ?? true,
    translations,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };

  const updates: any = {
    icon: parsed.data.icon || null,
    image: parsed.data.image || null,
    order: parsed.data.order,
    isActive: parsed.data.isActive,
  };

  if (parsed.data.translations) {
    for (const t of parsed.data.translations) {
      await prisma.whyChooseUsCardTranslation.upsert({
        where: { cardId_locale: { cardId: id, locale: t.locale as Locale } },
        create: { cardId: id, locale: t.locale as Locale, title: t.title, description: t.description },
        update: { title: t.title, description: t.description },
      });
    }
  }

  await prisma.whyChooseUsCard.update({ where: { id }, data: updates });
  await logAdminAction(admin.id, 'whyUs.update', 'whyChooseUsCard', id);
  revalidatePath('/admin/why-us');
  revalidatePath('/admin/why-us/' + id);
  revalidatePath('/ru');
  revalidatePath('/ru/why-us');
  redirect('/admin/why-us');
}

export async function deleteWhyUsCard(id: string): Promise<void> {
  const admin = await requireAdmin();
  const card = await prisma.whyChooseUsCard.findUnique({ where: { id } });
  if (!card) return;
  await prisma.whyChooseUsCard.delete({ where: { id } });
  if (card.image) await deleteFromCloudinary(card.image).catch(() => {});
  await logAdminAction(admin.id, 'whyUs.delete', 'whyChooseUsCard', id);
  revalidatePath('/admin/why-us');
  revalidatePath('/ru');
  revalidatePath('/ru/why-us');
}
