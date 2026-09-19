import { prisma } from '@/lib/db/prisma';
import type { Locale } from '@prisma/client';

export interface AdministratorListItem {
  id: string;
  photo: string | null;
  images: string[];
  fullName: string;
  position: string;
  order: number;
}

export interface AdministratorDetail extends AdministratorListItem {
  bio: string | null;
  education: string | null;
  email: string | null;
  phone: string | null;
}

const TRANSLATION_SELECT = {
  fullName: true,
  position: true,
  bio: true,
  education: true,
} as const;

export async function getAdministrators(
  locale: Locale
): Promise<AdministratorListItem[]> {
  const records = await prisma.administrator.findMany({
    where: { isActive: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: {
      translations: { where: { locale }, select: TRANSLATION_SELECT },
    },
  });
  return records
    .filter((r) => r.translations[0])
    .map((r) => ({
      id: r.id,
      photo: r.photo,
      images: r.images ?? [],
      fullName: r.translations[0].fullName,
      position: r.translations[0].position,
      order: r.order,
    }));
}

export async function getAdministratorById(
  id: string,
  locale: Locale
): Promise<AdministratorDetail | null> {
  const a = await prisma.administrator.findUnique({
    where: { id },
    include: {
      translations: { where: { locale }, select: TRANSLATION_SELECT },
    },
  });
  if (!a || !a.isActive || !a.translations[0]) return null;
  const tr = a.translations[0];
  return {
    id: a.id,
    photo: a.photo,
    images: a.images ?? [],
    fullName: tr.fullName,
    position: tr.position,
    bio: tr.bio,
    education: tr.education,
    email: a.email,
    phone: a.phone,
    order: a.order,
  };
}
