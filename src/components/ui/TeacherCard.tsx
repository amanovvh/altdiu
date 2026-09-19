import { CldImage } from './CldImage';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TeacherCardProps {
  teacher: {
    id: string;
    photo: string | null;
    fullName: string;
    subject: string;
    position: string | null;
    education?: string | null;
  };
  className?: string;
}

export function TeacherCard({ teacher, className }: TeacherCardProps) {
  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-xl',
        className
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-primary-100 via-primary-50 to-accent-50">
        <CldImage
          publicId={teacher.photo}
          alt={teacher.fullName}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary-900/60 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-accent-700">
          <GraduationCap className="h-3.5 w-3.5" />
          {teacher.subject}
        </span>
        <h3 className="mt-2 line-clamp-2 text-lg font-bold text-primary-800">
          {teacher.fullName}
        </h3>
        {teacher.position && (
          <p className="mt-1 text-sm font-medium text-ink-600">
            {teacher.position}
          </p>
        )}
        {teacher.education && (
          <p className="mt-3 line-clamp-3 text-sm text-ink-500">
            {teacher.education}
          </p>
        )}
      </div>
    </article>
  );
}