import type { MetadataRoute } from 'next';
import { routing } from '@/lib/i18n/routing';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      ...routing.locales.map((l) => `${baseUrl}/${l}/sitemap.xml`),
    ],
    host: baseUrl,
  };
}
