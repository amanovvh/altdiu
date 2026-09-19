import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdminApi } from '@/server/auth';

const TranslationSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  fullName: z.string().min(2),
  position: z.string().min(2),
  bio: z.string().optional(),
  education: z.string().optional(),
});

const CreateSchema = z.object({
  photo: z.string().nullable().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  order: z.number().int().default(0),
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
  const administrator = await prisma.administrator.create({
    data: {
      photo: parsed.data.photo ?? null,
      email: parsed.data.email,
      phone: parsed.data.phone,
      order: parsed.data.order,
      isActive: parsed.data.isActive,
      translations: { create: parsed.data.translations },
    },
  });
  return NextResponse.json({ success: true, id: administrator.id });
}

export async function GET() {
  const admin = await getCurrentAdminApi();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await prisma.administrator.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { translations: true },
  });
  return NextResponse.json({ administrators: data });
}
