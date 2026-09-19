'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import { UserPlus, Check, X } from 'lucide-react';
import { AdminInput, AdminSelect } from '@/components/admin/AdminFormField';
import { createUser } from './actions';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <UserPlus className="h-4 w-4" />
      {pending ? 'Создание…' : 'Создать'}
    </button>
  );
}

export function CreateUserForm() {
  const [state, action] = useFormState(createUser, {});
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary"
      >
        <UserPlus className="h-4 w-4" />
        Добавить пользователя
      </button>
    );
  }

  return (
    <form action={action} className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-primary-800">
          Новый администратор
        </h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded p-1 text-ink-400 hover:bg-ink-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {state.ok && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> Создан
        </div>
      )}
      {state.error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <AdminInput label="Email" name="email" type="email" required autoComplete="off" />
        <AdminInput label="Имя" name="name" placeholder="Иван Иванов" />
        <AdminInput label="Пароль" name="password" type="password" required autoComplete="new-password" hint="Минимум 8 символов" />
        <AdminSelect
          label="Роль"
          name="role"
          defaultValue="EDITOR"
          options={[
            { value: 'EDITOR', label: 'Editor — редактор контента' },
            { value: 'ADMIN', label: 'Admin — управление пользователями' },
            { value: 'SUPER_ADMIN', label: 'Super Admin — полный доступ' },
          ]}
        />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Отмена
        </button>
        <SubmitBtn />
      </div>
    </form>
  );
}
