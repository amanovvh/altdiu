'use client';

import { cn } from '@/lib/utils/cn';

export interface CategoryTab<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface Props<T extends string> {
  tabs: CategoryTab<T>[];
  active: T;
  onChange: (value: T) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

export function CategoryTabs<T extends string>({
  tabs,
  active,
  onChange,
  variant = 'pills',
  className,
}: Props<T>) {
  return (
    <div
      className={cn(
        variant === 'pills'
          ? 'inline-flex flex-wrap items-center gap-1 rounded-full border border-ink-100 bg-white p-1 shadow-soft'
          : 'border-b border-ink-100',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        if (variant === 'pills') {
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-800 text-white shadow-soft'
                  : 'text-ink-600 hover:bg-primary-50 hover:text-primary-800'
              )}
            >
              {tab.label}
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-2xs font-semibold',
                    isActive
                      ? 'bg-accent-500 text-primary-900'
                      : 'bg-ink-100 text-ink-700'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'text-primary-800 after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:bg-accent-500'
                : 'text-ink-500 hover:text-primary-700'
            )}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span className="text-xs text-ink-400">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
