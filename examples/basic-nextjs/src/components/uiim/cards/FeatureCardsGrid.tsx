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
import { ArrowRight } from 'lucide-react';

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
   Biffa variants — shared pieces
   ════════════════════════════════════════════ */
const biffaHasText = (value?: string) => !!value && value.trim().length > 0;

const BiffaSectionHeader = ({
  datasource,
  isEditing,
  tone,
}: {
  datasource: FeatureCardsGridDatasource;
  isEditing?: boolean;
  tone: 'light' | 'dark';
}) => {
  const color = tone === 'light' ? 'var(--brand-primary-foreground)' : 'var(--brand-fg)';
  const hasTitle = biffaHasText(datasource.title?.jsonValue?.value) || isEditing;
  const hasDescription = biffaHasText(datasource.description?.jsonValue?.value) || isEditing;
  if (!hasTitle && !hasDescription) return null;
  return (
    <div className="mx-auto mb-12 max-w-[880px] text-center md:mb-16">
      {hasTitle && (
        <Text
          field={datasource.title?.jsonValue}
          tag="h2"
          className="text-[34px] font-bold leading-[1.15] md:text-[46px] font-[var(--brand-heading-font,inherit)]"
          style={{ color }}
        />
      )}
      {hasDescription && (
        <ContentSdkRichText
          field={datasource.description?.jsonValue}
          className="mt-6 space-y-8 text-lg leading-[1.5] md:text-xl font-[var(--brand-body-font,inherit)] [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4 [&_a]:after:ml-3 [&_a]:after:content-['›'] [&_p:last-child:has(a)]:pt-2"
          style={{ color }}
        />
      )}
    </div>
  );
};

/** Article card (News / Insights): image top, red title, excerpt; whole card is the CardLink. */
const BiffaArticleCard = ({ card, isEditing }: { card: FeatureCardItemFields; isEditing?: boolean }) => {
  const link = card.cardLink?.jsonValue;
  const hasLink = !!link?.value?.href;
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[var(--brand-card-radius,1.5rem)] bg-[var(--brand-bg)] shadow-lg">
      {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
        <div className="relative h-[216px] w-full overflow-hidden">
          <ContentSdkImage
            field={card.cardImage?.jsonValue}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        {(biffaHasText(card.cardTitle?.jsonValue?.value) || isEditing) && (
          <Text
            field={card.cardTitle?.jsonValue}
            tag="h3"
            className="text-2xl font-bold leading-[1.25] md:text-[28px] font-[var(--brand-heading-font,inherit)]"
            style={{ color: 'var(--brand-primary)' }}
          />
        )}
        {(biffaHasText(card.cardDescription?.jsonValue?.value) || isEditing) && (
          <ContentSdkRichText
            field={card.cardDescription?.jsonValue}
            className="mt-4 text-base font-medium leading-[1.45] font-[var(--brand-body-font,inherit)]"
            style={{ color: 'var(--brand-fg)' }}
          />
        )}
        {isEditing ? (
          <ContentSdkLink field={link} className="mt-4 text-sm font-semibold underline" style={{ color: 'var(--brand-primary)' }} />
        ) : (
          hasLink && <ContentSdkLink field={link} className="absolute inset-0 z-10 text-[0px]" aria-label={link?.value?.text || undefined} />
        )}
      </div>
    </div>
  );
};

/** Promo card (Let's work together): image top, navy title, text, red pill CardLink. */
const BiffaPromoCard = ({ card, isEditing }: { card: FeatureCardItemFields; isEditing?: boolean }) => (
  <div className="flex flex-col overflow-hidden rounded-[var(--brand-card-radius,1.5rem)] bg-[var(--brand-bg)] shadow-lg">
    {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
      <div className="relative h-[260px] w-full overflow-hidden">
        <ContentSdkImage
          field={card.cardImage?.jsonValue}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    )}
    <div className="flex flex-1 flex-col p-6">
      {(biffaHasText(card.cardTitle?.jsonValue?.value) || isEditing) && (
        <Text
          field={card.cardTitle?.jsonValue}
          tag="h3"
          className="text-2xl font-bold leading-[1.25] md:text-[28px] font-[var(--brand-heading-font,inherit)]"
          style={{ color: 'var(--brand-fg)' }}
        />
      )}
      {(biffaHasText(card.cardDescription?.jsonValue?.value) || isEditing) && (
        <ContentSdkRichText
          field={card.cardDescription?.jsonValue}
          className="mt-4 flex-1 text-base font-medium leading-[1.45] font-[var(--brand-body-font,inherit)]"
          style={{ color: 'var(--brand-fg)' }}
        />
      )}
      {(card.cardLink?.jsonValue?.value?.href || isEditing) && (
        <span className="relative mt-8 inline-flex w-fit items-center gap-3 rounded-[var(--brand-button-radius,9999px)] bg-[var(--brand-primary)] px-5 py-3 text-lg font-semibold text-[var(--brand-primary-foreground)] transition-opacity hover:opacity-90">
          <ContentSdkLink field={card.cardLink?.jsonValue} className={cn(!isEditing && 'after:absolute after:inset-0')} />
          <ArrowRight aria-hidden className="h-5 w-5" />
        </span>
      )}
    </div>
  </div>
);

