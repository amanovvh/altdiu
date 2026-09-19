'use client';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

export interface UploadResult {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
}

export class UploadError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'UploadError';
  }
}

/**
 * Client-side validation helper. Mirrors the server-side rules in
 * /api/admin/upload so we fail fast before round-tripping to the server.
 */
export function validateImageClient(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Недопустимый формат: ${file.type || 'unknown'}. Разрешены: JPG, PNG, WEBP, AVIF, GIF.`;
  }
  if (file.size > MAX_SIZE) {
    return `Файл слишком большой (${formatBytes(file.size)}). Максимум ${formatBytes(MAX_SIZE)}.`;
  }
  return null;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} Б`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} КБ`;
  return `${(n / (1024 * 1024)).toFixed(1)} МБ`;
}

/**
 * Upload a single File to Cloudinary via the server-side proxy at
 * /api/admin/upload. Returns the publicId and a delivery URL on success.
 *
 * Throws UploadError on validation/server failures.
 */
export async function uploadImage(
  file: File,
  options: { folder?: string; signal?: AbortSignal } = {}
): Promise<UploadResult> {
  const err = validateImageClient(file);
  if (err) throw new UploadError(err, 400);

  const fd = new FormData();
  fd.append('file', file);
  if (options.folder) fd.append('folder', options.folder);

  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    body: fd,
    signal: options.signal,
  });

  const data = await res.json().catch(() => ({} as any));
  if (!res.ok || !data?.success) {
    throw new UploadError(data?.error ?? `Upload failed (${res.status})`, res.status);
  }
  return {
    publicId: data.publicId,
    url: data.url,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    format: data.format,
  };
}