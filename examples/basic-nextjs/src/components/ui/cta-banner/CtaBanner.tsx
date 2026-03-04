'use client';

import React, { JSX } from 'react';
import {
  Link as ContentSdkLink,
  Text,
  Field,
  LinkField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface CtaBannerFields {
  Headline?: Field<string> | { jsonValue?: Field<string> };
  headline?: Field<string> | { jsonValue?: Field<string> };
  Subheadline?: Field<string> | { jsonValue?: Field<string> };
  subheadline?: Field<string> | { jsonValue?: Field<string> };
  CtaLink?: LinkField | { jsonValue?: LinkField };
  ctaLink?: LinkField | { jsonValue?: LinkField };
}

interface CtaBannerProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: CtaBannerFields;
    };
  } & CtaBannerFields;
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

interface CtaBannerLayoutProps extends CtaBannerProps {
  backgroundColor: string;
  textColor: string;
  buttonStyle: 'primary' | 'outline';
}

function CtaBannerLayout({
  params,
  fields,
  backgroundColor,
  textColor,
  buttonStyle,
}: CtaBannerLayoutProps): JSX.Element {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource ?? fields;
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

  const hasHeadline = resolveValue(headline) ?? (isEditing && headline);
  const hasSubheadline = resolveValue(subheadline) ?? (isEditing && subheadline);
  const hasCta = ctaLink?.value?.href ?? (isEditing && ctaLink);

  const hasContent = hasHeadline || hasSubheadline || hasCta;

  if (!datasource || !hasContent) {
    return (
      <section
        className={cn('cta-banner py-16', styles)}
        id={id}
        data-testid="cta-banner"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-muted">
            <span className="is-empty-hint text-muted-foreground">
              CTA Banner - Add headline and CTA
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn('cta-banner py-16', backgroundColor, styles)}
      id={id}
      data-testid="cta-banner"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          {(hasHeadline || (isEditing && headline)) && headline && (
            <Text
              tag="h2"
              field={headline}
              className={cn(
                'field-headline mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl',
                textColor
              )}
            />
          )}
          {(hasSubheadline || (isEditing && subheadline)) && subheadline && (
            <Text
              tag="p"
              field={subheadline}
              className={cn(
                'field-subheadline mx-auto mb-8 max-w-2xl text-lg sm:text-xl',
                textColor === 'text-white' ? 'text-white/90' : 'text-muted-foreground'
              )}
            />
          )}
          {(hasCta || (isEditing && ctaLink)) && ctaLink && (
            <div className="flex justify-center">
              <ContentSdkLink
                field={ctaLink}
                editable={isEditing}
                className={cn(
                  'inline-flex items-center rounded-md px-8 py-3 text-base font-semibold transition-colors',
                  buttonStyle === 'primary' &&
                    'bg-white text-vargroup-blue hover:bg-white/90',
                  buttonStyle === 'outline' &&
                    'border-2 border-white bg-transparent text-white hover:bg-white hover:text-vargroup-blue'
                )}
              >
                {ctaLink?.value?.text ?? 'Get Started'}
              </ContentSdkLink>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * CTA Banner - Call-to-action section with headline, subheadline, and CTA button.
 * Default: Blue background, white text, white button
 */
export const Default = (props: CtaBannerProps): JSX.Element => (
  <CtaBannerLayout
    {...props}
    backgroundColor="bg-vargroup-blue"
    textColor="text-white"
    buttonStyle="primary"
  />
);

/**
 * Light: Light gray background, dark text, blue button
 */
export const Light = (props: CtaBannerProps): JSX.Element => (
  <CtaBannerLayout
    {...props}
    backgroundColor="bg-vargroup-light-gray"
    textColor="text-foreground"
    buttonStyle="primary"
  />
);

/**
 * Green: Green background, white text, outline button
 */
export const Green = (props: CtaBannerProps): JSX.Element => (
  <CtaBannerLayout
    {...props}
    backgroundColor="bg-vargroup-green"
    textColor="text-white"
    buttonStyle="outline"
  />
);
