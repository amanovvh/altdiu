import { prisma } from '@/lib/db/prisma';
import type { Locale } from '@prisma/client';

export interface GalleryAlbumSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  eventDate: Date | null;
  imageCount: number;
  order: number;
}

export interface GalleryAlbumDetail extends GalleryAlbumSummary {
  images: {
    id: string;
    publicId: string;
    width: number | null;
    height: number | null;
    alt: string | null;
    order: number;
  }[];
}

const TRANSLATION_SELECT = {
  title: true,
  description: true,
} as const;

export async function getGalleryAlbums(
  locale: Locale,
  options: { limit?: number } = {}
): Promise<GalleryAlbumSummary[]> {
  const records = await prisma.galleryAlbum.findMany({
    where: { status: 'PUBLISHED', isActive: true },
    orderBy: [{ order: 'asc' }, { eventDate: 'desc' }],
    ...(options.limit ? { take: options.limit } : {}),
    include: {
      translations: { where: { locale }, select: TRANSLATION_SELECT },
      _count: { select: { images: true } },
    },
  });
  return records
    .filter((r) => r.translations[0])
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.translations[0].title,
      description: r.translations[0].description,
      coverImage: r.coverImage,
      eventDate: r.eventDate,
      imageCount: r._count.images,
      order: r.order,
    }));
}

export async function getGalleryAlbumBySlug(
  slug: string,
  locale: Locale
): Promise<GalleryAlbumDetail | null> {
  const album = await prisma.galleryAlbum.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale }, select: TRANSLATION_SELECT },
      images: { orderBy: { order: 'asc' } },
      _count: { select: { images: true } },
    },
  });
  if (!album || album.status !== 'PUBLISHED' || !album.translations[0]) return null;
  const tr = album.translations[0];
  return {
    id: album.id,
    slug: album.slug,
    title: tr.title,
    description: tr.description,
    coverImage: album.coverImage,
    eventDate: album.eventDate,
    order: album.order,
    imageCount: album._count.images,
    images: album.images.map((img) => ({
      id: img.id,
      publicId: img.publicId,
      width: img.width,
      height: img.height,
      alt: img.alt,
      order: img.order,
    })),
  };
}

export async function getRecentGalleryImages(
  locale: Locale,
  limit = 8
): Promise<
  {
    albumSlug: string;
    publicId: string;
    width: number | null;
    height: number | null;
  }[]
> {
  const albums = await prisma.galleryAlbum.findMany({
    where: { status: 'PUBLISHED', isActive: true },
    orderBy: [{ eventDate: 'desc' }, { createdAt: 'desc' }],
    take: 5,
    include: {
      images: { take: 4, orderBy: { order: 'asc' } },
    },
  });
  const items = albums.flatMap((a) =>
    a.images.map((img) => ({
      albumSlug: a.slug,
      publicId: img.publicId,
      width: img.width,
      height: img.height,
    }))
  );
  return items.slice(0, limit);
}
