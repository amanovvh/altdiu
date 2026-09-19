import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { getAdministrators } from '@/services/administration.service';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Placeholder } from '@/components/ui/Placeholder';
import { CldImage } from '@/components/ui/CldImage';
import { Mail, Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdministrationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const t = await getTranslations({ locale, namespace: 'administration' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const administrators = await getAdministrators(locale as Locale);

  return (
    <>
      <section className="bg-gradient-soft py-16 md:py-20">
        <div className="container-tight">
          <SectionHeader
            eyebrow={t('pageSubtitle')}
            title={t('pageTitle')}
            align="left"
          />
        </div>
      </section>

      <section className="section">
        <div className="container-tight">
          {administrators.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {administrators.map((a) => (
                <article
                  key={a.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft transition-all duration-500 hover:shadow-xl sm:flex-row"
                >
                  <div className="relative aspect-square w-full shrink-0 bg-gradient-to-br from-primary-100 to-accent-50 sm:aspect-auto sm:w-48 md:w-56">
                    <CldImage
                      publicId={a.photo}
                      alt={a.fullName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 224px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent-700">
                      {a.position}
                    </span>
                    <h3 className="mt-1 text-2xl font-bold text-primary-800">
                      {a.fullName}
                    </h3>
                    
                    {/* Detail info comes from a separate fetch */}
                    <AdminDetailBlock adminId={a.id} locale={locale as Locale} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Placeholder text={t('placeholder')} />
          )}
        </div>
      </section>
    </>
  );
}

async function AdminDetailBlock({
  adminId,
  locale,
}: {
  adminId: string;
  locale: Locale;
}) {
  const { getAdministratorById } = await import('@/services/administration.service');
  const admin = await getAdministratorById(adminId, locale);
  if (!admin) return null;
  return (
    <>
      {admin.bio && (
        <p className="mt-3 text-sm text-ink-600">{admin.bio}</p>
      )}
      {admin.education && (
        <p className="mt-3 text-xs text-ink-500">
          <span className="font-semibold text-ink-700">Образование: </span>
          {admin.education}
        </p>
      )}
      {(admin.email || admin.phone) && (
        <div className="mt-4 flex flex-col gap-2 border-t border-ink-100 pt-4 text-xs text-ink-600">
          {admin.email && (
            <a
              href={`mailto:${admin.email}`}
              className="inline-flex items-center gap-2 hover:text-accent-700"
            >
              <Mail className="h-3.5 w-3.5" />
              {admin.email}
            </a>
          )}
          {admin.phone && (
            <a
              href={`tel:${admin.phone.replace(/[^\d+]/g, '')}`}
              className="inline-flex items-center gap-2 hover:text-accent-700"
            >
              <Phone className="h-3.5 w-3.5" />
              {admin.phone}
            </a>
          )}
        </div>
      )}
    </>
  );
}
