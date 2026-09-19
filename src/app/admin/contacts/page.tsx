import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ContactForm } from './ContactForm';
import { SocialLinksForm } from './SocialLinksForm';
import type { Locale } from '@prisma/client';
import { cn } from '@/lib/utils/cn';

export const dynamic = 'force-dynamic';

const LOCALES: { value: Locale; label: string }[] = [
  { value: 'ru', label: '🇷🇺 Русский' },
  { value: 'uz', label: '🇺🇿 Oʻzbekcha' },
  { value: 'en', label: '🇬🇧 English' },
];

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const sp = await searchParams;
  const activeLocale = (sp.locale as Locale) ?? 'ru';

  const [allContacts, socials] = await Promise.all([
    prisma.contactInfo.findMany(),
    prisma.socialLink.findMany({ orderBy: { order: 'asc' } }),
  ]);

  const current = allContacts.find((c) => c.locale === activeLocale) ?? allContacts[0];

  return (
    <>
      <AdminPageHeader
        title="Контакты"
        description="Адрес, телефон, email, карта и социальные сети"
      />

      {/* Locale tabs */}
      <div className="mb-6 inline-flex rounded-full border border-ink-100 bg-white p-1 shadow-soft">
        {LOCALES.map((l) => (
          <a
            key={l.value}
            href={`/admin/contacts?locale=${l.value}`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition',
              activeLocale === l.value
                ? 'bg-primary-800 text-white'
                : 'text-ink-600 hover:bg-primary-50 hover:text-primary-800'
            )}
          >
            {l.label}
          </a>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ContactForm locale={activeLocale} initial={current ?? null} />
        <SocialLinksForm initial={socials} />
      </div>
    </>
  );
}
