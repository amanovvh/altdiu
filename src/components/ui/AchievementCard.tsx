import { EntityGallery } from './EntityGallery';
import { Trophy, Award, Medal, Activity, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatShortDate } from '@/lib/utils/dates';
import type { AchievementCategory } from '@prisma/client';
import type { Locale } from '@/lib/i18n/config';

interface AchievementCardProps {
  achievement: {
    id: string;
    category: AchievementCategory;
    title: string;
    description: string | null;
    image: string | null;
    images?: string[];
    date: Date;
  };
  locale: Locale;
  className?: string;
}

const categoryIcons: Record<
  AchievementCategory,
  React.ComponentType<{ className?: string }>
> = {
  OLYMPIAD: Trophy,
  CERTIFICATE: Award,
  COMPETITION: Medal,
  SPORT: Activity,
  OTHER: Sparkles,
};

const categoryColors: Record<AchievementCategory, string> = {
  OLYMPIAD: 'bg-amber-50 text-amber-700 border-amber-200',
  CERTIFICATE: 'bg-sky-50 text-sky-700 border-sky-200',
  COMPETITION: 'bg-violet-50 text-violet-700 border-violet-200',
  SPORT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OTHER: 'bg-slate-50 text-slate-700 border-slate-200',
};

export function AchievementCard({ achievement, locale, className }: AchievementCardProps) {
  const Icon = categoryIcons[achievement.category];
  const colorClass = categoryColors[achievement.category];

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-xl',
        className
      )}
    >
      {achievement.image || (achievement.images && achievement.images.length > 0) ? (
        <EntityGallery
          photo={achievement.image}
          images={achievement.images}
          alt={achievement.title}
          aspect="aspect-[4/3]"
          className="bg-surface-alt"
        />
      ) : (
        <div
          className={cn(
            'flex aspect-[4/3] items-center justify-center border-b border-ink-100',
            colorClass
          )}
        >
          <Icon className="h-16 w-16 opacity-50" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
              colorClass
            )}
          >
            <Icon className="h-3 w-3" />
            {achievement.category}
          </span>
          <time className="text-xs text-ink-500">
            {formatShortDate(achievement.date, locale)}
          </time>
        </div>

        <h3 className="mt-3 line-clamp-2 text-base font-bold text-primary-800">
          {achievement.title}
        </h3>
        {achievement.description && (
          <p className="mt-2 line-clamp-3 text-sm text-ink-500">
            {achievement.description}
          </p>
        )}
      </div>
    </article>
  );
}
