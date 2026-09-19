import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminApi } from '@/server/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Internal upload proxy used by the Admin Panel to forward a remote image
 * URL (e.g. dragged into the editor) into Cloudinary.
 *
 * Requires a valid admin session cookie.
 */
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdminApi();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { url?: string; folder?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  try {
    const upstream = await fetch(body.url);
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch source' }, { status: 502 });
    }
    const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Source is not an image' }, { status: 415 });
    }
    const buffer = Buffer.from(await upstream.arrayBuffer());
    const optimized = await sharp(buffer)
      .rotate()
      .toFormat('webp', { quality: 88 })
      .toBuffer();

    const result = await uploadToCloudinary(optimized, {
      folder: body.folder,
      resourceType: 'image',
      tags: ['lyceum', 'admin-upload'],
    });

    return NextResponse.json({
      publicId: result.publicId,
      url: result.url,
      width: result.width,
      height: result.height,
    });
  } catch (err: any) {
    console.error('[upload-proxy] failed', err);
    return NextResponse.json({ error: err.message ?? 'Upload failed' }, { status: 500 });
  }
}
