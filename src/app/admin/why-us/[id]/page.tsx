import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { WhyUsForm } from '../WhyUsForm';
import { updateWhyUsCard } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditWhyUsCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await prisma.whyChooseUsCard.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!card) notFound();

  const initial = {
    icon: card.icon,
    order: card.order,
    isActive: card.isActive,
    translations: card.translations.map((t) => ({
      locale: t.locale as 'ru' | 'uz' | 'en',
      title: t.title,
      description: t.description,
    })),
  };

  const action = updateWhyUsCard.bind(null, id);

  return (
    <>
      <AdminPageHeader title="Редактирование карточки" />
      <WhyUsForm action={action} initial={initial} submitLabel="Сохранить" />
    </>
  );
}
