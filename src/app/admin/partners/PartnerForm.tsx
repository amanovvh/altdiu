'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import { Save, Plus, Trash2, Upload, X, ImageIcon, FileImage } from 'lucide-react';
import { AdminInput, AdminTextarea } from '@/components/admin/AdminFormField';
import { FileUploadField } from '@/components/admin/FileUploadField';

type Locale = 'ru' | 'uz' | 'en';

interface Translation {
  locale: Locale;
  name: string;
  description: string;
}

interface InitialValue {
  logo?: string | null;
  websiteUrl?: string | null;
  category?: string | null;
  photos?: string[];
  documentUrl?: string | null;
  documentDescription?: string | null;
  order?: number;
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

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Save className="h-4 w-4" />
      {pending ? 'Сохранение…' : label}
    </button>
  );
}

interface GalleryProps {
  initial: string[];
  name: string;
  folder: string;
}

function GalleryField({ initial, name, folder }: GalleryProps) {
  const [photos, setPhotos] = useState<string[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', folder);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        uploaded.push(data.publicId ?? data.url);
      }
      setPhotos((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить фото');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <input type="hidden" name={name} value={photos.join('\n')} />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {photos.map((url, idx) => (
          <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg bg-surface-alt">
            <img src={url} alt={`photo ${idx + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(idx)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Удалить фото"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-ink-200 bg-surface-alt text-ink-400 transition hover:border-primary-300 hover:bg-primary-50/40 hover:text-primary-700">
          {uploading ? (
            <Upload className="h-5 w-5 animate-pulse" />
          ) : (
            <>
              <ImageIcon className="h-5 w-5" />
              <span className="text-[10px]">+ фото</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      <p className="mt-2 text-xs text-ink-500">
        Фото отобразятся в модалке при клике на партнёра на сайте.
      </p>
    </div>
  );
}

export function PartnerForm({ action, initial = {}, submitLabel = 'Сохранить' }: Props) {
  const [state, formAction] = useFormState(action, {});
  const [translations, setTranslations] = useState<Translation[]>(
    initial.translations && initial.translations.length > 0
      ? initial.translations
      : [{ locale: 'ru', name: '', description: '' }]
  );

  const addTranslation = () => {
    const used = new Set(translations.map((t) => t.locale));
    const next = LANGS.find((l) => !used.has(l.value));
    if (next) setTranslations([...translations, { locale: next.value, name: '', description: '' }]);
  };

  const removeTranslation = (idx: number) =>
    setTranslations(translations.filter((_, i) => i !== idx));

  const updateTranslation = (idx: number, field: keyof Translation, value: string) =>
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
              <div className="space-y-4">
                <AdminInput label="Название" name={`name_${t.locale}`} required
                  defaultValue={t.name}
                  onChange={(e) => updateTranslation(idx, 'name', (e.target as HTMLInputElement).value)} />
                <AdminTextarea label="Описание (необязательно)" name={`description_${t.locale}`}
                  defaultValue={t.description} rows={2}
                  onChange={(e) => updateTranslation(idx, 'description', (e.target as HTMLTextAreaElement).value)} />
              </div>
            </div>
          ))}
        </div>
        <input type="hidden" name="translations" value={JSON.stringify(translations)} />
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-primary-800">Основное</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FileUploadField
              label="Логотип"
              name="logo"
              initialPublicId={initial.logo ?? null}
              folder="lyceum/partners"
            />
          </div>
          <AdminInput label="Веб-сайт" name="websiteUrl" type="url"
            defaultValue={initial.websiteUrl ?? ''}
            placeholder="https://example.com" />
          <AdminInput label="Категория" name="category"
            defaultValue={initial.category ?? ''}
            placeholder="Университет, Банк, Компания…" />
          <AdminInput label="Порядок" name="order" type="number"
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

      <div className="card p-6">
        <h2 className="mb-1 font-display text-lg font-bold text-primary-800">
          Фотогалерея
        </h2>
        <p className="mb-4 text-sm text-ink-500">
          Фото совместных мероприятий, встреч, подписания договоров.
          Откроются в модальном окне при клике на партнёра.
        </p>
        <GalleryField
          initial={initial.photos ?? []}
          name="photos"
          folder="lyceum/partners/photos"
        />
      </div>

      <div className="card p-6">
        <div className="mb-1 flex items-center gap-2">
          <FileImage className="h-5 w-5 text-accent-700" />
          <h2 className="font-display text-lg font-bold text-primary-800">
            Документ о сотрудничестве
          </h2>
        </div>
        <p className="mb-4 text-sm text-ink-500">
          Загрузите скан или фото договора. Над ним появится пояснительный текст.
        </p>
        <AdminTextarea
          label="Описание (что это за документ)"
          name="documentDescription"
          defaultValue={initial.documentDescription ?? ''}
          rows={2}
          placeholder="Двусторонний договор о сотрудничестве в сфере подготовки экономистов. Подписан 12.05.2025."
        />
        <div className="mt-4">
          <FileUploadField
            label="Фото / скан документа"
            name="documentUrl"
            initialPublicId={initial.documentUrl ?? null}
            folder="lyceum/partners/documents"
            hint="JPG, PNG или WebP — любой формат изображения"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitBtn label={submitLabel} />
      </div>
    </form>
  );
}