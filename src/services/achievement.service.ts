import { prisma } from '@/lib/db/prisma';
import type { Locale, AchievementCategory } from '@prisma/client';

export interface AchievementItem {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string | null;
  image: string | null;
  images: string[];
  date: Date;
}

const TRANSLATION_SELECT = {
  title: true,
  description: true,
} as const;

export async function getAchievements(
  locale: Locale,
  options: { category?: AchievementCategory | 'ALL'; limit?: number } = {}
): Promise<AchievementItem[]> {
  const where = {
    isActive: true,
    ...(options.category && options.category !== 'ALL' ? { category: options.category } : {}),
  };
  const records = await prisma.achievement.findMany({
    where,
    orderBy: { date: 'desc' },
    ...(options.limit ? { take: options.limit } : {}),
    include: {
      translations: { where: { locale }, select: TRANSLATION_SELECT },
    },
  });
  return records
    .filter((r) => r.translations[0])
    .map((r) => ({
      id: r.id,
      category: r.category,
      title: r.translations[0].title,
      description: r.translations[0].description,
      image: r.image,
      images: r.images ?? [],
      date: r.date,
    }));
}

export async function getAchievementCategories(
  locale: Locale
): Promise<{ value: AchievementCategory; count: number }[]> {
  const grouped = await prisma.achievement.groupBy({
    by: ['category'],
    where: { isActive: true },
    _count: { category: true },
  });
  return grouped.map((g) => ({ value: g.category, count: g._count.category }));
}
