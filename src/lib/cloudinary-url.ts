/**
 * Client-safe image URL builder.
 *
 * Supports three storage backends transparently:
 *
 * 1. **Cloudinary** — `publicId` is a Cloudinary public_id (e.g. `lyceum/news/abc`).
 *    Builds `https://res.cloudinary.com/<cloud>/image/upload/<transforms>/<id>`.
 *
 * 2. **Local filesystem** — `publicId` starts with `/uploads/` (e.g.
 *    `/uploads/lyceum/news/abc.jpg`). Returns the path as-is so Next.js serves
 *    it from the `public/` directory. No transformations are applied — width
 *    / height / format options are ignored for local storage.
 *
 * 3. **Cloudflare R2** (or any S3-compatible) — `publicId` is an absolute
 *    `https://...` URL. Returned as-is so Next.js Image Optimization can
 *    proxy it (with auto-resize / format conversion).
 *
 * This module MUST NOT import the `cloudinary` SDK because it relies on
 * Node-only modules (`fs`, etc.) and breaks bundling for Client Components.
 */

export interface CloudinaryUrlOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  gravity?: 'auto' | 'face' | 'center';
}

export function buildCloudinaryUrl(
  publicId: string | null | undefined,
  options: CloudinaryUrlOptions = {}
): string {
  if (!publicId) return '/placeholder.svg';

  // Local storage path — served directly by Next.js from public/.
  if (publicId.startsWith('/')) {
    return publicId;
  }

  // Legacy absolute URLs (e.g. http://...) — pass through unchanged.
  if (/^https?:\/\//i.test(publicId)) {
    return publicId;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return '/placeholder.svg';

  const parts: string[] = ['f_auto', `q_${options.quality ?? 'auto'}`];
  if (options.width || options.height) {
    const w = options.width ? `w_${options.width}` : '';
    const h = options.height ? `h_${options.height}` : '';
    const c = options.crop ?? 'fill';
    const g = options.gravity ? `g_${options.gravity}` : '';
    parts.push(`${w}${w && h ? ',' : ''}${h},c_${c}${g ? ',' + g : ''}`);
  }
  const transforms = parts.join(',');
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
}