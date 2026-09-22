'use client';

import { useRouter, usePathname } from '@/lib/i18n/routing';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Category {
  value: string;
  label: string;
  count: number;
}

interface Props {
  categories: Category[];
  active: string;
}

export function TeachersFilter({ categories, active }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (value: string) => {
    if (value === 'ALL') {
      router.push(pathname as any);
    } else {
      router.push(`${pathname}?category=${value.toLowerCase()}` as any);
    }
  };

  // Visually separate FOREIGN from the rest of the filters:
  //   1. Render it after a thin divider
  //   2. Apply a distinct sky-blue styling so it doesn't blend with the
  //      navy/gray primary filters
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
      <div className="inline-flex min-w-full items-center gap-2 md:flex-wrap">
        {categories.map((cat, idx) => {
          const isActive = active === cat.value;
          const isForeign = cat.value === 'FOREIGN';
          return (
            <span key={cat.value} className="inline-flex items-center">
              {/* Vertical divider before FOREIGN tab to separate it visually */}
              {isForeign && (
                <span
                  aria-hidden
                  className="mx-2 hidden h-6 w-px bg-ink-200 md:inline-block"
                />
              )}
              <button
                type="button"
                onClick={() => handleClick(cat.value)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                  isForeign
                    ? // Distinct sky-blue styling for the FOREIGN tab
                      isActive
                      ? 'border-sky-700 bg-sky-700 text-white shadow-soft'
                      : 'border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-400 hover:bg-sky-100 hover:text-sky-900'
                    : // Default navy / gray for primary filters
                      isActive
                      ? 'border-primary-800 bg-primary-800 text-white shadow-soft'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800'
                )}
              >
                {isForeign && (
                  <Globe
                    className={cn(
                      'h-3.5 w-3.5',
                      isActive ? 'text-white' : 'text-sky-600'
                    )}
                  />
                )}
                {cat.label}
                <span
                  className={cn(
                    'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-2xs font-semibold',
                    isForeign
                      ? isActive
                        ? 'bg-sky-500 text-white'
                        : 'bg-white text-sky-700'
                      : isActive
                      ? 'bg-accent-500 text-primary-900'
                      : 'bg-ink-100 text-ink-700'
                  )}
                >
                  {cat.count}
                </span>
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}