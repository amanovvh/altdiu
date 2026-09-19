import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdminApi } from '@/server/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

const UpdateSchema = z.object({
  category: z
    .enum(['OLYMPIAD', 'CERTIFICATE', 'COMPETITION', 'SPORT', 'OTHER'])
    .optional(),
  image: z.string().nullable().optional(),
  date: z.string().datetime().optional(),
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
  for (const k of ['category', 'image', 'isActive'] as const) {
    if (parsed.data[k] !== undefined) updates[k] = parsed.data[k];
  }
  if (parsed.data.date) updates.date = new Date(parsed.data.date);

  if (parsed.data.translations) {
    for (const tr of parsed.data.translations) {
      await prisma.achievementTranslation.upsert({
        where: { achievementId_locale: { achievementId: id, locale: tr.locale } },
        create: { ...tr, achievementId: id },
        update: tr,
      });
    }
  }
  await prisma.achievement.update({ where: { id }, data: updates });
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
  const existing = await prisma.achievement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  await prisma.achievement.delete({ where: { id } });
  if (existing.image) {
    await deleteFromCloudinary(existing.image).catch(() => {});
  }
  return NextResponse.json({ success: true });
}
