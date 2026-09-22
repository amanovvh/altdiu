'use client';

import { useRouter, usePathname } from '@/lib/i18n/routing';
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

  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
      <div className="inline-flex min-w-full items-center gap-2 md:flex-wrap">
        {categories.map((cat) => {
          const isActive = active === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleClick(cat.value)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'border-primary-800 bg-primary-800 text-white shadow-soft'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800'
              )}
            >
              {cat.label}
              <span
                className={cn(
                  'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-2xs font-semibold',
                  isActive ? 'bg-accent-500 text-primary-900' : 'bg-ink-100 text-ink-700'
                )}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}