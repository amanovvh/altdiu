import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdminApi } from '@/server/auth';
import { slug as slugifyText } from '@/lib/utils/text';

const TranslationSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  title: z.string().min(2),
  description: z.string().optional(),
});

const CreateSchema = z.object({
  slug: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  coverImage: z.string().nullable().optional(),
  eventDate: z.string().datetime().nullable().optional(),
  order: z.number().int().default(0),
  images: z
    .array(
      z.object({
        publicId: z.string(),
        width: z.number().int().optional(),
        height: z.number().int().optional(),
        alt: z.string().optional(),
      })
    )
    .default([]),
  translations: z.array(TranslationSchema).min(1),
});

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdminApi();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const primaryTitle = parsed.data.translations[0].title;
  let slug = parsed.data.slug ?? slugifyText(primaryTitle, parsed.data.translations[0].locale);
  let suffix = 1;
  while (await prisma.galleryAlbum.findUnique({ where: { slug } }).then(Boolean)) {
    slug = `${slugifyText(primaryTitle)}-${suffix++}`;
  }
  const album = await prisma.galleryAlbum.create({
    data: {
      slug,
      status: parsed.data.status,
      coverImage: parsed.data.coverImage ?? null,
      eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : null,
      order: parsed.data.order,
      isActive: true,
      translations: { create: parsed.data.translations },
      images: {
        create: parsed.data.images.map((img, idx) => ({
          publicId: img.publicId,
          width: img.width ?? null,
          height: img.height ?? null,
          alt: img.alt ?? null,
          order: idx,
        })),
      },
    },
  });
  return NextResponse.json({ success: true, id: album.id, slug: album.slug });
}

export async function GET() {
  const admin = await getCurrentAdminApi();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const albums = await prisma.galleryAlbum.findMany({
    orderBy: [{ order: 'asc' }, { eventDate: 'desc' }],
    include: { translations: true, _count: { select: { images: true } } },
  });
  return NextResponse.json({ albums });
}
