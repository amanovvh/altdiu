import slugify from 'slugify';

export function slug(text: string, locale: string = 'ru'): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale,
    replacement: '-',
  });
}

export function ensureUniqueSlug(
  base: string,
  existing: string[],
  suffix?: string
): string {
  const seed = slug(base);
  let candidate = suffix ? `${seed}-${suffix}` : seed;
  let counter = 1;
  while (existing.includes(candidate)) {
    counter += 1;
    candidate = `${seed}-${counter}`;
  }
  return candidate;
}

export function truncate(text: string, max: number = 200): string {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function plainExcerpt(html: string, max: number = 220): string {
  return truncate(stripHtml(html), max);
}
