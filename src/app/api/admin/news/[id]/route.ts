import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdminApi } from '@/server/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

const UpdateNewsSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  isPinned: z.boolean().optional(),
  category: z.string().optional(),
  coverImage: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  translations: z
    .array(
      z.object({
        locale: z.enum(['ru', 'uz', 'en']),
        title: z.string().min(2),
        excerpt: z.string().optional(),
        body: z.string().min(2),
      })
    )
    .optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminApi();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = UpdateNewsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.news.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const updates: any = {};
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.isPinned !== undefined) updates.isPinned = parsed.data.isPinned;
  if (parsed.data.category !== undefined) updates.category = parsed.data.category;
  if (parsed.data.coverImage !== undefined) updates.coverImage = parsed.data.coverImage;
  if (parsed.data.images !== undefined) updates.images = parsed.data.images;
  if (parsed.data.publishedAt !== undefined) {
    updates.publishedAt = parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null;
  }
  // Auto-publish timestamp when first published
  if (
    parsed.data.status === 'PUBLISHED' &&
    !existing.publishedAt &&
    !parsed.data.publishedAt
  ) {
    updates.publishedAt = new Date();
  }

  // Upsert translations
  if (parsed.data.translations) {
    for (const tr of parsed.data.translations) {
      await prisma.newsTranslation.upsert({
        where: { newsId_locale: { newsId: id, locale: tr.locale } },
        create: {
          newsId: id,
          locale: tr.locale,
          title: tr.title,
          excerpt: tr.excerpt ?? tr.body.slice(0, 220),
          body: tr.body,
          slug: `${existing.slug}-${tr.locale}`,
        },
        update: {
          title: tr.title,
          excerpt: tr.excerpt ?? tr.body.slice(0, 220),
          body: tr.body,
        },
      });
    }
  }

  await prisma.news.update({ where: { id }, data: updates });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminApi();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Best-effort cleanup of Cloudinary assets
  const ids: string[] = [];
  if (existing.coverImage) ids.push(existing.coverImage);
  if (existing.images?.length) ids.push(...existing.images);

  await prisma.news.delete({ where: { id } });
  await Promise.allSettled(ids.map((publicId) => deleteFromCloudinary(publicId)));

  return NextResponse.json({ success: true });
}
