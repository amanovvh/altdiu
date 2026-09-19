import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/AdminDataTable';
import { formatDate } from '@/lib/utils/dates';
import { togglePublishNews, togglePinNews, deleteNews } from './actions';

export const dynamic = 'force-dynamic';

const STATUS_LABELS = {
  DRAFT: { label: 'Черновик', cls: 'bg-ink-100 text-ink-700' },
  PUBLISHED: { label: 'Опубликовано', cls: 'bg-emerald-100 text-emerald-700' },
  ARCHIVED: { label: 'Архив', cls: 'bg-amber-100 text-amber-700' },
} as const;

export default async function NewsListPage() {
  const records = await prisma.news.findMany({
    orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    include: { translations: true },
  });

  const rows = records.map((n) => ({
    id: n.id,
    status: n.status,
    isPinned: n.isPinned,
    title: n.translations[0]?.title ?? '(без названия)',
    locale: n.translations[0]?.locale ?? 'ru',
    category: n.category,
    publishedAt: n.publishedAt,
    createdAt: n.createdAt,
    translations: n.translations.map((t) => ({
      locale: t.locale,
      title: t.title,
      excerpt: t.excerpt,
      body: t.body,
    })),
    coverImage: n.coverImage,
    images: n.images,
  }));

  const columns: Column<(typeof rows)[number]>[] = [
    {
      key: 'title',
      label: 'Заголовок',
      render: (r) => (
        <div>
          <div className="flex items-center gap-2">
            {r.isPinned && <span title="Закреплено">📌</span>}
            <span className="font-medium text-primary-800">{r.title}</span>
          </div>
          {r.translations.length > 1 && (
            <div className="mt-1 flex gap-1">
              {r.translations.map((t) => (
                <span
                  key={t.locale}
                  className="rounded-full bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-ink-600"
                >
                  {t.locale}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Категория',
      render: (r) =>
        r.category ? (
          <span className="chip">{r.category}</span>
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
    {
      key: 'status',
      label: 'Статус',
      render: (r) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_LABELS[r.status].cls}`}
        >
          {STATUS_LABELS[r.status].label}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Дата',
      render: (r) =>
        r.publishedAt ? (
          <span className="text-ink-600">{formatDate(r.publishedAt, 'ru')}</span>
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
    {
      key: 'actions-row',
      label: 'Действия',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <ToggleAction
            id={r.id}
            action={togglePublishNews}
            label={r.status === 'PUBLISHED' ? 'Снять' : 'Опубликовать'}
            active={r.status === 'PUBLISHED'}
          />
          <ToggleAction
            id={r.id}
            action={togglePinNews}
            label={r.isPinned ? 'Открепить' : 'Закрепить'}
            active={r.isPinned}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Новости"
        description="Управление публикациями и черновиками"
      />
      <AdminDataTable
        rows={rows}
        columns={columns}
        editHref={(r) => `/admin/news/${r.id}`}
        onDelete={async (r) => {
          'use server';
          await deleteNews(r.id);
        }}
        newHref="/admin/news/new"
        newLabel="Создать новость"
        emptyMessage="Нет новостей. Создайте первую."
      />
    </>
  );
}

function ToggleAction({
  id,
  action,
  label,
  active,
}: {
  id: string;
  action: (id: string) => Promise<void>;
  label: string;
  active: boolean;
}) {
  return (
    <form
      action={async () => {
        'use server';
        await action(id);
      }}
    >
      <button
        type="submit"
        className={`rounded-md px-2 py-1 text-xs font-medium transition ${
          active
            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
        }`}
      >
        {label}
      </button>
    </form>
  );
}
