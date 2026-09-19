'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { buildCloudinaryUrl } from '@/lib/cloudinary-url';

export interface LightboxImage {
  /** Cloudinary public_id or local path (e.g. `/uploads/...`). */
  src: string;
  alt?: string;
}

interface BaseProps {
  /** All images in the gallery. */
  images: LightboxImage[];
  /** Optional starting index when opening. Defaults to 0. */
  initialIndex?: number;
  /** Alt text used for the cover image. */
  coverAlt?: string;
}

interface ControlledProps extends BaseProps {
  /** Controlled mode: parent owns open state. */
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
}

interface UncontrolledProps extends BaseProps {
  /** Uncontrolled mode: optional trigger element. The lightbox opens on click. */
  trigger?: React.ReactNode;
  triggerClassName?: string;
  open?: never;
  onClose?: never;
}

type LightboxProps = ControlledProps | UncontrolledProps;

/**
 * Fullscreen photo viewer with prev/next navigation.
 *
 * Supports two modes:
 * 1. **Controlled** — parent passes `open` + `onClose`. The lightbox is
 *    rendered as a portal-only overlay without a trigger. Used by galleries
 *    that need to control which image is shown.
 * 2. **Uncontrolled** — pass an optional `trigger` element (or use the
 *    built-in cover). Clicking the trigger opens the lightbox at index 0.
 *
 * Navigation:
 * - Prev/Next on-screen buttons
 * - Keyboard arrows (←/→) and Escape to close
 * - Touch swipe (left/right)
 *
 * When open, body scroll is locked. Click on the backdrop closes the lightbox.
 *
 * No external libraries — pure React + Tailwind.
 */
export function Lightbox(props: LightboxProps) {
  const { images, initialIndex = 0, coverAlt } = props;

  // Controlled vs uncontrolled state
  const [internalOpen, setInternalOpen] = useState(false);
  const open = 'open' in props ? props.open : internalOpen;
  const close = useCallback(() => {
    if ('onClose' in props && props.onClose) props.onClose();
    else setInternalOpen(false);
  }, [props]);

  const [index, setIndex] = useState(initialIndex);
  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length]
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );

  // When opening in controlled mode, sync internal index with `initialIndex`
  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close, next, prev]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Touch swipe
  const touchStartRef = { x: 0, y: 0 };
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.x = e.touches[0].clientX;
    touchStartRef.y = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartRef.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    }
  };

  if (images.length === 0) return null;

  const current = images[index];
  const currentUrl = buildCloudinaryUrl(current.src);

  // Render uncontrolled trigger if present
  const triggerButton = !('open' in props) ? (
    <button
      type="button"
      onClick={() => setInternalOpen(true)}
      className={cn(
        'group relative inline-block cursor-pointer overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2',
        props.triggerClassName
      )}
      aria-label="Открыть фото на весь экран"
    >
      {props.trigger ?? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl}
          alt={current.alt ?? coverAlt ?? ''}
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
        />
      )}
      {images.length > 1 && !props.trigger && (
        <span className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
          +{images.length - 1}
        </span>
      )}
    </button>
  ) : null;

  return (
    <>
      {triggerButton}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фото"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Close */}
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть"
            className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium tabular-nums text-white backdrop-blur-sm">
              {index + 1} / {images.length}
            </div>
          )}

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Предыдущее фото"
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-4 md:h-14 md:w-14"
              >
                <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Следующее фото"
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-4 md:h-14 md:w-14"
              >
                <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
              </button>
            </>
          )}

          {/* Image */}
          <figure className="relative flex h-full w-full items-center justify-center p-4 sm:p-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.src}
              src={currentUrl}
              alt={current.alt ?? ''}
              className="max-h-full max-w-full object-contain select-none"
              draggable={false}
            />
          </figure>

          {/* Caption */}
          {(current.alt || coverAlt) && (
            <figcaption className="absolute bottom-4 left-1/2 max-w-[90%] -translate-x-1/2 truncate rounded-full bg-black/60 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
              {current.alt ?? coverAlt}
            </figcaption>
          )}
        </div>
      )}
    </>
  );
}