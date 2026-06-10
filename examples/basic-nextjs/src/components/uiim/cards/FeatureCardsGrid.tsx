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
  // Optional Copenhagen Silver fields
  cardIcon?: { jsonValue: Field<string> };
  cardNumber?: { jsonValue: Field<string> };
}

const renderActionIcon = (name?: string) => {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'camera':
      return (
        <svg {...common}>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
    case 'image':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
      );
    default:
      return null;
  }
};

interface FeatureCardsGridDatasource {
  title: { jsonValue: Field<string> };
  description: { jsonValue: Field<string> };
  eyebrow?: { jsonValue: Field<string> };
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
    {datasource.eyebrow?.jsonValue?.value && (
      <Text
        field={datasource.eyebrow?.jsonValue}
        tag="p"
        className="mb-10 text-xs md:text-sm font-light tracking-[0.5em] uppercase"
        style={{ color: '#d4d4d8' }}
      />
    )}
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
   Default — Copenhagen Silver ActionCardsTwoUp
   2-up large dark cards, red icon square top-left,
   title h3, subtitle. Full card is clickable.
   Auto-routes to NumberedRedAccent when children carry CardNumber values.
   ──────────────────────────────────────────── */
export const Default = (props: FeatureCardsGridProps): JSX.Element => {
  const cards = props.fields?.data?.datasource?.children?.results || [];
  const hasNumbers = cards.some((c) => !!c.cardNumber?.jsonValue?.value);
  if (hasNumbers) return <NumberedRedAccent {...props} />;
  const { fields, params, page } = props;
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FeatureCardsGridDefaultComponent />;

  return (
    <div className={cn('component feature-cards-grid', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-5 sm:grid-cols-2">
            {cards.map((card) => {
              const iconName = card.cardIcon?.jsonValue?.value;
              const href = card.cardLink?.jsonValue?.value?.href;
              const CardWrapper = ({ children }: { children: React.ReactNode }) =>
                href ? (
                  <a
                    href={href}
                    target={card.cardLink?.jsonValue?.value?.target || undefined}
                    className="block transition-all hover:translate-y-[-2px] hover:opacity-95"
                  >
                    {children}
                  </a>
                ) : (
                  <div>{children}</div>
                );
              return (
                <CardWrapper key={card.id}>
                  <div
                    className="flex flex-col p-6 h-full"
                    style={{
                      backgroundColor: 'var(--brand-muted)',
                      border: '1px solid var(--brand-border)',
                      borderRadius: 'var(--brand-card-radius)',
                      boxShadow: 'var(--brand-card-shadow)',
                    }}
                  >
                    <div
                      className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: 'var(--brand-primary)',
                        color: 'var(--brand-primary-foreground)',
                      }}
                    >
                      {(card.cardImage?.jsonValue?.value?.src && (
                        <ContentSdkImage
                          field={card.cardImage?.jsonValue}
                          className="h-6 w-6 object-contain"
                        />
                      )) || renderActionIcon(iconName)}
                    </div>
                    {(card.cardTitle?.jsonValue?.value || isEditing) && (
                      <Text
                        field={card.cardTitle?.jsonValue}
                        tag="h3"
                        className="text-xl font-bold"
                        style={{ color: 'var(--brand-fg)' }}
                      />
                    )}
                    {(card.cardDescription?.jsonValue?.value || isEditing) && (
                      <ContentSdkRichText
                        field={card.cardDescription?.jsonValue}
                        className="mt-1 text-sm [&_p]:m-0"
                        style={{ color: 'var(--brand-muted-foreground)' }}
                      />
                    )}
                  </div>
                </CardWrapper>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   NumberedRedAccent — Event "What to Expect"
   2-col grid with shared hairline dividers,
   outlined silver numbers (01/02/03/04),
   "+" icon top-right, all-caps tracked title,
   gray description. No per-card backgrounds.
   ──────────────────────────────────────────── */
export const NumberedRedAccent = ({ fields, params, page }: FeatureCardsGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FeatureCardsGridDefaultComponent />;
  const cards = datasource.children?.results || [];
  const hairline = '1px solid rgba(255, 255, 255, 0.08)';

  return (
    <div className={cn('component feature-cards-grid', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div
            className="grid grid-cols-1 sm:grid-cols-2"
            style={{ border: hairline }}
          >
            {cards.map((card, idx) => {
              const num =
                card.cardNumber?.jsonValue?.value || String(idx + 1).padStart(2, '0');
              const isLeftCol = idx % 2 === 0;
              const isLastRow = idx >= cards.length - 2;
              const cellBorder: React.CSSProperties = {
                borderRight: isLeftCol ? hairline : 'none',
                borderBottom: !isLastRow ? hairline : 'none',
              };
              return (
                <div
                  key={card.id}
                  className="relative p-8 md:p-10"
                  style={cellBorder}
                >
                  {/* "+" icon top right */}
                  <span
                    aria-hidden
                    className="absolute top-6 right-6 inline-flex h-6 w-6 items-center justify-center rounded-full"
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontSize: '12px',
                      fontWeight: 300,
                    }}
                  >
                    +
                  </span>

                  {/* Outlined silver number */}
                  <span
                    className="block text-5xl md:text-6xl font-light"
                    style={{
                      fontFamily: 'var(--brand-heading-font)',
                      color: 'transparent',
                      WebkitTextStroke: '1px rgba(229, 231, 235, 0.55)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                    }}
                  >
                    {num}
                  </span>

                  {/* Title (all-caps tracked) */}
                  {(card.cardTitle?.jsonValue?.value || isEditing) && (
                    <Text
                      field={card.cardTitle?.jsonValue}
                      tag="h3"
                      className="mt-6 text-xs md:text-sm font-light tracking-[0.3em] uppercase"
                      style={{ color: '#d4d4d8' }}
                    />
                  )}

                  {/* Description */}
                  {(card.cardDescription?.jsonValue?.value || isEditing) && (
                    <ContentSdkRichText
                      field={card.cardDescription?.jsonValue}
                      className="mt-4 text-sm md:text-[15px] leading-relaxed font-light [&_p]:m-0"
                      style={{ color: '#a3a3a3' }}
                    />
                  )}
                </div>
              );
            })}
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
