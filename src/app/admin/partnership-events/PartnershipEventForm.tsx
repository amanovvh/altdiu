'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, ImageIcon } from 'lucide-react';

interface Props {
  initial?: {
    title: string;
    description: string | null;
    location: string | null;
    coverImage: string | null;
    photos: string[];
    date: string;
    order: number;
    isActive: boolean;
  };
  action: (formData: FormData) => Promise<void>;
  id?: string;
}

export function PartnershipEventForm({ initial, action, id }: Props) {
  const router = useRouter();
  const [coverImage, setCoverImage] = useState<string | null>(initial?.coverImage ?? null);
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'gallery') {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'partners/events');
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const url = data.publicId ?? data.url;
        uploaded.push(url);
      }
      if (target === 'cover' && uploaded[0]) {
        setCoverImage(uploaded[0]);
      } else {
        setPhotos((prev) => [...prev, ...uploaded]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить фото');
    } finally {
      setUploading(false);
      e.target.value = ''; // allow re-uploading same file
    }
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <form action={action} className="space-y-6">
      {id && <input type="hidden" name="id" value={id} />}
      <input type="hidden" name="coverImage" value={coverImage ?? ''} />
      <input type="hidden" name="photos" value={photos.join('\n')} />

      <div>
        <label className="form-label">
          Название <span className="text-rose-600">*</span>
        </label>
        <input
          type="text"
          name="title"
          required
          defaultValue={initial?.title}
          placeholder="Дебаты с ТГЭУ на тему «Цифровая экономика»"
          className="form-input"
        />
      </div>

      <div>
        <label className="form-label">Описание</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ''}
          placeholder="Краткое описание мероприятия"
          className="form-input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="form-label">Дата</label>
          <input
            type="date"
            name="date"
            defaultValue={initial?.date ?? new Date().toISOString().slice(0, 10)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Место</label>
          <input
            type="text"
            name="location"
            defaultValue={initial?.location ?? ''}
            placeholder="Ташкент, ТГЭУ"
            className="form-input"
          />
        </div>
      </div>

      {/* Cover image */}
      <div>
        <label className="form-label">Обложка</label>
        {coverImage ? (
          <div className="relative h-44 overflow-hidden rounded-xl border border-ink-100">
            <img src={coverImage} alt="cover" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setCoverImage(null)}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              aria-label="Удалить обложку"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-surface-alt px-6 py-6 transition hover:border-primary-300 hover:bg-primary-50/40">
            <Upload className="h-6 w-6 text-ink-400" />
            <span className="text-sm font-medium text-ink-700">
              {uploading ? 'Загрузка...' : 'Загрузить обложку'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, 'cover')}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Gallery photos */}
      <div>
        <label className="form-label">Фотографии ({photos.length})</label>
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
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs">+ фото</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleUpload(e, 'gallery')}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-ink-500">
          Можно загрузить несколько фото сразу. На странице «Сотрудничество» показывается до 8 фото.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div>
        <label className="form-label">Порядок</label>
        <input
          type="number"
          name="order"
          defaultValue={initial?.order ?? 0}
          className="form-input max-w-32"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={initial?.isActive ?? true}
          className="h-4 w-4 rounded border-ink-300 text-primary-700 focus:ring-primary-500"
        />
        <span className="text-sm font-medium text-ink-700">Активен (виден на сайте)</span>
      </label>

      <div className="flex items-center gap-3 border-t border-ink-100 pt-6">
        <button type="submit" className="btn-primary" disabled={uploading}>
          {id ? 'Сохранить' : 'Создать'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline">
          Отмена
        </button>
      </div>
    </form>
  );
}