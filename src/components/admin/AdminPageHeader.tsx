import { cn } from '@/lib/utils/cn';

interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({ title, description, action, className }: Props) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-end justify-between gap-3', className)}>
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-800 lg:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-ink-500">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
