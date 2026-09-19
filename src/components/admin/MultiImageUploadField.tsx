'use client';

import { useRef, useState, useTransition } from 'react';
import { ImagePlus, X, Loader2, AlertCircle, Upload } from 'lucide-react';
import { uploadImage, UploadError, formatBytes } from '@/services/upload.service';
import { cn } from '@/lib/utils/cn';

interface Props {
  /** Form field name. We submit a comma-separated list of public_ids. */
  name: string;
  label: string;
  /** Initial Cloudinary public_ids (when editing). */
  initialPublicIds?: string[];
  folder?: string;
  hint?: string;
  className?: string;
  /** Max number of images (UI limit; not enforced server-side). */
  max?: number;
}

interface ImageEntry {
  /** Either an existing Cloudinary public_id, or a freshly uploaded one. */
  publicId: string;
  /** Preview URL to render — for existing entries this is the Cloudinary
   *  delivery URL; for freshly uploaded entries it's the response `url`. */
  previewUrl: string;
  /** Optional: only set for newly uploaded entries. */
  pending?: boolean;
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif';

/**
 * Multi-file Cloudinary upload field. Stores its value as a comma-separated
 * list of public_ids (no JSON parsing required by the server action).
 *
 * Behaviour:
 * - Existing public_ids render immediately with delete buttons.
 * - Newly picked files are uploaded in parallel and appended on success.
 * - Per-image inline progress (overlay on the thumbnail while uploading).
 * - Errors surface inline and do not affect other uploads.
 */
export function MultiImageUploadField({
  name,
  label,
  initialPublicIds = [],
  folder = 'lyceum/news',
  hint,
  className,
  max = 12,
}: Props) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const initial: ImageEntry[] = initialPublicIds.map((id) => ({
    publicId: id,
    previewUrl: id.startsWith('/')
      ? id
      : `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${id}`,
  }));

  const [items, setItems] = useState<ImageEntry[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const remaining = Math.max(0, max - items.length);
    if (remaining === 0) {
      setError(`Максимум ${max} изображений. Удалите существующие, чтобы добавить новые.`);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    const picked = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      setError(`Превышен лимит ${max} изображений. Загружаю первые ${remaining}.`);
    }

    // Reserve placeholder rows with local previews, then upload in parallel.
    const placeholders: ImageEntry[] = picked.map((file) => ({
      publicId: '',
      previewUrl: URL.createObjectURL(file),
      pending: true,
    }));
    setItems((prev) => [...prev, ...placeholders]);

    picked.forEach((file, idx) => {
      const placeholderIdx = items.length + idx;
      startTransition(async () => {
        try {
          const res = await uploadImage(file, { folder });
          URL.revokeObjectURL(placeholders[idx].previewUrl);
          setItems((prev) =>
            prev.map((it, i) =>
              i === placeholderIdx
                ? { publicId: res.publicId, previewUrl: res.url, pending: false }
                : it
            )
          );
        } catch (e) {
          URL.revokeObjectURL(placeholders[idx].previewUrl);
          const msg =
            e instanceof UploadError
              ? e.message
              : e instanceof Error
                ? e.message
                : 'Не удалось загрузить файл';
          setError(`${file.name}: ${msg}`);
          // Drop the failed placeholder so it doesn't linger as an empty tile.
          setItems((prev) => prev.filter((_, i) => i !== placeholderIdx));
        }
      });
    });

    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (idx: number) => {
    setItems((prev) => {
      const target = prev[idx];
      // Revoke local blob URL if it's still a local one.
      if (target && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Submit as a single comma-separated string of public_ids.
  const hiddenValue = items
    .filter((i) => !i.pending && i.publicId)
    .map((i) => i.publicId)
    .join(',');

  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-primary-800">
        {label}
      </label>

      <input type="hidden" name={name} value={hiddenValue} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((it, idx) => (
          <div
            key={it.publicId || `pending-${idx}`}
            className={cn(
              'group relative aspect-square overflow-hidden rounded-xl border border-ink-200 bg-surface-alt'
            )}
          >
            {it.pending && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-1.5 rounded-full bg-primary-900 px-3 py-1.5 text-xs font-medium text-white">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Загрузка…
                </div>
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.previewUrl}
              alt={it.publicId || 'Предпросмотр'}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              disabled={it.pending}
              aria-label="Удалить изображение"
              className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 shadow-soft transition group-hover:opacity-100 focus:opacity-100 disabled:opacity-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-3 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
              {it.publicId}
            </div>
          </div>
        ))}

        {/* Add tile */}
        {items.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'group flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink-200 bg-surface-alt/40 text-ink-500 transition',
              'hover:border-accent-400 hover:bg-accent-50/40 hover:text-accent-700'
            )}
          >
            {pending ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs">Загружаем…</span>
              </>
            ) : (
              <>
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs font-medium">Добавить</span>
                <span className="text-[10px] text-ink-400">
                  JPG · PNG · WEBP
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(e) => handlePick(e.target.files)}
      />

      {error && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
        <span>
          {items.length} из {max} изображений · макс. {formatBytes(10 * 1024 * 1024)} каждое
        </span>
        {items.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <Upload className="h-3 w-3" />
            Загрузка автоматическая
          </span>
        )}
      </div>

      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}