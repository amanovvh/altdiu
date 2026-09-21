import { prisma } from '@/lib/db/prisma';

export interface PartnerDocument {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileSize: number | null;
  date: Date;
  order: number;
  isActive: boolean;
}

/**
 * Public-facing list of partnership documents (agreements, contracts, PDFs).
 * Returns active documents sorted newest-first.
 */
export async function getPartnerDocuments(): Promise<PartnerDocument[]> {
  return prisma.partnerDocument.findMany({
    where: { isActive: true },
    orderBy: [{ date: 'desc' }, { order: 'asc' }],
  });
}

/**
 * Admin-facing list — includes inactive (drafts).
 */
export async function listPartnerDocuments(): Promise<PartnerDocument[]> {
  return prisma.partnerDocument.findMany({
    orderBy: [{ date: 'desc' }, { order: 'asc' }],
  });
}

export async function getPartnerDocument(id: string): Promise<PartnerDocument | null> {
  return prisma.partnerDocument.findUnique({ where: { id } });
}

export async function createPartnerDocument(input: {
  title: string;
  description?: string | null;
  fileUrl: string;
  fileSize?: number | null;
  date?: Date;
  order?: number;
  isActive?: boolean;
}): Promise<PartnerDocument> {
  return prisma.partnerDocument.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      fileUrl: input.fileUrl,
      fileSize: input.fileSize ?? null,
      date: input.date ?? new Date(),
      order: input.order ?? 0,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updatePartnerDocument(
  id: string,
  input: Partial<{
    title: string;
    description: string | null;
    fileUrl: string;
    fileSize: number | null;
    date: Date;
    order: number;
    isActive: boolean;
  }>
): Promise<PartnerDocument> {
  return prisma.partnerDocument.update({ where: { id }, data: input });
}

export async function deletePartnerDocument(id: string): Promise<void> {
  await prisma.partnerDocument.delete({ where: { id } });
}