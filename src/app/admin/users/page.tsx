import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/AdminDataTable';
import { formatRelative } from '@/lib/utils/dates';
import { getCurrentAdmin } from '@/server/auth';
import { toggleUserActive, deleteUser } from './actions';
import { CreateUserForm } from './CreateUserForm';

export const dynamic = 'force-dynamic';

const ROLE_LABELS = {
  SUPER_ADMIN: { label: 'Super Admin', cls: 'bg-rose-100 text-rose-700' },
  ADMIN: { label: 'Admin', cls: 'bg-accent-100 text-accent-800' },
  EDITOR: { label: 'Editor', cls: 'bg-ink-100 text-ink-700' },
} as const;

export default async function UsersPage() {
  const me = await getCurrentAdmin();
  const records = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const rows = records.map((u) => ({
    id: u.id,
    email: (u as any).email,
    name: (u as any).name,
    role: u.role,
    isActive: u.isActive,
    lastSeenAt: u.lastSeenAt,
    createdAt: u.createdAt,
  }));

  const columns: Column<(typeof rows)[number]>[] = [
    {
      key: 'user',
      label: 'Администратор',
      render: (r) => (
        <div>
          <p className="font-medium text-primary-800">{r.name ?? r.email}</p>
          <p className="text-xs text-ink-500">{r.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Роль',
      render: (r) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_LABELS[r.role].cls}`}>
          {ROLE_LABELS[r.role].label}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Статус',
      render: (r) =>
        r.isActive ? (
          <span className="chip">Активен</span>
        ) : (
          <span className="text-ink-400">Отключён</span>
        ),
    },
    {
      key: 'last',
      label: 'Последний визит',
      render: (r) =>
        r.lastSeenAt ? (
          <span className="text-xs text-ink-500">{formatRelative(r.lastSeenAt, 'ru')}</span>
        ) : (
          <span className="text-xs text-ink-400">никогда</span>
        ),
    },
  ];

  const isSuperAdmin = me?.role === 'SUPER_ADMIN';

  return (
    <>
      <AdminPageHeader
        title="Пользователи"
        description="Администраторы с доступом к панели"
      />

      {isSuperAdmin ? (
        <div className="mb-6">
          <CreateUserForm />
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          ⚠️ Только Super Admin может создавать, удалять и сбрасывать пароли пользователей.
        </div>
      )}

      <AdminDataTable
        rows={rows}
        columns={columns}
        editHref={(r) => `/admin/users/${r.id}`}
        onDelete={
          isSuperAdmin
            ? async (r) => {
              if (r.id === me?.id) return;
              await deleteUser(r.id);
            }
            : undefined
        }
        emptyMessage="Нет пользователей"
      />
    </>
  );
}
