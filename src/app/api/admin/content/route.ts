import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdminApi } from '@/server/auth';

const BodySchema = z.union([
  z.object({
    key: z.string().min(1),
    locale: z.enum(['ru', 'uz', 'en']),
    title: z.string().optional(),
    body: z.string().min(1),
    data: z.record(z.unknown()).optional(),
    isActive: z.boolean().default(true),
  }),
  z.object({
    key: z.string().min(1),
    locale: z.enum(['ru', 'uz', 'en']),
    isActive: z.boolean(),
  }),
]);

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
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if ('body' in parsed.data) {
    const jsonData = parsed.data.data ? (parsed.data.data as any) : undefined;
    await prisma.siteContent.upsert({
      where: { key_locale: { key: parsed.data.key, locale: parsed.data.locale } },
      create: {
        key: parsed.data.key,
        locale: parsed.data.locale,
        title: parsed.data.title,
        body: parsed.data.body,
        data: jsonData,
        isActive: parsed.data.isActive,
      },
      update: {
        title: parsed.data.title,
        body: parsed.data.body,
        data: jsonData,
        isActive: parsed.data.isActive,
      },
    });
  } else {
    await prisma.siteContent.update({
      where: { key_locale: { key: parsed.data.key, locale: parsed.data.locale } },
      data: { isActive: parsed.data.isActive },
    });
  }
  return NextResponse.json({ success: true });
}
