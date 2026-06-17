import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  Text,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface LandingHeroRouteFields {
  heroEyebrow?: Field<string>;
  heroHeadline?: Field<string>;
  heroSubhead?: Field<string>;
  heroPrimaryCta?: LinkField;
  heroSecondaryCta?: LinkField;
  heroImage?: ImageField;
  heroVideo?: LinkField;
}

const LandingHeroDefaultComponent = (): JSX.Element => (
  <div className="component landing-hero">
    <div className="component-content">
      <span className="is-empty-hint">LandingHero</span>
    </div>
  </div>
);

function getRouteFields(page: ComponentProps['page']): LandingHeroRouteFields | null {
  const fields = page?.layout?.sitecore?.route?.fields;
  return fields ? (fields as unknown as LandingHeroRouteFields) : null;
}

function HeroMedia({
  image,
  video,
  isEditing,
  className,
}: {
  image?: ImageField;
  video?: LinkField;
  isEditing?: boolean;
  className?: string;
}) {
  const videoHref = video?.value?.href;
  if (videoHref) {
    return (
      <video
        className={cn('h-full w-full object-cover', className)}
        src={videoHref}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }
  if (image?.value?.src || isEditing) {
    return (
      <ContentSdkImage
        field={image}
        className={cn('h-full w-full object-cover', className)}
      />
    );
  }
  return null;
}

function CtaPair({
  primary,
  secondary,
  isEditing,
  variant,
}: {
  primary?: LinkField;
  secondary?: LinkField;
  isEditing?: boolean;
  variant: 'default' | 'minimal' | 'split';
}) {
  const showPrimary = primary?.value?.href || isEditing;
  const showSecondary = secondary?.value?.href || isEditing;
  if (!showPrimary && !showSecondary) return null;

  const primaryClasses =
    variant === 'default'
      ? 'inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-base font-semibold text-gray-900 transition hover:bg-gray-100'
      : 'inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-gray-800';

  const secondaryClasses =
    variant === 'default'
      ? 'inline-flex items-center justify-center rounded-md border border-white/40 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10'
      : 'inline-flex items-center justify-center rounded-md border border-gray-300 px-6 py-3 text-base font-semibold text-gray-900 transition hover:bg-gray-50';

  return (
    <div className="mt-8 flex flex-wrap items-center gap-4" data-testid="hero-ctas">
      {showPrimary && primary && (
        <ContentSdkLink field={primary} className={primaryClasses} data-testid="hero-primary-cta" />
      )}
      {showSecondary && secondary && (
        <ContentSdkLink
          field={secondary}
          className={secondaryClasses}
          data-testid="hero-secondary-cta"
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Sage — dark, near-black hero with green-glow accent and pill CTAs
   ──────────────────────────────────────────── */
export const Sage = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);
  if (!routeFields) return <LandingHeroDefaultComponent />;

  const {
    heroEyebrow,
    heroHeadline,
    heroSubhead,
    heroPrimaryCta,
    heroSecondaryCta,
    heroImage,
    heroVideo,
  } = routeFields;

  const hasMedia = heroVideo?.value?.href || heroImage?.value?.src || isEditing;
  const showPrimary = heroPrimaryCta?.value?.href || isEditing;
  const showSecondary = heroSecondaryCta?.value?.href || isEditing;

  return (
    <div className={cn('component landing-hero', styles)} id={RenderingIdentifier}>
      <section
        className="relative overflow-hidden px-4 py-20 md:py-28"
        style={{
          backgroundColor: 'var(--brand-header-bg)',
          color: 'var(--brand-fg)',
          fontFamily: 'var(--brand-body-font, inherit)',
        }}
        data-testid="landing-hero"
      >
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl [background:radial-gradient(circle,var(--brand-primary),transparent_70%)]"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          {(heroEyebrow?.value || isEditing) && (
            <Text
              field={heroEyebrow}
              tag="span"
              className="mb-6 inline-block rounded-full border border-white/20 px-3 py-1 text-xs font-medium uppercase tracking-wider"
              data-testid="hero-eyebrow"
            />
          )}
          {(heroHeadline?.value || isEditing) && (
            <Text
              field={heroHeadline}
              tag="h1"
              className="text-4xl font-[900] leading-tight sm:text-5xl md:text-6xl font-[var(--brand-heading-font,inherit)]"
              data-testid="hero-headline"
            />
          )}
          {(heroSubhead?.value || isEditing) && (
            <Text
              field={heroSubhead}
              tag="p"
              className="mt-6 max-w-2xl text-lg opacity-80 md:text-xl"
              data-testid="hero-subhead"
            />
          )}
          {(showPrimary || showSecondary) && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4" data-testid="hero-ctas">
              {showPrimary && heroPrimaryCta && (
                <ContentSdkLink
                  field={heroPrimaryCta}
                  className="inline-flex items-center justify-center rounded-[var(--brand-button-radius,9999px)] px-6 py-3 text-base font-semibold transition hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--brand-primary)',
                    color: 'var(--brand-primary-foreground)',
                  }}
                  data-testid="hero-primary-cta"
                />
              )}
              {showSecondary && heroSecondaryCta && (
                <ContentSdkLink
                  field={heroSecondaryCta}
                  className="inline-flex items-center justify-center rounded-full border border-current bg-transparent px-6 py-3 text-base font-semibold transition hover:opacity-80"
                  data-testid="hero-secondary-cta"
                />
              )}
            </div>
          )}
          {hasMedia && (
            <div
              className="relative mt-12 aspect-[16/9] w-full max-w-3xl overflow-hidden rounded-[var(--brand-card-radius,0.75rem)]"
              style={{ backgroundColor: 'var(--brand-muted)' }}
              data-testid="hero-media"
            >
              <HeroMedia image={heroImage} video={heroVideo} isEditing={isEditing} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Default — delegates to the Sage look-and-feel
   ──────────────────────────────────────────── */
export const Default = (props: ComponentProps): JSX.Element => <Sage {...props} />;

/* ────────────────────────────────────────────
   SplitImage — two-column: text left, hero media right
   ──────────────────────────────────────────── */
export const SplitImage = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);
  if (!routeFields) return <LandingHeroDefaultComponent />;

  const {
    heroEyebrow,
    heroHeadline,
    heroSubhead,
    heroPrimaryCta,
    heroSecondaryCta,
    heroImage,
    heroVideo,
  } = routeFields;

  const hasMedia = heroVideo?.value?.href || heroImage?.value?.src || isEditing;

  return (
    <div className={cn('component landing-hero', styles)} id={RenderingIdentifier}>
      <section className="bg-white" data-testid="landing-hero">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            {(heroEyebrow?.value || isEditing) && (
              <Text
                field={heroEyebrow}
                tag="p"
                className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-600"
                data-testid="hero-eyebrow"
              />
            )}
            {(heroHeadline?.value || isEditing) && (
              <Text
                field={heroHeadline}
                tag="h1"
                className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl"
                data-testid="hero-headline"
              />
            )}
            {(heroSubhead?.value || isEditing) && (
              <Text
                field={heroSubhead}
                tag="p"
                className="mt-6 text-lg text-gray-600"
                data-testid="hero-subhead"
              />
            )}
            <CtaPair
              primary={heroPrimaryCta}
              secondary={heroSecondaryCta}
              isEditing={isEditing}
              variant="split"
            />
          </div>
          {hasMedia && (
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100"
              data-testid="hero-media"
            >
              <HeroMedia image={heroImage} video={heroVideo} isEditing={isEditing} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Minimal — text-only, no media (retargeting visitor)
   ──────────────────────────────────────────── */
export const Minimal = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);
  if (!routeFields) return <LandingHeroDefaultComponent />;

  const { heroEyebrow, heroHeadline, heroSubhead, heroPrimaryCta, heroSecondaryCta } = routeFields;

  return (
    <div className={cn('component landing-hero', styles)} id={RenderingIdentifier}>
      <section className="bg-white" data-testid="landing-hero">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
          {(heroEyebrow?.value || isEditing) && (
            <Text
              field={heroEyebrow}
              tag="p"
              className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-600"
              data-testid="hero-eyebrow"
            />
          )}
          {(heroHeadline?.value || isEditing) && (
            <Text
              field={heroHeadline}
              tag="h1"
              className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl"
              data-testid="hero-headline"
            />
          )}
          {(heroSubhead?.value || isEditing) && (
            <Text
              field={heroSubhead}
              tag="p"
              className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 md:text-xl"
              data-testid="hero-subhead"
            />
          )}
          <div className="flex justify-center">
            <CtaPair
              primary={heroPrimaryCta}
              secondary={heroSecondaryCta}
              isEditing={isEditing}
              variant="minimal"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
