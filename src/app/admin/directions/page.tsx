import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/AdminDataTable';
import { deleteDirection } from './actions';

export const dynamic = 'force-dynamic';

export default async function DirectionsPage() {
  const records = await prisma.direction.findMany({
    orderBy: [{ order: 'asc' }],
    include: { translations: true, subjects: true },
  });

  const rows = records.map((d) => ({
    id: d.id,
    slug: d.slug,
    title: d.translations[0]?.title ?? '—',
    shortTitle: d.translations[0]?.shortTitle,
    subjects: d.subjects.map((s) => s.name).join(', '),
    isActive: d.isActive,
  }));

  const columns: Column<(typeof rows)[number]>[] = [
    { key: 'title', label: 'Название', render: (r) => (
      <div>
        <p className="font-medium text-primary-800">{r.title}</p>
        {r.shortTitle && <p className="text-xs text-ink-500">{r.shortTitle}</p>}
      </div>
    ) },
    { key: 'slug', label: 'Slug', render: (r) => <code className="text-xs">/{r.slug}</code> },
    { key: 'subjects', label: 'Предметы', render: (r) => (
      <span className="text-xs text-ink-600">{r.subjects || '—'}</span>
    ) },
  ];

  return (
    <>
      <AdminPageHeader title="Направления обучения" description="Economics и Languages" />
      <AdminDataTable
        rows={rows}
        columns={columns}
        editHref={(r) => `/ru/directions/${r.slug}`}
        onDelete={async (r) => { 'use server'; await deleteDirection(r.id); }}
        newHref="/admin/directions/new"
        newLabel="Добавить"
        emptyMessage="Нет направлений"
      />
    </>
  );
}
