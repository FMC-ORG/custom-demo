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
