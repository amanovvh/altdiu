'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Save, Check } from 'lucide-react';
import { AdminInput, AdminTextarea } from '@/components/admin/AdminFormField';
import { saveContact } from './actions';

interface Props {
  locale: 'ru' | 'uz' | 'en';
  initial: {
    address: string;
    phone: string;
    email: string;
    mapEmbed: string | null;
    latitude: number | null;
    longitude: number | null;
    schedule: string | null;
    description: string | null;
  } | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Save className="h-4 w-4" />
      {pending ? 'Сохранение…' : 'Сохранить'}
    </button>
  );
}

export function ContactForm({ locale, initial }: Props) {
  const [state, action] = useFormState(saveContact, {});
  return (
    <form action={action} className="card p-6">
      <input type="hidden" name="locale" value={locale} />

      <h2 className="mb-4 font-display text-lg font-bold text-primary-800">
        Контактная информация
      </h2>

      {state.ok && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" />
          Сохранено
        </div>
      )}
      {state.error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        <AdminInput label="Адрес" name="address" required
          defaultValue={initial?.address ?? ''} />
        <AdminInput label="Телефон" name="phone" type="tel" required
          defaultValue={initial?.phone ?? ''} placeholder="+998 71 123 45 67" />
        <AdminInput label="Email" name="email" type="email" required
          defaultValue={initial?.email ?? ''} placeholder="info@lyceum.uz" />
        <AdminInput label="Часы работы" name="schedule"
          defaultValue={initial?.schedule ?? ''} placeholder="Пн — Пт: 09:00 — 18:00" />
        <AdminTextarea label="Описание (необязательно)" name="description"
          defaultValue={initial?.description ?? ''} rows={2} />
        <AdminInput label="Карта (iframe URL)" name="mapEmbed"
          defaultValue={initial?.mapEmbed ?? ''} hint="URL iframe с OpenStreetMap или Google Maps" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary-800">Широта</label>
            <input
              type="number"
              step="0.000001"
              name="latitude"
              defaultValue={initial?.latitude ?? ''}
              className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-primary-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-200 focus:border-accent-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary-800">Долгота</label>
            <input
              type="number"
              step="0.000001"
              name="longitude"
              defaultValue={initial?.longitude ?? ''}
              className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-primary-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-200 focus:border-accent-400"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
