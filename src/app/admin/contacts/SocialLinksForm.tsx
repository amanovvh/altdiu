'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState, useTransition } from 'react';
import { Save, Trash2, Plus, X, Check } from 'lucide-react';
import { AdminInput, AdminSelect } from '@/components/admin/AdminFormField';
import { saveSocialLink, deleteSocialLink } from './actions';

interface Social {
  id: string;
  platform: string;
  url: string;
  isVisible: boolean;
  order: number;
}

interface Props {
  initial: Social[];
}

const PLATFORMS = [
  { value: 'TELEGRAM', label: 'Telegram' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'TWITTER', label: 'X / Twitter' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
];

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Save className="h-4 w-4" />
      {pending ? 'Сохранение…' : 'Сохранить'}
    </button>
  );
}

export function SocialLinksForm({ initial }: Props) {
  const [items, setItems] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [state, action] = useFormState(saveSocialLink, {});
  const [pending, start] = useTransition();

  const visible = state.ok ? state : {};

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-primary-800">
          Социальные сети
        </h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn-outline"
          >
            <Plus className="h-4 w-4" />
            Добавить
          </button>
        )}
      </div>

      {showForm && (
        <form
          action={action}
          className="mb-4 rounded-xl border border-ink-100 bg-surface-alt/40 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-primary-800">Новая ссылка</p>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded p-1 text-ink-400 hover:bg-ink-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {state.error && (
            <p className="mb-3 rounded bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {state.error}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminSelect label="Платформа" name="platform" required
              options={PLATFORMS} />
            <AdminInput label="URL" name="url" type="url" required
              placeholder="https://t.me/your_channel" />
            <AdminInput label="Порядок" name="order" type="number"
              defaultValue={items.length} />
            <div className="flex items-end">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm">
                <input type="checkbox" name="isVisible" value="true"
                  defaultChecked
                  className="h-4 w-4 rounded border-ink-300 text-primary-700 focus:ring-accent-400" />
                <span className="font-medium text-primary-800">Показывать</span>
              </label>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-ghost"
            >
              Отмена
            </button>
            <SaveBtn />
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-ink-500">Нет ссылок</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 bg-white px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary-800">
                  {PLATFORMS.find((p) => p.value === item.platform)?.label ?? item.platform}
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-xs text-ink-500 hover:text-accent-700"
                >
                  {item.url}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    item.isVisible
                      ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700'
                      : 'rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600'
                  }
                >
                  {item.isVisible ? 'Видимая' : 'Скрыта'}
                </span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm('Удалить ссылку?')) return;
                    start(async () => {
                      await deleteSocialLink(item.platform);
                      setItems(items.filter((i) => i.id !== item.id));
                    });
                  }}
                  className="rounded-lg p-2 text-ink-500 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
