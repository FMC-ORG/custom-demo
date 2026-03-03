'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  Text,
  Field,
  ImageField,
  LinkField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSlideItem {
  id: string;
  backgroundImage?: { jsonValue?: ImageField };
  slideHeadline?: { jsonValue?: Field<string> };
  slideSubtext?: { jsonValue?: Field<string> };
  slideCTALabel?: { jsonValue?: Field<string> };
  slideCTALink?: { jsonValue?: LinkField };
}

interface HeroSliderFields {
  data?: {
    datasource?: {
      autoAdvance?: { jsonValue?: Field<string> };
      autoAdvanceInterval?: { jsonValue?: Field<string> };
      children?: {
        results?: HeroSlideItem[];
      };
    };
  };
}

interface HeroSliderProps extends ComponentProps {
  params: { [key: string]: string };
  fields?: HeroSliderFields;
}

/**
 * HeroSlider — full-viewport rotating slides.
 * Text anchored bottom-left, dot indicators centered at bottom.
 * Auto-advances every 6 seconds (configurable via datasource).
 */
export const Default: React.FC<HeroSliderProps> = (props) => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource;
  const slides = datasource?.children?.results ?? [];
  const autoAdvance = datasource?.autoAdvance?.jsonValue?.value !== '0';
  const intervalMs =
    Number(datasource?.autoAdvanceInterval?.jsonValue?.value) * 1000 || 6000;

  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback(
    (idx: number) => {
      setActiveIndex((idx + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (!autoAdvance || slides.length <= 1 || isEditing) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoAdvance, intervalMs, slides.length, isEditing]);

  if (!datasource || slides.length === 0) {
    return (
      <section
        className={cn('hero-slider relative w-full bg-vg-dark', styles)}
        id={id}
        data-testid="hero-slider"
        style={{ height: '100vh', minHeight: '500px' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="is-empty-hint text-white/60">Hero Slider — add slides as children</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn('hero-slider relative w-full overflow-hidden', styles)}
      id={id}
      data-testid="hero-slider"
      style={{ height: '100vh', minHeight: '500px' }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
        if (e.key === 'ArrowRight') goTo(activeIndex + 1);
      }}
      tabIndex={0}
      aria-label="Hero Slider"
    >
      {slides.map((slide, idx) => {
        const img = slide.backgroundImage?.jsonValue;
        const headline = slide.slideHeadline?.jsonValue;
        const subtext = slide.slideSubtext?.jsonValue;
        const ctaLabel = slide.slideCTALabel?.jsonValue;
        const ctaLink = slide.slideCTALink?.jsonValue;

        return (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-500',
              idx === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            )}
            aria-hidden={idx !== activeIndex}
          >
            {/* Background image — render in edit mode even when empty so authors can add image */}
            {(img?.value?.src || (isEditing && img)) && img ? (
              <ContentSdkImage
                field={img}
                fill
                className="object-cover"
                priority={idx === 0}
                alt={(img.value?.alt ?? '') as string}
              />
            ) : (
              <div className="absolute inset-0 bg-vg-dark" />
            )}

            {/* Text content — bottom-left */}
            <div className="absolute bottom-12 left-6 md:left-12 max-w-xl z-20">
              {(headline?.value || (isEditing && headline)) && headline && (
                <Text
                  tag="h1"
                  field={headline}
                  className="field-slideheadline text-5xl md:text-7xl font-bold text-white leading-tight"
                />
              )}
              {(subtext?.value || (isEditing && subtext)) && subtext && (
                <Text
                  tag="p"
                  field={subtext}
                  className="field-slidesubtext text-base md:text-lg text-white/90 mt-3"
                />
              )}
              {(ctaLink?.value?.href || (isEditing && ctaLink)) && ctaLink && (
                <div className="mt-5">
                  <ContentSdkLink
                    field={ctaLink}
                    editable={isEditing}
                    className="text-sm font-medium text-white underline-offset-4 hover:underline inline-flex items-center gap-2"
                  >
                    {ctaLabel?.value || ctaLink?.value?.text || ''}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </ContentSdkLink>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30"
          role="tablist"
          aria-label="Slide indicators"
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                idx === activeIndex ? 'bg-white' : 'bg-white/50'
              )}
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
