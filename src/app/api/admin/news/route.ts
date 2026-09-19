import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdminApi } from '@/server/auth';
import { generateSlug } from '@/services/news.service';

const CreateNewsSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  title: z.string().min(2).max(200),
  excerpt: z.string().min(2).max(500).optional(),
  body: z.string().min(2),
  coverImage: z.string().nullable().optional(),
  images: z.array(z.string()).default([]),
  category: z.string().optional(),
  publishedAt: z.string().datetime().optional(),
  isPinned: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  // Optional multilingual extension in same call
  extraTranslations: z
    .array(
      z.object({
        locale: z.enum(['ru', 'uz', 'en']),
        title: z.string().min(2),
        excerpt: z.string().min(2).optional(),
        body: z.string().min(2),
      })
    )
    .optional(),
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

  const parsed = CreateNewsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const slug = generateSlug(data.title, data.locale);
  let newsSlug = slug;
  let suffix = 1;
  // Ensure unique slug
  while (
    await prisma.news.findUnique({ where: { slug: newsSlug } }).then(Boolean)
  ) {
    newsSlug = `${slug}-${suffix++}`;
  }

  const news = await prisma.news.create({
    data: {
      slug: newsSlug,
      status: data.status,
      coverImage: data.coverImage ?? null,
      images: data.images,
      category: data.category ?? null,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : data.status === 'PUBLISHED' ? new Date() : null,
      isPinned: data.isPinned,
      translations: {
        create: [
          {
            locale: data.locale,
            title: data.title,
            excerpt: data.excerpt ?? data.body.slice(0, 220),
            body: data.body,
            slug: newsSlug,
          },
          ...(data.extraTranslations ?? []).map((tr) => ({
            locale: tr.locale,
            title: tr.title,
            excerpt: tr.excerpt ?? tr.body.slice(0, 220),
            body: tr.body,
            slug: `${newsSlug}-${tr.locale}`,
          })),
        ],
      },
    },
    include: { translations: true },
  });

  return NextResponse.json({ success: true, id: news.id, slug: news.slug });
}
