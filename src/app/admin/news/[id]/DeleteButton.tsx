'use client';

import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { deleteNews } from '../actions';

export function DeleteNewsButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm('Удалить новость безвозвратно?')) return;
        start(async () => {
          await deleteNews(id);
        });
      }}
      className="btn-outline border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
      {pending ? 'Удаление…' : 'Удалить'}
    </button>
  );
}
