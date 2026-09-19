import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/AdminDataTable';
import { CldImage } from '@/components/ui/CldImage';
import { ExternalLink, Building2 } from 'lucide-react';
import { deletePartner } from './actions';

export const dynamic = 'force-dynamic';

export default async function PartnersListPage() {
  const records = await prisma.partner.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { translations: true },
  });

  const rows = records.map((p) => ({
    id: p.id,
    logo: p.logo,
    name: p.translations[0]?.name ?? '—',
    category: p.category,
    websiteUrl: p.websiteUrl,
    isActive: p.isActive,
    translations: p.translations.map((t) => ({
      locale: t.locale,
      name: t.name,
      description: t.description,
    })),
  }));

  const columns: Column<(typeof rows)[number]>[] = [
    {
      key: 'partner',
      label: 'Партнёр',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-alt">
            {r.logo ? (
              <CldImage publicId={r.logo} alt={r.name} width={64} height={48} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-300">
                <Building2 className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-primary-800">{r.name}</p>
            {r.websiteUrl && (
              <a href={r.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 truncate text-xs text-ink-500 hover:text-accent-700">
                <ExternalLink className="h-3 w-3" />
                {r.websiteUrl.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category', label: 'Категория', render: (r) =>
        r.category ? <span className="chip">{r.category}</span> : <span className="text-ink-400">—</span>
    },
    {
      key: 'status', label: 'Статус', render: (r) =>
        r.isActive ? <span className="chip">Активен</span> : <span className="text-ink-400">Скрыт</span>
    },
  ];

  return (
    <>
      <AdminPageHeader title="Сотрудничетсво" description="Партнёры и друзья лицея (лого, название, сайт)" />
      <AdminDataTable
        rows={rows}
        columns={columns}
        editHref={(r) => `/admin/partners/${r.id}`}
        onDelete={async (r) => { 'use server'; await deletePartner(r.id); }}
        newHref="/admin/partners/new"
        newLabel="Добавить партнёра"
        emptyMessage="Нет партнёров"
      />
    </>
  );
}
