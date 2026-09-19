import { cn } from '@/lib/utils/cn';

/**
 * Renders a clean placeholder message for content that hasn't been added yet.
 * Used everywhere we need to indicate "data is coming" without inventing facts.
 */
export function Placeholder({
  text,
  className,
  variant = 'default',
}: {
  text: string;
  className?: string;
  variant?: 'default' | 'subtle' | 'card';
}) {
  const styles = {
    default: 'border-dashed border-ink-200 bg-surface-alt/50 text-ink-500',
    subtle: 'border-transparent bg-transparent text-ink-400 italic',
    card: 'border-dashed border-ink-200 bg-white text-ink-500 shadow-soft',
  };
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl px-6 py-8 text-center text-sm',
        styles[variant],
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="opacity-50"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
        <span>{text}</span>
      </div>
    </div>
  );
}
