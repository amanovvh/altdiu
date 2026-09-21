'use client';

import { useState } from 'react';
import { CldImage } from '@/components/ui/CldImage';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Link } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { ExternalLink, Building2, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { PartnerItem } from '@/services/partner.service';
import type { Locale } from '@/lib/i18n/config';
import { PartnerModal } from './PartnerModal';

interface Props {
  partners: PartnerItem[];
  variant?: 'homepage' | 'full';
  className?: string;
}

export function PartnersSection({ partners, variant = 'homepage', className }: Props) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;

  const limited = variant === 'homepage' ? partners.slice(0, 8) : partners;
  const [openPartner, setOpenPartner] = useState<PartnerItem | null>(null);

  if (partners.length === 0) return null;

  return (
    <section className={cn(variant === 'homepage' ? 'section bg-surface-alt' : 'section bg-white', className)}>
      <div className="container-wide">
        {variant === 'homepage' && (
          <SectionHeader
            eyebrow={t('partnersSubtitle')}
            title={t('partnersTitle')}
            align="center"
            className="mb-12"
          />
        )}

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {limited.map((partner) => {
            const tr = partner.translations.find((t) => t.locale === locale) || partner.translations[0];
            if (!tr) return null;
            const hasDetails = partner.photos.length > 0 || partner.documentUrl;
            return (
              <button
                key={partner.id}
                type="button"
                onClick={() => setOpenPartner(partner)}
                className={cn(
                  'group relative flex h-full w-full flex-col items-center justify-center rounded-2xl border bg-white p-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-left',
                  hasDetails ? 'border-primary-200 cursor-pointer' : 'border-ink-100'
                )}
                aria-label={`Открыть подробности о ${tr.name}`}
              >
                <div className="flex h-20 w-full items-center justify-center">
                  {partner.logo ? (
                    <CldImage
                      publicId={partner.logo}
                      alt={tr.name}
                      width={160}
                      height={80}
                      className="h-full w-auto max-w-[160px] object-contain"
                    />
                  ) : (
                    <Building2 className="h-12 w-12 text-ink-300" />
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold text-primary-800 line-clamp-2">
                  {tr.name}
                </p>
                {tr.description && variant === 'full' && (
                  <p className="mt-2 line-clamp-3 text-xs text-ink-500">
                    {tr.description}
                  </p>
                )}
                {/* Indicators: doc / photos */}
                {hasDetails && (
                  <div className="mt-3 flex items-center gap-1.5">
                    {partner.documentUrl && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-medium text-accent-700">
                        <FileImage className="h-2.5 w-2.5" />
                        Документ
                      </span>
                    )}
                    {partner.photos.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700">
                        {partner.photos.length} фото
                      </span>
                    )}
                  </div>
                )}
                {/* External link is opened directly, separate from modal */}
                {partner.websiteUrl && (
                  <a
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/0 text-ink-400 transition hover:bg-primary-50 hover:text-primary-700"
                    aria-label="Перейти на сайт"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </button>
            );
          })}
        </div>

        {variant === 'homepage' && partners.length > 8 && (
          <div className="mt-10 text-center">
            <Link href="/community" className="btn-outline">
              {t('partnersViewAll')}
            </Link>
          </div>
        )}
      </div>

      {/* Modal */}
      <PartnerModal partner={openPartner} locale={locale} onClose={() => setOpenPartner(null)} />
    </section>
  );
}