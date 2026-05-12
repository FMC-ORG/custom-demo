'use client';

import React, { JSX, useState, useCallback, useEffect } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface FeatureCardItemFields {
  id: string;
  cardTitle: { jsonValue: Field<string> };
  cardDescription: { jsonValue: Field<string> };
  cardImage: { jsonValue: ImageField };
  cardLink: { jsonValue: LinkField };
}

interface FeatureCardsGridDatasource {
  title: { jsonValue: Field<string> };
  description: { jsonValue: Field<string> };
  children: {
    results: FeatureCardItemFields[];
  };
}

interface FeatureCardsGridFields {
  data: {
    datasource: FeatureCardsGridDatasource;
  };
}

type FeatureCardsGridProps = ComponentProps & {
  fields: FeatureCardsGridFields;
};

const FeatureCardsGridDefaultComponent = (): JSX.Element => (
  <div className="component feature-cards-grid">
    <div className="component-content">
      <span className="is-empty-hint">FeatureCardsGrid</span>
    </div>
  </div>
);

const SectionHeader = ({
  datasource,
  isEditing,
}: {
  datasource: FeatureCardsGridDatasource;
  isEditing?: boolean;
}) => (
  <div className="mx-auto mb-12 max-w-3xl text-center">
    {(datasource.title?.jsonValue?.value || isEditing) && (
      <Text
        field={datasource.title?.jsonValue}
        tag="h2"
        className="text-3xl font-bold tracking-tight sm:text-4xl font-[var(--brand-heading-font,inherit)]"
        style={{ color: 'var(--brand-fg, #111111)' }}
      />
    )}
    {(datasource.description?.jsonValue?.value || isEditing) && (
      <ContentSdkRichText
        field={datasource.description?.jsonValue}
        className="mt-4 text-lg opacity-70 font-[var(--brand-body-font,inherit)]"
        style={{ color: 'var(--brand-fg, #111111)' }}
      />
    )}
  </div>
);

/* ────────────────────────────────────────────
   Default — 3-column grid, icon top
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: FeatureCardsGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FeatureCardsGridDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component feature-cards-grid', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col p-6 rounded-[var(--brand-card-radius,0.75rem)]"
                style={{
                  backgroundColor: 'var(--brand-bg, #ffffff)',
                  border: '1px solid var(--brand-border, #e5e7eb)',
                }}
              >
                {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
                  <div className="mb-4 h-12 w-12 overflow-hidden">
                    <ContentSdkImage
                      field={card.cardImage?.jsonValue}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                {(card.cardTitle?.jsonValue?.value || isEditing) && (
                  <Text
                    field={card.cardTitle?.jsonValue}
                    tag="h3"
                    className="text-lg font-semibold font-[var(--brand-heading-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                {(card.cardDescription?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={card.cardDescription?.jsonValue}
                    className="mt-2 flex-1 text-sm opacity-70 font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                {(card.cardLink?.jsonValue?.value?.href || isEditing) && (
                  <ContentSdkLink
                    field={card.cardLink?.jsonValue}
                    className="mt-4 inline-flex text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--brand-primary)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   TwoColumn — 2 wider cards
   ──────────────────────────────────────────── */
