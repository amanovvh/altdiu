'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { CldImage } from './CldImage';
import { cn } from '@/lib/utils/cn';

interface Props {
  /** Primary photo (Cloudinary public_id or `/uploads/...`). */
  photo: string | null;
  /** Additional gallery photos. */
  images?: string[];
  alt: string;
  /** Aspect ratio class. Default `aspect-[4/3]`. */
  aspect?: string;
  /** Class for the outer container. */
  className?: string;
}

/**
 * Compact cover image with **inline** swipe/arrows inside the card.
 *
 * Unlike `EntityGallery` (which opens a fullscreen lightbox), this version
 * keeps the user inside the card: arrows on the edges, dots at the bottom,
 * touch swipe on mobile, keyboard ←/→ on desktop. No modal, no portal.
 *
 * When there is only one photo, the dots/arrows are hidden and the
 * component behaves like a static cover image (matching the previous UX).
 */
export function EntityGalleryCarousel({
  photo,
  images = [],
  alt,
  aspect = 'aspect-[4/3]',
  className,
}: Props) {
  const allPhotos = [
    ...(photo ? [photo] : []),
    ...images,
  ];
  const count = allPhotos.length;
  const [index, setIndex] = useState(0);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % Math.max(count, 1)),
    [count]
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + Math.max(count, 1)) % Math.max(count, 1)),
    [count]
  );

  // Keyboard arrows — only when carousel has focus / hover.
  useEffect(() => {
    if (count <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count, next, prev]);

  // Touch swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) =>
    setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || count <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    setTouchStart(null);
  };

  if (count === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-surface-alt text-ink-400',
          aspect,
          className
        )}
        aria-label={alt}
      >
        <Images className="h-10 w-10" />
      </div>
    );
  }

  const multi = count > 1;

  return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-xl bg-surface-alt',
          aspect,
          className
        )}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label={alt}
        tabIndex={multi ? 0 : -1}
      >
        {allPhotos.map((src, i) => (
          <div
            key={src + i}
            className={cn(
              'absolute inset-0 transition-opacity duration-500 ease-out',
              i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            aria-hidden={i !== index}
          >
            <CldImage
              publicId={src}
              alt={i === 0 ? alt : `${alt} — фото ${i + 1}`}
              fill
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ))}

        {multi && (
          <>
            {/* Prev / Next buttons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Предыдущее фото"
              className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-accent-400 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Следующее фото"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-accent-400 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 z-[1] flex -translate-x-1/2 gap-1.5 rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm">
              {allPhotos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  aria-label={`Перейти к фото ${i + 1}`}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-all',
                    i === index
                      ? 'w-4 bg-white'
                      : 'bg-white/55 hover:bg-white/80'
                  )}
                />
              ))}
            </div>

            {/* Counter */}
            <span className="pointer-events-none absolute right-2 top-2 z-[1] inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              <Images className="h-3 w-3" />
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>
    );
  }