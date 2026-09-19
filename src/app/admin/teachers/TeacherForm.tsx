'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { AdminInput, AdminTextarea, AdminSelect } from '@/components/admin/AdminFormField';
import { FileUploadField } from '@/components/admin/FileUploadField';

type Locale = 'ru' | 'uz' | 'en';
type Category =
  | 'ECONOMICS'
  | 'LANGUAGES'
  | 'MATHEMATICS'
  | 'NATURAL_SCIENCES'
  | 'HUMANITIES'
  | 'OTHER';

interface Translation {
  locale: Locale;
  fullName: string;
  subject: string;
  position: string;
  education: string;
  bio: string;
}

interface InitialValue {
  photo?: string | null;
  category?: Category;
  order?: number;
  email?: string | null;
  isActive?: boolean;
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

const CATEGORIES = [
  { value: 'ECONOMICS', label: 'Экономика' },
  { value: 'LANGUAGES', label: 'Иностранные языки' },
  { value: 'MATHEMATICS', label: 'Математика' },
  { value: 'NATURAL_SCIENCES', label: 'Естественные науки' },
  { value: 'HUMANITIES', label: 'Гуманитарные науки' },
  { value: 'OTHER', label: 'Другое' },
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Save className="h-4 w-4" />
      {pending ? 'Сохранение…' : label}
    </button>
  );
}

export function TeacherForm({ action, initial = {}, submitLabel = 'Сохранить' }: Props) {
  const [state, formAction] = useFormState(action, {});
  const [translations, setTranslations] = useState<Translation[]>(
    initial.translations && initial.translations.length > 0
      ? initial.translations
      : [{ locale: 'ru', fullName: '', subject: '', position: '', education: '', bio: '' }]
  );

  const addTranslation = () => {
    const used = new Set(translations.map((t) => t.locale));
    const next = LANGS.find((l) => !used.has(l.value));
    if (next) setTranslations([...translations, { locale: next.value, fullName: '', subject: '', position: '', education: '', bio: '' }]);
  };

  const removeTranslation = (idx: number) =>
    setTranslations(translations.filter((_, i) => i !== idx));

  const updateTranslation = (
    idx: number,
    field: keyof Translation,
    value: string
  ) => setTranslations((arr) => arr.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {state.error}
        </div>
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
                <AdminInput label="ФИО" name={`fullName_${t.locale}`} required
                  defaultValue={t.fullName}
                  onChange={(e) => updateTranslation(idx, 'fullName', (e.target as HTMLInputElement).value)} />
                <AdminInput label="Предмет" name={`subject_${t.locale}`} required
                  defaultValue={t.subject}
                  onChange={(e) => updateTranslation(idx, 'subject', (e.target as HTMLInputElement).value)} />
                <AdminInput label="Должность" name={`position_${t.locale}`}
                  defaultValue={t.position}
                  onChange={(e) => updateTranslation(idx, 'position', (e.target as HTMLInputElement).value)} />
                <AdminInput label="Образование" name={`education_${t.locale}`}
                  defaultValue={t.education}
                  onChange={(e) => updateTranslation(idx, 'education', (e.target as HTMLInputElement).value)} />
                <div className="md:col-span-2">
                  <AdminTextarea label="Краткая биография" name={`bio_${t.locale}`}
                    defaultValue={t.bio} rows={3}
                    onChange={(e) => updateTranslation(idx, 'bio', (e.target as HTMLTextAreaElement).value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <input type="hidden" name="translations" value={JSON.stringify(translations)} />
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-primary-800">Дополнительно</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <FileUploadField
            label="Фото"
            name="photo"
            initialPublicId={initial.photo ?? null}
            folder="lyceum/teachers"
          />
          <AdminSelect label="Категория" name="category"
            defaultValue={initial.category ?? 'OTHER'}
            options={CATEGORIES} />
          <AdminInput label="Email" name="email" type="email"
            defaultValue={initial.email ?? ''} />
          <AdminInput label="Порядок сортировки" name="order" type="number"
            defaultValue={initial.order ?? 0} />
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
