import Image, { type ImageProps } from 'next/image';
import { buildCloudinaryUrl } from '@/lib/cloudinary-url';
import { cn } from '@/lib/utils/cn';

interface Props
  extends Omit<ImageProps, 'src' | 'width' | 'height' | 'loader'> {
  publicId: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  /** If true, the component falls back to a placeholder if publicId is empty */
  showPlaceholder?: boolean;
  priority?: boolean;
}

/**
 * Drop-in replacement for next/image that handles Cloudinary URLs,
 * with a clean placeholder fallback when no image is provided.
 */
export function CldImage({
  publicId,
  alt,
  width = 1200,
  height = 800,
  className,
  showPlaceholder = true,
  priority = false,
  ...rest
}: Props) {
  if (!publicId) {
    if (!showPlaceholder) return null;
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-surface-alt text-ink-400',
          className
        )}
        style={{ aspectRatio: `${width} / ${height}` }}
        aria-label={alt}
      >
        <svg
          viewBox="0 0 24 24"
          width="32"
          height="32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );
  }

  const src = buildCloudinaryUrl(publicId);

  const { fill, ...imageRest } = rest;

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      placeholder="empty"
      {...imageRest}
    />
  );
}
