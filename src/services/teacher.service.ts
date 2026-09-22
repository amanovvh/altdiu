import { prisma } from '@/lib/db/prisma';
import type { Locale, TeacherCategory } from '@prisma/client';

export interface TeacherListItem {
  id: string;
  photo: string | null;
  fullName: string;
  subject: string;
  position: string | null;
  education: string | null;
  bio: string | null;
  category: TeacherCategory;
  order: number;
}

export interface TeacherDetail extends TeacherListItem {
  education: string | null;
  bio: string | null;
  email: string | null;
}

const TRANSLATION_SELECT = {
  fullName: true,
  subject: true,
  position: true,
  education: true,
  bio: true,
} as const;

export async function getTeachers(
  locale: Locale,
  options: { category?: TeacherCategory } = {}
): Promise<TeacherListItem[]> {
  const records = await prisma.teacher.findMany({
    where: {
      isActive: true,
      ...(options.category ? { category: options.category } : {}),
    },
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
      fullName: r.translations[0].fullName,
      subject: r.translations[0].subject,
      position: r.translations[0].position,
      education: r.translations[0].education,
      bio: r.translations[0].bio,
      category: r.category,
      order: r.order,
    }));
}

export async function getTeacherById(
  id: string,
  locale: Locale
): Promise<TeacherDetail | null> {
  const t = await prisma.teacher.findUnique({
    where: { id },
    include: { translations: { where: { locale }, select: TRANSLATION_SELECT } },
  });
  if (!t || !t.isActive || !t.translations[0]) return null;
  const tr = t.translations[0];
  return {
    id: t.id,
    photo: t.photo,
    fullName: tr.fullName,
    subject: tr.subject,
    position: tr.position,
    education: tr.education,
    bio: tr.bio,
    email: t.email,
    category: t.category,
    order: t.order,
  };
}

export async function getTeacherCategories(
  locale: Locale
): Promise<{ value: TeacherCategory; count: number }[]> {
  const grouped = await prisma.teacher.groupBy({
    by: ['category'],
    where: { isActive: true },
    _count: { category: true },
  });
  return grouped.map((g) => ({
    value: g.category,
    count: g._count.category,
  }));
}
