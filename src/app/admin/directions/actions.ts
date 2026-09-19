'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdmin, logAdminAction } from '@/server/auth';
import { slug as slugify } from '@/lib/utils/text';
import type { Locale } from '@prisma/client';

const TranslationSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  title: z.string().min(2).max(200),
  shortTitle: z.string().max(100).optional(),
  description: z.string().min(2),
  highlights: z.array(z.string()).default([]),
});

const CreateSchema = z.object({
  slug: z.string().min(1).max(60),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
  subjects: z.string().default(''),
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

export async function createDirection(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();
  let translations: any[];
  try { translations = JSON.parse(String(formData.get('translations') ?? '[]')); }
  catch { return { error: 'Ошибка в переводах' }; }

  const parsed = CreateSchema.safeParse({
    slug: formData.get('slug'),
    icon: formData.get('icon') || undefined,
    color: formData.get('color') || undefined,
    order: formData.get('order') || 0,
    isActive: formData.get('isActive') ?? true,
    subjects: formData.get('subjects') || '',
    translations,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };

  const subjects = parsed.data.subjects.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);

  const d = await prisma.direction.create({
    data: {
      slug: parsed.data.slug,
      icon: parsed.data.icon || null,
      color: parsed.data.color || null,
      order: parsed.data.order,
      isActive: parsed.data.isActive,
      translations: { create: parsed.data.translations.map((t) => ({
        locale: t.locale as Locale,
        title: t.title,
        shortTitle: t.shortTitle || null,
        description: t.description,
        highlights: t.highlights,
      })) },
      subjects: { create: subjects.map((name, idx) => ({ name, order: idx })) },
    },
  });
  await logAdminAction(admin.id, 'direction.create', 'direction', d.id);
  revalidatePath('/admin/directions');
  revalidatePath('/ru/directions');
  redirect('/admin/directions');
}

export async function deleteDirection(id: string): Promise<void> {
  const admin = await requireAdmin();
  await prisma.direction.delete({ where: { id } });
  await logAdminAction(admin.id, 'direction.delete', 'direction', id);
  revalidatePath('/admin/directions');
  revalidatePath('/ru/directions');
}
