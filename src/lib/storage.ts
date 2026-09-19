import 'server-only';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

/**
 * Local filesystem storage driver.
 *
 * Writes uploaded files under `public/uploads/<folder>/<random>.<ext>`.
 * The public URL is the path relative to the site root, e.g. `/uploads/news/cover/abc.jpg`.
 *
 * Caveats:
 * - Files are served by Next.js from `public/` — fine for small/medium sites.
 * - On serverless platforms (Vercel, Netlify) the filesystem is ephemeral; use
 *   an external store (S3, R2, etc.) in production. For self-hosted deployments
 *   (VPS, Docker) the filesystem persists across restarts.
 * - No CDN. Browser requests go directly to your server.
 *
 * Detection: any `publicId` returned by this driver starts with `/uploads/`.
 * `buildCloudinaryUrl` checks for the leading `/` and returns the path as-is.
 */

const UPLOADS_ROOT = join(process.cwd(), 'public', 'uploads');

export interface LocalUploadResult {
  publicId: string;
  url: string;
  bytes: number;
  format: string;
}

function sanitizeFolder(folder?: string): string {
  if (!folder) return 'misc';
  // Strip any leading slashes and parent-directory escapes, then collapse to safe chars.
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

export async function saveBufferLocally(
  buffer: Buffer,
  options: { folder?: string; mime: string }
): Promise<LocalUploadResult> {
  const folder = sanitizeFolder(options.folder);
  const ext = pickExtension(options.mime);
  const id = randomBytes(12).toString('hex');
  const filename = `${id}.${ext}`;
  const dir = join(UPLOADS_ROOT, folder);
  const filepath = join(dir, filename);

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(filepath, buffer);

  // publicId is the URL path — starts with `/` so the URL builder treats it
  // as a local asset instead of a Cloudinary public_id.
  const publicId = `/uploads/${folder}/${filename}`;
  return {
    publicId,
    url: publicId,
    bytes: buffer.length,
    format: ext,
  };
}