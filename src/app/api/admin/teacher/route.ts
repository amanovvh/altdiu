import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdminApi } from '@/server/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

const TranslationSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  fullName: z.string().min(2),
  subject: z.string().min(2),
  position: z.string().optional(),
  education: z.string().optional(),
  bio: z.string().optional(),
});

const CreateTeacherSchema = z.object({
  photo: z.string().nullable().optional(),
  category: z.enum([
    'ECONOMICS',
    'LANGUAGES',
    'MATHEMATICS',
    'NATURAL_SCIENCES',
    'HUMANITIES',
    'OTHER',
  ]).default('OTHER'),
  order: z.number().int().default(0),
  email: z.string().email().optional(),
  isActive: z.boolean().default(true),
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

  const parsed = CreateTeacherSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const teacher = await prisma.teacher.create({
    data: {
      photo: parsed.data.photo ?? null,
      category: parsed.data.category,
      order: parsed.data.order,
      email: parsed.data.email,
      isActive: parsed.data.isActive,
      translations: {
        create: parsed.data.translations,
      },
    },
  });

  return NextResponse.json({ success: true, id: teacher.id });
}

export async function GET() {
  const admin = await getCurrentAdminApi();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const teachers = await prisma.teacher.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { translations: true },
  });
  return NextResponse.json({ teachers });
}
