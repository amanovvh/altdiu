import { format, formatDistanceToNow } from 'date-fns';
import { ru, uz, enUS } from 'date-fns/locale';
import type { Locale } from '@/lib/i18n/config';

const localeMap = { ru, uz, en: enUS } as const;

export function formatDate(
  date: Date | string | null | undefined,
  locale: Locale = 'ru',
  pattern: string = 'd MMMM yyyy'
): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return format(d, pattern, { locale: localeMap[locale] });
}

export function formatShortDate(
  date: Date | string | null | undefined,
  locale: Locale = 'ru'
): string {
  return formatDate(date, locale, 'd MMM yyyy');
}

export function formatRelative(
  date: Date | string | null | undefined,
  locale: Locale = 'ru'
): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return formatDistanceToNow(d, { addSuffix: true, locale: localeMap[locale] });
}
