import React, { JSX } from 'react';
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
          <div className="overflow-hidden rounded-[var(--brand-card-radius,0.75rem)]">
            {(fields.HeroImage?.value?.src || isEditing) && (
              <ContentSdkImage
                field={fields.HeroImage}
                className="h-full w-full object-cover"
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
            <ContentSdkImage
              field={fields.HeroImage}
              className="h-full w-full object-cover"
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
            <ContentSdkImage
              field={fields.HeroImage}
              className="h-full w-full object-cover"
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
            <ContentSdkImage
              field={fields.HeroImage}
              className="h-full w-full object-cover"
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
                  className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--brand-accent, #BE552E)',
                    color: '#ffffff',
                  }}
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
