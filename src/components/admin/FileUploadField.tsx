'use client';

import { useRef, useState, useTransition } from 'react';
import { ImagePlus, X, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { uploadImage, UploadError, formatBytes } from '@/services/upload.service';
import { cn } from '@/lib/utils/cn';

interface Props {
  /** Form field name. The hidden input's value will be the Cloudinary public_id. */
  name: string;
  label: string;
  /** Initial Cloudinary public_id (when editing). */
  initialPublicId?: string | null;
  /** Cloudinary folder. Default: 'lyceum/news'. */
  folder?: string;
  /** Required marker. */
  required?: boolean;
  hint?: string;
  className?: string;
}

type State =
  | { kind: 'empty' }
  | { kind: 'existing'; publicId: string; previewUrl: string }
  | {
      kind: 'new';
      file: File;
      previewUrl: string;
      publicId: string | null;
      uploading: boolean;
    }
  | { kind: 'error'; message: string };

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif';

/**
 * Single-file Cloudinary upload field.
 *
 * Flow:
 * 1. If `initialPublicId` is given, shows the existing image with "Заменить"/"Удалить".
 * 2. On file pick, we immediately upload to /api/admin/upload. While uploading,
 *    a local blob: preview is shown with a "Загружаем в Cloudinary…" overlay.
 * 3. On success, we replace the local preview with the canonical Cloudinary URL
 *    and store the public_id. The hidden input value becomes that public_id.
 * 4. On failure, we show inline error and reset to empty state.
 * 5. The server action only ever sees a Cloudinary public_id (string) — no
 *    binary data on submit, and Cloudinary secrets stay server-side.
 */
export function FileUploadField({
  name,
  label,
  initialPublicId,
  folder = 'lyceum/news',
  required,
  hint,
  className,
}: Props) {
  // Initial preview URL: local paths (starting with `/`) are used as-is;
  // anything else is treated as a Cloudinary public_id.
  const initialPreview = initialPublicId
    ? initialPublicId.startsWith('/')
      ? initialPublicId
      : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${initialPublicId}`
    : null;

  const [state, setState] = useState<State>(
    initialPublicId && initialPreview
      ? { kind: 'existing', publicId: initialPublicId, previewUrl: initialPreview }
      : { kind: 'empty' }
  );
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setState({
      kind: 'new',
      file,
      previewUrl: localUrl,
      publicId: null,
      uploading: true,
    });

    startTransition(async () => {
      try {
        const res = await uploadImage(file, { folder });
        URL.revokeObjectURL(localUrl);
        setState({
          kind: 'new',
          file,
          previewUrl: res.url,
          publicId: res.publicId,
          uploading: false,
        });
      } catch (e) {
        URL.revokeObjectURL(localUrl);
        const msg =
          e instanceof UploadError
            ? e.message
            : e instanceof Error
              ? e.message
              : 'Не удалось загрузить файл';
        setState({ kind: 'error', message: msg });
      }
    });
  };

  const handleReplace = () => {
    inputRef.current?.click();
  };

  const handleRemove = () => {
    setState({ kind: 'empty' });
    if (inputRef.current) inputRef.current.value = '';
  };

  // The hidden input always renders so the field is part of the form submission.
  // Its value is the public_id when we have one, otherwise empty string.
  const hiddenValue =
    state.kind === 'existing'
      ? state.publicId
      : state.kind === 'new'
        ? (state.publicId ?? '')
        : '';

  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-primary-800">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>

      <input type="hidden" name={name} value={hiddenValue} />

      {(state.kind === 'empty' || state.kind === 'error') && (
        <div>
          <div
            className={cn(
              'group relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-surface-alt/40 px-6 py-10 text-center transition',
              'hover:border-accent-400 hover:bg-accent-50/40',
              state.kind === 'error' ? 'border-rose-300' : 'border-ink-200'
            )}
          >
            <ImagePlus className="h-8 w-8 text-ink-400 group-hover:text-accent-600" />
            <p className="text-sm text-ink-600">
              Перетащите файл сюда или{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="font-semibold text-primary-700 underline-offset-2 hover:underline"
              >
                выберите файл
              </button>
            </p>
            <p className="text-xs text-ink-500">
              JPG, PNG, WEBP, AVIF или GIF · до {formatBytes(10 * 1024 * 1024)}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => handlePick(e.target.files)}
            />
          </div>
          {state.kind === 'error' && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-xs">{state.message}</p>
            </div>
          )}
        </div>
      )}

      {(state.kind === 'existing' || state.kind === 'new') && (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <div className="relative aspect-[16/10] bg-surface-alt">
            {state.kind === 'new' && state.uploading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                <div className="flex items-center gap-2 rounded-full bg-primary-900 px-4 py-2 text-sm font-medium text-white">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Загружаем в Cloudinary…
                </div>
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.previewUrl}
              alt="Предпросмотр"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-4 py-3">
            <div className="min-w-0 flex-1">
              {state.kind === 'existing' ? (
                <p className="truncate text-sm text-ink-600" title={state.publicId}>
                  <span className="font-mono text-xs">{state.publicId}</span>
                </p>
              ) : (
                <p className="truncate text-sm text-ink-600" title={state.file.name}>
                  <span className="font-medium">{state.file.name}</span>
                  <span className="ml-2 text-xs text-ink-500">
                    {formatBytes(state.file.size)}
                  </span>
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={handleReplace}
                disabled={state.kind === 'new' && state.uploading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Заменить
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={state.kind === 'new' && state.uploading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Удалить
              </button>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="sr-only"
                onChange={(e) => handlePick(e.target.files)}
              />
            </div>
          </div>
        </div>
      )}

      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}