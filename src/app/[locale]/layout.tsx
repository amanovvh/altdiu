import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { isValidLocale, type Locale } from '@/lib/i18n/config';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const messages = await getMessages({ locale });
  const meta = (messages as any).metadata ?? {};
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const alternates: Record<string, string> = {};
  for (const l of routing.locales) {
    alternates[l] = `${baseUrl}/${l}`;
  }

  return {
    title: meta.siteFullName ?? meta.siteName,
    description: meta.description,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: alternates,
    },
    openGraph: {
      title: meta.siteFullName,
      description: meta.tagline,
      url: `${baseUrl}/${locale}`,
      siteName: meta.siteName,
      locale: locale === 'ru' ? 'ru_RU' : locale === 'uz' ? 'uz_UZ' : 'en_US',
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => (l === 'ru' ? 'ru_RU' : l === 'uz' ? 'uz_UZ' : 'en_US')),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale as Locale} />
      </div>
    </NextIntlClientProvider>
  );
}
