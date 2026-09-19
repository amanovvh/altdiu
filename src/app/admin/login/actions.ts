'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  authenticate,
  createSession,
  destroySession,
  checkLoginRate,
  recordFailedLogin,
  clearLoginAttempts,
  logAdminAction,
} from '@/server/auth';

const LoginSchema = z.object({
  email: z.string().email('Введите корректный email').max(200),
  password: z.string().min(1, 'Введите пароль').max(200),
  redirect: z.string().optional(),
});

export interface LoginState {
  error?: string;
  fields?: { email?: string };
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const raw = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    redirect: String(formData.get('redirect') ?? '/admin/dashboard'),
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Некорректные данные',
      fields: { email: raw.email },
    };
  }

  // Basic per-process rate limit (IP omitted because middleware already
  // protects the endpoint — this is an extra safety net).
  const rate = checkLoginRate('global');
  if (!rate.allowed) {
    return {
      error: `Слишком много попыток входа. Повторите через ${rate.retryIn} сек.`,
    };
  }

  const admin = await authenticate(parsed.data.email, parsed.data.password);
  if (!admin) {
    recordFailedLogin('global');
    return {
      error: 'Неверный email или пароль',
      fields: { email: raw.email },
    };
  }

  clearLoginAttempts('global');
  await createSession({ id: admin.id, email: admin.email, role: admin.role });
  await logAdminAction(admin.id, 'auth.login');

  // Only allow internal redirects
  const target = (parsed.data.redirect ?? '').startsWith('/admin')
    ? parsed.data.redirect!
    : '/admin/dashboard';
  redirect(target);
}

export async function logoutAction(): Promise<void> {
  const { getCurrentAdmin } = await import('@/server/auth');
  const admin = await getCurrentAdmin();
  if (admin) {
    await logAdminAction(admin.id, 'auth.logout');
  }
  destroySession();
  redirect('/admin/login');
}
