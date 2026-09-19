'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Save, Check, Sparkles, BookOpen, Building, Target, Award, Users, History } from 'lucide-react';
import { AdminInput, AdminTextarea } from '@/components/admin/AdminFormField';
import { saveAboutBlock, type FormState } from './actions';
import type { Locale } from '@prisma/client';
import { cn } from '@/lib/utils/cn';

type LocaleCode = 'ru' | 'uz' | 'en';

interface Props {
  keyName: string;
  label: string;
  /** Canonical icon for visual hierarchy. */
  iconKey: 'history' | 'general' | 'mission' | 'features' | 'advantages' | 'environment' | 'sparkles';
  /** Initial content for the 3 locales. Empty strings allowed. */
  initial: Record<LocaleCode, { title: string; body: string }>;
}

const ICONS = {
  history: History,
  general: Building,
  mission: Target,
  features: Sparkles,
  advantages: Award,
  environment: Users,
  sparkles: Sparkles,
} as const;

const LOCALES: { code: LocaleCode; flag: string; label: string }[] = [
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'uz', flag: '🇺🇿', label: 'Oʻzbekcha' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Save className="h-4 w-4" />
      {pending ? 'Сохранение…' : 'Сохранить секцию'}
    </button>
  );
}

export function SectionEditor({ keyName, label, iconKey, initial }: Props) {
  const Icon = ICONS[iconKey];
  const [state, action] = useFormState<FormState, FormData>(saveAboutBlock, {});

  return (
    <form action={action} className="card overflow-hidden">
      <input type="hidden" name="key" value={keyName} />

      {/* Section header */}
      <div className="flex items-center gap-3 border-b border-ink-100 bg-primary-50/40 px-6 py-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-800 text-accent-400">
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold text-primary-800">{label}</h2>
          <p className="text-xs text-ink-500">
            Заполните контент на нужных языках. Пустые локали не перезаписываются.
          </p>
        </div>
        <code className="hidden rounded-md bg-ink-100 px-2 py-1 font-mono text-xs text-ink-500 md:inline-block">
          {keyName}
        </code>
      </div>

      {state.ok && (
        <div className="m-6 mb-0 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" />
          Сохранено
        </div>
      )}
      {state.error && (
        <div className="m-6 mb-0 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {state.error}
        </div>
      )}

      {/* Locale columns */}
      <div className="grid gap-px bg-ink-100 sm:grid-cols-2 lg:grid-cols-3">
        {LOCALES.map((loc) => {
          const initialLoc = initial[loc.code];
          const fieldError = state.fieldErrors?.[`${loc.code}__body`];
          return (
            <div
              key={loc.code}
              className={cn(
                'flex flex-col gap-3 bg-white p-5',
                fieldError && 'ring-1 ring-rose-300'
              )}
            >
              <div className="flex items-center justify-between border-b border-ink-100 pb-2">
                <h3 className="font-semibold text-primary-800">
                  <span className="mr-1.5">{loc.flag}</span>
                  {loc.label}
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-ink-400">
                  {loc.code}
                </span>
              </div>

              <AdminInput
                label="Заголовок"
                name={`${loc.code}__title`}
                defaultValue={initialLoc.title}
                placeholder={`Заголовок (${loc.label})`}
              />
              <AdminTextarea
                label="Текст раздела"
                name={`${loc.code}__body`}
                defaultValue={initialLoc.body}
                rows={8}
                hint="Поддерживается HTML: <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>, <a href>"
              />
              {fieldError && (
                <p className="text-xs text-rose-600">{fieldError}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end border-t border-ink-100 bg-surface-alt/40 px-6 py-4">
        <SubmitButton />
      </div>
    </form>
  );
}