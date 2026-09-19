'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdmin, logAdminAction } from '@/server/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { parseImagesField } from '@/lib/forms';
import type { Locale } from '@prisma/client';

const TranslationSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  fullName: z.string().min(2).max(120),
  position: z.string().min(2).max(120),
  bio: z.string().max(2000).optional(),
  education: z.string().max(500).optional(),
});

const CreateSchema = z.object({
  photo: z.string().nullable().optional(),
  images: z.string().optional(), // comma-separated Cloudinary public_ids
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
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

export async function createAdministrator(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();
  let translations: any[];
  try { translations = JSON.parse(String(formData.get('translations') ?? '[]')); }
  catch { return { error: 'Ошибка в переводах' }; }

  const parsed = CreateSchema.safeParse({
    photo: formData.get('photo') || null,
    images: formData.get('images') || undefined,
    email: formData.get('email') || '',
    phone: formData.get('phone') || '',
    order: formData.get('order') || 0,
    isActive: formData.get('isActive') ?? true,
    translations,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };

  const a = await prisma.administrator.create({
    data: {
      photo: parsed.data.photo || null,
      images: parseImagesField(parsed.data.images),
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      order: parsed.data.order,
      isActive: parsed.data.isActive,
      translations: { create: parsed.data.translations.map((t) => ({
        locale: t.locale as Locale,
        fullName: t.fullName,
        position: t.position,
        bio: t.bio || null,
        education: t.education || null,
      })) },
    },
  });
  await logAdminAction(admin.id, 'administrator.create', 'administrator', a.id);
  revalidatePath('/admin/administration');
  revalidatePath('/ru/administration');
  redirect('/admin/administration');
}

export async function updateAdministrator(
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
    photo: formData.get('photo') || null,
    images: formData.get('images') || undefined,
    email: formData.get('email') || '',
    phone: formData.get('phone') || '',
    order: formData.get('order') || 0,
    isActive: formData.get('isActive') ?? true,
    translations,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };

  const updates: any = {
    photo: parsed.data.photo || null,
    images: parseImagesField(parsed.data.images),
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    order: parsed.data.order,
    isActive: parsed.data.isActive,
  };

  if (parsed.data.translations) {
    for (const t of parsed.data.translations) {
      await prisma.administratorTranslation.upsert({
        where: { administratorId_locale: { administratorId: id, locale: t.locale as Locale } },
        create: {
          administratorId: id,
          locale: t.locale as Locale,
          fullName: t.fullName,
          position: t.position,
          bio: t.bio || null,
          education: t.education || null,
        },
        update: {
          fullName: t.fullName,
          position: t.position,
          bio: t.bio || null,
          education: t.education || null,
        },
      });
    }
  }

  await prisma.administrator.update({ where: { id }, data: updates });
  await logAdminAction(admin.id, 'administrator.update', 'administrator', id);
  revalidatePath('/admin/administration');
  revalidatePath('/admin/administration/' + id);
  revalidatePath('/ru/administration');
  redirect('/admin/administration');
}

export async function deleteAdministrator(id: string): Promise<void> {
  const admin = await requireAdmin();
  const a = await prisma.administrator.findUnique({ where: { id } });
  if (!a) return;
  await prisma.administrator.delete({ where: { id } });
  if (a.photo) await deleteFromCloudinary(a.photo).catch(() => {});
  await logAdminAction(admin.id, 'administrator.delete', 'administrator', id);
  revalidatePath('/admin/administration');
  revalidatePath('/ru/administration');
}
