import { CldImage } from '@/components/ui/CldImage';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Link } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { ExternalLink, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { PartnerItem } from '@/services/partner.service';
import type { Locale } from '@/lib/i18n/config';

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

  if (partners.length === 0) return null;

  return (
    <section className={cn(variant === 'homepage' ? 'section bg-surface-alt' : 'section bg-white', className)}>
      <div className="container-wide">
        <SectionHeader
          eyebrow={t('partnersSubtitle')}
          title={t('partnersTitle')}
          align="center"
          className="mb-12"
        />

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {limited.map((partner) => {
            const tr = partner.translations.find((t) => t.locale === locale) || partner.translations[0];
            if (!tr) return null;
            const inner = (
              <div className="group flex h-full flex-col items-center justify-center rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
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
                  <p className="mt-2 text-xs text-ink-500 line-clamp-3">
                    {tr.description}
                  </p>
                )}
                {partner.websiteUrl && variant === 'full' && (
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-700">
                    {tCommon('visitWebsite')}
                    <ExternalLink className="h-3 w-3" />
                  </span>
                )}
              </div>
            );
            return (
              <div key={partner.id}>
                {partner.websiteUrl ? (
                  <a
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </div>
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
    </section>
  );
}
