import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { defaultLocale, locales, type Locale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (locales as readonly string[]).includes(requested ?? '')
    ? (requested as Locale)
    : defaultLocale;

  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return {
    locale,
    messages,
    timeZone: 'Asia/Tashkent',
    now: new Date(),
  };
});
