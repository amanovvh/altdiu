'use client';

import { useEffect } from 'react';
import { X, GraduationCap, Briefcase, BookOpen } from 'lucide-react';
import { CldImage } from './CldImage';
import { cn } from '@/lib/utils/cn';

export interface TeacherModalData {
  id: string;
  photo: string | null;
  fullName: string;
  position: string | null;
  subject: string | null;
  education: string | null;
  bio: string | null;
}

interface Props {
  teacher: TeacherModalData | null;
  onClose: () => void;
}

/**
 * Modal with detailed information about a teacher.
 * Triggered from TeacherCard on /teachers.
 *
 * Intentionally omits email/phone — those are admin-only contact info.
 */
export function TeacherModal({ teacher, onClose }: Props) {
  // Lock body scroll + Escape key
  useEffect(() => {
    if (!teacher) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [teacher, onClose]);

  if (!teacher) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-center bg-primary-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={teacher.fullName}
    >
      <div
        className={cn(
          // Mobile: full-screen sheet; sm+: centered card
          'relative flex w-full flex-col overflow-hidden bg-white shadow-2xl',
          'max-h-screen sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero — photo + name */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-primary-800 via-primary-800 to-primary-900">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Photo */}
          <div className="flex h-56 items-end justify-center sm:h-64">
            {teacher.photo ? (
              <CldImage
                publicId={teacher.photo}
                alt={teacher.fullName}
                width={240}
                height={300}
                className="h-full w-auto object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-300">
                <GraduationCap className="h-24 w-24 opacity-30" />
              </div>
            )}
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 md:px-8">
          {/* Name + position */}
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-balance text-2xl font-bold leading-tight text-primary-900 md:text-3xl">
                {teacher.fullName}
              </h2>
              {teacher.position && (
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-accent-700">
                  <Briefcase className="h-4 w-4" />
                  {teacher.position}
                </p>
              )}
              {teacher.subject && (
                <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-ink-600">
                  <BookOpen className="h-4 w-4" />
                  {teacher.subject}
                </p>
              )}
            </div>
          </div>

          {/* Education */}
          {teacher.education && (
            <section className="mt-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
                Образование
              </h3>
              <p className="text-pretty text-sm text-ink-700 md:text-base">
                {teacher.education}
              </p>
            </section>
          )}

          {/* Bio */}
          {teacher.bio && (
            <section className={teacher.education ? 'mt-5' : 'mt-2'}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
                О себе
              </h3>
              <div
                className="prose-lyceum text-pretty text-sm text-ink-700 md:text-base"
                dangerouslySetInnerHTML={{ __html: teacher.bio }}
              />
            </section>
          )}

          {/* Empty state */}
          {!teacher.education && !teacher.bio && (
            <p className="mt-6 text-center text-sm text-ink-500">
              Дополнительная информация будет добавлена администрацией.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}