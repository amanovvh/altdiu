import 'server-only';
import { put } from '@vercel/blob';
import { randomBytes } from 'node:crypto';

/**
 * Vercel Blob storage driver.
 *
 * Best choice for Vercel deployments:
 * - No extra account needed (lives inside the Vercel project)
 * - Free tier: 500 MB storage + 100 GB egress / month
 * - No credit card required
 * - Auto-CDN at vercel-storage.com (or custom domain)
 * - The returned `url` is absolute, so `buildCloudinaryUrl()` passes it through.
 *
 * Required env: `BLOB_READ_WRITE_TOKEN` (Vercel creates this automatically
 * the first time you create a Blob store in the project's Storage tab).
 */

export interface VercelBlobUploadResult {
  publicId: string;
  url: string;
  bytes: number;
  format: string;
}

function isConfigured(): boolean {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return Boolean(token && !token.startsWith('your_'));
}

function sanitizeFolder(folder?: string): string {
  if (!folder) return 'misc';
  return folder
    .replace(/^[\\/]+/, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9/_-]/g, '_')
    .toLowerCase();
}

function pickExtension(mime: string, fallback = 'bin'): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/avif':
      return 'avif';
    case 'image/gif':
      return 'gif';
    default:
      return fallback;
  }
}

/**
 * Upload a buffer to Vercel Blob. Returns the public URL which we use as `publicId`.
 *
 * The returned `publicId` is an absolute URL (e.g. `https://xxxx.public.blob.vercel-storage.com/lyceum/news/abc.webp`),
 * so `buildCloudinaryUrl()` returns it as-is.
 */
export async function saveBufferToVercelBlob(
  buffer: Buffer,
  options: { folder?: string; mime: string }
): Promise<VercelBlobUploadResult> {
  if (!isConfigured()) {
    throw new Error(
      'Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN in your Vercel project (Storage → Create Database → Blob).'
    );
  }

  const folder = sanitizeFolder(options.folder);
  const ext = pickExtension(options.mime);
  const id = randomBytes(12).toString('hex');
  const pathname = `${folder}/${id}.${ext}`;

  const blob = await put(pathname, buffer, {
    access: 'public',
    contentType: options.mime,
    addRandomSuffix: false,
  });

  return {
    publicId: blob.url,
    url: blob.url,
    bytes: buffer.length,
    format: ext,
  };
}
