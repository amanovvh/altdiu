'use client';

import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  /** Target value to count up to. */
  value: number;
  /** Animation duration in ms (default 1500). */
  duration?: number;
  /** Locale used by Intl.NumberFormat for thousands separators. */
  locale?: string;
  /** Optional className for the wrapper span. */
  className?: string;
}

/**
 * Smooth tween counter that animates from 0 → value on mount and whenever
 * `value` changes. Uses requestAnimationFrame with ease-out cubic for a
 * natural decel. Respects `prefers-reduced-motion` and snaps to the target
 * when the user prefers no motion. No external libraries.
 *
 * Implementation notes:
 * - We do NOT gate the effect with a one-shot ref. React 18 Strict Mode
 *   runs effect → cleanup → effect, so a one-shot guard breaks in dev
 *   (the second effect would skip the animation, leaving display = 0).
 *   Instead, every effect run starts a fresh RAF cycle, and cleanup
 *     cancels it. The next run starts again from scratch.
 * - `useState(0)` is the SSR-safe initial render value; hydration matches.
 * - Final value is set explicitly with `setDisplay(value)` on completion
 *   to guarantee the displayed number equals the target (no off-by-one).
 */
export function AnimatedCounter({
  value,
  duration = 1500,
  locale,
  className,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // Guard against bad inputs — never run on NaN/undefined.
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      setDisplay(0);
      return;
    }

    // Respect reduced-motion preference — show final value immediately.
    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    // Always start from 0 so reloads replay the count.
    setDisplay(0);

    // Local closure state — recreated on every effect run.
    let rafId: number | null = null;
    let startTs: number | null = null;

    const tick = (now: number) => {
      if (startTs === null) startTs = now;
      const elapsed = now - startTs;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic: decelerate toward end
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * value);

      // Skip redundant re-renders when the integer value didn't change.
      setDisplay((prev) => (prev === current ? prev : current));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        // Pin exact target value (handles Rounding exactly on the final step).
        setDisplay(value);
        rafId = null;
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
  }, [value, duration]);

  const formatted = display.toLocaleString(locale);

  return (
    <span className={className} aria-label={value.toLocaleString(locale)}>
      {formatted}
    </span>
  );
}