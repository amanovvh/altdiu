import { prisma } from '@/lib/db/prisma';
import type { Locale } from '@prisma/client';

export interface DirectionListItem {
  id: string;
  slug: string;
  title: string;
  shortTitle: string | null;
  icon: string | null;
  color: string | null;
  order: number;
}

export interface DirectionDetail extends DirectionListItem {
  description: string;
  highlights: string[];
  subjects: { name: string; icon: string | null; order: number }[];
}

const TRANSLATION_SELECT = {
  title: true,
  shortTitle: true,
  description: true,
  highlights: true,
} as const;

export async function getDirections(locale: Locale): Promise<DirectionListItem[]> {
  const records = await prisma.direction.findMany({
    where: { isActive: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    include: { translations: { where: { locale }, select: TRANSLATION_SELECT } },
  });
  return records
    .filter((r) => r.translations[0])
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.translations[0].title,
      shortTitle: r.translations[0].shortTitle,
      icon: r.icon,
      color: r.color,
      order: r.order,
    }));
}

export async function getDirectionBySlug(
  slug: string,
  locale: Locale
): Promise<DirectionDetail | null> {
  const direction = await prisma.direction.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale }, select: TRANSLATION_SELECT },
      subjects: { orderBy: { order: 'asc' } },
    },
  });
  if (!direction || !direction.isActive || !direction.translations[0]) return null;
  const tr = direction.translations[0];
  return {
    id: direction.id,
    slug: direction.slug,
    title: tr.title,
    shortTitle: tr.shortTitle,
    icon: direction.icon,
    color: direction.color,
    order: direction.order,
    description: tr.description,
    highlights: (tr.highlights as string[] | null) ?? [],
    subjects: direction.subjects.map((s) => ({
      name: s.name,
      icon: s.icon,
      order: s.order,
    })),
  };
}
