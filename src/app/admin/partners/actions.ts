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
  name: z.string().min(2).max(200),
  description: z.string().max(500).optional(),
});

const CreateSchema = z.object({
  logo: z.string().nullable().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  category: z.string().optional(),
  order: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
  translations: z.array(TranslationSchema).min(1),
});

/** Parse newline-separated URLs from the gallery hidden input. */
function parsePhotos(formData: FormData): string[] {
  const raw = String(formData.get('photos') ?? '').trim();
  if (!raw) return [];
  return raw.split('\n').map((s) => s.trim()).filter(Boolean);
}

export interface FormState {
  error?: string;
}

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');
  return admin;
}

export async function createPartner(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();
  let translations: any[];
  try { translations = JSON.parse(String(formData.get('translations') ?? '[]')); }
  catch { return { error: 'Ошибка в переводах' }; }

  const parsed = CreateSchema.safeParse({
    logo: formData.get('logo') || null,
    websiteUrl: formData.get('websiteUrl') || '',
    category: formData.get('category') || undefined,
    order: formData.get('order') || 0,
    isActive: formData.get('isActive') ?? true,
    translations,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };

  const photos = parsePhotos(formData);
  const documentUrl = String(formData.get('documentUrl') ?? '').trim() || null;
  const documentDescription = String(formData.get('documentDescription') ?? '').trim() || null;

  const partner = await prisma.partner.create({
    data: {
      logo: parsed.data.logo || null,
      websiteUrl: parsed.data.websiteUrl || null,
      category: parsed.data.category || null,
      photos,
      documentUrl,
      documentDescription,
      order: parsed.data.order,
      isActive: parsed.data.isActive,
      translations: { create: parsed.data.translations.map((t) => ({
        locale: t.locale as Locale,
        name: t.name,
        description: t.description || null,
      })) },
    },
  });
  await logAdminAction(admin.id, 'partner.create', 'partner', partner.id);
  revalidatePath('/admin/partners');
  revalidatePath('/ru');
  revalidatePath('/ru/community');
  redirect('/admin/partners');
}

export async function updatePartner(
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
    logo: formData.get('logo') || null,
    websiteUrl: formData.get('websiteUrl') || '',
    category: formData.get('category') || undefined,
    order: formData.get('order') || 0,
    isActive: formData.get('isActive') ?? true,
    translations,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };

  const updates: any = {
    logo: parsed.data.logo || null,
    websiteUrl: parsed.data.websiteUrl || null,
    category: parsed.data.category || null,
    photos: parsePhotos(formData),
    documentUrl: String(formData.get('documentUrl') ?? '').trim() || null,
    documentDescription: String(formData.get('documentDescription') ?? '').trim() || null,
    order: parsed.data.order,
    isActive: parsed.data.isActive,
  };

  if (parsed.data.translations) {
    for (const t of parsed.data.translations) {
      await prisma.partnerTranslation.upsert({
        where: { partnerId_locale: { partnerId: id, locale: t.locale as Locale } },
        create: { partnerId: id, locale: t.locale as Locale, name: t.name, description: t.description || null },
        update: { name: t.name, description: t.description || null },
      });
    }
  }

  await prisma.partner.update({ where: { id }, data: updates });
  await logAdminAction(admin.id, 'partner.update', 'partner', id);
  revalidatePath('/admin/partners');
  revalidatePath('/admin/partners/' + id);
  revalidatePath('/ru');
  revalidatePath('/ru/community');
  redirect('/admin/partners');
}

export async function deletePartner(id: string): Promise<void> {
  const admin = await requireAdmin();
  const p = await prisma.partner.findUnique({ where: { id } });
  if (!p) return;
  await prisma.partner.delete({ where: { id } });
  if (p.logo) await deleteFromCloudinary(p.logo).catch(() => {});
  await logAdminAction(admin.id, 'partner.delete', 'partner', id);
  revalidatePath('/admin/partners');
  revalidatePath('/ru/community');
}
