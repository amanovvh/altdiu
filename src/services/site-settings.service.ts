import { prisma } from '@/lib/db/prisma';

export interface SiteSettings {
  heroStats: {
    years: number;
    students: number;
    teachers: number;
    graduates: number;
  };
  features: string[];
}

const DEFAULTS: SiteSettings = {
  heroStats: {
    years: 10,
    students: 600,
    teachers: 40,
    graduates: 1200,
  },
  features: [],
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const records = await prisma.siteSetting.findMany();
  const map = new Map(records.map((r) => [r.key, r.value]));
  const stats = map.get('hero.stats') as SiteSettings['heroStats'] | undefined;
  const features = (map.get('features') as string[] | undefined) ?? [];
  return {
    heroStats: stats ?? DEFAULTS.heroStats,
    features,
  };
}
