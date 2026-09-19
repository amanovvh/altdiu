'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { AdminInput, AdminTextarea } from '@/components/admin/AdminFormField';

type Locale = 'ru' | 'uz' | 'en';

interface Translation {
  locale: Locale;
  title: string;
  shortTitle: string;
  description: string;
  highlights: string[];
}

interface InitialValue {
  slug?: string;
  icon?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
  subjects?: string;
  translations?: Translation[];
}

interface Props {
  action: (prev: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  initial?: InitialValue;
  submitLabel?: string;
}

const LANGS = [
  { value: 'ru', label: '🇷🇺 Русский' },
  { value: 'uz', label: '🇺🇿 Oʻzbekcha' },
  { value: 'en', label: '🇬🇧 English' },
] as const;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Save className="h-4 w-4" />
      {pending ? 'Сохранение…' : label}
    </button>
  );
}

export function DirectionForm({ action, initial = {}, submitLabel = 'Сохранить' }: Props) {
  const [state, formAction] = useFormState(action, {});
  const [translations, setTranslations] = useState<Translation[]>(
    initial.translations && initial.translations.length > 0
      ? initial.translations
      : [{ locale: 'ru', title: '', shortTitle: '', description: '', highlights: [] }]
  );

  const addTranslation = () => {
    const used = new Set(translations.map((t) => t.locale));
    const next = LANGS.find((l) => !used.has(l.value));
    if (next) setTranslations([...translations, { locale: next.value, title: '', shortTitle: '', description: '', highlights: [] }]);
  };

  const removeTranslation = (idx: number) =>
    setTranslations(translations.filter((_, i) => i !== idx));

  const updateTranslation = (idx: number, field: keyof Translation, value: string | string[]) =>
    setTranslations((arr) => arr.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{state.error}</div>
      )}

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-primary-800">По языкам</h2>
          {translations.length < 3 && (
            <button type="button" onClick={addTranslation} className="btn-outline">
              <Plus className="h-4 w-4" /> Добавить язык
            </button>
          )}
        </div>
        <div className="space-y-6">
          {translations.map((t, idx) => (
            <div key={`${t.locale}-${idx}`} className="rounded-xl border border-ink-100 bg-surface-alt/40 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-primary-800">
                  {LANGS.find((l) => l.value === t.locale)?.label}
                </span>
                {translations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTranslation(idx)}
                    className="text-xs text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 className="mr-1 inline h-3 w-3" /> Удалить язык
                  </button>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminInput label="Название" name={`title_${t.locale}`} required
                  defaultValue={t.title}
                  onChange={(e) => updateTranslation(idx, 'title', (e.target as HTMLInputElement).value)} />
                <AdminInput label="Краткое название" name={`shortTitle_${t.locale}`}
                  defaultValue={t.shortTitle}
                  onChange={(e) => updateTranslation(idx, 'shortTitle', (e.target as HTMLInputElement).value)} />
                <div className="md:col-span-2">
                  <AdminTextarea label="Описание" name={`description_${t.locale}`} required
                    defaultValue={t.description} rows={4}
                    onChange={(e) => updateTranslation(idx, 'description', (e.target as HTMLTextAreaElement).value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <input type="hidden" name="translations" value={JSON.stringify(translations.map((t) => ({
          locale: t.locale,
          title: t.title,
          shortTitle: t.shortTitle || undefined,
          description: t.description,
          highlights: t.highlights,
        })))} />
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-primary-800">Параметры</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <AdminInput label="Slug (URL)" name="slug" required
            defaultValue={initial.slug ?? ''} placeholder="economics" hint="Только латиница, без пробелов" />
          <AdminInput label="Порядок" name="order" type="number"
            defaultValue={initial.order ?? 0} />
          <AdminInput label="Иконка (название lucide-react)" name="icon"
            defaultValue={initial.icon ?? 'trending-up'} />
          <AdminInput label="Цвет (HEX)" name="color" type="text"
            defaultValue={initial.color ?? '#0e2046'} />
          <div className="md:col-span-2">
            <AdminTextarea label="Предметы (по одному на строку)" name="subjects"
              defaultValue={initial.subjects ?? ''} rows={3} hint="Например: Математика, Английский язык" />
          </div>
          <div className="flex items-end">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm">
              <input type="checkbox" name="isActive" value="true"
                defaultChecked={initial.isActive ?? true}
                className="h-4 w-4 rounded border-ink-300 text-primary-700 focus:ring-accent-400" />
              <span className="font-medium text-primary-800">Показывать на сайте</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
