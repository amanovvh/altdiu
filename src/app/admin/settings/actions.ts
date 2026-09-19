'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdmin, hashPassword, verifyPassword, logAdminAction } from '@/server/auth';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Минимум 8 символов').max(200),
  confirmPassword: z.string().min(1),
});

export interface PasswordFormState {
  error?: string;
  ok?: boolean;
}

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');
  return admin;
}

export async function changePassword(
  _prev: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const admin = await requireAdmin();
  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };
  }
  if (parsed.data.newPassword !== parsed.data.confirmPassword) {
    return { error: 'Новый пароль и подтверждение не совпадают' };
  }

  const ok = await verifyPassword(parsed.data.currentPassword, admin.passwordHash);
  if (!ok) return { error: 'Неверный текущий пароль' };

  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: newHash } as any,
  });
  await logAdminAction(admin.id, 'auth.password-change');
  return { ok: true };
}

const StatsSchema = z.object({
  years: z.coerce.number().int().min(0),
  students: z.coerce.number().int().min(0),
  teachers: z.coerce.number().int().min(0),
  graduates: z.coerce.number().int().min(0),
});

export interface StatsFormState {
  error?: string;
  ok?: boolean;
}

export async function saveStats(
  _prev: StatsFormState,
  formData: FormData
): Promise<StatsFormState> {
  const admin = await requireAdmin();
  const parsed = StatsSchema.safeParse({
    years: formData.get('years'),
    students: formData.get('students'),
    teachers: formData.get('teachers'),
    graduates: formData.get('graduates'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };

  await prisma.siteSetting.upsert({
    where: { key: 'hero.stats' },
    create: { key: 'hero.stats', value: parsed.data },
    update: { value: parsed.data },
  });
  await logAdminAction(admin.id, 'settings.stats');
  revalidatePath('/admin/settings');
  revalidatePath('/ru');
  return { ok: true };
}
