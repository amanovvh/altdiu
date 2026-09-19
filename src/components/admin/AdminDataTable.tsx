import Link from 'next/link';
import { Edit, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  editHref: (row: T) => string;
  onDelete?: (row: T) => Promise<unknown> | unknown;
  deleteLabel?: string;
  newHref?: string;
  newLabel?: string;
}

export function AdminDataTable<T extends { id: string }>({
  rows,
  columns,
  emptyMessage = 'Нет данных',
  editHref,
  onDelete,
  deleteLabel = 'Удалить',
  newHref,
  newLabel = 'Добавить',
}: Props<T>) {
  return (
    <div className="card overflow-hidden">
      {newHref && (
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
          <p className="text-sm text-ink-500">Всего: {rows.length}</p>
          <Link href={newHref} className="btn-primary">
            <Plus className="h-4 w-4" />
            {newLabel}
          </Link>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center text-ink-500">
          <p className="text-sm">{emptyMessage}</p>
          {newHref && (
            <Link href={newHref} className="btn-outline mt-2">
              <Plus className="h-4 w-4" />
              {newLabel}
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={cn('px-5 py-3 font-semibold', c.className)}
                  >
                    {c.label}
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-alt/60">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn('px-5 py-3 align-middle', c.className)}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={editHref(row)}
                        className="rounded-lg p-2 text-ink-500 transition hover:bg-primary-50 hover:text-primary-700"
                        aria-label="Редактировать"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      {onDelete && (
                        <DeleteButton
                          row={row}
                          action={onDelete}
                          label={deleteLabel}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DeleteButton<T extends { id: string }>({
  row,
  action,
  label,
}: {
  row: T;
  action: (row: T) => Promise<unknown> | unknown;
  label: string;
}) {
  return (
    <form
      action={async () => {
        'use server';
        await action(row);
      }}
    >
      <button
        type="submit"
        className="rounded-lg p-2 text-ink-500 transition hover:bg-rose-50 hover:text-rose-700"
        aria-label={label}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
