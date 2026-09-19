import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/AdminDataTable';
import { deleteWhyUsCard } from './actions';

export const dynamic = 'force-dynamic';

export default async function WhyUsListPage() {
  const records = await prisma.whyChooseUsCard.findMany({
    orderBy: { order: 'asc' },
    include: { translations: true },
  });

  const rows = records.map((c) => ({
    id: c.id,
    icon: c.icon,
    isActive: c.isActive,
    title: c.translations[0]?.title ?? '—',
    description: c.translations[0]?.description ?? '',
    translations: c.translations.map((t) => ({
      locale: t.locale,
      title: t.title,
      description: t.description,
    })),
  }));

  const columns: Column<(typeof rows)[number]>[] = [
    {
      key: 'title',
      label: 'Карточка',
      render: (r) => (
        <div>
          <div className="flex items-center gap-2">
            {r.icon && (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-700 text-xs font-mono">
                {r.icon.slice(0, 2)}
              </span>
            )}
            <span className="font-medium text-primary-800">{r.title}</span>
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-ink-500">{r.description}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Статус',
      render: (r) =>
        r.isActive ? <span className="chip">Активна</span> : <span className="text-ink-400">Скрыта</span>,
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Почему выбирают нас"
        description="Карточки преимуществ лицея (на главной и на странице /why-us)"
      />
      <AdminDataTable
        rows={rows}
        columns={columns}
        editHref={(r) => `/admin/why-us/${r.id}`}
        onDelete={async (r) => { 'use server'; await deleteWhyUsCard(r.id); }}
        newHref="/admin/why-us/new"
        newLabel="Добавить карточку"
        emptyMessage="Нет карточек"
      />
    </>
  );
}
