'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { loginAction, type LoginState } from './actions';

interface Props {
  redirect?: string;
  configError?: boolean;
}

const initial: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full justify-center disabled:opacity-60"
    >
      {pending ? 'Вход…' : 'Войти'}
    </button>
  );
}

export function LoginForm({ redirect, configError }: Props) {
  const [state, formAction] = useFormState(loginAction, initial);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {redirect && <input type="hidden" name="redirect" value={redirect} />}

      {configError && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Сервер не настроен</p>
            <p className="mt-1 text-xs text-rose-600">
              Переменная <code className="rounded bg-rose-100 px-1">NEXTAUTH_SECRET</code> не
              задана или слишком короткая. Добавьте её в <code>.env</code>.
            </p>
          </div>
        </div>
      )}

      {state.error && !configError && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{state.error}</p>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary-800">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            autoFocus
            defaultValue={state.fields?.email ?? ''}
            className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-10 pr-3 text-sm text-primary-900 placeholder:text-ink-400 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-200"
            placeholder="admin@lyceum.uz"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary-800">
          Пароль
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-10 pr-10 text-sm text-primary-900 placeholder:text-ink-400 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-200"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <SubmitButton />

      <p className="text-center text-xs text-ink-500">
        Доступ только для авторизованных администраторов.
      </p>
    </form>
  );
}
