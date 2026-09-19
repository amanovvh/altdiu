import { Link } from '@/lib/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { CldImage } from './CldImage';
import { ArrowUpRight } from 'lucide-react';
import { formatShortDate } from '@/lib/utils/dates';
import { cn } from '@/lib/utils/cn';
import type { Locale } from '@/lib/i18n/config';

interface NewsCardProps {
  news: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string | null;
    category: string | null;
    publishedAt: Date | null;
    isPinned?: boolean;
  };
  variant?: 'feature' | 'default' | 'compact';
  className?: string;
}

export function NewsCard({ news, variant = 'default', className }: NewsCardProps) {
  const locale = useLocale() as Locale;
  const tCommon = useTranslations('common');
  const dateLabel = news.publishedAt ? formatShortDate(news.publishedAt, locale) : '';

  if (variant === 'feature') {
    return (
      <Link
        href={`/news/${news.slug}` as any}
        className={cn(
          'group relative flex flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft transition-all duration-500 hover:shadow-xl',
          className
        )}
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <CldImage
            publicId={news.coverImage}
            alt={news.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/30 to-transparent" />
          {news.isPinned && (
            <span className="absolute left-4 top-4 chip-accent">📌 Pinned</span>
          )}
          {news.category && (
            <span className="absolute right-4 top-4 chip bg-white/90 text-primary-800">
              {news.category}
            </span>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
            {dateLabel && (
              <span className="text-xs uppercase tracking-widest text-accent-300">
                {dateLabel}
              </span>
            )}
            <h3 className="mt-2 max-w-3xl text-balance text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">
              {news.title}
            </h3>
            <p className="mt-3 max-w-2xl text-pretty text-sm text-ink-100/90 md:text-base">
              {news.excerpt}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/news/${news.slug}` as any}
        className={cn(
          'group flex items-start gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-ink-100 hover:bg-surface-alt/60',
          className
        )}
      >
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-surface-alt">
          <CldImage
            publicId={news.coverImage}
            alt={news.title}
            fill
            className="object-cover"
            sizes="112px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-ink-500">
            {dateLabel && <time>{dateLabel}</time>}
            {news.category && (
              <>
                <span aria-hidden>·</span>
                <span className="truncate">{news.category}</span>
              </>
            )}
          </div>
          <h4 className="mt-1 line-clamp-2 text-sm font-semibold text-primary-800 group-hover:text-accent-700">
            {news.title}
          </h4>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/news/${news.slug}` as any}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-xl',
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-alt">
        <CldImage
          publicId={news.coverImage}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {news.isPinned && (
          <span className="absolute left-3 top-3 chip-accent">📌 Pinned</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-ink-500">
          {dateLabel && <time>{dateLabel}</time>}
          {news.category && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate">{news.category}</span>
            </>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 text-lg font-bold text-primary-800 transition-colors group-hover:text-accent-700">
          {news.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-ink-500">{news.excerpt}</p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 group-hover:text-accent-700">
          {tCommon('readMore')}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
