import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdminApi } from '@/server/auth';

const TranslationSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  title: z.string().min(2),
  shortTitle: z.string().optional(),
  description: z.string().min(2),
  highlights: z.array(z.string()).default([]),
});

const CreateSchema = z.object({
  slug: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  translations: z.array(TranslationSchema).min(1),
  subjects: z.array(z.string()).default([]),
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
  const dir = await prisma.direction.create({
    data: {
      slug: parsed.data.slug,
      icon: parsed.data.icon,
      color: parsed.data.color,
      order: parsed.data.order,
      isActive: parsed.data.isActive,
      translations: { create: parsed.data.translations },
      subjects: {
        create: parsed.data.subjects.map((name, idx) => ({
          name,
          order: idx,
        })),
      },
    },
  });
  return NextResponse.json({ success: true, id: dir.id });
}

export async function GET() {
  const admin = await getCurrentAdminApi();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await prisma.direction.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    include: { translations: true, subjects: true },
  });
  return NextResponse.json({ directions: data });
}
