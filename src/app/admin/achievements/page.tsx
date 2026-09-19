import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/AdminDataTable';
import { formatDate } from '@/lib/utils/dates';
import { deleteAchievement, toggleAchievementActive } from './actions';

export const dynamic = 'force-dynamic';

const CAT_LABELS = {
  OLYMPIAD: 'Олимпиада',
  CERTIFICATE: 'Сертификат',
  COMPETITION: 'Конкурс',
  SPORT: 'Спорт',
  OTHER: 'Другое',
} as const;

export default async function AchievementsListPage() {
  const records = await prisma.achievement.findMany({
    orderBy: { date: 'desc' },
    include: { translations: true },
  });

  const rows = records.map((a) => ({
    id: a.id,
    title: a.translations[0]?.title ?? '—',
    category: a.category,
    date: a.date,
    isActive: a.isActive,
    translations: a.translations.map((t) => ({
      locale: t.locale,
      title: t.title,
      description: t.description,
    })),
    image: a.image,
  }));

  const columns: Column<(typeof rows)[number]>[] = [
    { key: 'title', label: 'Название', render: (r) => (
      <p className="font-medium text-primary-800">{r.title}</p>
    ) },
    { key: 'category', label: 'Категория', render: (r) => (
      <span className="chip">{CAT_LABELS[r.category]}</span>
    ) },
    { key: 'date', label: 'Дата', render: (r) => (
      <span className="text-ink-600">{formatDate(r.date, 'ru')}</span>
    ) },
    { key: 'status', label: 'Статус', render: (r) =>
      r.isActive ? <span className="chip">Активно</span> : <span className="text-ink-400">Скрыто</span>
    },
    { key: 'actions-row', label: 'Действия', render: (r) => (
      <form action={async () => { 'use server'; await toggleAchievementActive(r.id); }}>
        <button type="submit" className="rounded-md border border-ink-200 bg-white px-2 py-1 text-xs font-medium text-ink-600 hover:bg-ink-50">
          {r.isActive ? 'Скрыть' : 'Показать'}
        </button>
      </form>
    ) },
  ];

  return (
    <>
      <AdminPageHeader title="Достижения" description="Олимпиады, конкурсы, спортивные и академические победы" />
      <AdminDataTable
        rows={rows}
        columns={columns}
        editHref={(r) => `/admin/achievements/${r.id}`}
        onDelete={async (r) => { 'use server'; await deleteAchievement(r.id); }}
        newHref="/admin/achievements/new"
        newLabel="Добавить"
        emptyMessage="Нет достижений"
      />
    </>
  );
}
