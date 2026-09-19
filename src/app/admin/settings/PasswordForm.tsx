'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Lock, Check } from 'lucide-react';
import { AdminInput } from '@/components/admin/AdminFormField';
import { changePassword } from './actions';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Lock className="h-4 w-4" />
      {pending ? 'Смена…' : 'Сменить пароль'}
    </button>
  );
}

export function PasswordForm() {
  const [state, action] = useFormState(changePassword, {});
  return (
    <form action={action} className="space-y-4">
      {state.ok && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> Пароль изменён
        </div>
      )}
      {state.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {state.error}
        </div>
      )}
      <AdminInput label="Текущий пароль" name="currentPassword" type="password" required autoComplete="current-password" />
      <AdminInput label="Новый пароль" name="newPassword" type="password" required autoComplete="new-password" hint="Минимум 8 символов" />
      <AdminInput label="Подтверждение" name="confirmPassword" type="password" required autoComplete="new-password" />
      <div className="flex justify-end">
        <SubmitBtn />
      </div>
    </form>
  );
}
