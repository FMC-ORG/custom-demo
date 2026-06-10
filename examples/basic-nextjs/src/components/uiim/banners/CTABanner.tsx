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

interface CTABannerFields {
  Title: Field<string>;
  Description: Field<string>;
  PrimaryLink: LinkField;
  SecondaryLink: LinkField;
  BackgroundImage: ImageField;
}

type CTABannerProps = ComponentProps & {
  fields: CTABannerFields;
};

const CTABannerDefaultComponent = (): JSX.Element => (
  <div className="component cta-banner">
    <div className="component-content">
      <span className="is-empty-hint">CTABanner</span>
    </div>
  </div>
);

const PrimaryButton = ({ field, isEditing, className }: { field: LinkField; isEditing?: boolean; className?: string }) => {
  if (!field?.value?.href && !isEditing) return null;
  return (
    <ContentSdkLink
      field={field}
      className={cn(
        'inline-flex items-center justify-center px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 rounded-[var(--brand-button-radius,0.375rem)]',
        className
      )}
    />
  );
};

const SecondaryButton = ({ field, isEditing }: { field: LinkField; isEditing?: boolean }) => {
  if (!field?.value?.href && !isEditing) return null;
  return (
    <ContentSdkLink
      field={field}
      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold border border-current bg-transparent transition-opacity hover:opacity-70 rounded-[var(--brand-button-radius,0.375rem)]"
    />
  );
};

/* ────────────────────────────────────────────
   Default — Copenhagen Silver DarkIllustration
   Dark card with line-art illustration top, title +
   pill CTA at bottom (Tivoli card style).
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: CTABannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <CTABannerDefaultComponent />;

  // If there's no title/description, this is a "PillOnly" use case — render
  // a standalone centered CTA (Event/Gallery pages do this).
  const isPillOnly = !fields.Title?.value && !fields.Description?.value && !isEditing;
  if (isPillOnly) {
    return (
      <div className={cn('component cta-banner', styles)} id={RenderingIdentifier}>
        <section className="w-full px-4 py-10 text-center">
          {(fields.PrimaryLink?.value?.href || isEditing) && (
            <ContentSdkLink
              field={fields.PrimaryLink}
              className="inline-flex items-center justify-center px-10 py-3 text-sm font-bold tracking-[0.25em] uppercase transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: 'var(--brand-primary-foreground)',
                borderRadius: 'var(--brand-button-radius)',
              }}
            />
          )}
        </section>
      </div>
    );
  }

  return (
    <div className={cn('component cta-banner', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-8">
        <div
          className="mx-auto max-w-3xl overflow-hidden"
          style={{
            backgroundColor: 'var(--brand-muted)',
            border: '1px solid var(--brand-border)',
            borderRadius: 'var(--brand-card-radius)',
            boxShadow: 'var(--brand-card-shadow)',
          }}
        >
          {/* Illustration area */}
          <div
            className="relative h-32 md:h-44 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
            aria-hidden
          >
            {(fields.BackgroundImage?.value?.src || isEditing) && fields.BackgroundImage?.value?.src ? (
              <SmartMedia
                field={fields.BackgroundImage}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover opacity-60"
              />
            ) : (
              <TivoliSilhouette />
            )}
          </div>

          {/* Footer with title + CTA */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--brand-fg)' }}>
              <span style={{ color: 'var(--brand-primary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              {(fields.Title?.value || isEditing) && (
                <Text field={fields.Title} tag="span" className="font-medium" />
              )}
            </div>

            {(fields.PrimaryLink?.value?.href || isEditing) && (
              <ContentSdkLink
                field={fields.PrimaryLink}
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'var(--brand-primary-foreground)',
                  borderRadius: 'var(--brand-button-radius)',
                }}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const TivoliSilhouette = () => (
  <svg
    viewBox="0 0 600 180"
    width="80%"
    height="100%"
    preserveAspectRatio="xMidYMax meet"
    style={{ color: 'rgba(255,255,255,0.18)' }}
  >
    {/* Tivoli concert hall line art */}
    <g stroke="currentColor" fill="none" strokeWidth="1.2" strokeLinejoin="round">
      <path d="M50 170 L50 110 L80 110 L80 90 L100 90 L100 110 L130 110 L130 80 L160 80 L160 50 L180 30 L200 50 L200 80 L230 80 L230 110 L260 110 L260 90 L280 90 L280 110 L320 110 L320 90 L340 90 L340 110 L370 110 L370 80 L400 80 L400 50 L420 30 L440 50 L440 80 L470 80 L470 110 L500 110 L500 90 L520 90 L520 110 L550 110 L550 170 Z" />
      <path d="M178 30 L182 18 L186 30" />
      <path d="M418 30 L422 18 L426 30" />
      <line x1="120" y1="135" x2="125" y2="135" />
      <line x1="135" y1="135" x2="140" y2="135" />
      <line x1="170" y1="135" x2="175" y2="135" />
      <line x1="200" y1="135" x2="205" y2="135" />
      <line x1="240" y1="135" x2="245" y2="135" />
      <line x1="350" y1="135" x2="355" y2="135" />
      <line x1="380" y1="135" x2="385" y2="135" />
      <line x1="420" y1="135" x2="425" y2="135" />
      <line x1="460" y1="135" x2="465" y2="135" />
      <line x1="500" y1="135" x2="505" y2="135" />
    </g>
  </svg>
);

