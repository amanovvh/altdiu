import { prisma } from '@/lib/db/prisma';
import type { Locale } from '@prisma/client';
import type { SocialPlatform } from '@prisma/client';

export interface ContactInfoData {
  address: string;
  phone: string;
  email: string;
  mapEmbed: string | null;
  latitude: number | null;
  longitude: number | null;
  schedule: string | null;
  description: string | null;
}

export interface SocialLinkData {
  platform: SocialPlatform;
  url: string;
  isVisible: boolean;
}

export async function getContactInfo(locale: Locale): Promise<ContactInfoData | null> {
  const record = await prisma.contactInfo.findUnique({ where: { locale } });
  if (!record) return null;
  return {
    address: record.address,
    phone: record.phone,
    email: record.email,
    mapEmbed: record.mapEmbed,
    latitude: record.latitude,
    longitude: record.longitude,
    schedule: record.schedule,
    description: record.description,
  };
}

export async function getSocialLinks(): Promise<SocialLinkData[]> {
  const records = await prisma.socialLink.findMany({
    where: { isVisible: true },
    orderBy: { order: 'asc' },
  });
  return records.map((r) => ({
    platform: r.platform,
    url: r.url,
    isVisible: r.isVisible,
  }));
}
