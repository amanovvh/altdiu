import { Link } from '@/lib/i18n/routing';
import { ArrowRight, BookOpen, Languages } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface DirectionCardProps {
  direction: {
    id: string;
    slug: string;
    title: string;
    shortTitle: string | null;
    icon: string | null;
    color: string | null;
  };
  tagline?: string;
  className?: string;
}

const defaultIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  economics: BookOpen,
  languages: Languages,
};

export function DirectionCard({ direction, tagline, className }: DirectionCardProps) {
  const Icon = defaultIcons[direction.slug] ?? BookOpen;
  return (
    <Link
      href={`/directions/${direction.slug}` as any}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl',
        className
      )}
    >
      {/* decorative gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent-100/50 blur-3xl transition-opacity duration-500 group-hover:bg-accent-200/70"
      />

      <div className="flex items-center gap-4">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-800 transition-all duration-500 group-hover:bg-primary-800 group-hover:text-accent-400">
          <Icon className="h-7 w-7" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">
            {direction.shortTitle ?? direction.title}
          </p>
          <h3 className="mt-1 text-2xl font-bold text-primary-800">
            {direction.title}
          </h3>
        </div>
      </div>

      {tagline && (
        <p className="mt-6 text-pretty text-base text-ink-600">{tagline}</p>
      )}

      <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary-700 group-hover:text-accent-700">
        Подробнее
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>

      <span
        aria-hidden
        className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-400 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
    </Link>
  );
}
