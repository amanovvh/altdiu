import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface LogoProps {
  variant?: 'full' | 'compact' | 'mark' | 'wordmark';
  className?: string;
  /** Render only the circular mark (no text). Useful for tight spaces. */
  markOnly?: boolean;
  /** Force the inline SVG fallback instead of /logo.jpeg (e.g. for tests). */
  fallback?: boolean;
  /**
   * Color theme for the wordmark text.
   * - `light` (default): dark navy on white background (Header, public pages)
   * - `dark`: white text for use on dark navy backgrounds (Footer)
   */
  theme?: 'light' | 'dark';
}

/**
 * Official site logo. Uses the circular seal provided by the lyceum.
 *
 * Variants:
 * - full:    seal + "International Finance" + "Academic Lyceum · TSUE"
 * - compact: seal + "International Finance" (no subtitle) — for tight headers
 * - mark:    seal only
 * - wordmark: text only (no seal)
 */
export function Logo({
  variant = 'full',
  className,
  markOnly = false,
  fallback = false,
  theme = 'light',
}: LogoProps) {
  const effectiveVariant = markOnly ? 'mark' : variant;
  const height =
    effectiveVariant === 'full' ? 52 : effectiveVariant === 'compact' ? 44 : effectiveVariant === 'wordmark' ? 28 : 44;
  const markSize = height;

  const showWordmark = effectiveVariant !== 'mark';
  const showSubtitle = effectiveVariant === 'full';

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-soft ring-1 ring-primary-900/10"
        style={{ width: markSize, height: markSize }}
        aria-hidden={!fallback}
      >
        {!fallback ? (
          <Image
            src="/logo.jpeg"
            alt="International Finance — Academic Lyceum seal"
            width={256}
            height={256}
            className="h-full w-full object-cover"
            priority
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            fill="none"
            className="h-full w-full"
          >
            <path
              d="M14 46V18h12a8 8 0 0 1 0 16h-6v12h-6Zm6-18h6a2 2 0 1 0 0-4h-6v4Z"
              fill="#0a2540"
            />
            <circle cx="44" cy="22" r="4" fill="#c9a961" />
            <path
              d="M50 32a8 8 0 1 1-8-8"
              stroke="#c9a961"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        )}
      </span>

      {showWordmark && (
        <span className="flex flex-col leading-tight">
          <span
            className={cn(
              'font-display text-lg font-bold tracking-tight',
              theme === 'dark' ? 'text-white' : 'text-primary-800'
            )}
          >
            International Finance
          </span>
          {showSubtitle && (
            <span
              className={cn(
                'text-[10px] uppercase tracking-[0.18em]',
                theme === 'dark' ? 'text-ink-300' : 'text-ink-500'
              )}
            >
              Academic Lyceum · TSUE
            </span>
          )}
        </span>
      )}
    </div>
  );
}