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

interface FeatureHighlightFields {
  EyebrowText: Field<string>;
  Title: Field<string>;
  Description: Field<string>;
  FeatureImage: ImageField;
  PrimaryLink: LinkField;
}

type FeatureHighlightProps = ComponentProps & {
  fields: FeatureHighlightFields;
};

const FeatureHighlightDefaultComponent = (): JSX.Element => (
  <div className="component feature-highlight">
    <div className="component-content">
      <span className="is-empty-hint">FeatureHighlight</span>
    </div>
  </div>
);

const Eyebrow = ({ field, isEditing }: { field: Field<string>; isEditing?: boolean }) => {
  if (!field?.value && !isEditing) return null;
  return (
    <Text
      field={field}
      tag="span"
      className="mb-3 inline-block text-xs font-semibold uppercase tracking-wider"
      style={{ color: 'var(--brand-primary)' }}
    />
  );
};

const CtaButton = ({ field, isEditing }: { field: LinkField; isEditing?: boolean }) => {
  if (!field?.value?.href && !isEditing) return null;
  return (
    <ContentSdkLink
      field={field}
      className="mt-6 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 rounded-[var(--brand-button-radius,0.375rem)]"
      style={{
        backgroundColor: 'var(--brand-primary)',
        color: 'var(--brand-primary-foreground)',
      }}
    />
  );
};

/* ────────────────────────────────────────────
   Default — image right, text left (alternates via CSS)
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: FeatureHighlightProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <FeatureHighlightDefaultComponent />;

  return (
    <div className={cn('component feature-highlight', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:px-6 even:[&]:direction-rtl even:[&>*]:direction-ltr">
          <div>
            <Eyebrow field={fields.EyebrowText} isEditing={isEditing} />
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
                className="mt-4 text-base opacity-70 font-[var(--brand-body-font,inherit)]"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            <CtaButton field={fields.PrimaryLink} isEditing={isEditing} />
          </div>
          <div className="overflow-hidden rounded-[var(--brand-card-radius,0.75rem)]">
            {(fields.FeatureImage?.value?.src || isEditing) && (
              <ContentSdkImage
                field={fields.FeatureImage}
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
   Centered — centered text above, image below
   ──────────────────────────────────────────── */