/* ────────────────────────────────────────────
   PillOnly — standalone red pill, no surrounding card.
   Use when no Title/Description but you want explicit name.
   ──────────────────────────────────────────── */
export const PillOnly = ({ fields, params, page }: CTABannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <CTABannerDefaultComponent />;
  return (
    <div className={cn('component cta-banner', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-10 text-center">
        {(fields.PrimaryLink?.value?.href || isEditing) && (
          <ContentSdkLink
            field={fields.PrimaryLink}
            className="inline-flex items-center justify-center px-10 py-3 text-sm font-bold tracking-[0.25em] uppercase transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--brand-primary-foreground)',
              borderRadius: 'var(--brand-button-radius)',
            }}
          />
        )}
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   WithImage — full-bleed background with overlay
   ──────────────────────────────────────────── */
export const WithImage = ({ fields, params, page }: CTABannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <CTABannerDefaultComponent />;

  return (
    <div className={cn('component cta-banner', styles)} id={RenderingIdentifier}>
      <section className="relative w-full overflow-hidden">
        {(fields.BackgroundImage?.value?.src || isEditing) && (
          <div className="absolute inset-0">
            <SmartMedia
              field={fields.BackgroundImage}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 px-4 py-16 md:py-24 text-white">
          <div className="mx-auto max-w-3xl text-center">
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="text-3xl font-bold tracking-tight sm:text-4xl font-[var(--brand-heading-font,inherit)]"
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="mt-4 text-lg opacity-90 font-[var(--brand-body-font,inherit)]"
              />
            )}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <PrimaryButton
                field={fields.PrimaryLink}
                isEditing={isEditing}
                className="bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)]"
              />
              <SecondaryButton field={fields.SecondaryLink} isEditing={isEditing} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Split — text left, buttons right
   ──────────────────────────────────────────── */
export const Split = ({ fields, params, page }: CTABannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <CTABannerDefaultComponent />;

  return (
    <div className={cn('component cta-banner', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-20"
        style={{ backgroundColor: 'var(--brand-muted, #f5f5f5)' }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2 md:px-6">
          <div>
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="text-3xl font-bold tracking-tight sm:text-4xl font-[var(--brand-heading-font,inherit)]"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="mt-4 text-base font-[var(--brand-body-font,inherit)]"
                style={{ color: 'var(--brand-muted-foreground, #6b7280)' }}
              />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 md:justify-end">
            <PrimaryButton
              field={fields.PrimaryLink}
              isEditing={isEditing}
              className="bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)]"
            />
            <SecondaryButton field={fields.SecondaryLink} isEditing={isEditing} />
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Minimal — subtle background, inline text + link
   ──────────────────────────────────────────── */
export const Minimal = ({ fields, params, page }: CTABannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <CTABannerDefaultComponent />;

  return (
    <div className={cn('component cta-banner', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-10"
        style={{ backgroundColor: 'var(--brand-muted, #f5f5f5)' }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 sm:flex-row sm:justify-between sm:px-6">
          <div className="flex-1">
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="p"
                className="text-lg font-semibold font-[var(--brand-heading-font,inherit)]"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="mt-1 text-sm font-[var(--brand-body-font,inherit)]"
                style={{ color: 'var(--brand-muted-foreground, #6b7280)' }}
              />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <PrimaryButton
              field={fields.PrimaryLink}
              isEditing={isEditing}
              className="bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)]"
            />
            {(fields.SecondaryLink?.value?.href || isEditing) && (
              <ContentSdkLink
                field={fields.SecondaryLink}
                className="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
                style={{ color: 'var(--brand-primary)' }}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
