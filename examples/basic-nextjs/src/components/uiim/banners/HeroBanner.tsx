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
  // Optional Copenhagen Silver fields (gracefully ignored when not present)
  EyebrowText?: Field<string>;
  Description?: Field<string>;
  WatermarkText?: Field<string>;
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

// Copenhagen Silver pill-button — used by Default and SilverCelebrationCenter only.
const PillPrimaryButton = ({
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
      className="inline-flex items-center justify-center px-8 py-3 text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-90"
      style={{
        backgroundColor: 'var(--brand-primary)',
        color: 'var(--brand-primary-foreground)',
        borderRadius: 'var(--brand-button-radius)',
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
/* ────────────────────────────────────────────
   Default — Copenhagen Silver CenteredHuge
   88px centered headline, eyebrow line, lead paragraph.
   Auto-routes to SilverCelebrationCenter when WatermarkText is set.
   ──────────────────────────────────────────── */
export const Default = (props: HeroBannerProps): JSX.Element => {
  // Auto-route: if datasource has WatermarkText, render the silver-chrome variant
  if (props.fields?.WatermarkText?.value) {
    return <SilverCelebrationCenter {...props} />;
  }
  const { fields, params, page } = props;
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <HeroBannerDefaultComponent />;

  return (
    <div className={cn('component hero-banner', styles)} id={RenderingIdentifier}>
      <section className="relative w-full px-4 pt-16 md:pt-24 pb-12 md:pb-16 text-center overflow-hidden">
        <div className="mx-auto max-w-5xl">
          {(fields.EyebrowText?.value || isEditing) && fields.EyebrowText && (
            <Text
              field={fields.EyebrowText}
              tag="p"
              className="text-sm md:text-base opacity-70"
              style={{ color: 'var(--brand-muted-foreground)' }}
            />
          )}
          {(fields.Title?.value || isEditing) && (
            <Text
              field={fields.Title}
              tag="h1"
              className="mt-6 text-6xl md:text-8xl font-bold"
              style={{
                color: 'var(--brand-fg)',
                fontFamily: 'var(--brand-heading-font)',
                letterSpacing: '-0.04em',
                lineHeight: '1.05',
              }}
            />
          )}
          {(fields.Subtitle?.value || isEditing) && (
            <ContentSdkRichText
              field={fields.Subtitle}
              className="mt-4 text-2xl md:text-3xl font-medium [&_p]:m-0"
              style={{ color: 'var(--brand-fg)' }}
            />
          )}
          {(fields.Description?.value || isEditing) && fields.Description && (
            <ContentSdkRichText
              field={fields.Description}
              className="mx-auto mt-6 max-w-2xl text-base md:text-lg [&_p]:m-0"
              style={{ color: 'var(--brand-muted-foreground)' }}
            />
          )}
          {(fields.PrimaryLink?.value?.href || fields.SecondaryLink?.value?.href || isEditing) && (
            <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
              <PillPrimaryButton field={fields.PrimaryLink} isEditing={isEditing} />
              <SecondaryButton field={fields.SecondaryLink} isEditing={isEditing} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Silver chrome Sitecore logo — SVG with metallic
   radial gradient + the signature "C" notch ring.
   ──────────────────────────────────────────── */
const SilverSitecoreLogo = () => (
  <div className="flex flex-col items-center">
    <svg width="96" height="96" viewBox="0 0 100 100" aria-hidden>
      <defs>
        <radialGradient id="silverChrome" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#e5e7eb" />
          <stop offset="60%" stopColor="#9ca3af" />
          <stop offset="80%" stopColor="#6b7280" />
          <stop offset="100%" stopColor="#374151" />
        </radialGradient>
        <radialGradient id="silverInner" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </radialGradient>
        <linearGradient id="silverHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* outer ring */}
      <circle cx="50" cy="50" r="46" fill="url(#silverChrome)" />
      {/* inner dark */}
      <circle cx="50" cy="50" r="38" fill="url(#silverInner)" />
      {/* the C ring with notch on right side */}
      <path
        d="M 50 22 A 28 28 0 1 1 65 71 L 65 60 A 17 17 0 1 0 50 33 Z"
        fill="url(#silverChrome)"
      />
      {/* top highlight gloss */}
      <ellipse cx="50" cy="30" rx="28" ry="8" fill="url(#silverHighlight)" opacity="0.4" />
    </svg>
    <div className="mt-3 flex items-baseline gap-0.5">
      <span
        className="text-base font-bold tracking-[0.15em]"
        style={{
          color: '#d4d4d8',
          textShadow: '0 1px 0 rgba(0,0,0,0.4)',
        }}
      >
        SITECORE
      </span>
      <span style={{ color: '#a3a3a3', fontSize: '0.6em' }}>®</span>
    </div>
  </div>
);

/* ────────────────────────────────────────────
   SilverCelebrationCenter — Event page hero
   Stroke-only "25" watermark, silver chrome logo,
   silver-gradient SILVER CELEBRATION title,
   outlined REGISTER NOW button (not red pill).
   ──────────────────────────────────────────── */
export const SilverCelebrationCenter = ({ fields, params, page }: HeroBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <HeroBannerDefaultComponent />;
  const watermark = fields.WatermarkText?.value || '25';

  return (
    <div className={cn('component hero-banner', styles)} id={RenderingIdentifier}>
      <section className="relative w-full px-4 py-24 md:py-32 text-center overflow-hidden">
        {/* Giant stroke-only "25" watermark behind everything */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ lineHeight: 1 }}
        >
          <span
            style={{
              fontSize: 'clamp(28rem, 60vw, 52rem)',
              fontWeight: 100,
              letterSpacing: '-0.05em',
              fontFamily: 'var(--brand-heading-font)',
              color: 'transparent',
              WebkitTextStroke: '1px rgba(255,255,255,0.05)',
              lineHeight: 1,
            }}
          >
            {watermark}
          </span>
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Silver chrome Sitecore logo */}
          <SilverSitecoreLogo />

          {/* Thin divider under logo */}
          <div
            className="mx-auto mt-6 mb-8"
            style={{
              width: '80px',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
            }}
            aria-hidden
          />

          {(fields.EyebrowText?.value || isEditing) && fields.EyebrowText && (
            <Text
              field={fields.EyebrowText}
              tag="p"
              className="text-xs md:text-sm font-light tracking-[0.5em] uppercase"
              style={{ color: '#a3a3a3' }}
            />
          )}

          {(fields.Title?.value || isEditing) && (
            <Text
              field={fields.Title}
              tag="h1"
              className="mt-6 text-4xl md:text-6xl font-light"
              style={{
                fontFamily: 'var(--brand-heading-font)',
                letterSpacing: '0.18em',
                background:
                  'linear-gradient(180deg, #f5f5f5 0%, #d4d4d8 40%, #a3a3a3 80%, #6b7280 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            />
          )}

          {(fields.Subtitle?.value || isEditing) && (
            <ContentSdkRichText
              field={fields.Subtitle}
              className="mt-6 text-xs md:text-sm font-light tracking-[0.35em] uppercase [&_p]:m-0"
              style={{ color: '#a3a3a3' }}
            />
          )}

          {(fields.PrimaryLink?.value?.href || isEditing) && (
            <div className="mt-12">
              <ContentSdkLink
                field={fields.PrimaryLink}
                className="inline-flex items-center justify-center px-10 py-3.5 text-xs font-light tracking-[0.4em] uppercase transition-all hover:bg-white/5"
                style={{
                  color: '#d4d4d8',
                  border: '1px solid rgba(255,255,255,0.25)',
                  backgroundColor: 'transparent',
                  borderRadius: '2px',
                }}
              />
            </div>
          )}
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
