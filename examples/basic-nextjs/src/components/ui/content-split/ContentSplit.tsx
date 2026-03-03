'use client';

import React, { JSX } from 'react';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text,
  Field,
  ImageField,
  LinkField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Supports GraphQL camelCase (jsonValue) and default JSS PascalCase */
interface ContentSplitFields {
  ContentSplitImage?: ImageField | { jsonValue?: ImageField };
  contentSplitImage?: ImageField | { jsonValue?: ImageField };
  EyebrowLabel?: Field<string> | { jsonValue?: Field<string> };
  eyebrowLabel?: Field<string> | { jsonValue?: Field<string> };
  SectionHeadline?: Field<string> | { jsonValue?: Field<string> };
  sectionHeadline?: Field<string> | { jsonValue?: Field<string> };
  BodyText?: Field<string> | { jsonValue?: Field<string> };
  bodyText?: Field<string> | { jsonValue?: Field<string> };
  BulletPointsContent?: Field<string> | { jsonValue?: Field<string> };
  bulletPointsContent?: Field<string> | { jsonValue?: Field<string> };
  CTALink?: LinkField | { jsonValue?: LinkField };
  ctaLink?: LinkField | { jsonValue?: LinkField };
}

interface ContentSplitProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: ContentSplitFields;
    };
  } & ContentSplitFields;
}

function resolveField<T>(
  raw: T | { jsonValue?: T } | undefined
): T | undefined {
  if (!raw) return undefined;
  const withJson = raw as { jsonValue?: T };
  return withJson?.jsonValue ?? (raw as T);
}

function resolveValue(field: Field<string> | undefined): string | undefined {
  if (!field) return undefined;
  const f = field as Field<string>;
  return f?.value;
}

/**
 * Shared content block for both variants.
 * imageFirst: true = ImageLeft (Variant A), false = ImageRight (Variant B)
 */
