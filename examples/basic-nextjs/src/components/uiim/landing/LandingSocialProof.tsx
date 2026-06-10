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

export const Default = ({ params, page }: ComponentProps): JSX.Element => {
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
      <section className="py-16 md:py-24" data-testid="landing-social-proof">
        <div className="mx-auto max-w-3xl px-4">
          {hasTestimonial && (
            <figure className="text-center" data-testid="testimonial">
              {(testimonialQuote?.value || isEditing) && (
                <blockquote
                  className="text-2xl md:text-3xl italic font-light leading-snug [&_p]:m-0"
                  style={{
                    fontFamily: 'var(--brand-heading-font)',
                    background:
                      'linear-gradient(180deg, #f5f5f5 0%, #d4d4d8 40%, #a3a3a3 80%, #6b7280 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                  data-testid="testimonial-quote"
                >
                  <ContentSdkRichText field={testimonialQuote} />
                </blockquote>
              )}
              {/* Thin divider above attribution */}
              <div
                className="mx-auto mt-10 mb-6"
                style={{
                  width: '60px',
                  height: '1px',
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                }}
                aria-hidden
              />
              <figcaption className="flex items-center justify-center gap-4">
                {(testimonialAuthorImage?.value?.src || isEditing) && (
                  <div
                    className="h-12 w-12 overflow-hidden rounded-full"
                    style={{ border: '1px solid rgba(255,255,255,0.15)' }}
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
                      className="text-sm font-light"
                      style={{ color: '#d4d4d8', letterSpacing: '0.1em' }}
                      data-testid="testimonial-author-name"
                    />
                  )}
                  {(testimonialAuthorTitle?.value || isEditing) && (
                    <Text
                      field={testimonialAuthorTitle}
                      tag="p"
                      className="text-xs font-light uppercase mt-1"
                      style={{ color: '#a3a3a3', letterSpacing: '0.2em' }}
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
                className="h-auto max-w-full"
                style={{ opacity: 0.4, filter: 'grayscale(1) brightness(2)' }}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
