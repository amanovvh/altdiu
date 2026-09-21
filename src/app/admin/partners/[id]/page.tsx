import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { PartnerForm } from '../PartnerForm';
import { updatePartner } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!partner) notFound();

  const initial = {
    logo: partner.logo,
    websiteUrl: partner.websiteUrl,
    category: partner.category,
    photos: partner.photos,
    documentUrl: partner.documentUrl,
    documentDescription: partner.documentDescription,
    order: partner.order,
    isActive: partner.isActive,
    translations: partner.translations.map((t) => ({
      locale: t.locale as 'ru' | 'uz' | 'en',
      name: t.name,
      description: t.description ?? '',
    })),
  };

  const action = updatePartner.bind(null, id);

  return (
    <>
      <AdminPageHeader title="Редактирование партнёра" />
      <PartnerForm action={action} initial={initial} submitLabel="Сохранить" />
    </>
  );
}
