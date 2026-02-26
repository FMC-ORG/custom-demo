'use client';

import type React from 'react';
import { useState, useCallback, useEffect } from 'react';
import {
  Text as ContentSdkText,
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import type { Field, LinkField, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { Home, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

interface ProviderQuoteItem {
  id?: string;
  providerName?: { jsonValue?: Field<string> };
  price?: { jsonValue?: Field<string> };
  priceLabel?: { jsonValue?: Field<string> };
  accentColor?: { jsonValue?: Field<string> };
  badgeText?: { jsonValue?: Field<string> };
  providerLogo?: { jsonValue?: ImageField };
}

interface ProviderQuotesCarouselFields {
  data?: {
    datasource?: {
      heading?: { jsonValue?: Field<string> };
      subtitle?: { jsonValue?: Field<string> };
      ctaLink?: { jsonValue?: LinkField };
      ctaText?: { jsonValue?: Field<string> };
      secondaryLinkText?: { jsonValue?: Field<string> };
      providers?: {
        targetItems?: ProviderQuoteItem[];
      };
    };
  };
}

type ProviderQuotesCarouselProps = ComponentProps & {
  fields?: ProviderQuotesCarouselFields;
};

const ACCENT_COLORS: Record<string, string> = {
  green: 'bg-trustpilot-green',
  blue: 'bg-confused-cta-blue',
  teal: 'bg-confused-cta-teal',
};

const DEFAULT_HEADING = 'Recommended home insurance quotes';
const DEFAULT_SUBTITLE = '2 mins to get your full home insurance quotes';
const DEFAULT_CTA_TEXT = 'Get a home insurance quote';
const DEFAULT_SECONDARY_TEXT = 'Maybe later';
const DEFAULT_PROVIDERS = [
  { providerName: 'Aviva', price: '£183', badgeText: 'Top pick', accentColor: 'green' },
  { providerName: 'AXA', price: '£197', accentColor: 'blue' },
  { providerName: 'LV=', price: '£214', accentColor: 'teal' },
];

function getAccentBg(color: string | undefined): string {
  if (!color) return ACCENT_COLORS.green ?? '';
  const key = color.trim().toLowerCase();
  return ACCENT_COLORS[key] ?? ACCENT_COLORS.green ?? '';
}

/**
 * ProviderQuotesCarousel - carousel of insurance provider cards.
 * Uses Multilist (providers.targetItems).
 */
export const Default: React.FC<ProviderQuotesCarouselProps> = (props) => {
  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing ?? false;

  const datasource = fields?.data?.datasource;
  const hasDatasource = Boolean(datasource);

  const heading =
    datasource?.heading?.jsonValue?.value ?? DEFAULT_HEADING;
  const subtitle =
    datasource?.subtitle?.jsonValue?.value ?? DEFAULT_SUBTITLE;
  const ctaText =
    datasource?.ctaText?.jsonValue?.value ?? DEFAULT_CTA_TEXT;
  const secondaryText =
    datasource?.secondaryLinkText?.jsonValue?.value ?? DEFAULT_SECONDARY_TEXT;
  const ctaLink = datasource?.ctaLink?.jsonValue;
  const ctaHref = (ctaLink?.value?.href as string) ?? '#';

  const targetItems = datasource?.providers?.targetItems ?? [];
  const providers =
    hasDatasource && targetItems.length > 0
      ? targetItems.map((item) => ({
          id: item.id ?? '',
          providerName: item.providerName?.jsonValue?.value ?? '',
          price: item.price?.jsonValue?.value ?? '',
          priceLabel: item.priceLabel?.jsonValue?.value ?? 'per year',
          accentColor: item.accentColor?.jsonValue?.value ?? 'green',
          badgeText: item.badgeText?.jsonValue?.value ?? '',
          providerLogo: item.providerLogo?.jsonValue,
        }))
      : DEFAULT_PROVIDERS.map((p, i) => ({
          id: `provider-${i}`,
          providerName: p.providerName,
          price: p.price,
          priceLabel: 'per year',
          accentColor: p.accentColor,
          badgeText: (p as { badgeText?: string }).badgeText ?? '',
          providerLogo: undefined,
        }));

  const showPlaceholder = !hasDatasource && isEditing;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    skipSnaps: false,
    containScroll: 'trimSnaps',
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (showPlaceholder) {
    return (
      <div className="rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-8 text-center">
        <p className="text-white/60">Add ProviderQuotesCarousel datasource</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {datasource?.heading?.jsonValue ? (
        <ContentSdkText
          tag="h2"
          field={datasource.heading.jsonValue}
          className="text-xl font-bold text-white"
        />
      ) : (
        <h2 className="text-xl font-bold text-white">{heading}</h2>
      )}

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 -ml-4">
            {providers.map((provider) => {
              const accentBg = getAccentBg(provider.accentColor);
              return (
                <div
                  key={provider.id}
                  className="flex-[0_0_calc(50%-0.5rem)] min-w-0 pl-4 sm:flex-[0_0_calc(33.333%-0.5rem)] lg:flex-[0_0_calc(25%-0.5rem)]"
                >
                  <div className="rounded-xl border border-white/10 bg-white overflow-hidden">
                    <div
                      className={cn(
                        'px-4 py-2 text-center text-white font-semibold',
                        accentBg || 'bg-gray-500'
                      )}
                    >
                      {provider.badgeText && (
                        <span className="mr-2">★ {provider.badgeText}</span>
                      )}
                      {provider.providerName}
                    </div>
                    <div className="p-6 flex flex-col items-center gap-2">
                      {provider.providerLogo ? (
                        <ContentSdkImage
                          field={provider.providerLogo as ImageField}
                          className="max-h-8 w-auto"
                          alt={provider.providerName}
                        />
                      ) : null}
                      <p className="text-2xl font-bold text-gray-900">
                        {provider.price}
                      </p>
                      <p className="text-sm text-gray-600">
                        {provider.priceLabel}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* See all card */}
            <div className="flex-[0_0_calc(50%-0.5rem)] min-w-0 pl-4 sm:flex-[0_0_calc(33.333%-0.5rem)] lg:flex-[0_0_calc(25%-0.5rem)]">
              <div className="rounded-xl border border-dashed border-white/30 bg-white/5 p-6 flex flex-col items-center justify-center min-h-[140px]">
                <p className="text-sm font-medium text-white/80">60+ more</p>
                <p className="text-base font-semibold text-white mt-2">
                  See all →
                </p>
              </div>
            </div>
          </div>
        </div>

        {providers.length > 0 && (
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous providers"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next providers"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {datasource?.subtitle?.jsonValue ? (
        <ContentSdkText
          tag="p"
          field={datasource.subtitle.jsonValue}
          className="text-sm text-white/80"
        />
      ) : (
        <p className="text-sm text-white/80">{subtitle}</p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {ctaLink ? (
          <ContentSdkLink
            field={ctaLink as LinkField}
            className="inline-flex items-center gap-2 rounded-lg bg-confused-cta-teal px-6 py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Home className="h-5 w-5" aria-hidden />
            <span>{ctaText}</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ContentSdkLink>
        ) : (
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-lg bg-confused-cta-teal px-6 py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Home className="h-5 w-5" aria-hidden />
            <span>{ctaText}</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
        <Link
          href="#"
          className="text-sm text-white/70 hover:text-white/90 transition-colors"
        >
          {secondaryText}
        </Link>
      </div>
    </div>
  );
};
