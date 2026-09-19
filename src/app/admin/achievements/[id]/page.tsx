import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AchievementForm } from '../AchievementForm';
import { updateAchievement } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditAchievementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = await prisma.achievement.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!a) notFound();

  const initial = {
    category: a.category,
    image: a.image,
    images: a.images,
    date: new Date(a.date).toISOString().slice(0, 10),
    isActive: a.isActive,
    translations: a.translations.map((t) => ({
      locale: t.locale as 'ru' | 'uz' | 'en',
      title: t.title,
      description: t.description ?? '',
    })),
  };

  const action = updateAchievement.bind(null, id);

  return (
    <>
      <AdminPageHeader title="Редактирование достижения" />
      <AchievementForm action={action} initial={initial} submitLabel="Сохранить" />
    </>
  );
}
