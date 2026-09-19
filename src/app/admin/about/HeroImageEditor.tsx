'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Save, Check, ImageIcon } from 'lucide-react';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { saveAboutHero, type FormState } from './actions';

type LocaleCode = 'ru' | 'uz' | 'en';

const LOCALES: { code: LocaleCode; flag: string; label: string }[] = [
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'uz', flag: '🇺🇿', label: 'Oʻzbekcha' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
];

interface InitialByLocale {
  image: string | null;
  caption: string;
}

interface Props {
  initial: Record<LocaleCode, InitialByLocale>;
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

export function HeroImageEditor({ initial }: Props) {
  const [state, action] = useFormState<FormState, FormData>(saveAboutHero, {});

  return (
    <form action={action} className="card mb-6 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-ink-100 bg-accent-50/40 px-6 py-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white">
          <ImageIcon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold text-primary-800">
            Главное фото «О лицее»
          </h2>
          <p className="text-xs text-ink-500">
            Используется в блоке на главной и в hero-секции страницы «О лицее».
            Можно загрузить отдельное фото для каждого языка.
          </p>
        </div>
      </div>

      {state.ok && (
        <div className="m-6 mb-0 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" />
          Сохранено
        </div>
      )}
      {state.error && (
        <div className="m-6 mb-0 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {state.error}
        </div>
      )}

      {/* Locale columns */}
      <div className="grid gap-px bg-ink-100 sm:grid-cols-2 lg:grid-cols-3">
        {LOCALES.map((loc) => {
          const initialLoc = initial[loc.code];
          return (
            <div key={loc.code} className="flex flex-col gap-3 bg-white p-5">
              <div className="flex items-center justify-between border-b border-ink-100 pb-2">
                <h3 className="font-semibold text-primary-800">
                  <span className="mr-1.5">{loc.flag}</span>
                  {loc.label}
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-ink-400">
                  {loc.code}
                </span>
              </div>

              <FileUploadField
                name={`${loc.code}__image`}
                label="Фото"
                initialPublicId={initialLoc.image}
                folder="lyceum/about"
                hint="JPG/PNG/WEBP до 10 МБ. Рекомендуемый размер 1600×1000px."
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end border-t border-ink-100 bg-surface-alt/40 px-6 py-4">
        <SubmitButton />
      </div>
    </form>
  );
}