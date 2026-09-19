import { Link } from '@/lib/i18n/routing';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
  className?: string;
}

export function Pagination({ page, pageSize, total, basePath, searchParams, className }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (searchParams) {
      for (const [k, v] of Object.entries(searchParams)) {
        if (v !== undefined && k !== 'page') params.set(k, v);
      }
    }
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ''}`;
  };

  const pages: (number | '...')[] = [];
  const push = (v: number | '...') => pages.push(v);
  const window = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - window && i <= page + window)
    ) {
      push(i);
    } else if (pages[pages.length - 1] !== '...') {
      push('...');
    }
  }

  return (
    <nav
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
    >
      <Link
        href={buildHref(Math.max(1, page - 1)) as any}
        aria-disabled={page === 1}
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 text-ink-600 transition',
          page === 1
            ? 'pointer-events-none opacity-40'
            : 'hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`e-${idx}`} className="px-2 text-ink-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p) as any}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition',
              p === page
                ? 'bg-primary-800 text-white shadow-soft'
                : 'border border-ink-100 text-ink-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800'
            )}
          >
            {p}
          </Link>
        )
      )}
      <Link
        href={buildHref(Math.min(totalPages, page + 1)) as any}
        aria-disabled={page === totalPages}
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 text-ink-600 transition',
          page === totalPages
            ? 'pointer-events-none opacity-40'
            : 'hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
