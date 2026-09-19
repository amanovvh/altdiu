import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'International Finance — Академический лицей при ТГЭУ',
    template: '%s — International Finance',
  },
  description:
    'Официальный сайт Академического лицея при Ташкентском государственном экономическом университете «International Finance». Подготовка к поступлению в ведущие университеты.',
  applicationName: 'International Finance Lyceum',
  authors: [{ name: 'Academic Lyceum "International Finance"' }],
  keywords: [
    'Academic Lyceum',
    'International Finance',
    'Ташкент',
    'лицей',
    'экономика',
    'ТГЭУ',
    'TDIU',
    'International Finance academic lyceum',
    'Toshkent',
  ],
  openGraph: {
    type: 'website',
    siteName: 'International Finance',
    locale: 'ru_RU',
    alternateLocale: ['uz_UZ', 'en_US'],
    title: 'International Finance — Академический лицей при ТГЭУ',
    description:
      'Престижное академическое образование в сфере экономики и иностранных языков',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'International Finance' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'International Finance',
    description: 'Академический лицей при ТГЭУ',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/favicon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white text-ink-900 antialiased">
        {children}
      </body>
    </html>
  );
}
