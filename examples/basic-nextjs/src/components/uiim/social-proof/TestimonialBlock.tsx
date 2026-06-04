'use client';

import React, { JSX, useState } from 'react';
import {
  Field,
  ImageField,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface TestimonialItemFields {
  id: string;
  quoteText: { jsonValue: Field<string> };
  authorName: { jsonValue: Field<string> };
  authorRole: { jsonValue: Field<string> };
  authorImage: { jsonValue: ImageField };
  companyName: { jsonValue: Field<string> };
  companyLogo: { jsonValue: ImageField };
}

interface TestimonialBlockDatasource {
  sectionTitle: { jsonValue: Field<string> };
  ratingValue?: { jsonValue: Field<string> };
  reviewsCount?: { jsonValue: Field<string> };
  verifiedBy?: { jsonValue: Field<string> };
  children: {
    results: TestimonialItemFields[];
  };
}

interface TestimonialBlockFields {
  data: {
    datasource: TestimonialBlockDatasource;
  };
}

type TestimonialBlockProps = ComponentProps & {
  fields: TestimonialBlockFields;
};

const TestimonialBlockDefaultComponent = (): JSX.Element => (
  <div className="component testimonial-block">
    <div className="component-content">
      <span className="is-empty-hint">TestimonialBlock</span>
    </div>
  </div>
);

const QuoteMark = () => (
  <span
    className="block text-6xl leading-none opacity-30 font-serif select-none"
    style={{ color: 'var(--brand-primary)' }}
    aria-hidden="true"
  >
    &ldquo;
  </span>
);

const AuthorAttribution = ({
  item,
  isEditing,
  size = 'sm',
}: {
  item: TestimonialItemFields;
  isEditing?: boolean;
  size?: 'sm' | 'lg';
}) => (
  <div className={cn('flex items-center', size === 'lg' ? 'gap-4' : 'gap-3')}>
    {(item.authorImage?.jsonValue?.value?.src || isEditing) && (
      <ContentSdkImage
        field={item.authorImage?.jsonValue}
        width={56}
        height={56}
        className={cn(
          'rounded-full object-cover',
          size === 'lg' ? 'h-14 w-14' : 'h-12 w-12'
        )}
      />
    )}
    <div>
      {(item.authorName?.jsonValue?.value || isEditing) && (
        <Text
          field={item.authorName?.jsonValue}
          tag="p"
          className="font-semibold font-[var(--brand-heading-font,inherit)]"
          style={{ color: 'var(--brand-fg, #111111)' }}
        />
      )}
      <div className="flex flex-wrap items-center gap-1 text-sm" style={{ color: 'var(--brand-muted-foreground, #6b7280)' }}>
        {(item.authorRole?.jsonValue?.value || isEditing) && (
          <Text field={item.authorRole?.jsonValue} tag="span" />
        )}
        {item.authorRole?.jsonValue?.value && item.companyName?.jsonValue?.value && (
          <span aria-hidden="true">&middot;</span>
        )}
        {(item.companyName?.jsonValue?.value || isEditing) && (
          <Text field={item.companyName?.jsonValue} tag="span" />
        )}
      </div>
    </div>
  </div>
);

/* ────────────────────────────────────────────
   Default — single large centered quote (first child)
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: TestimonialBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TestimonialBlockDefaultComponent />;
  const items = datasource.children?.results || [];
  const item = items[0];

  return (
    <div className={cn('component testimonial-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-3xl text-center">
          {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.sectionTitle?.jsonValue}
              tag="h2"
              className="mb-8 text-2xl font-bold font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          {item && (
            <>
              <QuoteMark />
              {(item.quoteText?.jsonValue?.value || isEditing) && (
                <ContentSdkRichText
                  field={item.quoteText?.jsonValue}
                  className="mt-2 text-lg italic md:text-xl font-[var(--brand-body-font,inherit)]"
                  style={{ color: 'var(--brand-fg, #111111)' }}
                />
              )}
              <div className="mt-6 flex justify-center">
                <AuthorAttribution item={item} isEditing={isEditing} />
              </div>
              {(item.companyLogo?.jsonValue?.value?.src || isEditing) && (
                <div className="mt-4 flex justify-center">
                  <ContentSdkImage
                    field={item.companyLogo?.jsonValue}
                    width={120}
                    height={32}
                    className="h-8 max-w-[120px] object-contain opacity-60"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   HCA — 3-up patient story cards: portrait photo on top,
   short quote + author below in white card with navy heading style
   ──────────────────────────────────────────── */
export const HCA = ({ fields, params, page }: TestimonialBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TestimonialBlockDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component testimonial-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl md:px-6">
          {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
            <div className="mb-12 max-w-3xl">
              <Text
                field={datasource.sectionTitle?.jsonValue}
                tag="h2"
                className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl font-[var(--brand-heading-font,inherit)]"
                style={{ color: 'var(--brand-primary, #0C2141)' }}
              />
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
                style={{
                  border: '1px solid var(--brand-border, #e5e7eb)',
                }}
              >
                {(item.authorImage?.jsonValue?.value?.src || isEditing) && (
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <ContentSdkImage
                      field={item.authorImage?.jsonValue}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-4 p-6">
                  {(item.quoteText?.jsonValue?.value || isEditing) && (
                    <ContentSdkRichText
                      field={item.quoteText?.jsonValue}
                      className="flex-1 text-base leading-snug font-[var(--brand-body-font,inherit)]"
                      style={{ color: 'var(--brand-primary, #0C2141)' }}
                    />
                  )}
                  <div className="pt-2">
                    {(item.authorName?.jsonValue?.value || isEditing) && (
                      <Text
                        field={item.authorName?.jsonValue}
                        tag="p"
                        className="text-sm font-semibold font-[var(--brand-heading-font,inherit)]"
                        style={{ color: 'var(--brand-fg, #111111)' }}
                      />
                    )}
                    <div
                      className="flex flex-wrap items-center gap-1 text-xs opacity-70"
                      style={{ color: 'var(--brand-fg, #111111)' }}
                    >
                      {(item.authorRole?.jsonValue?.value || isEditing) && (
                        <Text field={item.authorRole?.jsonValue} tag="span" />
                      )}
                      {item.authorRole?.jsonValue?.value && item.companyName?.jsonValue?.value && (
                        <span aria-hidden="true">&middot;</span>
                      )}
                      {(item.companyName?.jsonValue?.value || isEditing) && (
                        <Text field={item.companyName?.jsonValue} tag="span" />
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Carousel — horizontal scrollable container
   ──────────────────────────────────────────── */
export const Carousel = ({ fields, params, page }: TestimonialBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TestimonialBlockDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component testimonial-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.sectionTitle?.jsonValue}
              tag="h2"
              className="mb-8 text-center text-2xl font-bold font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="min-w-[300px] max-w-[400px] shrink-0 snap-center p-6 rounded-[var(--brand-card-radius,0.75rem)]"
                style={{
                  backgroundColor: 'var(--brand-bg, #ffffff)',
                  border: '1px solid var(--brand-border, #e5e7eb)',
                }}
              >
                <QuoteMark />
                {(item.quoteText?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.quoteText?.jsonValue}
                    className="mt-2 text-sm italic font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                <div className="mt-4">
                  <AuthorAttribution item={item} isEditing={isEditing} />
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
   Grid — 2-3 testimonial cards
   ──────────────────────────────────────────── */
export const Grid = ({ fields, params, page }: TestimonialBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TestimonialBlockDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component testimonial-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.sectionTitle?.jsonValue}
              tag="h2"
              className="mb-10 text-center text-2xl font-bold font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col p-6 rounded-[var(--brand-card-radius,0.75rem)]"
                style={{
                  backgroundColor: 'var(--brand-bg, #ffffff)',
                  border: '1px solid var(--brand-border, #e5e7eb)',
                }}
              >
                <QuoteMark />
                {(item.quoteText?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.quoteText?.jsonValue}
                    className="mt-2 flex-1 text-sm italic font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--brand-border, #e5e7eb)' }}>
                  <AuthorAttribution item={item} isEditing={isEditing} />
                </div>
                {(item.companyLogo?.jsonValue?.value?.src || isEditing) && (
                  <div className="mt-3">
                    <ContentSdkImage
                      field={item.companyLogo?.jsonValue}
                      width={100}
                      height={24}
                      className="h-6 max-w-[100px] object-contain opacity-50"
                    />
                  </div>
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
   WithPhoto — single quote with large author photo
   ──────────────────────────────────────────── */
export const WithPhoto = ({ fields, params, page }: TestimonialBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TestimonialBlockDefaultComponent />;
  const items = datasource.children?.results || [];
  const item = items[0];

  return (
    <div className={cn('component testimonial-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-4xl">
          {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.sectionTitle?.jsonValue}
              tag="h2"
              className="mb-10 text-center text-2xl font-bold font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          {item && (
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
              {(item.authorImage?.jsonValue?.value?.src || isEditing) && (
                <div className="shrink-0">
                  <ContentSdkImage
                    field={item.authorImage?.jsonValue}
                    width={128}
                    height={128}
                    className="h-32 w-32 rounded-full object-cover shadow-md"
                  />
                </div>
              )}
              <div className="flex-1 text-center md:text-left">
                <QuoteMark />
                {(item.quoteText?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.quoteText?.jsonValue}
                    className="mt-2 text-lg italic md:text-xl font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                <div className="mt-6">
                  <AuthorAttribution item={item} isEditing={isEditing} size="lg" />
                </div>
                {(item.companyLogo?.jsonValue?.value?.src || isEditing) && (
                  <div className="mt-4">
                    <ContentSdkImage
                      field={item.companyLogo?.jsonValue}
                      width={120}
                      height={32}
                      className="h-8 max-w-[120px] object-contain opacity-60"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   HCAReviews — large rating number, mint stars, quote with circle nav arrows.
   Used by hospital pages for the aggregate reviews section
   (e.g. "5 / ★★★★★ / 4,301 Reviews / Verified by Doctify").
   ──────────────────────────────────────────── */
const HCAStarIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const HCAArrowIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {direction === 'left' ? (
      <>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </>
    ) : (
      <>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </>
    )}
  </svg>
);

export const HCAReviews = ({ fields, params, page }: TestimonialBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TestimonialBlockDefaultComponent />;

  const items = datasource.children?.results || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = items.length > 0 ? activeIndex % items.length : 0;
  const activeItem = items[safeIndex];

  const ratingNumber = Number(datasource.ratingValue?.jsonValue?.value ?? 0);
  const fullStars = Math.max(0, Math.min(5, Math.round(ratingNumber)));

  const goPrev = () => setActiveIndex((i) => (items.length ? (i - 1 + items.length) % items.length : 0));
  const goNext = () => setActiveIndex((i) => (items.length ? (i + 1) % items.length : 0));

  return (
    <div className={cn('component testimonial-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Big rating number */}
          {(datasource.ratingValue?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.ratingValue?.jsonValue}
              tag="div"
              className="text-7xl font-bold leading-none tracking-tight md:text-8xl font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-primary, #0C2141)' }}
            />
          )}

          {/* Stars row */}
          <div className="mt-4 flex items-center gap-2" style={{ color: '#A6E5DE' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ opacity: i < fullStars ? 1 : 0.25 }}>
                <HCAStarIcon />
              </span>
            ))}
          </div>

          {/* Reviews count */}
          {(datasource.reviewsCount?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.reviewsCount?.jsonValue}
              tag="p"
              className="mt-3 text-base font-medium"
              style={{ color: 'var(--brand-primary, #0C2141)' }}
            />
          )}

          {/* Quote */}
          {activeItem && (activeItem.quoteText?.jsonValue?.value || isEditing) && (
            <div className="mt-10 max-w-2xl">
              <ContentSdkRichText
                field={activeItem.quoteText?.jsonValue}
                className="text-lg leading-relaxed md:text-xl"
                style={{ color: 'var(--brand-primary, #0C2141)' }}
              />
            </div>
          )}

          {/* Circle nav arrows */}
          {items.length > 1 && !isEditing && (
            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous review"
                className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'var(--brand-primary, #0C2141)' }}
              >
                <HCAArrowIcon direction="left" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next review"
                className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'var(--brand-primary, #0C2141)' }}
              >
                <HCAArrowIcon direction="right" />
              </button>
            </div>
          )}

          {/* Verified by */}
          {(datasource.verifiedBy?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.verifiedBy?.jsonValue}
              tag="p"
              className="mt-6 text-sm opacity-70"
              style={{ color: 'var(--brand-primary, #0C2141)' }}
            />
          )}
        </div>
      </section>
    </div>
  );
};
