import { cn } from '@/lib/utils/cn';

interface Props {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'primary' | 'accent' | 'success' | 'warning';
  hint?: string;
}

const accentMap = {
  primary: 'bg-primary-50 text-primary-700',
  accent: 'bg-accent-50 text-accent-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
};

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  accent = 'primary',
  hint,
}: Props) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span
        className={cn(
          'inline-flex h-12 w-12 items-center justify-center rounded-xl',
          accentMap[accent]
        )}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-500">
          {label}
        </p>
        <p className="mt-1 truncate font-display text-2xl font-bold text-primary-800">
          {value}
        </p>
        {hint && <p className="mt-0.5 text-xs text-ink-500">{hint}</p>}
      </div>
    </div>
  );
}
