import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  Link as ContentSdkLink,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';
import { SmartMedia } from '@/components/uiim/media/SmartMedia';

interface HeroBannerFields {
  Title: Field<string>;
  Subtitle: Field<string>;
  HeroImage: ImageField;
  PrimaryLink: LinkField;
  SecondaryLink: LinkField;
  // Hospital-page fields (optional — only used by HospitalHero variant)
  Address?: Field<string>;
  Hours?: Field<string>;
  Phone?: Field<string>;
  ReviewsCount?: Field<string>;
  RatingValue?: Field<string>;
  TertiaryLink?: LinkField;
}

type HeroBannerProps = ComponentProps & {
  fields: HeroBannerFields;
};

const HeroBannerDefaultComponent = (): JSX.Element => (
  <div className="component hero-banner">
    <div className="component-content">
      <span className="is-empty-hint">HeroBanner</span>
    </div>
  </div>
);

const PrimaryButton = ({
  field,
  isEditing,
}: {
  field: LinkField;
  isEditing?: boolean;
}) => {
  if (!field?.value?.href && !isEditing) return null;
  return (
    <ContentSdkLink
      field={field}
      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 rounded-[var(--brand-button-radius,0.375rem)]"
      style={{
        backgroundColor: 'var(--brand-primary)',
        color: 'var(--brand-primary-foreground)',
      }}
    />
  );
};

const SecondaryButton = ({
  field,
  isEditing,
}: {
  field: LinkField;
  isEditing?: boolean;
}) => {
  if (!field?.value?.href && !isEditing) return null;
  return (
    <ContentSdkLink
      field={field}
      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold border border-current bg-transparent transition-opacity hover:opacity-70 rounded-[var(--brand-button-radius,0.375rem)]"
    />
  );
};

/* ────────────────────────────────────────────
   Default — centered text on colored background
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: HeroBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <HeroBannerDefaultComponent />;

  return (
    <div className={cn('component hero-banner', styles)} id={RenderingIdentifier}>
      <section
        className="flex min-h-[80vh] w-full items-center justify-center px-4 py-20 text-center"
        style={{
          backgroundColor: 'var(--brand-header-bg, #1a1a2e)',
          color: 'var(--brand-header-fg, #ffffff)',
        }}
      >
        <div className="mx-auto max-w-4xl space-y-6">
          {(fields.Title?.value || isEditing) && (
            <Text
              field={fields.Title}
              tag="h1"
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-[var(--brand-heading-font,inherit)]"
            />
          )}
          {(fields.Subtitle?.value || isEditing) && (
            <ContentSdkRichText
              field={fields.Subtitle}
              className="mx-auto max-w-2xl text-lg opacity-90"
            />
          )}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <PrimaryButton field={fields.PrimaryLink} isEditing={isEditing} />
            <SecondaryButton field={fields.SecondaryLink} isEditing={isEditing} />
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   SplitImageText — 50/50 grid
   ──────────────────────────────────────────── */
