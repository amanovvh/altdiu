import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdminApi } from '@/server/auth';

const ContactSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  address: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email(),
  mapEmbed: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  schedule: z.string().optional(),
  description: z.string().optional(),
});

const SocialSchema = z.object({
  platform: z.enum([
    'TELEGRAM',
    'INSTAGRAM',
    'FACEBOOK',
    'YOUTUBE',
    'TWITTER',
    'LINKEDIN',
  ]),
  url: z.string().url(),
  isVisible: z.boolean().default(true),
  order: z.number().int().default(0),
});

const BodySchema = z.union([
  z.object({ contact: ContactSchema }),
  z.object({ social: SocialSchema }),
  z.object({ contacts: z.array(ContactSchema) }),
  z.object({ socials: z.array(SocialSchema) }),
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

  // Single contact
  if ('contact' in parsed.data) {
    const { locale, ...rest } = parsed.data.contact;
    await prisma.contactInfo.upsert({
      where: { locale },
      create: { locale, ...rest },
      update: rest,
    });
    return NextResponse.json({ success: true });
  }
  if ('contacts' in parsed.data) {
    for (const c of parsed.data.contacts) {
      const { locale, ...rest } = c;
      await prisma.contactInfo.upsert({
        where: { locale },
        create: { locale, ...rest },
        update: rest,
      });
    }
    return NextResponse.json({ success: true, count: parsed.data.contacts.length });
  }
  if ('social' in parsed.data) {
    await prisma.socialLink.upsert({
      where: { platform: parsed.data.social.platform },
      create: parsed.data.social,
      update: {
        url: parsed.data.social.url,
        isVisible: parsed.data.social.isVisible,
        order: parsed.data.social.order,
      },
    });
    return NextResponse.json({ success: true });
  }
  if ('socials' in parsed.data) {
    for (const s of parsed.data.socials) {
      await prisma.socialLink.upsert({
        where: { platform: s.platform },
        create: s,
        update: { url: s.url, isVisible: s.isVisible, order: s.order },
      });
    }
    return NextResponse.json({ success: true, count: parsed.data.socials.length });
  }
  return NextResponse.json({ error: 'No operation' }, { status: 400 });
}
