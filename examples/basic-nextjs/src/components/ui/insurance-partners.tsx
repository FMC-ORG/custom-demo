'use client';

import type React from 'react';
import {
  Link as ContentSdkLink,
  Text as ContentSdkText,
  NextImage as ContentSdkImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import type { LinkField, Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PartnerLogoItemChild {
  id?: string;
  logoImage?: { jsonValue?: ImageField };
}

interface InsurancePartnersFields {
  data?: {
    datasource?: {
      heading?: { jsonValue?: Field<string> };
      ctaLink?: { jsonValue?: LinkField };
      children?: {
        results?: PartnerLogoItemChild[];
      };
    };
  };
}

type InsurancePartnersProps = ComponentProps & {
  fields?: InsurancePartnersFields;
};

const DEFAULT_HEADING =
  'We work with 100s of insurance companies to help save you money';
const DEFAULT_CTA_TEXT = 'Learn more about who we work with';
const DEFAULT_CTA_HREF = '#';

/**
 * InsurancePartners component - two-column layout with heading and CTA on the left,
 * grid of partner logos on the right. White background, clean layout.
 * Supports Sitecore datasource with parent/children structure.
 */
export const Default: React.FC<InsurancePartnersProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing ?? false;

  const datasource = fields?.data?.datasource;
  const hasDatasource =
    Boolean(datasource) || Boolean(rendering?.dataSource);

  const heading =
    datasource?.heading?.jsonValue?.value ?? DEFAULT_HEADING;
  const ctaLink = datasource?.ctaLink?.jsonValue;
  const ctaHref =
    (ctaLink?.value?.href as string | undefined) ?? DEFAULT_CTA_HREF;
  const ctaText =
    (ctaLink?.value?.text as string | undefined) ?? DEFAULT_CTA_TEXT;

  const useContentSdkHeading = Boolean(datasource?.heading?.jsonValue);
  const useContentSdkCta = Boolean(ctaLink);

  const children = datasource?.children?.results ?? [];
  const logos =
    hasDatasource && children.length > 0
      ? children.map((child) => ({
          id: child.id ?? '',
          logoImage: child.logoImage?.jsonValue,
        }))
      : [];

  const showPlaceholder = !hasDatasource && isEditing;

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showPlaceholder ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">Add Insurance Partners datasource</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Heading and CTA */}
            <div className="flex flex-col gap-6">
              {useContentSdkHeading && datasource?.heading?.jsonValue ? (
                <ContentSdkText
                  tag="h2"
                  field={datasource.heading.jsonValue}
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight"
                />
              ) : (
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {heading}
                </h2>
              )}

              {useContentSdkCta && ctaLink ? (
                <ContentSdkLink
                  field={ctaLink as LinkField}
                  className="inline-flex items-center gap-2 text-base font-medium text-gray-900 underline hover:text-gray-700"
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </ContentSdkLink>
              ) : (
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-2 text-base font-medium text-gray-900 underline hover:text-gray-700"
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>

            {/* Right: Logo grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {logos.length > 0 ? (
                logos.map((logo, index) => (
                  <div
                    key={logo.id || `logo-${index}`}
                    className="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-center min-h-[80px]"
                  >
                    {logo.logoImage ? (
                      <ContentSdkImage
                        field={logo.logoImage as ImageField}
                        className="max-h-12 w-auto object-contain"
                        alt={
                          typeof logo.logoImage?.value?.alt === 'string'
                            ? logo.logoImage.value.alt
                            : 'Partner logo'
                        }
                      />
                    ) : (
                      <div className="h-12 w-24 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-400">Logo</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={`placeholder-${i}`}
                    className="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-center min-h-[80px]"
                  >
                    <div className="h-12 w-24 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-400">Logo</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