export const SplitImageText = ({ fields, params, page }: HeroBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <HeroBannerDefaultComponent />;

  return (
    <div className={cn('component hero-banner', styles)} id={RenderingIdentifier}>
      <section
        className="w-full"
        style={{
          backgroundColor: 'var(--brand-bg, #ffffff)',
          color: 'var(--brand-fg, #111111)',
        }}
      >
        <div className="mx-auto grid min-h-[60vh] max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:px-6">
          <div className="space-y-6">
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h1"
                className="text-4xl font-bold tracking-tight sm:text-5xl font-[var(--brand-heading-font,inherit)]"
              />
            )}
            {(fields.Subtitle?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Subtitle}
                className="max-w-lg text-lg opacity-80"
              />
            )}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <PrimaryButton field={fields.PrimaryLink} isEditing={isEditing} />
              <SecondaryButton field={fields.SecondaryLink} isEditing={isEditing} />
            </div>
          </div>
          <div className="relative h-full min-h-[400px] overflow-hidden rounded-[var(--brand-card-radius,0.75rem)]">
            {(fields.HeroImage?.value?.src || isEditing) && (
              <SmartMedia
                field={fields.HeroImage}
                isEditing={isEditing}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   BackgroundImage — full-bleed image with overlay
   ──────────────────────────────────────────── */
export const BackgroundImage = ({ fields, params, page }: HeroBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <HeroBannerDefaultComponent />;

  return (
    <div className={cn('component hero-banner', styles)} id={RenderingIdentifier}>
      <section className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden">
        {/* Background image */}
        {(fields.HeroImage?.value?.src || isEditing) && (
          <div className="absolute inset-0">
            <SmartMedia
              field={fields.HeroImage}
              isEditing={isEditing}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center text-white">
          <div className="space-y-6">
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h1"
                className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-[var(--brand-heading-font,inherit)]"
              />
            )}
            {(fields.Subtitle?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Subtitle}
                className="mx-auto max-w-2xl text-lg opacity-90"
              />
            )}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <PrimaryButton field={fields.PrimaryLink} isEditing={isEditing} />
              <SecondaryButton field={fields.SecondaryLink} isEditing={isEditing} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   VideoBackground — poster image with video overlay indicator
   ──────────────────────────────────────────── */
export const VideoBackground = ({ fields, params, page }: HeroBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <HeroBannerDefaultComponent />;

  return (
    <div className={cn('component hero-banner', styles)} id={RenderingIdentifier}>
      <section className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden">
        {/* Poster / background image */}
        {(fields.HeroImage?.value?.src || isEditing) && (
          <div className="absolute inset-0">
            <SmartMedia
              field={fields.HeroImage}
              isEditing={isEditing}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Play indicator */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full opacity-80"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="var(--brand-primary-foreground, #fff)"
            >
              <polygon points="6,3 20,12 6,21" />
            </svg>
          </div>
        </div>
        {/* Content */}
        <div className="relative z-20 mx-auto max-w-4xl px-4 py-20 text-center text-white">
          <div className="space-y-6">
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h1"
                className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-[var(--brand-heading-font,inherit)]"
              />
            )}
            {(fields.Subtitle?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Subtitle}
                className="mx-auto max-w-2xl text-lg opacity-90"
              />
            )}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <PrimaryButton field={fields.PrimaryLink} isEditing={isEditing} />
              <SecondaryButton field={fields.SecondaryLink} isEditing={isEditing} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   HCA — full-bleed image with left-aligned content,
   dark gradient on left, headline + sub + pill CTAs
   ──────────────────────────────────────────── */
export const HCA = ({ fields, params, page }: HeroBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <HeroBannerDefaultComponent />;

  return (
    <div className={cn('component hero-banner', styles)} id={RenderingIdentifier}>
      <section className="relative w-full overflow-hidden min-h-[560px] md:min-h-[640px]">
        {/* Background image */}
        {(fields.HeroImage?.value?.src || isEditing) && (
          <div className="absolute inset-0">
            <SmartMedia
              field={fields.HeroImage}
              isEditing={isEditing}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}
        {/* Gradient overlay - darker on left, fades right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(12,33,65,0.85) 0%, rgba(12,33,65,0.65) 35%, rgba(12,33,65,0.15) 70%, rgba(12,33,65,0) 100%)',
          }}
        />
        {/* Content */}
        <div className="relative z-10 mx-auto flex min-h-[560px] md:min-h-[640px] max-w-7xl items-center px-4 py-16 sm:px-6">
          <div className="max-w-xl space-y-5 text-white">
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h1"
                className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl font-[var(--brand-heading-font,inherit)]"
              />
            )}
            {(fields.Subtitle?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Subtitle}
                className="max-w-md text-base opacity-95 md:text-lg"
              />
            )}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {(fields.PrimaryLink?.value?.href || isEditing) && (
                <ContentSdkLink
                  field={fields.PrimaryLink}
                  className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold bg-[#A6E5DE] text-[var(--brand-primary,#0C2141)] transition-colors duration-200 hover:bg-[var(--brand-primary,#0C2141)] hover:text-white"
                />
              )}
              {(fields.SecondaryLink?.value?.href || isEditing) && (
                <ContentSdkLink
                  field={fields.SecondaryLink}
                  className="inline-flex items-center justify-center rounded-full border border-white bg-transparent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[var(--brand-primary,#0C2141)]"
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   HospitalHero — mint background, organic-clipped image right,
   title + star rating + address/hours/phone chips + 3 CTAs left.
   Used by hospital location pages (e.g. London Bridge Hospital).
   ──────────────────────────────────────────── */
const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const LocationPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const HospitalHero = ({ fields, params, page }: HeroBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <HeroBannerDefaultComponent />;

  const ratingNumber = Number(fields.RatingValue?.value ?? 0);
  const fullStars = Math.max(0, Math.min(5, Math.round(ratingNumber)));

  return (
    <div className={cn('component hero-banner', styles)} id={RenderingIdentifier}>
      <section
        className="relative w-full overflow-hidden"
        style={{ backgroundColor: '#A6E5DE' }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_1fr] md:gap-12 md:py-16">
          {/* Left column: content */}
          <div className="space-y-5">
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h1"
                className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-[56px] font-[var(--brand-heading-font,inherit)]"
                style={{ color: 'var(--brand-primary, #0C2141)' }}
              />
            )}

            {/* Rating + reviews */}
            {(fields.RatingValue?.value || fields.ReviewsCount?.value || isEditing) && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--brand-primary, #0C2141)' }}>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < fullStars} />
                  ))}
                </div>
                {(fields.ReviewsCount?.value || isEditing) && (
                  <Text field={fields.ReviewsCount} tag="span" className="font-medium" />
                )}
              </div>
            )}

            {/* Address chip */}
            {(fields.Address?.value || isEditing) && (
              <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--brand-primary, #0C2141)' }}>
                <span className="mt-0.5 shrink-0"><LocationPinIcon /></span>
                <Text field={fields.Address} tag="span" className="font-medium" />
              </div>
            )}

            {/* Hours chip */}
            {(fields.Hours?.value || isEditing) && (
              <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--brand-primary, #0C2141)' }}>
                <span className="mt-0.5 shrink-0"><ClockIcon /></span>
                <Text field={fields.Hours} tag="span" className="font-medium" />
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {(fields.PrimaryLink?.value?.href || isEditing) && (
                <ContentSdkLink
                  field={fields.PrimaryLink}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--brand-primary,#0C2141)] bg-[var(--brand-primary,#0C2141)] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-[var(--brand-primary,#0C2141)]"
                />
              )}
              {(fields.SecondaryLink?.value?.href || isEditing) && (
                <ContentSdkLink
                  field={fields.SecondaryLink}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--brand-primary,#0C2141)] transition-colors duration-200 hover:bg-[var(--brand-primary,#0C2141)] hover:text-white"
                />
              )}
              {fields.TertiaryLink && (fields.TertiaryLink.value?.href || isEditing) && (
                <ContentSdkLink
                  field={fields.TertiaryLink}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary,#0C2141)] bg-transparent px-6 py-3 text-sm font-semibold text-[var(--brand-primary,#0C2141)] transition-colors duration-200 hover:bg-[var(--brand-primary,#0C2141)] hover:text-white"
                >
                  <PhoneIcon />
                </ContentSdkLink>
              )}
            </div>
          </div>

          {/* Right column: organic-clipped image */}
          {(fields.HeroImage?.value?.src || isEditing) && (
            <div
              className="relative aspect-[5/4] w-full overflow-hidden md:aspect-square"
              style={{ borderRadius: '40% 50% 50% 40% / 50% 40% 50% 40%' }}
            >
              <SmartMedia
                field={fields.HeroImage}
                isEditing={isEditing}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Minimal — text-only, generous padding
   ──────────────────────────────────────────── */
export const Minimal = ({ fields, params, page }: HeroBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <HeroBannerDefaultComponent />;

  return (
    <div className={cn('component hero-banner', styles)} id={RenderingIdentifier}>
      <section
        className="w-full py-24 px-4 md:py-32"
        style={{
          backgroundColor: 'var(--brand-bg, #ffffff)',
          color: 'var(--brand-fg, #111111)',
        }}
      >
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          {(fields.Title?.value || isEditing) && (
            <Text
              field={fields.Title}
              tag="h1"
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-[var(--brand-heading-font,inherit)]"
            />
          )}
          {(fields.Subtitle?.value || isEditing) && (
            <ContentSdkRichText
              field={fields.Subtitle}
              className="mx-auto max-w-2xl text-lg opacity-80"
            />
          )}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <PrimaryButton field={fields.PrimaryLink} isEditing={isEditing} />
            <SecondaryButton field={fields.SecondaryLink} isEditing={isEditing} />
          </div>
        </div>
      </section>
    </div>
  );
};