function ContentSplitLayout({
  params,
  fields,
  imageFirst,
  showBullets,
  ctaAsButton,
}: ContentSplitProps & {
  imageFirst: boolean;
  showBullets: boolean;
  ctaAsButton: boolean;
}): JSX.Element {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource ?? fields;
  const imageField = resolveField<ImageField>(
    (datasource?.ContentSplitImage ?? datasource?.contentSplitImage) as
      | ImageField
      | { jsonValue?: ImageField }
  );
  const eyebrow = resolveField<Field<string>>(
    (datasource?.EyebrowLabel ?? datasource?.eyebrowLabel) as
      | Field<string>
      | { jsonValue?: Field<string> }
  );
  const headline = resolveField<Field<string>>(
    (datasource?.SectionHeadline ?? datasource?.sectionHeadline) as
      | Field<string>
      | { jsonValue?: Field<string> }
  );
  const body = resolveField<Field<string>>(
    (datasource?.BodyText ?? datasource?.bodyText) as
      | Field<string>
      | { jsonValue?: Field<string> }
  );
  const bullets = resolveField<Field<string>>(
    (datasource?.BulletPointsContent ?? datasource?.bulletPointsContent) as
      | Field<string>
      | { jsonValue?: Field<string> }
  );
  const ctaLink = resolveField<LinkField>(
    (datasource?.CTALink ?? datasource?.ctaLink) as
      | LinkField
      | { jsonValue?: LinkField }
  );

  const hasImage = imageField?.value?.src ?? (isEditing && imageField);
  const hasEyebrow = resolveValue(eyebrow) ?? (isEditing && eyebrow);
  const hasHeadline = resolveValue(headline) ?? (isEditing && headline);
  const hasBody = resolveValue(body) ?? (isEditing && body);
  const hasBullets = resolveValue(bullets) ?? (isEditing && bullets);
  const hasCta = ctaLink?.value?.href ?? (isEditing && ctaLink);

  const hasContent =
    hasImage ||
    hasEyebrow ||
    hasHeadline ||
    hasBody ||
    hasBullets ||
    hasCta;

  if (!datasource || !hasContent) {
    return (
      <section
        className={cn('content-split py-12', styles)}
        id={id}
        data-testid="content-split"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid min-h-[200px] grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
              <span className="is-empty-hint text-muted-foreground">
                Content Split
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const imageColumn = (
    <div
      className={cn(
        'relative aspect-video overflow-hidden rounded-lg bg-muted lg:aspect-auto lg:min-h-[320px]',
        imageFirst ? 'lg:order-1' : 'lg:order-2'
      )}
    >
      {(hasImage || (isEditing && imageField)) && imageField ? (
        <ContentSdkImage
          field={imageField}
          editable={isEditing}
          className="h-full w-full object-cover"
          fill
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="is-empty-hint text-muted-foreground">
            [contentsplit - image field]
          </span>
        </div>
      )}
    </div>
  );

  const textColumn = (
    <div
      className={cn(
        'flex flex-col justify-center space-y-4 px-0 lg:px-8',
        imageFirst ? 'lg:order-2' : 'lg:order-1'
      )}
    >
      {(hasEyebrow || (isEditing && eyebrow)) && eyebrow && (
        <Text
          tag="p"
          field={eyebrow}
          className="field-eyebrowlabel text-xs font-medium uppercase tracking-wider text-muted-foreground"
        />
      )}
      {(hasHeadline || (isEditing && headline)) && headline && (
        <Text
          tag="h2"
          field={headline}
          className="field-sectionheadline text-2xl font-bold text-foreground sm:text-3xl"
        />
      )}
      {(hasBody || (isEditing && body)) && body && (
        <div className="field-bodytext text-base text-muted-foreground">
          <ContentSdkRichText field={body} />
        </div>
      )}
      {showBullets && (hasBullets || (isEditing && bullets)) && bullets && (
        <div className="field-bulletpointscontent">
          <ContentSdkRichText field={bullets} />
        </div>
      )}
      {(hasCta || (isEditing && ctaLink)) && ctaLink && (
        <div className="pt-2">
          <ContentSdkLink
            field={ctaLink}
            editable={isEditing}
            className={cn(
              'inline-flex items-center gap-1 font-medium',
              ctaAsButton
                ? 'rounded-md bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90'
                : 'text-primary hover:underline'
            )}
          >
            {ctaLink?.value?.text ?? ''}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ContentSdkLink>
        </div>
      )}
    </div>
  );

  return (
    <section
      className={cn('content-split py-12', styles)}
      id={id}
      data-testid="content-split"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          {imageFirst ? imageColumn : textColumn}
          {imageFirst ? textColumn : imageColumn}
        </div>
      </div>
    </section>
  );
}

/**
 * ContentSplit - Two-column layout with image and text.
 * Variant A (ImageLeft): Image left, text right. Includes bullets, CTA as button.
 * Variant B (ImageRight): Image right, text left. No bullets, CTA as link.
 */
export const Default = (props: ContentSplitProps): JSX.Element => (
  <ContentSplitLayout
    {...props}
    imageFirst={true}
    showBullets={true}
    ctaAsButton={true}
  />
);

/** Variant A: Image left, text right. Bullets + CTA button. */
export const ImageLeft = (props: ContentSplitProps): JSX.Element => (
  <ContentSplitLayout
    {...props}
    imageFirst={true}
    showBullets={true}
    ctaAsButton={true}
  />
);

/** Variant B: Image right, text left. No bullets, CTA as link. */
export const ImageRight = (props: ContentSplitProps): JSX.Element => (
  <ContentSplitLayout
    {...props}
    imageFirst={false}
    showBullets={false}
    ctaAsButton={false}
  />
);

/**
 * CareersBanner variant — 50/50 split: full-bleed photo LEFT with white overlay card, blue panel RIGHT.
 * Photo has a white card overlaid at the bottom-left. Right panel is electric blue with white text.
 */
export const CareersBanner = (props: ContentSplitProps): JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { params, fields } = props;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource ?? fields;
  const imageField = resolveField<ImageField>(
    (datasource?.ContentSplitImage ?? datasource?.contentSplitImage) as
      | ImageField
      | { jsonValue?: ImageField }
  );
  const eyebrow = resolveField<Field<string>>(
    (datasource?.EyebrowLabel ?? datasource?.eyebrowLabel) as
      | Field<string>
      | { jsonValue?: Field<string> }
  );
  const headline = resolveField<Field<string>>(
    (datasource?.SectionHeadline ?? datasource?.sectionHeadline) as
      | Field<string>
      | { jsonValue?: Field<string> }
  );
  const body = resolveField<Field<string>>(
    (datasource?.BodyText ?? datasource?.bodyText) as
      | Field<string>
      | { jsonValue?: Field<string> }
  );
  const ctaLink = resolveField<LinkField>(
    (datasource?.CTALink ?? datasource?.ctaLink) as
      | LinkField
      | { jsonValue?: LinkField }
  );

  const hasImage = imageField?.value?.src ?? (isEditing && imageField);
  const hasContent =
    hasImage ||
    resolveValue(eyebrow) ||
    resolveValue(headline) ||
    resolveValue(body) ||
    ctaLink?.value?.href;

  if (!datasource || !hasContent) {
    return (
      <section className={cn('content-split-careers', styles)} id={id}>
        <div className="mx-auto max-w-7xl px-4 py-12">
          <span className="is-empty-hint text-muted-foreground">CareersBanner</span>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('content-split-careers', styles)} id={id} data-testid="content-split-careers">
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: '480px' }}>
        {/* Left: Full-bleed photo with overlay card */}
        <div className="relative min-h-[320px] lg:min-h-0 overflow-hidden">
          {(hasImage || (isEditing && imageField)) && imageField ? (
            <ContentSdkImage
              field={imageField}
              editable={isEditing}
              className="h-full w-full object-cover"
              fill
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <span className="is-empty-hint text-muted-foreground">[image]</span>
            </div>
          )}
          {/* White overlay card at bottom-left */}
          <div className="absolute bottom-0 left-0 w-3/4 bg-white p-6">
            {(resolveValue(eyebrow) || (isEditing && eyebrow)) && eyebrow && (
              <Text
                tag="p"
                field={eyebrow}
                className="field-eyebrowlabel text-xs font-bold uppercase tracking-widest text-[#1d4ed8] mb-1"
              />
            )}
            {(resolveValue(body) || (isEditing && body)) && body && (
              <div className="field-bodytext text-sm text-vg-body">
                <ContentSdkRichText field={body} />
              </div>
            )}
            {(ctaLink?.value?.href || (isEditing && ctaLink)) && ctaLink && (
              <div className="flex justify-end mt-3">
                <ContentSdkLink
                  field={ctaLink}
                  editable={isEditing}
                  className="inline-flex items-center justify-center w-8 h-8 bg-[#1d4ed8] text-white"
                  aria-label={ctaLink?.value?.text ?? 'Learn more'}
                >
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </ContentSdkLink>
              </div>
            )}
          </div>
        </div>
        {/* Right: Blue panel */}
        <div className="bg-[#1d4ed8] flex items-center px-12 py-16">
          <div>
            {(resolveValue(headline) || (isEditing && headline)) && headline && (
              <Text
                tag="h2"
                field={headline}
                className="field-sectionheadline text-3xl md:text-4xl font-bold text-white leading-tight"
              />
            )}
            {(ctaLink?.value?.href || (isEditing && ctaLink)) && ctaLink && (
              <div className="mt-8">
                <ContentSdkLink
                  field={ctaLink}
                  editable={isEditing}
                  className="text-sm text-white underline-offset-4 hover:underline inline-flex items-center gap-2"
                >
                  {ctaLink?.value?.text ?? ''}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </ContentSdkLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * SustainabilityBanner variant — 50/50 split: blue panel + full-bleed photo with white overlay card.
 * imageFirst=true: blue LEFT, photo RIGHT. imageFirst=false (default): photo LEFT, blue RIGHT.
 * Controlled via params.imageFirst or defaults to false (photo left).
 */
function SustainabilityBannerLayout(
  props: ContentSplitProps & { imageFirst?: boolean }
): JSX.Element {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { params, fields, imageFirst = false } = props;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource ?? fields;
  const imageField = resolveField<ImageField>(
    (datasource?.ContentSplitImage ?? datasource?.contentSplitImage) as
      | ImageField
      | { jsonValue?: ImageField }
  );
  const eyebrow = resolveField<Field<string>>(
    (datasource?.EyebrowLabel ?? datasource?.eyebrowLabel) as
      | Field<string>
      | { jsonValue?: Field<string> }
  );
  const headline = resolveField<Field<string>>(
    (datasource?.SectionHeadline ?? datasource?.sectionHeadline) as
      | Field<string>
      | { jsonValue?: Field<string> }
  );
  const body = resolveField<Field<string>>(
    (datasource?.BodyText ?? datasource?.bodyText) as
      | Field<string>
      | { jsonValue?: Field<string> }
  );
  const ctaLink = resolveField<LinkField>(
    (datasource?.CTALink ?? datasource?.ctaLink) as
      | LinkField
      | { jsonValue?: LinkField }
  );

  const hasImage = imageField?.value?.src ?? (isEditing && imageField);
  const hasContent =
    hasImage ||
    resolveValue(eyebrow) ||
    resolveValue(headline) ||
    resolveValue(body) ||
    ctaLink?.value?.href;

  if (!datasource || !hasContent) {
    return (
      <section className={cn('content-split-sustainability', styles)} id={id}>
        <div className="mx-auto max-w-7xl px-4 py-12">
          <span className="is-empty-hint text-muted-foreground">SustainabilityBanner</span>
        </div>
      </section>
    );
  }

  const bluePanel = (
    <div className="bg-[#1d4ed8] flex items-center px-12 py-16">
      <div>
        {(resolveValue(headline) || (isEditing && headline)) && headline && (
          <Text
            tag="h2"
            field={headline}
            className="field-sectionheadline text-3xl font-bold text-white leading-tight"
          />
        )}
        {(resolveValue(body) || (isEditing && body)) && body && (
          <div className="field-bodytext text-base text-white/80 mt-4">
            <ContentSdkRichText field={body} />
          </div>
        )}
        {(ctaLink?.value?.href || (isEditing && ctaLink)) && ctaLink && (
          <div className="mt-6">
            <ContentSdkLink
              field={ctaLink}
              editable={isEditing}
              className="text-sm text-white underline-offset-4 hover:underline inline-flex items-center gap-2"
            >
              {ctaLink?.value?.text ?? ''}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ContentSdkLink>
          </div>
        )}
      </div>
    </div>
  );

  const photoPanel = (
    <div className="relative min-h-[320px] overflow-hidden">
      {(hasImage || (isEditing && imageField)) && imageField ? (
        <ContentSdkImage
          field={imageField}
          editable={isEditing}
          className="h-full w-full object-cover"
          fill
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-muted">
          <span className="is-empty-hint text-muted-foreground">[image]</span>
        </div>
      )}
      {/* White overlay card */}
      <div className="absolute bottom-4 left-4 bg-white p-5 max-w-xs">
        {(resolveValue(eyebrow) || (isEditing && eyebrow)) && eyebrow && (
          <Text
            tag="p"
            field={eyebrow}
            className="field-eyebrowlabel text-sm font-semibold text-[#1d4ed8]"
          />
        )}
        {(resolveValue(body) || (isEditing && body)) && body && (
          <div className="field-bodytext text-xs text-vg-body mt-1 line-clamp-3">
            <ContentSdkRichText field={body} />
          </div>
        )}
        {(ctaLink?.value?.href || (isEditing && ctaLink)) && ctaLink && (
          <div className="flex justify-end mt-2">
            <ContentSdkLink
              field={ctaLink}
              editable={isEditing}
              className="inline-flex items-center justify-center w-7 h-7 bg-[#1d4ed8] text-white"
              aria-label={ctaLink?.value?.text ?? 'Learn more'}
            >
              <ArrowRight className="h-3 w-3" aria-hidden />
            </ContentSdkLink>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section
      className={cn('content-split-sustainability', styles)}
      id={id}
      data-testid="content-split-sustainability"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: '420px' }}>
        {imageFirst ? bluePanel : photoPanel}
        {imageFirst ? photoPanel : bluePanel}
      </div>
    </section>
  );
}

/** SustainabilityBanner variant: photo LEFT, blue panel RIGHT (default orientation). */
export const SustainabilityBanner = (props: ContentSplitProps): JSX.Element => (
  <SustainabilityBannerLayout {...props} imageFirst={false} />
);

/** SustainabilityBannerReversed variant: blue panel LEFT, photo RIGHT. */
export const SustainabilityBannerReversed = (props: ContentSplitProps): JSX.Element => (
  <SustainabilityBannerLayout {...props} imageFirst={true} />
);
