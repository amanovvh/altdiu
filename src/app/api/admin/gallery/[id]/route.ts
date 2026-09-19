import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdminApi } from '@/server/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

const UpdateSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  coverImage: z.string().nullable().optional(),
  eventDate: z.string().datetime().nullable().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  translations: z
    .array(
      z.object({
        locale: z.enum(['ru', 'uz', 'en']),
        title: z.string().min(2),
        description: z.string().optional(),
      })
    )
    .optional(),
  addImages: z
    .array(
      z.object({
        publicId: z.string(),
        width: z.number().int().optional(),
        height: z.number().int().optional(),
        alt: z.string().optional(),
      })
    )
    .optional(),
  removeImageIds: z.array(z.string()).optional(),
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
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updates: any = {};
  for (const k of ['status', 'coverImage', 'order', 'isActive'] as const) {
    if (parsed.data[k] !== undefined) updates[k] = parsed.data[k];
  }
  if (parsed.data.eventDate !== undefined) {
    updates.eventDate = parsed.data.eventDate ? new Date(parsed.data.eventDate) : null;
  }

  // Remove images first
  if (parsed.data.removeImageIds?.length) {
    const toDelete = await prisma.galleryImage.findMany({
      where: { id: { in: parsed.data.removeImageIds }, albumId: id },
    });
    await prisma.galleryImage.deleteMany({
      where: { id: { in: parsed.data.removeImageIds }, albumId: id },
    });
    await Promise.allSettled(
      toDelete.map((img) => deleteFromCloudinary(img.publicId))
    );
  }

  // Add images
  if (parsed.data.addImages?.length) {
    const last = await prisma.galleryImage.findFirst({
      where: { albumId: id },
      orderBy: { order: 'desc' },
    });
    let order = (last?.order ?? -1) + 1;
    await prisma.galleryImage.createMany({
      data: parsed.data.addImages.map((img) => ({
        albumId: id,
        publicId: img.publicId,
        width: img.width ?? null,
        height: img.height ?? null,
        alt: img.alt ?? null,
        order: order++,
      })),
    });
  }

  // Translations
  if (parsed.data.translations) {
    for (const tr of parsed.data.translations) {
      await prisma.galleryAlbumTranslation.upsert({
        where: { albumId_locale: { albumId: id, locale: tr.locale } },
        create: { ...tr, albumId: id },
        update: tr,
      });
    }
  }

  await prisma.galleryAlbum.update({ where: { id }, data: updates });
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
  const album = await prisma.galleryAlbum.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!album) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.galleryAlbum.delete({ where: { id } });
  const ids = [album.coverImage, ...album.images.map((i) => i.publicId)].filter(
    Boolean
  ) as string[];
  await Promise.allSettled(ids.map((p) => deleteFromCloudinary(p)));
  return NextResponse.json({ success: true });
}
