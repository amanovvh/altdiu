'use client';

import { useState } from 'react';
import { Images } from 'lucide-react';
import { Lightbox, type LightboxImage } from './Lightbox';
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
 * Compact cover image with a "ещё N фото" badge. Clicking opens a
 * fullscreen lightbox showing the primary photo + all additional photos.
 *
 * Implementation note: uses Lightbox in controlled mode and a dedicated
 * full-size `<button>` so the inner `<CldImage fill />>` has a positioned
 * parent with explicit size (rather than a zero-sized `inline-block`).
 */
export function EntityGallery({
  photo,
  images = [],
  alt,
  aspect = 'aspect-[4/3]',
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  const allPhotos: LightboxImage[] = [
    ...(photo ? [{ src: photo, alt }] : []),
    ...images.map((src) => ({ src, alt })),
  ];

  if (allPhotos.length === 0) {
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

  const extraCount = allPhotos.length - 1;

  return (
    <div className={cn('relative group overflow-hidden rounded-xl', aspect, className)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Открыть фото на весь экран"
        className="absolute inset-0 h-full w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2"
      >
        <CldImage
          publicId={allPhotos[0].src}
          alt={alt}
          fill
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </button>
      {extraCount > 0 && (
        <span className="pointer-events-none absolute bottom-2 right-2 z-[1] inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Images className="h-3 w-3" />+{extraCount}
        </span>
      )}
      <Lightbox
        images={allPhotos}
        open={open}
        onClose={() => setOpen(false)}
        coverAlt={alt}
      />
    </div>
  );
}