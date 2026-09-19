import { prisma } from '@/lib/db/prisma';
import type { Locale } from '@prisma/client';

export interface PartnerItem {
  id: string;
  logo: string | null;
  websiteUrl: string | null;
  category: string | null;
  order: number;
  translations: {
    locale: Locale;
    name: string;
    description: string | null;
  }[];
}

export async function getPartners(locale: Locale): Promise<PartnerItem[]> {
  const records = await prisma.partner.findMany({
    where: { isActive: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: {
      translations: { where: { locale }, select: { locale: true, name: true, description: true } },
    },
  });
  return records.map((r) => ({
    id: r.id,
    logo: r.logo,
    websiteUrl: r.websiteUrl,
    category: r.category,
    order: r.order,
    translations: r.translations.map((t) => ({
      locale: t.locale,
      name: t.name,
      description: t.description,
    })),
  }));
}
