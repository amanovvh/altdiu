import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { saveBufferToVercelBlob } from '@/lib/vercel-blob-storage';
import { setHomeHeroImage } from '@/services/home-media.service';
import { locales } from '@/lib/i18n/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * One-shot seed endpoint: reads `public/hero-lyceum-building.jpg` from the
 * deployed bundle, uploads it to Vercel Blob, and persists the resulting
 * URL to SiteContent['home.hero_image'] for every locale.
 *
 * This is only meant for the initial hero setup — once the URL is in the
 * DB, /admin/upload handles any further changes.
 *
 * Protection:
 *   - The route returns 404 unless `HERO_SEED_TOKEN` env var is set.
 *   - When set, requires `?token=...` (or `x-hero-seed-token` header) to match.
 *
 * Usage (after deploying):
 *   curl -X POST 'https://altdiu.vercel.app/api/internal/seed-hero?token=XXX'
 *
 * After running once, remove the env var to disable the route.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.HERO_SEED_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const url = new URL(req.url);
  const headerToken = req.headers.get('x-hero-seed-token');
  const provided =
    url.searchParams.get('token') ?? headerToken ?? '';
  if (provided !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Read the source image from the deployed bundle.
  const filePath = resolve(process.cwd(), 'public/hero-lyceum-building.jpg');
  let buffer: Buffer;
  try {
    buffer = readFileSync(filePath);
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Source image not found in deployed bundle',
        path: filePath,
        hint: 'Make sure public/hero-lyceum-building.jpg is committed and included in the build.',
      },
      { status: 500 }
    );
  }

  // Upload to Vercel Blob.
  let uploaded;
  try {
    uploaded = await saveBufferToVercelBlob(buffer, {
      folder: 'site',
      mime: 'image/jpeg',
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Vercel Blob upload failed',
        detail: err instanceof Error ? err.message : String(err),
        hint: 'Set BLOB_READ_WRITE_TOKEN in Vercel env (auto-injected when STORAGE_DRIVER=vercel-blob).',
      },
      { status: 500 }
    );
  }

  // Persist for every locale.
  const caption = 'Здание Академического лицея';
  const results: Array<{ locale: string; ok: boolean; error?: string }> = [];
  for (const locale of locales) {
    try {
      await setHomeHeroImage(locale, { src: uploaded.url, caption });
      results.push({ locale, ok: true });
    } catch (err) {
      results.push({
        locale,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    url: uploaded.url,
    bytes: uploaded.bytes,
    locales: results,
    note: 'You can now remove HERO_SEED_TOKEN from Vercel env to disable this endpoint.',
  });
}

export async function GET() {
  // Don't expose the existence of the route in production.
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}