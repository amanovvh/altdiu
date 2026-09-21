'use client';

import { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  /** Existing values for edit; empty fields for create. */
  initial?: {
    title: string;
    description: string | null;
    fileUrl: string;
    fileSize: number | null;
    date: string; // YYYY-MM-DD for <input type="date">
    order: number;
    isActive: boolean;
  };
  /** Action server-side handler. */
  action: (formData: FormData) => Promise<void>;
  /** Edit page passes the id; new page omits. */
  id?: string;
}

export function PartnerDocumentForm({ initial, action, id }: Props) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState(initial?.fileUrl ?? '');
  const [fileSize, setFileSize] = useState<number | null>(initial?.fileSize ?? null);
  const [fileName, setFileName] = useState<string | null>(
    initial?.fileUrl ? initial.fileUrl.split('/').pop() ?? null : null
  );

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'partners/documents');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setFileUrl(data.publicId ?? data.url ?? '');
      setFileSize(data.bytes ?? file.size);
      setFileName(file.name);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Не удалось загрузить файл');
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="space-y-6">
      {id && <input type="hidden" name="id" value={id} />}

      <div>
        <label className="form-label">
          Название документа <span className="text-rose-600">*</span>
        </label>
        <input
          type="text"
          name="title"
          required
          defaultValue={initial?.title}
          placeholder="Договор о сотрудничестве с ТГЭУ"
          className="form-input"
        />
      </div>

      <div>
        <label className="form-label">Описание</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ''}
          placeholder="Краткое описание документа (необязательно)"
          className="form-input"
        />
      </div>

      {/* File upload */}
      <div>
        <label className="form-label">
          PDF-файл <span className="text-rose-600">*</span>
        </label>

        {fileUrl ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <FileText className="h-5 w-5 text-emerald-700" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-emerald-900">{fileName}</p>
              {fileSize && (
                <p className="text-xs text-emerald-700">{(fileSize / 1024).toFixed(1)} KB</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setFileUrl('');
                setFileSize(null);
                setFileName(null);
              }}
              className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-100"
              aria-label="Удалить"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-surface-alt px-6 py-8 transition hover:border-primary-300 hover:bg-primary-50/40">
            <Upload className="h-7 w-7 text-ink-400" />
            <span className="text-sm font-medium text-ink-700">
              {uploading ? 'Загрузка...' : 'Нажмите чтобы загрузить PDF'}
            </span>
            <span className="text-xs text-ink-500">До 10 MB</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}

        {uploadError && (
          <p className="mt-2 text-sm text-rose-600">{uploadError}</p>
        )}

        <input type="hidden" name="fileUrl" value={fileUrl} />
        {fileSize !== null && (
          <input type="hidden" name="fileSize" value={fileSize} />
        )}
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
          <label className="form-label">Порядок</label>
          <input
            type="number"
            name="order"
            defaultValue={initial?.order ?? 0}
            className="form-input"
          />
        </div>
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
        <button type="submit" className="btn-primary" disabled={!fileUrl}>
          {id ? 'Сохранить' : 'Создать'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}