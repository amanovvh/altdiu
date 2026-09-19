import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/AdminDataTable';
import { CldImage } from '@/components/ui/CldImage';
import { deleteTeacher, toggleTeacherActive } from './actions';

export const dynamic = 'force-dynamic';

const CAT_LABELS: Record<string, string> = {
  ECONOMICS: 'Экономика',
  LANGUAGES: 'Иностранные языки',
  MATHEMATICS: 'Математика',
  NATURAL_SCIENCES: 'Естественные науки',
  HUMANITIES: 'Гуманитарные науки',
  OTHER: 'Другое',
};

export default async function TeachersListPage() {
  const records = await prisma.teacher.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { translations: true },
  });

  const rows = records.map((t) => ({
    id: t.id,
    photo: t.photo,
    fullName: t.translations[0]?.fullName ?? '—',
    subject: t.translations[0]?.subject ?? '',
    category: t.category,
    isActive: t.isActive,
    email: t.email,
    translations: t.translations.map((tr) => ({
      locale: tr.locale,
      fullName: tr.fullName,
      subject: tr.subject,
      position: tr.position,
      education: tr.education,
      bio: tr.bio,
    })),
  }));

  const columns: Column<(typeof rows)[number]>[] = [
    {
      key: 'name',
      label: 'Преподаватель',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-brand">
            <CldImage
              publicId={r.photo}
              alt={r.fullName}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-primary-800">{r.fullName}</p>
            <p className="truncate text-xs text-ink-500">{r.subject}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Категория',
      render: (r) => <span className="chip">{CAT_LABELS[r.category]}</span>,
    },
    {
      key: 'status',
      label: 'Статус',
      render: (r) =>
        r.isActive ? (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            Активен
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
            Скрыт
          </span>
        ),
    },
    {
      key: 'actions-row',
      label: 'Действия',
      render: (r) => (
        <form
          action={async () => {
            'use server';
            await toggleTeacherActive(r.id);
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-ink-200 bg-white px-2 py-1 text-xs font-medium text-ink-600 hover:bg-ink-50"
          >
            {r.isActive ? 'Скрыть' : 'Показать'}
          </button>
        </form>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Преподаватели"
        description="Карточки преподавателей и их категории"
      />
      <AdminDataTable
        rows={rows}
        columns={columns}
        editHref={(r) => `/admin/teachers/${r.id}`}
        onDelete={async (r) => {
          'use server';
          await deleteTeacher(r.id);
        }}
        newHref="/admin/teachers/new"
        newLabel="Добавить преподавателя"
        emptyMessage="Нет преподавателей"
      />
    </>
  );
}
