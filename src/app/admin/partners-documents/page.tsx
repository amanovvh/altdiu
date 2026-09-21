import Link from 'next/link';
import { listPartnerDocuments } from '@/services/partner-document.service';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/AdminDataTable';
import { FileText, Plus, Calendar, ExternalLink } from 'lucide-react';
import { deletePartnerDocumentAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function PartnerDocumentsListPage() {
  const docs = await listPartnerDocuments();

  const rows = docs.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    fileUrl: d.fileUrl,
    fileSize: d.fileSize,
    date: d.date,
    order: d.order,
    isActive: d.isActive,
  }));

  const columns: Column<(typeof rows)[number]>[] = [
    {
      key: 'doc',
      label: 'Документ',
      render: (r) => (
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-primary-800">{r.title}</p>
            {r.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">{r.description}</p>
            )}
            <a
              href={r.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-primary-700 hover:text-primary-900"
            >
              <ExternalLink className="h-3 w-3" />
              Открыть файл
            </a>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Дата',
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-sm text-ink-600">
          <Calendar className="h-3.5 w-3.5" />
          {new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }).format(r.date)}
        </span>
      ),
    },
    {
      key: 'size',
      label: 'Размер',
      render: (r) =>
        r.fileSize ? (
          <span className="text-sm text-ink-600">{(r.fileSize / 1024).toFixed(0)} KB</span>
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
    {
      key: 'status',
      label: 'Статус',
      render: (r) =>
        r.isActive ? (
          <span className="chip bg-emerald-50 text-emerald-700 border-emerald-200">Активен</span>
        ) : (
          <span className="chip bg-slate-50 text-slate-600 border-slate-200">Скрыт</span>
        ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Документы о сотрудничестве"
        description="PDF-договоры и соглашения с партнёрами — отображаются на странице «Сотрудничество»."
        action={
          <Link href="/admin/partners-documents/new" className="btn-primary group">
            <Plus className="h-4 w-4" />
            Добавить документ
          </Link>
        }
      />

      <AdminDataTable
        rows={rows}
        columns={columns}
        emptyMessage="Документов пока нет"
        editHref={(r) => `/admin/partners-documents/${r.id}`}
        onDelete={(r) => deletePartnerDocumentAction(r.id)}
      />
    </>
  );
}