'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import { Trash2, Plus, Save } from 'lucide-react';
import { AdminInput, AdminTextarea, AdminSelect } from '@/components/admin/AdminFormField';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { MultiImageUploadField } from '@/components/admin/MultiImageUploadField';

type Locale = 'ru' | 'uz' | 'en';

interface TranslationState {
  locale: Locale;
  title: string;
  excerpt: string;
  body: string;
}

interface InitialValue {
  status?: string;
  isPinned?: boolean;
  category?: string | null;
  coverImage?: string | null;
  images?: string[];
  publishedAt?: string | null;
  translations?: TranslationState[];
}

interface Props {
  action: (prev: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  initial?: InitialValue;
  submitLabel?: string;
}

const LANGS: { value: Locale; label: string }[] = [
  { value: 'ru', label: '🇷🇺 Русский' },
  { value: 'uz', label: '🇺🇿 Oʻzbekcha' },
  { value: 'en', label: '🇬🇧 English' },
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

export function NewsForm({ action, initial = {}, submitLabel = 'Сохранить' }: Props) {
  const [state, formAction] = useFormState(action, {});
  const [translations, setTranslations] = useState<TranslationState[]>(
    initial.translations && initial.translations.length > 0
      ? initial.translations
      : [{ locale: 'ru', title: '', excerpt: '', body: '' }]
  );

  const addTranslation = () => {
    const used = new Set(translations.map((t) => t.locale));
    const next = LANGS.find((l) => !used.has(l.value));
    if (next) setTranslations([...translations, { locale: next.value, title: '', excerpt: '', body: '' }]);
  };

  const removeTranslation = (idx: number) =>
    setTranslations(translations.filter((_, i) => i !== idx));

  const updateTranslation = (idx: number, field: keyof TranslationState, value: string) => {
    setTranslations((arr) => arr.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {state.error}
        </div>
      )}

      {/* Translations */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-primary-800">
            Содержимое (по языкам)
          </h2>
          {translations.length < 3 && (
            <button
              type="button"
              onClick={addTranslation}
              className="btn-outline"
            >
              <Plus className="h-4 w-4" />
              Добавить язык
            </button>
          )}
        </div>

        <div className="space-y-6">
          {translations.map((t, idx) => (
            <div
              key={`${t.locale}-${idx}`}
              className="rounded-xl border border-ink-100 bg-surface-alt/40 p-5"
            >
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
                    <Trash2 className="mr-1 inline h-3 w-3" />
                    Удалить язык
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <AdminInput
                  label="Заголовок"
                  name={`title_${t.locale}`}
                  required
                  defaultValue={t.title}
                  placeholder="Открытие учебного года"
                  onChange={(e) =>
                    updateTranslation(idx, 'title', (e.target as HTMLInputElement).value)
                  }
                />
                <AdminTextarea
                  label="Краткое описание (необязательно)"
                  name={`excerpt_${t.locale}`}
                  defaultValue={t.excerpt}
                  rows={2}
                  hint="Если пусто — будет сгенерировано автоматически"
                  onChange={(e) =>
                    updateTranslation(idx, 'excerpt', (e.target as HTMLTextAreaElement).value)
                  }
                />
                <AdminTextarea
                  label="Полный текст"
                  name={`body_${t.locale}`}
                  required
                  defaultValue={t.body}
                  rows={8}
                  placeholder="Поддерживается HTML: <p>, <h2>, <ul>, <li>, <strong>, <a href>"
                  onChange={(e) =>
                    updateTranslation(idx, 'body', (e.target as HTMLTextAreaElement).value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* Hidden field that carries translations JSON */}
        <input
          type="hidden"
          name="translations"
          value={JSON.stringify(
            translations.map((t) => ({
              locale: t.locale,
              title: t.title,
              excerpt: t.excerpt || undefined,
              body: t.body,
            }))
          )}
        />
      </div>

      {/* Publishing options */}
      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-primary-800">
          Публикация
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <AdminSelect
            label="Статус"
            name="status"
            defaultValue={initial.status ?? 'DRAFT'}
            options={[
              { value: 'DRAFT', label: 'Черновик' },
              { value: 'PUBLISHED', label: 'Опубликовано' },
              { value: 'ARCHIVED', label: 'В архиве' },
            ]}
          />
          <AdminInput
            label="Дата публикации"
            name="publishedAt"
            type="datetime-local"
            defaultValue={initial.publishedAt ?? ''}
            hint="Если пусто — при публикации будет использована текущая дата"
          />
          <AdminInput
            label="Категория"
            name="category"
            defaultValue={initial.category ?? ''}
            placeholder="Мероприятия"
          />
          <div className="flex items-end">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm">
              <input
                type="checkbox"
                name="isPinned"
                value="true"
                defaultChecked={initial.isPinned ?? false}
                className="h-4 w-4 rounded border-ink-300 text-primary-700 focus:ring-accent-400"
              />
              <span className="font-medium text-primary-800">📌 Закрепить на главной</span>
            </label>
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-primary-800">Медиа</h2>
        <div className="space-y-6">
          <FileUploadField
            name="coverImage"
            label="Обложка"
            initialPublicId={initial.coverImage ?? null}
            folder="lyceum/news/cover"
            hint="Основное изображение для карточки новости. Загружается автоматически."
          />
          <MultiImageUploadField
            name="images"
            label="Дополнительные изображения"
            initialPublicIds={initial.images ?? []}
            folder="lyceum/news/gallery"
            hint="Галерея для страницы новости. Можно загрузить несколько файлов сразу."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
