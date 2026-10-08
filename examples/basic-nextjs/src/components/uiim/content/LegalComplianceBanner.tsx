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
import { ArrowRight } from 'lucide-react';

interface LegalComplianceBannerFields {
  Title: Field<string>;
  Description: Field<string>;
  BannerImage: ImageField;
  PrimaryLink: LinkField;
}

type LegalComplianceBannerProps = ComponentProps & {
  fields: LegalComplianceBannerFields;
};

const LegalComplianceBannerDefaultComponent = (): JSX.Element => (
  <div className="component legal-compliance-banner">
    <div className="component-content">
      <span className="is-empty-hint">LegalComplianceBanner</span>
    </div>
  </div>
);

/* ────────────────────────────────────────────
   Default — centered text on muted background
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: LegalComplianceBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <LegalComplianceBannerDefaultComponent />;

  return (
    <div className={cn('component legal-compliance-banner', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16"
        style={{ backgroundColor: 'var(--brand-muted, #f5f5f5)' }}
      >
        <div className="mx-auto max-w-3xl text-center">
          {(fields.Title?.value || isEditing) && (
            <Text
              field={fields.Title}
              tag="h2"
              className="text-2xl font-bold font-[var(--brand-heading-font,inherit)]"
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
          {(fields.PrimaryLink?.value?.href || isEditing) && (
            <div className="mt-6">
              <ContentSdkLink
                field={fields.PrimaryLink}
                className="text-sm font-semibold underline underline-offset-4 transition-opacity hover:opacity-70 font-[var(--brand-body-font,inherit)]"
                style={{ color: 'var(--brand-primary)' }}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   WithImage — text left, badge/seal image right
   ──────────────────────────────────────────── */
export const WithImage = ({ fields, params, page }: LegalComplianceBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <LegalComplianceBannerDefaultComponent />;

  return (
    <div className={cn('component legal-compliance-banner', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16"
        style={{ backgroundColor: 'var(--brand-muted, #f5f5f5)' }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2 md:px-6">
          <div>
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="text-2xl font-bold font-[var(--brand-heading-font,inherit)]"
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
            {(fields.PrimaryLink?.value?.href || isEditing) && (
              <div className="mt-6">
                <ContentSdkLink
                  field={fields.PrimaryLink}
                  className="text-sm font-semibold underline underline-offset-4 transition-opacity hover:opacity-70 font-[var(--brand-body-font,inherit)]"
                  style={{ color: 'var(--brand-primary)' }}
                />
              </div>
            )}
          </div>
          <div className="flex items-center justify-center">
            {(fields.BannerImage?.value?.src || isEditing) && (
              <ContentSdkImage
                field={fields.BannerImage}
                className="max-h-64 w-auto object-contain"
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Biffa variant — BannerImage as full-bleed background with a
   left dark gradient, white text block left, red pill CTA
   ──────────────────────────────────────────── */
export const Biffa = ({ fields, params, page }: LegalComplianceBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <LegalComplianceBannerDefaultComponent />;

  return (
    <div className={cn('component legal-compliance-banner', styles)} id={RenderingIdentifier}>
      <section
        className="relative flex min-h-[560px] w-full items-center overflow-hidden md:min-h-[650px]"
        style={{ backgroundColor: 'var(--brand-muted, #f5f5f5)' }}
      >
        {(fields.BannerImage?.value?.src || isEditing) && (
          <div className="absolute inset-0">
            <ContentSdkImage
              field={fields.BannerImage}
              fill
              sizes="100vw"
              className="object-cover object-[61%_47%]"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.54)_30%,rgba(0,0,0,0)_92%)]" />
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 py-20 md:px-[145px]">
          <div className="max-w-[600px] text-white">
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="text-[34px] font-bold leading-[1.15] md:text-[46px] font-[var(--brand-heading-font,inherit)]"
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="mt-6 text-lg leading-[1.5] font-[var(--brand-body-font,inherit)]"
              />
            )}
            {(fields.PrimaryLink?.value?.href || isEditing) && (
              <span className="relative mt-8 inline-flex items-center gap-3 rounded-[var(--brand-button-radius,9999px)] bg-[var(--brand-primary)] px-6 py-3.5 text-lg font-semibold text-[var(--brand-primary-foreground)] transition-opacity hover:opacity-90">
                <ContentSdkLink field={fields.PrimaryLink} className={cn(!isEditing && 'after:absolute after:inset-0')} />
                <ArrowRight aria-hidden className="h-5 w-5" />
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
