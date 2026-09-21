import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/about': '/about',
    '/administration': '/administration',
    '/teachers': '/teachers',
    '/directions': '/directions',
    '/directions/[slug]': '/directions/[slug]',
    '/achievements': '/achievements',
    '/news': '/news',
    '/news/[slug]': '/news/[slug]',
    '/gallery': '/gallery',
    '/gallery/[slug]': '/gallery/[slug]',
    '/why-us': '/why-us',
    '/community': '/community',
    '/contacts': '/contacts',
  },
});

export type Pathnames = keyof typeof routing.pathnames;
export type AppLocale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
