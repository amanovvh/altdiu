import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdminApi } from '@/server/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

const UpdateSchema = z.object({
  photo: z.string().nullable().optional(),
  category: z
    .enum(['ECONOMICS', 'LANGUAGES', 'MATHEMATICS', 'NATURAL_SCIENCES', 'HUMANITIES', 'OTHER'])
    .optional(),
  order: z.number().int().optional(),
  email: z.string().email().nullable().optional(),
  isActive: z.boolean().optional(),
  translations: z
    .array(
      z.object({
        locale: z.enum(['ru', 'uz', 'en']),
        fullName: z.string().min(2),
        subject: z.string().min(2),
        position: z.string().optional(),
        education: z.string().optional(),
        bio: z.string().optional(),
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
  for (const k of ['photo', 'category', 'order', 'email', 'isActive'] as const) {
    if (parsed.data[k] !== undefined) updates[k] = parsed.data[k];
  }

  if (parsed.data.translations) {
    for (const tr of parsed.data.translations) {
      await prisma.teacherTranslation.upsert({
        where: { teacherId_locale: { teacherId: id, locale: tr.locale } },
        create: { ...tr, teacherId: id },
        update: tr,
      });
    }
  }

  await prisma.teacher.update({ where: { id }, data: updates });
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
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  await prisma.teacher.delete({ where: { id } });
  if (existing.photo) {
    await deleteFromCloudinary(existing.photo).catch(() => {});
  }
  return NextResponse.json({ success: true });
}
