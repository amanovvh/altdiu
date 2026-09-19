import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/AdminDataTable';
import { CldImage } from '@/components/ui/CldImage';
import { deleteAdministrator } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminsListPage() {
  const records = await prisma.administrator.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { translations: true },
  });

  const rows = records.map((a) => ({
    id: a.id,
    photo: a.photo,
    fullName: a.translations[0]?.fullName ?? '—',
    position: a.translations[0]?.position ?? '',
    email: a.email,
    phone: a.phone,
    isActive: a.isActive,
    translations: a.translations.map((t) => ({
      locale: t.locale,
      fullName: t.fullName,
      position: t.position,
      bio: t.bio,
      education: t.education,
    })),
  }));

  const columns: Column<(typeof rows)[number]>[] = [
    {
      key: 'name',
      label: 'Член руководства',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-brand">
            <CldImage publicId={r.photo} alt={r.fullName} width={40} height={40} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-primary-800">{r.fullName}</p>
            <p className="truncate text-xs text-ink-500">{r.position}</p>
          </div>
        </div>
      ),
    },
    { key: 'contact', label: 'Контакты', render: (r) => (
      <div className="text-xs text-ink-600">
        {r.email && <div>{r.email}</div>}
        {r.phone && <div>{r.phone}</div>}
      </div>
    ) },
    { key: 'status', label: 'Статус', render: (r) =>
      r.isActive ? <span className="chip">Активен</span> : <span className="text-ink-400">Скрыт</span>
    },
  ];

  return (
    <>
      <AdminPageHeader title="Администрация лицея" description="Руководство и команда" />
      <AdminDataTable
        rows={rows}
        columns={columns}
        editHref={(r) => `/admin/administration/${r.id}`}
        onDelete={async (r) => { 'use server'; await deleteAdministrator(r.id); }}
        newHref="/admin/administration/new"
        newLabel="Добавить"
        emptyMessage="Нет записей"
      />
    </>
  );
}
