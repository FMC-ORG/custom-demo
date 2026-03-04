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
import { cn } from '@/lib/utils';

interface HeroBannerFields {
  BackgroundImage?: ImageField | { jsonValue?: ImageField };
  backgroundImage?: ImageField | { jsonValue?: ImageField };
  Headline?: Field<string> | { jsonValue?: Field<string> };
  headline?: Field<string> | { jsonValue?: Field<string> };
  Subheadline?: Field<string> | { jsonValue?: Field<string> };
  subheadline?: Field<string> | { jsonValue?: Field<string> };
  CtaLink?: LinkField | { jsonValue?: LinkField };
  ctaLink?: LinkField | { jsonValue?: LinkField };
  SecondaryCtaLink?: LinkField | { jsonValue?: LinkField };
  secondaryCtaLink?: LinkField | { jsonValue?: LinkField };
}

interface HeroBannerProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: HeroBannerFields;
    };
  } & HeroBannerFields;
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

interface HeroBannerLayoutProps extends HeroBannerProps {
  variant: 'full' | 'centered' | 'compact';
  overlayOpacity: string;
  contentAlignment: 'left' | 'center';
}

function HeroBannerLayout({
  params,
  fields,
  variant,
  overlayOpacity,
  contentAlignment,
}: HeroBannerLayoutProps): JSX.Element {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource ?? fields;
  const backgroundImage = resolveField<ImageField>(
    (datasource?.BackgroundImage ?? datasource?.backgroundImage) as
      | ImageField
      | { jsonValue?: ImageField }
  );
  const headline = resolveField<Field<string>>(
    (datasource?.Headline ?? datasource?.headline) as
      | Field<string>
      | { jsonValue?: Field<string> }
  );
  const subheadline = resolveField<Field<string>>(
    (datasource?.Subheadline ?? datasource?.subheadline) as
      | Field<string>
      | { jsonValue?: Field<string> }
  );
  const ctaLink = resolveField<LinkField>(
    (datasource?.CtaLink ?? datasource?.ctaLink) as
      | LinkField
      | { jsonValue?: LinkField }
  );
  const secondaryCtaLink = resolveField<LinkField>(
    (datasource?.SecondaryCtaLink ?? datasource?.secondaryCtaLink) as
      | LinkField
      | { jsonValue?: LinkField }
  );

  const hasImage = backgroundImage?.value?.src ?? (isEditing && backgroundImage);
  const hasHeadline = resolveValue(headline) ?? (isEditing && headline);
  const hasSubheadline = resolveValue(subheadline) ?? (isEditing && subheadline);
  const hasCta = ctaLink?.value?.href ?? (isEditing && ctaLink);
  const hasSecondaryCta = secondaryCtaLink?.value?.href ?? (isEditing && secondaryCtaLink);

  const hasContent = hasImage || hasHeadline || hasSubheadline || hasCta || hasSecondaryCta;

  const heightClasses = {
    full: 'min-h-[600px] lg:min-h-[700px]',
    centered: 'min-h-[500px] lg:min-h-[600px]',
    compact: 'min-h-[400px] lg:min-h-[450px]',
  };

  const textSizeClasses = {
    full: 'text-4xl sm:text-5xl lg:text-6xl',
    centered: 'text-3xl sm:text-4xl lg:text-5xl',
    compact: 'text-2xl sm:text-3xl lg:text-4xl',
  };

  if (!datasource || !hasContent) {
    return (
      <section
        className={cn('hero-banner relative overflow-hidden', heightClasses.full, styles)}
        id={id}
        data-testid="hero-banner"
      >
        <div className="absolute inset-0 bg-muted" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4">
          <div className="text-center w-full">
            <span className="is-empty-hint text-muted-foreground">
              Hero Banner - Add content
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn('hero-banner relative overflow-hidden', heightClasses[variant], styles)}
      id={id}
      data-testid="hero-banner"
    >
      {/* Background Image */}
      {(hasImage || (isEditing && backgroundImage)) && backgroundImage ? (
        <div className="absolute inset-0">
          <ContentSdkImage
            field={backgroundImage}
            className="h-full w-full object-cover"
            fill
            priority
          />
          <div
            className={cn('absolute inset-0 bg-black', overlayOpacity)}
            aria-hidden="true"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-vargroup-blue to-vargroup-green" />
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4">
        <div
          className={cn(
            'max-w-4xl space-y-6',
            contentAlignment === 'center' ? 'mx-auto text-center' : 'text-left'
          )}
        >
          {(hasHeadline || (isEditing && headline)) && headline && (
            <Text
              tag="h1"
              field={headline}
              className={cn(
                'field-headline font-bold text-white leading-tight',
                textSizeClasses[variant]
              )}
            />
          )}
          {(hasSubheadline || (isEditing && subheadline)) && subheadline && (
            <div className="field-subheadline text-lg text-white/90 sm:text-xl lg:text-2xl max-w-3xl">
              <ContentSdkRichText field={subheadline} />
            </div>
          )}
          {((hasCta || (isEditing && ctaLink)) || (hasSecondaryCta || (isEditing && secondaryCtaLink))) && (
            <div className={cn(
              'flex flex-wrap gap-4 pt-4',
              contentAlignment === 'center' ? 'justify-center' : 'justify-start'
            )}>
              {(hasCta || (isEditing && ctaLink)) && ctaLink && (
                <ContentSdkLink
                  field={ctaLink}
                  editable={isEditing}
                  className="inline-flex items-center rounded-md bg-vargroup-blue px-8 py-3 text-base font-semibold text-white hover:bg-vargroup-blue/90 transition-colors"
                >
                  {ctaLink?.value?.text ?? 'Learn More'}
                </ContentSdkLink>
              )}
              {(hasSecondaryCta || (isEditing && secondaryCtaLink)) && secondaryCtaLink && (
                <ContentSdkLink
                  field={secondaryCtaLink}
                  editable={isEditing}
                  className="inline-flex items-center rounded-md border-2 border-white bg-transparent px-8 py-3 text-base font-semibold text-white hover:bg-white hover:text-vargroup-blue transition-colors"
                >
                  {secondaryCtaLink?.value?.text ?? 'Contact Us'}
                </ContentSdkLink>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Hero Banner - Large header section with background image and content.
 * Default: Full height, left-aligned, strong overlay
 */
export const Default = (props: HeroBannerProps): JSX.Element => (
  <HeroBannerLayout
    {...props}
    variant="full"
    overlayOpacity="bg-opacity-50"
    contentAlignment="left"
  />
);

/**
 * Centered: Medium height, centered content, medium overlay
 */
export const Centered = (props: HeroBannerProps): JSX.Element => (
  <HeroBannerLayout
    {...props}
    variant="centered"
    overlayOpacity="bg-opacity-40"
    contentAlignment="center"
  />
);

/**
 * Compact: Smaller height, left-aligned, light overlay
 */
export const Compact = (props: HeroBannerProps): JSX.Element => (
  <HeroBannerLayout
    {...props}
    variant="compact"
    overlayOpacity="bg-opacity-30"
    contentAlignment="left"
  />
);
