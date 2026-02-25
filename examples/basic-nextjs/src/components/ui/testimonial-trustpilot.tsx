'use client';

import type React from 'react';
import { useState } from 'react';
import {
  Link as ContentSdkLink,
  Text as ContentSdkText,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import type { LinkField, Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';

interface TestimonialItemChild {
  id?: string;
  quote?: { jsonValue?: Field<string> };
  authorName?: { jsonValue?: Field<string> };
  attribution?: { jsonValue?: Field<string> };
  reviewDate?: { jsonValue?: Field<string> };
}

interface TestimonialTrustpilotFields {
  data?: {
    datasource?: {
      testimonialHeading?: { jsonValue?: Field<string> };
      ratingLabel?: { jsonValue?: Field<string> };
      ratingScore?: { jsonValue?: Field<number | string> };
      reviewCount?: { jsonValue?: Field<number | string> };
      reviewDate?: { jsonValue?: Field<string> };
      trustpilotLink?: { jsonValue?: LinkField };
      children?: {
        results?: TestimonialItemChild[];
      };
    };
  };
}

type TestimonialTrustpilotProps = ComponentProps & {
  fields?: TestimonialTrustpilotFields;
};

const DEFAULT_HEADING = 'Our customers say:';
const DEFAULT_QUOTE =
  '"Best of all the comparison sites- even the prices are better for the same deal!"';
const DEFAULT_ATTRIBUTION = 'Andy - Confused.com customer (January 2026)';
const DEFAULT_RATING_LABEL = 'Excellent';
const DEFAULT_RATING_SCORE = 4.3;
const DEFAULT_REVIEW_COUNT = 9858;
const DEFAULT_REVIEW_DATE = '06/01/2026';
const DEFAULT_TRUSTPILOT_HREF = '#';

function StarRating({ score }: { score: number }) {
  const fullStars = Math.floor(score);
  const partial = score - fullStars;

  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${score} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return (
            <Star
              key={i}
              className="h-6 w-6 text-trustpilot-green fill-trustpilot-green"
              aria-hidden
            />
          );
        }
        if (i === fullStars && partial > 0) {
          return (
            <div key={i} className="relative h-6 w-6">
              <Star
                className="absolute inset-0 h-6 w-6 text-gray-500"
                aria-hidden
              />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${partial * 100}%` }}
              >
                <Star
                  className="h-6 w-6 text-trustpilot-green fill-trustpilot-green"
                  aria-hidden
                />
              </div>
            </div>
          );
        }
        return (
          <Star
            key={i}
            className="h-6 w-6 text-gray-500"
            aria-hidden
          />
        );
      })}
    </div>
  );
}

/**
 * TestimonialTrustpilot component - customer testimonial carousel on the left,
 * Trustpilot rating summary on the right. Dark background, white text, green accents.
 * Uses Lucide icons only (no images).
 */
export const Default: React.FC<TestimonialTrustpilotProps> = (props) => {
  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing ?? false;

  const [activeIndex, setActiveIndex] = useState(0);

  const datasource = fields?.data?.datasource;
  const hasDatasource = Boolean(datasource);

  const testimonialHeading =
    datasource?.testimonialHeading?.jsonValue?.value ?? DEFAULT_HEADING;
  const ratingLabel =
    datasource?.ratingLabel?.jsonValue?.value ?? DEFAULT_RATING_LABEL;
  const ratingScore =
    Number(datasource?.ratingScore?.jsonValue?.value ?? DEFAULT_RATING_SCORE) ||
    DEFAULT_RATING_SCORE;
  const reviewCount =
    Number(datasource?.reviewCount?.jsonValue?.value ?? DEFAULT_REVIEW_COUNT) ||
    DEFAULT_REVIEW_COUNT;
  const reviewDate =
    datasource?.reviewDate?.jsonValue?.value ?? DEFAULT_REVIEW_DATE;
  const trustpilotLink = datasource?.trustpilotLink?.jsonValue;
  const trustpilotHref =
    (trustpilotLink?.value?.href as string | undefined) ?? DEFAULT_TRUSTPILOT_HREF;

  const useContentSdkHeading = Boolean(datasource?.testimonialHeading?.jsonValue);
  const useContentSdkTrustpilot = Boolean(trustpilotLink);

  const children = datasource?.children?.results ?? [];
  const testimonials =
    hasDatasource && children.length > 0
      ? children.map((child) => ({
          id: child.id ?? '',
          quote: child.quote?.jsonValue?.value ?? '',
          authorName: child.authorName?.jsonValue?.value ?? '',
          attribution: child.attribution?.jsonValue?.value ?? '',
          reviewDate: child.reviewDate?.jsonValue?.value ?? '',
        }))
      : [
          {
            id: 'default',
            quote: DEFAULT_QUOTE,
            authorName: 'Andy',
            attribution: 'Confused.com customer',
            reviewDate: 'January 2026',
          },
        ];

  const activeTestimonial = testimonials[activeIndex] ?? testimonials[0];
  const attributionText = activeTestimonial
    ? `${activeTestimonial.authorName} - ${activeTestimonial.attribution} (${activeTestimonial.reviewDate})`
    : DEFAULT_ATTRIBUTION;

  const showPlaceholder = !hasDatasource && isEditing;

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev > 0 ? prev - 1 : testimonials.length - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev < testimonials.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <section className="bg-confused-dark text-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showPlaceholder ? (
          <div className="rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-8 text-center">
            <p className="text-white/60">Add Testimonial Trustpilot datasource</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Testimonial carousel */}
            <div className="flex flex-col gap-6">
              {useContentSdkHeading && datasource?.testimonialHeading?.jsonValue ? (
                <ContentSdkText
                  tag="h2"
                  field={datasource.testimonialHeading.jsonValue}
                  className="text-xl font-bold text-white"
                />
              ) : (
                <h2 className="text-xl font-bold text-white">
                  {testimonialHeading}
                </h2>
              )}

              {activeTestimonial && (
                <>
                  <blockquote className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                    {activeTestimonial.quote}
                  </blockquote>
                  <p className="text-sm text-white/90">{attributionText}</p>
                </>
              )}

              {testimonials.length > 1 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="rounded-lg bg-gray-600/80 p-2 text-white hover:bg-gray-600 transition-colors"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="rounded-lg bg-gray-600/80 p-2 text-white hover:bg-gray-600 transition-colors"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              )}
            </div>

            {/* Right: Trustpilot rating */}
            <div className="flex flex-col gap-4">
              {datasource?.ratingLabel?.jsonValue ? (
                <ContentSdkText
                  tag="h3"
                  field={datasource.ratingLabel.jsonValue}
                  className="text-xl font-bold text-white"
                />
              ) : (
                <h3 className="text-xl font-bold text-white">{ratingLabel}</h3>
              )}

              <StarRating score={ratingScore} />

              <p className="text-sm text-white/90">
                <span>
                  Confused.com scores a{' '}
                  <strong>{ratingScore}</strong> out of 5 rating based on{' '}
                  <strong>{reviewCount.toLocaleString()}</strong> reviews as of{' '}
                  {reviewDate}
                </span>
              </p>

              {useContentSdkTrustpilot && trustpilotLink ? (
                <ContentSdkLink
                  field={trustpilotLink as LinkField}
                  className="inline-flex items-center gap-2 text-trustpilot-green font-medium hover:underline"
                >
                  <Star className="h-5 w-5 fill-trustpilot-green" aria-hidden />
                  <span>Trustpilot</span>
                </ContentSdkLink>
              ) : (
                <Link
                  href={trustpilotHref}
                  className="inline-flex items-center gap-2 text-trustpilot-green font-medium hover:underline"
                >
                  <Star className="h-5 w-5 fill-trustpilot-green" aria-hidden />
                  <span>Trustpilot</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
