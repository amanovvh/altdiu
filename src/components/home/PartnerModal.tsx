'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X, ExternalLink, FileImage, Calendar } from 'lucide-react';
import type { PartnerItem } from '@/services/partner.service';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils/cn';

interface Props {
  partner: PartnerItem | null;
  locale: Locale;
  onClose: () => void;
}

/**
 * Modal dialog that opens when a partner card is clicked on the
 * "Сотрудничество" page. Shows:
 *   - Logo + name + description
 *   - Photo gallery (if any)
 *   - Document scan (if any) with caption above it
 *   - Link to partner's website
 */
export function PartnerModal({ partner, locale, onClose }: Props) {
  // Lock body scroll while open
  useEffect(() => {
    if (!partner) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [partner]);

  // Escape key closes
  useEffect(() => {
    if (!partner) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [partner, onClose]);

  if (!partner) return null;

  const tr =
    partner.translations.find((t) => t.locale === locale) ?? partner.translations[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={tr?.name}
    >
      <div
        className={cn(
          'relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-primary-800 via-primary-800 to-primary-900 px-6 py-5 text-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              {partner.logo ? (
                <img
                  src={partner.logo}
                  alt={tr?.name ?? ''}
                  className="h-full w-full object-contain p-1.5"
                />
              ) : (
                <span className="font-display text-2xl font-bold">
                  {(tr?.name ?? '?').slice(0, 1)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              {partner.category && (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-300">
                  {partner.category}
                </p>
              )}
              <h2 className="mt-0.5 text-balance text-2xl font-bold leading-tight">
                {tr?.name}
              </h2>
            </div>
          </div>
          {tr?.description && (
            <p className="mt-4 text-pretty text-sm text-ink-100">{tr.description}</p>
          )}
          {partner.websiteUrl && (
            <a
              href={partner.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-300 hover:text-accent-200"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Перейти на сайт
            </a>
          )}
        </div>

        {/* Body — scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {/* Photo gallery */}
          {partner.photos.length > 0 && (
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
                Фотографии ({partner.photos.length})
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {partner.photos.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block overflow-hidden rounded-xl bg-surface-alt"
                  >
                    <img
                      src={url}
                      alt={`${tr?.name ?? ''} — фото ${idx + 1}`}
                      className="aspect-square h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Document (e.g. scanned agreement) */}
          {partner.documentUrl && (
            <section className={partner.photos.length > 0 ? 'mt-6' : ''}>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
                <FileImage className="h-3.5 w-3.5" />
                Документ о сотрудничестве
              </h3>
              {partner.documentDescription && (
                <p className="mb-3 rounded-xl border border-accent-200 bg-accent-50/60 px-4 py-3 text-sm text-ink-700">
                  {partner.documentDescription}
                </p>
              )}
              <a
                href={partner.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition hover:shadow-lg"
              >
                <img
                  src={partner.documentUrl}
                  alt={partner.documentDescription ?? 'Документ о сотрудничестве'}
                  className="w-full"
                  loading="lazy"
                />
                <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-ink-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Открыть в полном размере
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </a>
            </section>
          )}

          {/* Empty state — no extra media */}
          {partner.photos.length === 0 && !partner.documentUrl && (
            <p className="text-center text-sm text-ink-500">
              Дополнительные материалы будут добавлены администрацией.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}