export const TwoColumn = ({ fields, params, page }: FeatureCardsGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FeatureCardsGridDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component feature-cards-grid', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-5xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-8 md:grid-cols-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col p-8 rounded-[var(--brand-card-radius,0.75rem)]"
                style={{
                  backgroundColor: 'var(--brand-bg, #ffffff)',
                  border: '1px solid var(--brand-border, #e5e7eb)',
                }}
              >
                {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
                  <div className="mb-5 h-14 w-14 overflow-hidden">
                    <ContentSdkImage
                      field={card.cardImage?.jsonValue}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                {(card.cardTitle?.jsonValue?.value || isEditing) && (
                  <Text
                    field={card.cardTitle?.jsonValue}
                    tag="h3"
                    className="text-xl font-semibold font-[var(--brand-heading-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                {(card.cardDescription?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={card.cardDescription?.jsonValue}
                    className="mt-3 flex-1 text-base opacity-70 font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                {(card.cardLink?.jsonValue?.value?.href || isEditing) && (
                  <ContentSdkLink
                    field={card.cardLink?.jsonValue}
                    className="mt-5 inline-flex text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--brand-primary)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   WithImages — larger images at top of each card
   ──────────────────────────────────────────── */
export const WithImages = ({ fields, params, page }: FeatureCardsGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FeatureCardsGridDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component feature-cards-grid', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col overflow-hidden rounded-[var(--brand-card-radius,0.75rem)]"
                style={{
                  backgroundColor: 'var(--brand-bg, #ffffff)',
                  border: '1px solid var(--brand-border, #e5e7eb)',
                }}
              >
                {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
                  <ContentSdkImage
                    field={card.cardImage?.jsonValue}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  {(card.cardTitle?.jsonValue?.value || isEditing) && (
                    <Text
                      field={card.cardTitle?.jsonValue}
                      tag="h3"
                      className="text-lg font-semibold font-[var(--brand-heading-font,inherit)]"
                      style={{ color: 'var(--brand-fg, #111111)' }}
                    />
                  )}
                  {(card.cardDescription?.jsonValue?.value || isEditing) && (
                    <ContentSdkRichText
                      field={card.cardDescription?.jsonValue}
                      className="mt-2 flex-1 text-sm opacity-70 font-[var(--brand-body-font,inherit)]"
                      style={{ color: 'var(--brand-fg, #111111)' }}
                    />
                  )}
                  {(card.cardLink?.jsonValue?.value?.href || isEditing) && (
                    <ContentSdkLink
                      field={card.cardLink?.jsonValue}
                      className="mt-4 inline-flex text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
                      style={{ color: 'var(--brand-primary)' }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Carousel — horizontal scrolling cards with dots + arrows
   ──────────────────────────────────────────── */
export const Carousel = ({ fields, params, page }: FeatureCardsGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  const cards = datasource?.children?.results || [];

  // How many cards visible at once per breakpoint
  const VISIBLE = { sm: 1, md: 2, lg: 4 };
  const [pageIndex, setPageIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(VISIBLE.lg);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisibleCount(w < 640 ? VISIBLE.sm : w < 1024 ? VISIBLE.md : VISIBLE.lg);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const totalPages = Math.max(1, Math.ceil(cards.length / visibleCount));
  const clampedPage = Math.min(pageIndex, totalPages - 1);

  const goTo = useCallback(
    (idx: number) => setPageIndex(((idx % totalPages) + totalPages) % totalPages),
    [totalPages]
  );

  if (!datasource) return <FeatureCardsGridDefaultComponent />;

  return (
    <div className={cn('component feature-cards-grid', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />

          {/* Carousel track */}
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${clampedPage * 100}%)` }}
              >
                {/* Render all cards in a single row; each card takes 1/visibleCount width */}
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${100 / visibleCount}%` }}
                  >
                    <div className="group relative flex flex-col overflow-hidden rounded-[var(--brand-card-radius,0.75rem)] h-full">
                      {/* Card image — tall portrait ratio */}
                      {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <ContentSdkImage
                            field={card.cardImage?.jsonValue}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {/* Bottom gradient for text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          {/* Overlay content */}
                          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                            {(card.cardTitle?.jsonValue?.value || isEditing) && (
                              <Text
                                field={card.cardTitle?.jsonValue}
                                tag="h3"
                                className="text-lg font-bold tracking-tight font-[var(--brand-heading-font,inherit)] uppercase"
                              />
                            )}
                            {(card.cardLink?.jsonValue?.value?.href || isEditing) && (
                              <ContentSdkLink
                                field={card.cardLink?.jsonValue}
                                className="mt-3 inline-flex items-center justify-center rounded-[var(--brand-button-radius,0.375rem)] border border-white px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black"
                              />
                            )}
                          </div>
                        </div>
                      )}
                      {/* Fallback: show title + description below if no image */}
                      {!card.cardImage?.jsonValue?.value?.src && !isEditing && (
                        <div className="flex flex-1 flex-col p-6">
                          {(card.cardTitle?.jsonValue?.value || isEditing) && (
                            <Text
                              field={card.cardTitle?.jsonValue}
                              tag="h3"
                              className="text-lg font-semibold font-[var(--brand-heading-font,inherit)]"
                              style={{ color: 'var(--brand-fg, #111111)' }}
                            />
                          )}
                          {(card.cardDescription?.jsonValue?.value || isEditing) && (
                            <ContentSdkRichText
                              field={card.cardDescription?.jsonValue}
                              className="mt-2 flex-1 text-sm opacity-70"
                              style={{ color: 'var(--brand-fg, #111111)' }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prev / Next arrows */}
            {totalPages > 1 && !isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(clampedPage - 1)}
                  className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white"
                  style={{ color: 'var(--brand-fg, #111)' }}
                  aria-label="Previous cards"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 6 9 12 15 18" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => goTo(clampedPage + 1)}
                  className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white"
                  style={{ color: 'var(--brand-fg, #111)' }}
                  aria-label="Next cards"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Dot indicators */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-start gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={cn(
                    'h-2.5 w-2.5 rounded-full transition-all',
                    i === clampedPage
                      ? 'scale-110'
                      : 'opacity-40 hover:opacity-70'
                  )}
                  style={{
                    backgroundColor: i === clampedPage
                      ? 'var(--brand-fg, #111)'
                      : 'var(--brand-fg, #111)',
                  }}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ════════════════════════════════════════════
   WORLDPAY DEMO VARIANTS
   ════════════════════════════════════════════ */

/* Shared Worldpay section header with eyebrow, title, description, and optional CTA link */
const WorldpaySectionHeader = ({
  datasource,
  isEditing,
  eyebrow,
  ctaText,
  ctaOutline,
}: {
  datasource: FeatureCardsGridDatasource;
  isEditing?: boolean;
  eyebrow?: string;
  ctaText?: string;
  ctaOutline?: boolean;
}) => (
  <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      {eyebrow && (
        <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#00237D]/60">
          {eyebrow}
        </span>
      )}
      {(datasource.title?.jsonValue?.value || isEditing) && (
        <Text
          field={datasource.title?.jsonValue}
          tag="h2"
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: '#00237D' }}
        />
      )}
      {(datasource.description?.jsonValue?.value || isEditing) && (
        <ContentSdkRichText
          field={datasource.description?.jsonValue}
          className="mt-2 max-w-2xl text-base text-gray-600"
        />
      )}
    </div>
    {ctaText && (
      <a
        href="#"
        className={cn(
          'shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors',
          ctaOutline
            ? 'border-2 border-[#00237D] text-[#00237D] hover:bg-[#00237D] hover:text-white'
            : 'bg-[#00237D] text-white hover:bg-[#001A5C]'
        )}
      >
        {ctaText}
      </a>
    )}
  </div>
);

/* Shared Worldpay dot indicators */
const WorldpayDots = ({
  total,
  current,
  onSelect,
}: {
  total: number;
  current: number;
  onSelect: (i: number) => void;
}) => {
  if (total <= 1) return null;
  return (
    <div className="mt-8 flex justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          className={cn(
            'h-2 rounded-full transition-all',
            i === current ? 'w-8 bg-[#0066FF]' : 'w-2 bg-[#D9D9D9] hover:bg-[#BFBFBF]'
          )}
          aria-label={`Go to page ${i + 1}`}
        />
      ))}
    </div>
  );
};

/* ────────────────────────────────────────────
   WorldpayFeatureCarousel — "We're everywhere. You can be too."
   Large 2-card carousel with 50/50 text+image split per card
   ──────────────────────────────────────────── */
export const WorldpayFeatureCarousel = ({ fields, params, page }: FeatureCardsGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  const cards = datasource?.children?.results || [];

  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(0, cards.length - 1));

  if (!datasource) return <FeatureCardsGridDefaultComponent />;

  return (
    <div className={cn('component feature-cards-grid', styles)} id={RenderingIdentifier}>
      <section className="w-full bg-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <WorldpaySectionHeader datasource={datasource} isEditing={isEditing} eyebrow="Who we serve" />

          {/* Carousel track */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${safeIndex * 100}%)` }}
            >
              {cards.map((card) => (
                <div key={card.id} className="w-full flex-shrink-0">
                  <div className="grid gap-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center space-y-4">
                      {(card.cardTitle?.jsonValue?.value || isEditing) && (
                        <Text
                          field={card.cardTitle?.jsonValue}
                          tag="h3"
                          className="text-2xl font-bold tracking-tight"
                          style={{ color: '#00237D' }}
                        />
                      )}
                      {(card.cardDescription?.jsonValue?.value || isEditing) && (
                        <ContentSdkRichText
                          field={card.cardDescription?.jsonValue}
                          className="text-base leading-relaxed text-gray-600"
                        />
                      )}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {(card.cardLink?.jsonValue?.value?.href || isEditing) && (
                          <ContentSdkLink
                            field={card.cardLink?.jsonValue}
                            className="inline-flex items-center gap-2 rounded-full border-2 border-[#00237D] px-5 py-2.5 text-sm font-semibold text-[#00237D] transition-colors hover:bg-[#00237D] hover:text-white"
                          />
                        )}
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-2xl">
                      {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
                        <ContentSdkImage
                          field={card.cardImage?.jsonValue}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <WorldpayDots total={cards.length} current={safeIndex} onSelect={setActiveIndex} />
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   WorldpayJourneyCards — "Powering every part of your payments journey"
   3 cards with colorful images, title, description
   ──────────────────────────────────────────── */
export const WorldpayJourneyCards = ({ fields, params, page }: FeatureCardsGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FeatureCardsGridDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component feature-cards-grid', styles)} id={RenderingIdentifier}>
      <section className="w-full bg-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <WorldpaySectionHeader datasource={datasource} isEditing={isEditing} eyebrow="Discover our solutions" />

          <div className="grid gap-6 md:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
              >
                {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
                  <div className="overflow-hidden rounded-t-2xl">
                    <ContentSdkImage
                      field={card.cardImage?.jsonValue}
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  {(card.cardTitle?.jsonValue?.value || isEditing) && (
                    <Text
                      field={card.cardTitle?.jsonValue}
                      tag="h3"
                      className="text-xl font-bold"
                      style={{ color: '#00237D' }}
                    />
                  )}
                  {(card.cardDescription?.jsonValue?.value || isEditing) && (
                    <ContentSdkRichText
                      field={card.cardDescription?.jsonValue}
                      className="mt-3 flex-1 text-sm leading-relaxed text-gray-600"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   WorldpayStoryCards — "See how our customers have put Worldpay solutions into action"
   3 cards with photo, badge, company name, description, read more link
   ──────────────────────────────────────────── */
export const WorldpayStoryCards = ({ fields, params, page }: FeatureCardsGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FeatureCardsGridDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component feature-cards-grid', styles)} id={RenderingIdentifier}>
      <section className="w-full bg-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <WorldpaySectionHeader
            datasource={datasource}
            isEditing={isEditing}
            eyebrow="Customer stories"
            ctaText="See all customer stories"
          />

          <div className="grid gap-6 md:grid-cols-3">
            {cards.map((card) => (
              <div key={card.id} className="flex flex-col">
                {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
                  <div className="overflow-hidden rounded-2xl">
                    <ContentSdkImage
                      field={card.cardImage?.jsonValue}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                )}
                <div className="mt-4 flex flex-1 flex-col">
                  <span className="text-xs font-semibold text-[#00237D]/60">Enterprise</span>
                  {(card.cardTitle?.jsonValue?.value || isEditing) && (
                    <Text
                      field={card.cardTitle?.jsonValue}
                      tag="h3"
                      className="mt-1 text-xl font-bold"
                      style={{ color: '#00237D' }}
                    />
                  )}
                  {(card.cardDescription?.jsonValue?.value || isEditing) && (
                    <ContentSdkRichText
                      field={card.cardDescription?.jsonValue}
                      className="mt-2 flex-1 text-sm leading-relaxed text-gray-600"
                    />
                  )}
                  {(card.cardLink?.jsonValue?.value?.href || isEditing) && (
                    <ContentSdkLink
                      field={card.cardLink?.jsonValue}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#00237D] transition-opacity hover:opacity-70"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   WorldpayInsightCards — "Our expertise is your edge"
   3 article cards with image, title, description, read more link
   ──────────────────────────────────────────── */
export const WorldpayInsightCards = ({ fields, params, page }: FeatureCardsGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FeatureCardsGridDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component feature-cards-grid', styles)} id={RenderingIdentifier}>
      <section className="w-full bg-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <WorldpaySectionHeader
            datasource={datasource}
            isEditing={isEditing}
            eyebrow="Insights"
            ctaText="See all insight articles"
            ctaOutline
          />

          <div className="grid gap-6 md:grid-cols-3">
            {cards.map((card) => (
              <div key={card.id} className="flex flex-col">
                {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
                  <div className="overflow-hidden rounded-2xl">
                    <ContentSdkImage
                      field={card.cardImage?.jsonValue}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                )}
                <div className="mt-4 flex flex-1 flex-col">
                  {(card.cardTitle?.jsonValue?.value || isEditing) && (
                    <Text
                      field={card.cardTitle?.jsonValue}
                      tag="h3"
                      className="text-lg font-bold leading-tight"
                      style={{ color: '#00237D' }}
                    />
                  )}
                  {(card.cardDescription?.jsonValue?.value || isEditing) && (
                    <ContentSdkRichText
                      field={card.cardDescription?.jsonValue}
                      className="mt-2 flex-1 text-sm leading-relaxed text-gray-600"
                    />
                  )}
                  {(card.cardLink?.jsonValue?.value?.href || isEditing) && (
                    <ContentSdkLink
                      field={card.cardLink?.jsonValue}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#00237D] transition-opacity hover:opacity-70"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
