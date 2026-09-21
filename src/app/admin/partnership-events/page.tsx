import Link from 'next/link';
import { listPartnershipEvents } from '@/services/partnership-event.service';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/AdminDataTable';
import { CldImage } from '@/components/ui/CldImage';
import { Calendar, MapPin, Plus, Images } from 'lucide-react';
import { deletePartnershipEventAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function PartnershipEventsListPage() {
  const events = await listPartnershipEvents();

  const rows = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date,
    location: e.location,
    coverImage: e.coverImage,
    photos: e.photos,
    isActive: e.isActive,
  }));

  const columns: Column<(typeof rows)[number]>[] = [
    {
      key: 'event',
      label: 'Мероприятие',
      render: (r) => (
        <div className="flex items-start gap-3">
          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-alt">
            {r.coverImage ? (
              <CldImage
                publicId={r.coverImage}
                alt={r.title}
                width={80}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-300">
                <Calendar className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-primary-800">{r.title}</p>
            {r.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">{r.description}</p>
            )}
            <div className="mt-1 flex items-center gap-3 text-xs text-ink-500">
              {r.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {r.location}
                </span>
              )}
              {r.photos.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Images className="h-3 w-3" />
                  {r.photos.length} фото
                </span>
              )}
            </div>
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
        title="Мероприятия"
        description="Дебаты, встречи, форумы с партнёрами — с обложкой и фотогалереей."
        action={
          <Link href="/admin/partnership-events/new" className="btn-primary group">
            <Plus className="h-4 w-4" />
            Добавить мероприятие
          </Link>
        }
      />

      <AdminDataTable
        rows={rows}
        columns={columns}
        emptyMessage="Мероприятий пока нет"
        editHref={(r) => `/admin/partnership-events/${r.id}`}
        onDelete={(r) => deletePartnershipEventAction(r.id)}
      />
    </>
  );
}