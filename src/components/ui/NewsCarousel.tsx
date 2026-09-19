'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsCard } from './NewsCard';
import { cn } from '@/lib/utils/cn';

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  category: string | null;
  publishedAt: Date | null;
  isPinned?: boolean;
}

interface NewsCarouselProps {
  news: NewsItem[];
  className?: string;
}

/**
 * Horizontal news carousel with scroll-snap, drag/swipe, prev/next buttons
 * and progress indicator. No external libraries — pure scroll-snap CSS +
 * manual scrollLeft manipulation.
 *
 * Each card snaps to the start of the viewport. On mobile (< sm) the carousel
 * shows ~1.1 cards so the user can see there's more content to swipe.
 */
export function NewsCarousel({ news, className }: NewsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < maxScroll - 4);

    // Detect which card is closest to the left edge.
    const cards = el.querySelectorAll<HTMLElement>('[data-carousel-card]');
    if (cards.length === 0) return;
    const elRect = el.getBoundingClientRect();
    let closestIdx = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const dist = Math.abs(rect.left - elRect.left);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });
    setActiveIndex(closestIdx);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateState();
    el.addEventListener('scroll', updateState, { passive: true });
    window.addEventListener('resize', updateState);
    return () => {
      el.removeEventListener('scroll', updateState);
      window.removeEventListener('resize', updateState);
    };
  }, [updateState, news.length]);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-carousel-card]');
    if (!card) return;
    const step = card.offsetWidth + 24; // card width + gap
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const scrollToIndex = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-carousel-card]');
    const card = cards[i];
    if (!card) return;
    const elRect = el.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const delta = cardRect.left - elRect.left + el.scrollLeft;
    el.scrollTo({ left: delta, behavior: 'smooth' });
  };

  if (news.length === 0) return null;

  return (
    <div className={cn('relative', className)}>
      {/* Scroll container */}
      <div
        ref={scrollerRef}
        className={cn(
          '-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4',
          'scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]',
          '[&::-webkit-scrollbar]:hidden'
        )}
        aria-roledescription="carousel"
        aria-label="News"
      >
        {news.map((n) => (
          <article
            key={n.id}
            data-carousel-card
            className={cn(
              'snap-start shrink-0',
              // Card width: ~85% on mobile, ~50% on md, ~33% on lg+ for proper pagination
              'w-[85%] sm:w-[55%] md:w-[45%] lg:w-[33.3333%]'
            )}
          >
            <NewsCard news={n} variant="default" />
          </article>
        ))}
      </div>

      {/* Controls: prev / indicators / next */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="hidden gap-2 sm:flex">
          {news.map((n, i) => (
            <button
              key={n.id}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Перейти к новости ${i + 1}`}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === activeIndex
                  ? 'w-8 bg-accent-500'
                  : 'w-2 bg-ink-200 hover:bg-ink-300'
              )}
            />
          ))}
        </div>

        <span className="text-xs font-medium uppercase tracking-wider text-ink-500 sm:hidden">
          {activeIndex + 1} / {news.length}
        </span>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            disabled={!canPrev}
            aria-label="Предыдущая новость"
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition',
              'hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800',
              'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:bg-white disabled:hover:text-ink-700'
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            disabled={!canNext}
            aria-label="Следующая новость"
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition',
              'hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800',
              'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:bg-white disabled:hover:text-ink-700'
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}