/* ────────────────────────────────────────────
   BiffaNews variant — solid primary-red band, white heading,
   3 white article cards with red titles (whole card clickable)
   ──────────────────────────────────────────── */
export const BiffaNews = ({ fields, params, page }: FeatureCardsGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FeatureCardsGridDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component feature-cards-grid', styles)} id={RenderingIdentifier}>
      <section className="w-full px-6 py-20 md:py-28" style={{ backgroundColor: 'var(--brand-primary)' }}>
        <div className="mx-auto max-w-[1400px]">
          <BiffaSectionHeader datasource={datasource} isEditing={isEditing} tone="light" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <BiffaArticleCard key={card.id} card={card} isEditing={isEditing} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   BiffaPromo variant — primary-red top half / white bottom half,
   white heading, 3 audience cards with red pill buttons
   ──────────────────────────────────────────── */
export const BiffaPromo = ({ fields, params, page }: FeatureCardsGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FeatureCardsGridDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component feature-cards-grid', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-6 pb-20 pt-20 md:pb-28 md:pt-24"
        style={{
          background: 'linear-gradient(to bottom, var(--brand-primary) 0, var(--brand-primary) 55%, var(--brand-bg) 55%, var(--brand-bg) 100%)',
        }}
      >
        <div className="mx-auto max-w-[1400px]">
          <BiffaSectionHeader datasource={datasource} isEditing={isEditing} tone="light" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <BiffaPromoCard key={card.id} card={card} isEditing={isEditing} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   BiffaInsights variant — light-grey band, navy heading + intro
   (Description link styled as underlined "view more"), article cards
   ──────────────────────────────────────────── */
export const BiffaInsights = ({ fields, params, page }: FeatureCardsGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FeatureCardsGridDefaultComponent />;
  const cards = datasource.children?.results || [];
  const hasTitle = biffaHasText(datasource.title?.jsonValue?.value) || isEditing;
  const hasDescription = biffaHasText(datasource.description?.jsonValue?.value) || isEditing;

  // Live site shows the "view more" link BELOW the cards. It is authored as the last
  // Description paragraph, so outside edit mode the Description wrapper uses
  // display:contents and the link-only paragraph is ordered after the card grid.
  // In edit mode the Description stays a normal block so inline editing works.
  return (
    <div className={cn('component feature-cards-grid', styles)} id={RenderingIdentifier}>
      <section className="w-full px-6 py-20 md:py-28" style={{ backgroundColor: 'var(--brand-muted)' }}>
        <div className="mx-auto flex max-w-[1400px] flex-col items-center">
          {hasTitle && (
            <Text
              field={datasource.title?.jsonValue}
              tag="h2"
              className="order-1 max-w-[880px] text-center text-[34px] font-bold leading-[1.15] md:text-[46px] font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg)' }}
            />
          )}
          {hasDescription && (
            <ContentSdkRichText
              field={datasource.description?.jsonValue}
              className={cn(
                'text-center text-lg leading-[1.5] md:text-xl font-[var(--brand-body-font,inherit)]',
                "[&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4 [&_a]:after:ml-3 [&_a]:after:content-['›']",
                isEditing
                  ? 'order-2 mt-6 max-w-[880px] space-y-6'
                  : 'contents [&>p]:order-2 [&>p]:mt-6 [&>p]:max-w-[880px] [&>p:has(>a:only-child)]:order-4 [&>p:has(>a:only-child)]:mt-14'
              )}
              style={{ color: 'var(--brand-fg)' }}
            />
          )}
          <div className="order-3 mt-12 grid w-full gap-6 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <BiffaArticleCard key={card.id} card={card} isEditing={isEditing} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
