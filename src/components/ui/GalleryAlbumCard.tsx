import { Link } from '@/lib/i18n/routing';
import { CldImage } from './CldImage';
import { Images } from 'lucide-react';
import { formatShortDate } from '@/lib/utils/dates';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils/cn';

interface Props {
  album: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    coverImage: string | null;
    eventDate: Date | null;
    imageCount: number;
  };
  locale: Locale;
  className?: string;
}

export function GalleryAlbumCard({ album, locale, className }: Props) {
  return (
    <Link
      href={`/gallery/${album.slug}` as any}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-xl',
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-alt">
        <CldImage
          publicId={album.coverImage}
          alt={album.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary-900/85 via-primary-900/20 to-transparent" />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-primary-800">
          <Images className="h-3.5 w-3.5" />
          {album.imageCount}
        </span>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          {album.eventDate && (
            <span className="text-xs uppercase tracking-widest text-accent-300">
              {formatShortDate(album.eventDate, locale)}
            </span>
          )}
          <h3 className="mt-1 line-clamp-2 text-lg font-bold">{album.title}</h3>
        </div>
      </div>
    </Link>
  );
}
