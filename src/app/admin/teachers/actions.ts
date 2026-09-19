'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdmin, logAdminAction } from '@/server/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import type { Locale, TeacherCategory } from '@prisma/client';

const TranslationSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  fullName: z.string().min(2).max(120),
  subject: z.string().min(2).max(120),
  position: z.string().max(120).optional(),
  education: z.string().max(500).optional(),
  bio: z.string().max(2000).optional(),
});

const CreateSchema = z.object({
  photo: z.string().nullable().optional(),
  category: z.enum([
    'ECONOMICS',
    'LANGUAGES',
    'MATHEMATICS',
    'NATURAL_SCIENCES',
    'HUMANITIES',
    'OTHER',
  ]).default('OTHER'),
  order: z.coerce.number().int().default(0),
  email: z.string().email().optional().or(z.literal('')),
  isActive: z.coerce.boolean().default(true),
  translations: z.array(TranslationSchema).min(1),
});

export interface TeacherFormState {
  error?: string;
}

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');
  return admin;
}

export async function createTeacher(
  _prev: TeacherFormState,
  formData: FormData
): Promise<TeacherFormState> {
  const admin = await requireAdmin();
  let translations: any[];
  try {
    translations = JSON.parse(String(formData.get('translations') ?? '[]'));
  } catch {
    return { error: 'Ошибка в данных переводов' };
  }

  const parsed = CreateSchema.safeParse({
    photo: formData.get('photo') || null,
    category: formData.get('category') || 'OTHER',
    order: formData.get('order') || 0,
    email: formData.get('email') || '',
    isActive: formData.get('isActive') ?? true,
    translations,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' };
  }

  const teacher = await prisma.teacher.create({
    data: {
      photo: parsed.data.photo || null,
      category: parsed.data.category as TeacherCategory,
      order: parsed.data.order,
      email: parsed.data.email || null,
      isActive: parsed.data.isActive,
      translations: {
        create: parsed.data.translations.map((t) => ({
          locale: t.locale as Locale,
          fullName: t.fullName,
          subject: t.subject,
          position: t.position || null,
          education: t.education || null,
          bio: t.bio || null,
        })),
      },
    },
  });
  await logAdminAction(admin.id, 'teacher.create', 'teacher', teacher.id);
  revalidatePath('/admin/teachers');
  revalidatePath('/ru/teachers');
  redirect('/admin/teachers');
}

const UpdateSchema = CreateSchema.partial({ translations: true }).extend({
  id: z.string(),
});

export async function updateTeacher(
  id: string,
  _prev: TeacherFormState,
  formData: FormData
): Promise<TeacherFormState> {
  const admin = await requireAdmin();
  let translations: any[] | undefined;
  const trRaw = formData.get('translations');
  if (typeof trRaw === 'string' && trRaw.length > 0) {
    try {
      translations = JSON.parse(trRaw);
    } catch {
      return { error: 'Ошибка в данных переводов' };
    }
  }

  const parsed = UpdateSchema.safeParse({
    id,
    photo: formData.get('photo') || null,
    category: formData.get('category') || 'OTHER',
    order: formData.get('order') || 0,
    email: formData.get('email') || '',
    isActive: formData.get('isActive') ?? true,
    translations,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' };
  }

  const updates: any = {
    photo: parsed.data.photo || null,
    category: parsed.data.category,
    order: parsed.data.order,
    email: parsed.data.email || null,
    isActive: parsed.data.isActive,
  };

  if (parsed.data.translations) {
    for (const tr of parsed.data.translations) {
      await prisma.teacherTranslation.upsert({
        where: {
          teacherId_locale: { teacherId: id, locale: tr.locale as Locale },
        },
        create: {
          teacherId: id,
          locale: tr.locale as Locale,
          fullName: tr.fullName,
          subject: tr.subject,
          position: tr.position || null,
          education: tr.education || null,
          bio: tr.bio || null,
        },
        update: {
          fullName: tr.fullName,
          subject: tr.subject,
          position: tr.position || null,
          education: tr.education || null,
          bio: tr.bio || null,
        },
      });
    }
  }

  await prisma.teacher.update({ where: { id }, data: updates });
  await logAdminAction(admin.id, 'teacher.update', 'teacher', id);
  revalidatePath('/admin/teachers');
  revalidatePath('/admin/teachers/' + id);
  revalidatePath('/ru/teachers');
  redirect('/admin/teachers');
}

export async function deleteTeacher(id: string): Promise<void> {
  const admin = await requireAdmin();
  const t = await prisma.teacher.findUnique({ where: { id } });
  if (!t) return;
  await prisma.teacher.delete({ where: { id } });
  if (t.photo) await deleteFromCloudinary(t.photo).catch(() => {});
  await logAdminAction(admin.id, 'teacher.delete', 'teacher', id);
  revalidatePath('/admin/teachers');
  revalidatePath('/ru/teachers');
}

export async function toggleTeacherActive(id: string): Promise<void> {
  const admin = await requireAdmin();
  const t = await prisma.teacher.findUnique({ where: { id } });
  if (!t) return;
  await prisma.teacher.update({
    where: { id },
    data: { isActive: !t.isActive },
  });
  await logAdminAction(admin.id, 'teacher.toggle', 'teacher', id);
  revalidatePath('/admin/teachers');
}
