'use client';

import { useState } from 'react';
import { CldImage } from '@/components/ui/CldImage';
import { TeacherModal, type TeacherModalData } from '@/components/ui/TeacherModal';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TeacherListItem {
  id: string;
  photo: string | null;
  fullName: string;
  subject: string;
  position: string | null;
  education: string | null;
  bio: string | null;
}

interface Props {
  teachers: TeacherListItem[];
}

/**
 * Client wrapper around TeacherCard that adds modal-on-click behaviour.
 * The underlying TeacherCard stays as a pure server-renderable card;
 * this component wraps each card in a button that opens a modal with
 * the full teacher info.
 */
export function TeachersListWithModal({ teachers }: Props) {
  const [openTeacher, setOpenTeacher] = useState<TeacherModalData | null>(null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teachers.map((teacher) => (
          <button
            key={teacher.id}
            type="button"
            onClick={() => setOpenTeacher(teacher)}
            className={cn(
              'group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white text-left shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2'
            )}
            aria-label={`Открыть подробности о ${teacher.fullName}`}
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
                <p className="mt-1 text-sm font-medium text-ink-600">{teacher.position}</p>
              )}
              {teacher.education && (
                <p className="mt-3 line-clamp-3 text-sm text-ink-500">{teacher.education}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      <TeacherModal teacher={openTeacher} onClose={() => setOpenTeacher(null)} />
    </>
  );
}