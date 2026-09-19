'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdmin, hashPassword, logAdminAction } from '@/server/auth';
import type { AdminRole } from '@prisma/client';

const CreateSchema = z.object({
  email: z.string().email().max(200),
  name: z.string().min(2).max(100).optional(),
  password: z.string().min(8).max(200),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']).default('EDITOR'),
});

export interface UserFormState {
  error?: string;
  ok?: boolean;
}

async function requireSuperAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');
  if (admin.role !== 'SUPER_ADMIN') throw new Error('Forbidden');
  return admin;
}

export async function createUser(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const admin = await requireSuperAdmin();
  const parsed = CreateSchema.safeParse({
    email: String(formData.get('email') ?? '').toLowerCase().trim(),
    name: formData.get('name') || undefined,
    password: formData.get('password'),
    role: formData.get('role') ?? 'EDITOR',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };

  const existing = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } as any });
  if (existing) return { error: 'Email уже используется' };

  const passwordHash = await hashPassword(parsed.data.password);
  const u = await prisma.adminUser.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name ?? null,
      passwordHash,
      role: parsed.data.role as AdminRole,
    } as any,
  });
  await logAdminAction(admin.id, 'user.create', 'user', u.id);
  revalidatePath('/admin/users');
  return { ok: true };
}

export async function toggleUserActive(id: string): Promise<void> {
  const admin = await requireSuperAdmin();
  if (admin.id === id) return; // can't deactivate self
  const u = await prisma.adminUser.findUnique({ where: { id } });
  if (!u) return;
  await prisma.adminUser.update({ where: { id }, data: { isActive: !u.isActive } });
  await logAdminAction(admin.id, 'user.toggle', 'user', id);
  revalidatePath('/admin/users');
}

export async function deleteUser(id: string): Promise<void> {
  const admin = await requireSuperAdmin();
  if (admin.id === id) return;
  await prisma.adminUser.delete({ where: { id } });
  await logAdminAction(admin.id, 'user.delete', 'user', id);
  revalidatePath('/admin/users');
}

const ResetPasswordSchema = z.object({
  id: z.string(),
  newPassword: z.string().min(8).max(200),
});

export async function resetUserPassword(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const admin = await requireSuperAdmin();
  const parsed = ResetPasswordSchema.safeParse({
    id: formData.get('id'),
    newPassword: formData.get('newPassword'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };

  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.adminUser.update({
    where: { id: parsed.data.id },
    data: { passwordHash: newHash } as any,
  });
  await logAdminAction(admin.id, 'user.password-reset', 'user', parsed.data.id);
  return { ok: true };
}
