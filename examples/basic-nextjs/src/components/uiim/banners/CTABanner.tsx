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
   Default — centered, --brand-primary background
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: CTABannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <CTABannerDefaultComponent />;

  return (
    <div className={cn('component cta-banner', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{
          backgroundColor: 'var(--brand-primary)',
          color: 'var(--brand-primary-foreground)',
        }}
      >
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
              className="bg-[var(--brand-primary-foreground)] text-[var(--brand-primary)]"
            />
            <SecondaryButton field={fields.SecondaryLink} isEditing={isEditing} />
          </div>
        </div>
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
            <SitecoreNextImage
              field={fields.BackgroundImage}
              className="object-cover"
              sizes="100vw"
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

/* Howdens — brochure strip: product visual + dark copy column */
export const Howdens = ({ fields, params, page }: CTABannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <CTABannerDefaultComponent />;

  return (
    <div className={cn('component cta-banner', styles)} id={RenderingIdentifier}>
      <section className="relative w-full overflow-hidden md:min-h-[320px]">
        <div className="grid md:grid-cols-12">
          <div className="relative min-h-[220px] md:col-span-5">
            {(fields.BackgroundImage?.value?.src || isEditing) && (
              <SitecoreNextImage
                field={fields.BackgroundImage}
                className="object-cover object-left"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            )}
          </div>
          <div
            className="flex flex-col justify-center px-6 py-12 md:col-span-7 md:px-14 md:py-16"
            style={{ backgroundColor: 'var(--brand-header-bg)', color: 'var(--brand-header-fg)' }}
          >
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="max-w-xl text-3xl font-bold uppercase leading-tight tracking-tight md:text-4xl font-[var(--brand-heading-font,inherit)]"
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="mt-4 max-w-lg text-base opacity-85 font-[var(--brand-body-font,inherit)]"
              />
            )}
            <div className="mt-8 flex flex-wrap gap-4">
              {(fields.PrimaryLink?.value?.href || isEditing) && (
                <ContentSdkLink
                  field={fields.PrimaryLink}
                  className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-90 rounded-[var(--brand-button-radius,0.25rem)]"
                  style={{
                    backgroundColor: 'var(--brand-accent)',
                    color: 'var(--brand-accent-foreground)',
                  }}
                />
              )}
              <SecondaryButton field={fields.SecondaryLink} isEditing={isEditing} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
