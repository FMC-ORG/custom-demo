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
      <section className="bg-gray-50 py-16 md:py-24" data-testid="landing-social-proof">
        <div className="mx-auto max-w-4xl px-4">
          {hasTestimonial && (
            <figure className="text-center" data-testid="testimonial">
              {(testimonialQuote?.value || isEditing) && (
                <blockquote
                  className="text-2xl font-medium leading-relaxed text-gray-900 md:text-3xl"
                  data-testid="testimonial-quote"
                >
                  <ContentSdkRichText field={testimonialQuote} />
                </blockquote>
              )}
              <figcaption className="mt-8 flex items-center justify-center gap-4">
                {(testimonialAuthorImage?.value?.src || isEditing) && (
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
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
                      className="font-semibold text-gray-900"
                      data-testid="testimonial-author-name"
                    />
                  )}
                  {(testimonialAuthorTitle?.value || isEditing) && (
                    <Text
                      field={testimonialAuthorTitle}
                      tag="p"
                      className="text-sm text-gray-600"
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
                className="h-auto max-w-full opacity-70"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
