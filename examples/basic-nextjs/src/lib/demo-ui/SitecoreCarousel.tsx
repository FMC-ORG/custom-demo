'use client';
/**
 * Sitecore demo — horizontal scroll-snap carousel with round prev/next buttons
 * (sitecore.com platform and events strips). Children are rendered as slides.
 * In editing mode the track wraps into a static grid so every item stays reachable.
 */
import React, { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SitecoreCarousel = ({
  children,
  label,
  slideClassName,
  isEditing,
}: {
  children: React.ReactNode[];
  label: string;
  slideClassName?: string;
  isEditing?: boolean;
}): JSX.Element => {
  const track = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const scroll = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  if (isEditing) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={label}>
        {children}
      </div>
    );
  }

  const arrow =
    'absolute top-1/2 z-10 hidden h-[54px] w-[54px] -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-sm transition hover:shadow-md disabled:opacity-40 md:flex';

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <button
        type="button"
        aria-label="Previous"
        onClick={() => scroll(-1)}
        disabled={!canPrev}
        className={cn(arrow, '-left-4 lg:-left-[72px]')}
        style={{ borderColor: 'var(--brand-border)', color: 'var(--brand-fg)' }}
      >
        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
      </button>
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {React.Children.map(children, (child) => (
          <div className={cn('shrink-0 snap-start', slideClassName)}>{child}</div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Next"
        onClick={() => scroll(1)}
        disabled={!canNext}
        className={cn(arrow, '-right-4 lg:-right-[72px]')}
        style={{ borderColor: 'var(--brand-border)', color: 'var(--brand-fg)' }}
      >
        <ChevronRight className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
};
