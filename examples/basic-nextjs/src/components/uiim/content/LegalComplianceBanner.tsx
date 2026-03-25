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
