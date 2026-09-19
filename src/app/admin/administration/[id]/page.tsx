import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminPersonForm } from '../AdminForm';
import { updateAdministrator } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditAdminPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = await prisma.administrator.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!a) notFound();

  const initial = {
    photo: a.photo,
    images: a.images,
    email: a.email,
    phone: a.phone,
    order: a.order,
    isActive: a.isActive,
    translations: a.translations.map((t) => ({
      locale: t.locale as 'ru' | 'uz' | 'en',
      fullName: t.fullName,
      position: t.position,
      bio: t.bio ?? '',
      education: t.education ?? '',
    })),
  };

  const action = updateAdministrator.bind(null, id);

  return (
    <>
      <AdminPageHeader title="Редактирование" />
      <AdminPersonForm action={action} initial={initial} submitLabel="Сохранить изменения" />
    </>
  );
}