export const Centered = ({ fields, params, page }: FeatureHighlightProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <FeatureHighlightDefaultComponent />;

  return (
    <div className={cn('component feature-highlight', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <Eyebrow field={fields.EyebrowText} isEditing={isEditing} />
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
                className="mx-auto mt-4 max-w-2xl text-base opacity-70 font-[var(--brand-body-font,inherit)]"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            <CtaButton field={fields.PrimaryLink} isEditing={isEditing} />
          </div>
          {(fields.FeatureImage?.value?.src || isEditing) && (
            <div className="mt-10 overflow-hidden rounded-[var(--brand-card-radius,0.75rem)]">
              <ContentSdkImage
                field={fields.FeatureImage}
                className="w-full object-cover"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   WithVideo — same as Default but with play button overlay
   ──────────────────────────────────────────── */
export const WithVideo = ({ fields, params, page }: FeatureHighlightProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <FeatureHighlightDefaultComponent />;

  return (
    <div className={cn('component feature-highlight', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:px-6">
          <div>
            <Eyebrow field={fields.EyebrowText} isEditing={isEditing} />
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
                className="mt-4 text-base opacity-70 font-[var(--brand-body-font,inherit)]"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            <CtaButton field={fields.PrimaryLink} isEditing={isEditing} />
          </div>
          <div className="relative overflow-hidden rounded-[var(--brand-card-radius,0.75rem)]">
            {(fields.FeatureImage?.value?.src || isEditing) && (
              <ContentSdkImage
                field={fields.FeatureImage}
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full opacity-90"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="var(--brand-primary-foreground, #fff)"
                >
                  <polygon points="6,3 20,12 6,21" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   IconLeft — small image left, text right
   ──────────────────────────────────────────── */
export const IconLeft = ({ fields, params, page }: FeatureHighlightProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <FeatureHighlightDefaultComponent />;

  return (
    <div className={cn('component feature-highlight', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto flex max-w-4xl items-start gap-6 md:px-6">
          {(fields.FeatureImage?.value?.src || isEditing) && (
            <div className="h-16 w-16 shrink-0 overflow-hidden">
              <ContentSdkImage
                field={fields.FeatureImage}
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <div className="flex-1">
            <Eyebrow field={fields.EyebrowText} isEditing={isEditing} />
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h3"
                className="text-xl font-bold font-[var(--brand-heading-font,inherit)]"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="mt-2 text-sm opacity-70 font-[var(--brand-body-font,inherit)]"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            {(fields.PrimaryLink?.value?.href || isEditing) && (
              <ContentSdkLink
                field={fields.PrimaryLink}
                className="mt-3 inline-flex text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
                style={{ color: 'var(--brand-primary)' }}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

/* Howdens variant — design appointment band: image left, copy on muted panel */
export const HowdensDesignBand = ({ fields, params, page }: FeatureHighlightProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <FeatureHighlightDefaultComponent />;

  return (
    <div className={cn('component feature-highlight', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-14 md:px-6 md:py-20"
        style={{ backgroundColor: 'var(--brand-muted, #f4f4f4)' }}
      >
        <div className="mx-auto grid max-w-7xl items-stretch gap-0 overflow-hidden rounded-[var(--brand-card-radius,0.75rem)] md:grid-cols-2 md:shadow-sm">
          <div className="relative min-h-[240px] md:min-h-[320px]">
            {(fields.FeatureImage?.value?.src || isEditing) && (
              <ContentSdkImage
                field={fields.FeatureImage}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
          <div
            className="flex flex-col justify-center px-6 py-10 md:px-10 md:py-12"
            style={{ backgroundColor: 'var(--brand-muted, #f4f4f4)' }}
          >
            <Eyebrow field={fields.EyebrowText} isEditing={isEditing} />
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl font-[var(--brand-heading-font,inherit)]"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="mt-4 max-w-xl text-base leading-relaxed opacity-90 font-[var(--brand-body-font,inherit)]"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            <CtaButton field={fields.PrimaryLink} isEditing={isEditing} />
          </div>
        </div>
      </section>
    </div>
  );
};

/* Howdens variant — quartz split: warm panel behind copy */
export const HowdensQuartzSplit = ({ fields, params, page }: FeatureHighlightProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <FeatureHighlightDefaultComponent />;

  return (
    <div className={cn('component feature-highlight', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-14 md:py-20" style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}>
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-14 md:px-6">
          <div className="overflow-hidden rounded-[var(--brand-card-radius,0.75rem)] shadow-sm">
            {(fields.FeatureImage?.value?.src || isEditing) && (
              <ContentSdkImage
                field={fields.FeatureImage}
                className="h-full min-h-[260px] w-full object-cover md:min-h-[320px]"
              />
            )}
          </div>
          <div
            className="rounded-[var(--brand-card-radius,0.75rem)] px-8 py-10 md:px-10 md:py-12"
            style={{
              backgroundColor: 'var(--brand-muted, #f4f4f4)',
              color: 'var(--brand-fg, #111111)',
            }}
          >
            <Eyebrow field={fields.EyebrowText} isEditing={isEditing} />
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl font-[var(--brand-heading-font,inherit)]"
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="mt-4 text-base leading-relaxed opacity-85 font-[var(--brand-body-font,inherit)]"
              />
            )}
            {(fields.PrimaryLink?.value?.href || isEditing) && (
              <div className="mt-6">
                <ContentSdkLink
                  field={fields.PrimaryLink}
                  className="inline-flex items-center justify-center rounded-[var(--brand-button-radius,0.375rem)] border-2 px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{
                    borderColor: 'var(--brand-fg, #111111)',
                    color: 'var(--brand-fg, #111111)',
                    backgroundColor: 'var(--brand-bg, #ffffff)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

/* Howdens variant — bedroom inspiration: dark copy panel */
export const HowdensBedroomSplit = ({ fields, params, page }: FeatureHighlightProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <FeatureHighlightDefaultComponent />;

  return (
    <div className={cn('component feature-highlight', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-14 md:py-20" style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}>
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-0 md:px-6">
          <div className="overflow-hidden md:rounded-l-[var(--brand-card-radius,0.75rem)]">
            {(fields.FeatureImage?.value?.src || isEditing) && (
              <ContentSdkImage
                field={fields.FeatureImage}
                className="h-full min-h-[260px] w-full object-cover md:min-h-[340px]"
              />
            )}
          </div>
          <div
            className="flex flex-col justify-center px-8 py-10 md:rounded-r-[var(--brand-card-radius,0.75rem)] md:px-12 md:py-14"
            style={{
              backgroundColor: 'var(--brand-dark, #1b1f22)',
              color: 'var(--brand-dark-foreground, #ffffff)',
            }}
          >
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
                className="mt-4 text-base leading-relaxed opacity-90 font-[var(--brand-body-font,inherit)]"
              />
            )}
            {(fields.PrimaryLink?.value?.href || isEditing) && (
              <div className="mt-6">
                <ContentSdkLink
                  field={fields.PrimaryLink}
                  className="inline-flex items-center justify-center rounded-[var(--brand-button-radius,0.375rem)] px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--brand-bg, #ffffff)',
                    color: 'var(--brand-dark, #1b1f22)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
