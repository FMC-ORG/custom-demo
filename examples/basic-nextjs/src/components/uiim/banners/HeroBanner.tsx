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

/* ────────────────────────────────────────────
   Worley — pixel-perfect demo variant (worley.com homepage)
   Full-bleed media, left-weighted headline + lime pill, Subtitle rich text
   rendered as a translucent stat / quote panel on the right:
     p1 = eyebrow, p2 <strong> = big stat, p3 = stat label,
     <blockquote> = quote, <em> source, <strong> attribution.
   ──────────────────────────────────────────── */
export const Worley = ({ fields, params, page }: HeroBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <HeroBannerDefaultComponent />;

  return (
    <div className={cn('component hero-banner', styles)} id={RenderingIdentifier}>
      <section className="relative flex min-h-[560px] w-full overflow-hidden md:min-h-[700px]">
        {(fields.HeroImage?.value?.src || isEditing) && (
          <div className="absolute inset-0">
            <SmartMedia field={fields.HeroImage} fill priority sizes="100vw" className="object-cover" />
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, color-mix(in srgb, var(--brand-dark) 70%, transparent) 0%, color-mix(in srgb, var(--brand-dark) 30%, transparent) 55%, color-mix(in srgb, var(--brand-dark) 10%, transparent) 100%)',
          }}
        />
        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-10 px-6 py-16 md:grid-cols-[1fr_400px] md:px-10 lg:grid-cols-[1fr_420px] lg:gap-20 lg:pr-[220px]">
          <div className="space-y-10 text-white">
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h1"
                className="max-w-[560px] text-5xl font-bold leading-[1.05] tracking-tight md:text-[72px]"
                style={{ fontFamily: 'var(--brand-heading-font)' }}
              />
            )}
            <div className="flex flex-wrap gap-4">
              {(fields.PrimaryLink?.value?.href || isEditing) && (
                <ContentSdkLink
                  field={fields.PrimaryLink}
                  className="inline-flex items-center justify-center rounded-[var(--brand-button-radius)] px-14 py-3 text-base font-semibold transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--brand-primary)',
                    color: 'var(--brand-primary-foreground)',
                    fontFamily: 'var(--brand-body-font)',
                  }}
                />
              )}
              {(fields.SecondaryLink?.value?.href || isEditing) && (
                <ContentSdkLink
                  field={fields.SecondaryLink}
                  className="inline-flex items-center justify-center rounded-[var(--brand-button-radius)] border-2 border-white px-14 py-3 text-base font-semibold text-white transition-opacity hover:opacity-80"
                />
              )}
            </div>
          </div>

          {(fields.Subtitle?.value || isEditing) && (
            <div
              className="rounded-[10px] p-6 text-white backdrop-blur-sm"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--brand-dark) 85%, transparent)',
                fontFamily: 'var(--brand-body-font)',
              }}
            >
              <ContentSdkRichText
                field={fields.Subtitle}
                className={cn(
                  'text-base leading-relaxed',
                  // eyebrow
                  '[&>p:first-child]:mb-3 [&>p:first-child]:text-[13px] [&>p:first-child]:font-bold [&>p:first-child]:uppercase [&>p:first-child]:tracking-[0.12em] [&>p:first-child]:text-[var(--brand-highlight-light)]',
                  // big stat
                  '[&>p:nth-child(2)]:mb-2 [&>p:nth-child(2)]:text-[56px] [&>p:nth-child(2)]:font-bold [&>p:nth-child(2)]:leading-none [&>p:nth-child(2)]:text-[var(--brand-accent)]',
                  '[&>p_strong]:text-[var(--brand-accent)]',
                  // quote block
                  '[&_blockquote]:relative [&_blockquote]:mt-5 [&_blockquote]:border-t [&_blockquote]:border-white/25 [&_blockquote]:pt-9 [&_blockquote]:pb-8',
                  "[&_blockquote]:before:absolute [&_blockquote]:before:left-0 [&_blockquote]:before:top-3 [&_blockquote]:before:text-4xl [&_blockquote]:before:font-bold [&_blockquote]:before:leading-none [&_blockquote]:before:text-[var(--brand-accent)] [&_blockquote]:before:content-['❝']",
                  "[&_blockquote]:after:absolute [&_blockquote]:after:bottom-6 [&_blockquote]:after:right-0 [&_blockquote]:after:text-4xl [&_blockquote]:after:font-bold [&_blockquote]:after:leading-none [&_blockquote]:after:text-[var(--brand-accent)] [&_blockquote]:after:content-['❞']",
                  '[&_blockquote_p]:mb-3 [&_blockquote_em]:text-xs [&_blockquote_strong]:!text-white [&_blockquote_strong]:text-sm [&_blockquote_strong]:font-bold [&_blockquote>p:last-child]:mb-0 [&_blockquote>p:last-child]:mt-6'
                )}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
