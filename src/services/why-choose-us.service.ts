import { prisma } from '@/lib/db/prisma';
import type { Locale } from '@prisma/client';

export interface WhyChooseUsCardItem {
  id: string;
  icon: string | null;
  image: string | null;
  order: number;
  translations: {
    locale: Locale;
    title: string;
    description: string;
  }[];
}

export async function getWhyChooseUsCards(
  locale: Locale
): Promise<WhyChooseUsCardItem[]> {
  const records = await prisma.whyChooseUsCard.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      translations: { where: { locale }, select: { locale: true, title: true, description: true } },
    },
  });
  return records.map((r) => ({
    id: r.id,
    icon: r.icon,
    image: r.image,
    order: r.order,
    translations: r.translations.map((t) => ({
      locale: t.locale,
      title: t.title,
      description: t.description,
    })),
  }));
}
