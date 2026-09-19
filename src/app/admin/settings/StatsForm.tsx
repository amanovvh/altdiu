'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Save, Check } from 'lucide-react';
import { AdminInput } from '@/components/admin/AdminFormField';
import { saveStats } from './actions';

interface Props {
  initial: { years: number; students: number; teachers: number; graduates: number };
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Save className="h-4 w-4" />
      {pending ? 'Сохранение…' : 'Сохранить'}
    </button>
  );
}

export function StatsForm({ initial }: Props) {
  const [state, action] = useFormState(saveStats, {});
  return (
    <form action={action} className="space-y-4">
      {state.ok && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> Сохранено
        </div>
      )}
      {state.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {state.error}
        </div>
      )}
      <AdminInput label="Лет работы" name="years" type="number" defaultValue={initial.years} />
      <AdminInput label="Студентов" name="students" type="number" defaultValue={initial.students} />
      <AdminInput label="Преподавателей" name="teachers" type="number" defaultValue={initial.teachers} />
      <AdminInput label="Выпускников" name="graduates" type="number" defaultValue={initial.graduates} />
      <div className="flex justify-end">
        <SubmitBtn />
      </div>
    </form>
  );
}
