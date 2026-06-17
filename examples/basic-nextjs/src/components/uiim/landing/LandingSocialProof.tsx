import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  RichTextField,
  Text,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface LandingSocialProofRouteFields {
  testimonialQuote?: RichTextField;
  testimonialAuthorName?: Field<string>;
  testimonialAuthorTitle?: Field<string>;
  testimonialAuthorImage?: ImageField;
  partnerLogosImage?: ImageField;
}

const LandingSocialProofDefaultComponent = (): JSX.Element => (
  <div className="component landing-social-proof">
    <div className="component-content">
      <span className="is-empty-hint">LandingSocialProof</span>
    </div>
  </div>
);

function getRouteFields(page: ComponentProps['page']): LandingSocialProofRouteFields | null {
  const fields = page?.layout?.sitecore?.route?.fields;
  return fields ? (fields as unknown as LandingSocialProofRouteFields) : null;
}

export const Sage = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);
  if (!routeFields) return <LandingSocialProofDefaultComponent />;

  const {
    testimonialQuote,
    testimonialAuthorName,
    testimonialAuthorTitle,
    testimonialAuthorImage,
    partnerLogosImage,
  } = routeFields;

  const hasTestimonial =
    testimonialQuote?.value ||
    testimonialAuthorName?.value ||
    testimonialAuthorTitle?.value ||
    isEditing;
  const hasLogos = partnerLogosImage?.value?.src || isEditing;

  return (
    <div className={cn('component landing-social-proof', styles)} id={RenderingIdentifier}>
      <section
        className="py-16"
        style={{
          backgroundColor: 'var(--brand-bg)',
          color: 'var(--brand-fg)',
          fontFamily: 'var(--brand-body-font)',
        }}
        data-testid="landing-social-proof"
      >
        <div className="mx-auto max-w-4xl px-4">
          {hasTestimonial && (
            <figure className="text-center" data-testid="testimonial">
              <div
                aria-hidden="true"
                className="text-7xl leading-none font-serif"
                style={{ color: 'var(--brand-primary)', fontFamily: 'var(--brand-heading-font)' }}
              >
                &ldquo;
              </div>
              {(testimonialQuote?.value || isEditing) && (
                <blockquote
                  className="text-2xl font-medium leading-relaxed md:text-3xl"
                  style={{ color: 'var(--brand-fg)', fontFamily: 'var(--brand-heading-font)' }}
                  data-testid="testimonial-quote"
                >
                  <ContentSdkRichText field={testimonialQuote} />
                </blockquote>
              )}
              <figcaption className="mt-8 flex items-center justify-center gap-4">
                {(testimonialAuthorImage?.value?.src || isEditing) && (
                  <div
                    className="h-12 w-12 overflow-hidden rounded-full"
                    style={{ backgroundColor: 'var(--brand-muted)' }}
                  >
                    <ContentSdkImage
                      field={testimonialAuthorImage}
                      className="h-full w-full object-cover"
                      width={48}
                      height={48}
                    />
                  </div>
                )}
                <div className="text-left">
                  {(testimonialAuthorName?.value || isEditing) && (
                    <Text
                      field={testimonialAuthorName}
                      tag="p"
                      className="font-semibold"
                      style={{ color: 'var(--brand-fg)' }}
                      data-testid="testimonial-author-name"
                    />
                  )}
                  {(testimonialAuthorTitle?.value || isEditing) && (
                    <Text
                      field={testimonialAuthorTitle}
                      tag="p"
                      className="text-sm"
                      style={{ color: 'var(--brand-muted-foreground)' }}
                      data-testid="testimonial-author-title"
                    />
                  )}
                </div>
              </figcaption>
            </figure>
          )}

          {hasLogos && (
            <div className="mt-16 flex justify-center" data-testid="partner-logos">
              <ContentSdkImage
                field={partnerLogosImage}
                className="h-12 w-auto max-w-full opacity-80 brightness-0 invert"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export const Default = (props: ComponentProps): JSX.Element => <Sage {...props} />;
