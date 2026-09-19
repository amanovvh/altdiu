import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdminApi } from '@/server/auth';

const TranslationSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  title: z.string().min(2),
  description: z.string().optional(),
});

const CreateSchema = z.object({
  category: z.enum(['OLYMPIAD', 'CERTIFICATE', 'COMPETITION', 'SPORT', 'OTHER']),
  image: z.string().nullable().optional(),
  date: z.string().datetime(),
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
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const achievement = await prisma.achievement.create({
    data: {
      category: parsed.data.category,
      image: parsed.data.image ?? null,
      date: new Date(parsed.data.date),
      isActive: parsed.data.isActive,
      translations: {
        create: parsed.data.translations,
      },
    },
  });
  return NextResponse.json({ success: true, id: achievement.id });
}

export async function GET() {
  const admin = await getCurrentAdminApi();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const achievements = await prisma.achievement.findMany({
    orderBy: { date: 'desc' },
    include: { translations: true },
  });
  return NextResponse.json({ achievements });
}
