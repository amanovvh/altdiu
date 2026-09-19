import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminApi } from '@/server/auth';
import { uploadToCloudinary, validateImageFile } from '@/lib/cloudinary';
import { saveBufferLocally } from '@/lib/storage';
import { saveBufferToR2 } from '@/lib/r2-storage';
import { saveBufferToVercelBlob } from '@/lib/vercel-blob-storage';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Increase Vercel's default 4.5MB body limit for this route (10MB files).
export const maxDuration = 60;

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Storage driver selection.
 *
 *   STORAGE_DRIVER=local       → write files to public/uploads/<folder>/<id>.<ext>
 *   STORAGE_DRIVER=r2          → upload to Cloudflare R2 (requires R2_* env)
 *   STORAGE_DRIVER=vercel-blob → upload to Vercel Blob (requires BLOB_READ_WRITE_TOKEN)
 *   STORAGE_DRIVER=cloudinary  → upload to Cloudinary (requires CLOUDINARY_* env)
 *
 * Default is `local` so dev works without any external account.
 */
function getStorageDriver(): 'local' | 'r2' | 'vercel-blob' | 'cloudinary' {
  const v = (process.env.STORAGE_DRIVER ?? 'local').toLowerCase();
  if (v === 'r2') return 'r2';
  if (v === 'vercel-blob' || v === 'blob' || v === 'vercel') return 'vercel-blob';
  if (v === 'cloudinary') return 'cloudinary';
  return 'local';
}

function cloudinaryConfigured(): boolean {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return Boolean(
    cloudName &&
      apiKey &&
      apiSecret &&
      !cloudName.startsWith('your_') &&
      !apiKey.startsWith('your_') &&
      !apiSecret.startsWith('your_')
  );
}

/**
 * Accepts a multipart/form-data upload with field "file".
 * Optionally accepts "folder" to override default folder.
 *
 * Returns the storage public_id + URL on success.
 */
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdminApi();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const driver = getStorageDriver();

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 413 });
  }

  const err = validateImageFile({ size: file.size, mimeType: file.type });
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const folder = (formData.get('folder') as string) || undefined;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Pre-process: auto-rotate + smart compression via sharp.
    const optimized = await sharp(buffer)
      .rotate()
      .toFormat(file.type === 'image/png' ? 'png' : 'webp', { quality: 88 })
      .toBuffer();

    if (driver === 'local') {
      const result = await saveBufferLocally(optimized, {
        folder: folder ?? 'lyceum',
        mime: file.type,
      });
      return NextResponse.json({
        success: true,
        publicId: result.publicId,
        url: result.url,
        bytes: result.bytes,
        format: result.format,
      });
    }

    if (driver === 'r2') {
      const result = await saveBufferToR2(optimized, {
        folder: folder ?? 'lyceum',
        mime: file.type,
      });
      return NextResponse.json({
        success: true,
        publicId: result.publicId,
        url: result.url,
        bytes: result.bytes,
        format: result.format,
      });
    }

    if (driver === 'vercel-blob') {
      const result = await saveBufferToVercelBlob(optimized, {
        folder: folder ?? 'lyceum',
        mime: file.type,
      });
      return NextResponse.json({
        success: true,
        publicId: result.publicId,
        url: result.url,
        bytes: result.bytes,
        format: result.format,
      });
    }

    // driver === 'cloudinary'
    if (!cloudinaryConfigured()) {
      console.error('[upload] STORAGE_DRIVER=cloudinary but Cloudinary env vars are placeholders');
      return NextResponse.json(
        {
          error:
            'Хранилище Cloudinary не настроено. Установите NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY и CLOUDINARY_API_SECRET или переключитесь на STORAGE_DRIVER=local.',
        },
        { status: 503 }
      );
    }

    const result = await uploadToCloudinary(optimized, {
      folder,
      resourceType: 'image',
      tags: ['lyceum'],
    });

    return NextResponse.json({
      success: true,
      publicId: result.publicId,
      url: result.url,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[upload] Upload failed', { driver, error: msg });
    return NextResponse.json(
      { error: `Не удалось сохранить файл: ${msg}` },
      { status: 502 }
    );
  }
}