'use client';

import { Lightbox } from '@/components/ui/Lightbox';
import { buildCloudinaryUrl } from '@/lib/cloudinary-url';

interface Props {
  src: string;
  alt: string;
}

/**
 * Hero image for the homepage "О лицее" block.
 *
 * Shows the image in a sensible 4:5 aspect ratio with hover zoom, and
 * opens a fullscreen Lightbox on click. Uses the existing Cloudinary/local
 * URL builder so the same component works with both backends.
 */
export function AboutHeroImage({ src, alt }: Props) {
  const url = buildCloudinaryUrl(src, { width: 800, height: 1000, crop: 'fill' });

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
      <Lightbox
        images={[{ src, alt }]}
        trigger={
          <div className="aspect-[4/5] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={alt}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
        }
      />
    </div>
  );
}