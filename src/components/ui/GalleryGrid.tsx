'use client';

import { useState } from 'react';
import { CldImage } from './CldImage';
import { Lightbox, type LightboxImage } from './Lightbox';
import { cn } from '@/lib/utils/cn';

interface Image {
  id: string;
  publicId: string;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  order: number;
}

interface Props {
  images: Image[];
  albumTitle?: string;
}

export function GalleryGrid({ images, albumTitle }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const lightboxImages: LightboxImage[] = images.map((img) => ({
    src: img.publicId,
    alt: img.alt ?? undefined,
  }));

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-200 bg-surface-alt p-10 text-center text-ink-500">
        В альбоме пока нет фотографий.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img, idx) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setLightboxIndex(idx)}
            className={cn(
              'group relative aspect-square overflow-hidden rounded-xl bg-surface-alt focus-visible:ring-2 focus-visible:ring-accent-400',
              idx === 0 && images.length > 1 && 'md:col-span-2 md:row-span-2 md:aspect-[4/3]'
            )}
          >
            <CldImage
              publicId={img.publicId}
              alt={img.alt ?? `${albumTitle ?? 'Image'} ${idx + 1}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-primary-900/0 transition-colors group-hover:bg-primary-900/20" />
          </button>
        ))}
      </div>

      <Lightbox
        images={lightboxImages}
        open={lightboxIndex !== null}
        initialIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        coverAlt={albumTitle}
      />
    </>
  );
}
