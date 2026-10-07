'use client';

import React, { JSX, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Horizontal scroll-snap rail with circular prev/next buttons beside a header.
 * Presentation helper only (not a Sitecore component) — used by demo variants
 * whose parent component file is a server component (e.g. ProductPricingCards WorleyNews).
 */
export const ScrollRail = ({
  header,
  children,
  className,
  railClassName,
  headerClassName,
  buttonColor = 'var(--brand-secondary)',
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  railClassName?: string;
  headerClassName?: string;
  buttonColor?: string;
}): JSX.Element => {
  const railRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const firstCard = rail.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 32 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  const arrowClass =
    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-opacity hover:opacity-70';

  return (
    <div className={className}>
      <div className={cn('flex items-center justify-between gap-6', headerClassName)}>
        <div>{header}</div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className={arrowClass}
            style={{ borderColor: buttonColor, color: buttonColor }}
            aria-label="Previous"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className={arrowClass}
            style={{ borderColor: buttonColor, color: buttonColor }}
            aria-label="Next"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={railRef}
        className={cn(
          'flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          railClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};
