import { prisma } from '@/lib/db/prisma';

export interface PartnershipEvent {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  location: string | null;
  coverImage: string | null;
  photos: string[];
  order: number;
  isActive: boolean;
}

/**
 * Public-facing list of partnership events (debates, meetings, forums).
 * Returns active events sorted newest-first.
 */
export async function getPartnershipEvents(): Promise<PartnershipEvent[]> {
  return prisma.partnershipEvent.findMany({
    where: { isActive: true },
    orderBy: [{ date: 'desc' }, { order: 'asc' }],
  });
}

/**
 * Admin-facing list — includes inactive (drafts).
 */
export async function listPartnershipEvents(): Promise<PartnershipEvent[]> {
  return prisma.partnershipEvent.findMany({
    orderBy: [{ date: 'desc' }, { order: 'asc' }],
  });
}

export async function getPartnershipEvent(id: string): Promise<PartnershipEvent | null> {
  return prisma.partnershipEvent.findUnique({ where: { id } });
}

export async function createPartnershipEvent(input: {
  title: string;
  description?: string | null;
  date?: Date;
  location?: string | null;
  coverImage?: string | null;
  photos?: string[];
  order?: number;
  isActive?: boolean;
}): Promise<PartnershipEvent> {
  return prisma.partnershipEvent.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      date: input.date ?? new Date(),
      location: input.location ?? null,
      coverImage: input.coverImage ?? null,
      photos: input.photos ?? [],
      order: input.order ?? 0,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updatePartnershipEvent(
  id: string,
  input: Partial<{
    title: string;
    description: string | null;
    date: Date;
    location: string | null;
    coverImage: string | null;
    photos: string[];
    order: number;
    isActive: boolean;
  }>
): Promise<PartnershipEvent> {
  return prisma.partnershipEvent.update({ where: { id }, data: input });
}

export async function deletePartnershipEvent(id: string): Promise<void> {
  await prisma.partnershipEvent.delete({ where: { id } });
}