import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { TeacherForm } from '../TeacherForm';
import { updateTeacher } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditTeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await prisma.teacher.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!t) notFound();

  const initial = {
    photo: t.photo,
    category: t.category,
    order: t.order,
    email: t.email,
    isActive: t.isActive,
    translations: t.translations.map((tr) => ({
      locale: tr.locale as 'ru' | 'uz' | 'en',
      fullName: tr.fullName,
      subject: tr.subject,
      position: tr.position ?? '',
      education: tr.education ?? '',
      bio: tr.bio ?? '',
    })),
  };

  const action = updateTeacher.bind(null, id);

  return (
    <>
      <AdminPageHeader title="Редактирование преподавателя" />
      <TeacherForm action={action} initial={initial} submitLabel="Сохранить изменения" />
    </>
  );
}
