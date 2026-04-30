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
import { SitecoreNextImage } from '@/lib/sitecore-next-image';
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
          <div className="relative min-h-[280px] overflow-hidden rounded-[var(--brand-card-radius,0.75rem)] md:min-h-[360px]">
            {(fields.FeatureImage?.value?.src || isEditing) && (
              <SitecoreNextImage
                field={fields.FeatureImage}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
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
            <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-[var(--brand-card-radius,0.75rem)]">
              <SitecoreNextImage
                field={fields.FeatureImage}
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
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
          <div className="relative min-h-[280px] overflow-hidden rounded-[var(--brand-card-radius,0.75rem)] md:min-h-[360px]">
            {(fields.FeatureImage?.value?.src || isEditing) && (
              <SitecoreNextImage
                field={fields.FeatureImage}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
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
            <div className="relative h-16 w-16 shrink-0 overflow-hidden">
              <SitecoreNextImage
                field={fields.FeatureImage}
                className="object-contain"
                sizes="64px"
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

/* HowdensAppointment — dark promo strip, image left, checklist body */
export const HowdensAppointment = ({ fields, params, page }: FeatureHighlightProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <FeatureHighlightDefaultComponent />;

  return (
    <div className={cn('component feature-highlight', styles)} id={RenderingIdentifier}>
      <section className="w-full" style={{ backgroundColor: 'var(--brand-header-bg)' }}>
        <div className="mx-auto grid max-w-[1600px] items-stretch md:grid-cols-2">
          <div className="relative min-h-[280px] md:min-h-[360px]">
            {(fields.FeatureImage?.value?.src || isEditing) && (
              <SitecoreNextImage
                field={fields.FeatureImage}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
          <div className="flex flex-col justify-center px-6 py-12 md:px-12 md:py-16" style={{ color: 'var(--brand-header-fg)' }}>
            <Eyebrow field={fields.EyebrowText} isEditing={isEditing} />
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="mt-2 max-w-md text-3xl font-bold uppercase leading-tight tracking-tight md:text-4xl font-[var(--brand-heading-font,inherit)]"
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="mt-6 max-w-lg list-disc pl-5 text-base leading-relaxed opacity-95 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-2 font-[var(--brand-body-font,inherit)]"
              />
            )}
            {(fields.PrimaryLink?.value?.href || isEditing) && (
              <ContentSdkLink
                field={fields.PrimaryLink}
                className="mt-8 inline-flex w-fit items-center justify-center border-2 px-8 py-3 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-90 rounded-[var(--brand-button-radius,0.25rem)]"
                style={{
                  borderColor: 'var(--brand-header-fg)',
                  color: 'var(--brand-header-fg)',
                }}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

/* HowdensQuartz — warm split, kitchen image emphasis */
export const HowdensQuartz = ({ fields, params, page }: FeatureHighlightProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <FeatureHighlightDefaultComponent />;

  return (
    <div className={cn('component feature-highlight', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-12 md:py-16" style={{ backgroundColor: 'var(--brand-muted)' }}>
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-14 md:px-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--brand-card-radius,0.25rem)] shadow-sm">
            {(fields.FeatureImage?.value?.src || isEditing) && (
              <SitecoreNextImage
                field={fields.FeatureImage}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
          <div
            className="rounded-[var(--brand-card-radius,0.25rem)] border px-8 py-10 md:px-10 md:py-12"
            style={{
              backgroundColor: 'var(--brand-bg)',
              borderColor: 'var(--brand-border)',
            }}
          >
            <Eyebrow field={fields.EyebrowText} isEditing={isEditing} />
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="mt-2 text-3xl font-bold uppercase tracking-tight md:text-4xl font-[var(--brand-heading-font,inherit)]"
                style={{ color: 'var(--brand-fg)' }}
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="mt-5 text-base leading-relaxed opacity-80 font-[var(--brand-body-font,inherit)]"
                style={{ color: 'var(--brand-fg)' }}
              />
            )}
            {(fields.PrimaryLink?.value?.href || isEditing) && (
              <ContentSdkLink
                field={fields.PrimaryLink}
                className="mt-8 inline-flex items-center justify-center px-8 py-3 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-90 rounded-[var(--brand-button-radius,0.25rem)]"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'var(--brand-primary-foreground)',
                }}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

/* HowdensBedroom — image + deep text panel */
export const HowdensBedroom = ({ fields, params, page }: FeatureHighlightProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <FeatureHighlightDefaultComponent />;

  return (
    <div className={cn('component feature-highlight', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-12 md:py-16" style={{ backgroundColor: 'var(--brand-bg)' }}>
        <div className="mx-auto grid max-w-7xl items-stretch overflow-hidden rounded-[var(--brand-card-radius,0.25rem)] shadow-md md:grid-cols-2">
          <div className="relative min-h-[280px] w-full">
            {(fields.FeatureImage?.value?.src || isEditing) && (
              <SitecoreNextImage
                field={fields.FeatureImage}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
          <div
            className="flex flex-col justify-center px-8 py-10 md:px-12 md:py-14"
            style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-primary-foreground)' }}
          >
            <Eyebrow field={fields.EyebrowText} isEditing={isEditing} />
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="mt-2 text-3xl font-bold uppercase leading-tight md:text-4xl font-[var(--brand-heading-font,inherit)]"
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="mt-5 max-w-md text-base opacity-90 font-[var(--brand-body-font,inherit)]"
              />
            )}
            {(fields.PrimaryLink?.value?.href || isEditing) && (
              <ContentSdkLink
                field={fields.PrimaryLink}
                className="mt-8 inline-flex w-fit items-center justify-center border-2 px-8 py-3 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-90 rounded-[var(--brand-button-radius,0.25rem)]"
                style={{
                  borderColor: 'var(--brand-primary-foreground)',
                  color: 'var(--brand-primary-foreground)',
                }}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
