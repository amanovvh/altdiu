import { cn } from '@/lib/utils/cn';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
  accent?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
  accent = true,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]',
            accent ? 'text-accent-700' : 'text-primary-700'
          )}
        >
          <span
            aria-hidden
            className={cn(
              'h-px w-6',
              accent ? 'bg-accent-400' : 'bg-primary-300'
            )}
          />
          {eyebrow}
        </span>
      )}
      <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-balance text-base text-ink-500 md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
