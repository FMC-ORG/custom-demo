'use client';

import type React from 'react';
import Link from 'next/link';
import { Text, Image as SitecoreImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { CheckCircle2 } from 'lucide-react';

/**
 * TrustPoint child item structure
 */
interface TrustPointItem {
  id: string;
  title?: { jsonValue?: Field<string> };
  description?: { jsonValue?: Field<string> };
}

/**
 * TrustSection component parameters
 */
interface TrustSectionParams {
  [key: string]: any; // eslint-disable-line
}

/**
 * TrustSection fields structure (GraphQL: children are inside datasource)
 */
interface TrustSectionFields {
  data?: {
    datasource?: {
      sectionTitle?: { jsonValue?: Field<string> };
      sectionSubtitle?: { jsonValue?: Field<string> };
      ctaLink?: { jsonValue?: LinkField };
      image?: { jsonValue?: ImageField };
      children?: {
        results?: TrustPointItem[];
      };
    };
  };
}

/**
 * TrustSection component props
 */
interface TrustSectionProps extends ComponentProps {
  params: TrustSectionParams;
  fields: TrustSectionFields;
  isPageEditing?: boolean;
}

/**
 * TrustSection component implementation
 * @param {TrustSectionProps} props - Component props from XM Cloud datasource
 * @returns {JSX.Element} The rendered trust section component
 */
const TrustSectionComponent: React.FC<TrustSectionProps> = (props) => {
  const { fields, isPageEditing } = props;
  const { data } = fields || {};
  const { datasource } = data || {};
  const points = datasource?.children?.results || [];
  

  if (!data?.datasource && !isPageEditing) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            TrustSection: No datasource configured
          </div>
        </div>
      </section>
    );
  }

  const ctaHref = datasource?.ctaLink?.jsonValue?.value?.href ?? '#';
  const ctaText = datasource?.ctaLink?.jsonValue?.value?.text ?? 'Learn more about Saga';

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-1 h-8 bg-saga-teal rounded-full mt-1 flex-shrink-0" />
          {(datasource?.sectionTitle?.jsonValue?.value || isPageEditing) && (
            <Text
              field={datasource?.sectionTitle?.jsonValue}
              tag="h2"
              className="text-2xl md:text-3xl font-bold text-saga-navy text-balance"
            />
          )}
        </div>
        {(datasource?.sectionSubtitle?.jsonValue?.value || isPageEditing) && (
          <Text
            field={datasource?.sectionSubtitle?.jsonValue}
            tag="p"
            className="text-base md:text-lg text-saga-navy/70 mb-8 ml-4"
          />
        )}

        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          {/* Trust points */}
          <div className="flex-1">
            <div className="flex flex-col gap-6">
              {points.map((point) => (
                <div key={point.id} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    {(point.title?.jsonValue?.value || isPageEditing) && (
                      <Text
                        field={point.title?.jsonValue}
                        tag="h3"
                        className="font-bold text-saga-navy text-base"
                      />
                    )}
                    {(point.description?.jsonValue?.value || isPageEditing) && (
                      <Text
                        field={point.description?.jsonValue}
                        tag="p"
                        className="mt-1 text-sm text-saga-navy/70 leading-relaxed"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Link
              href={ctaHref}
              className="mt-8 inline-block rounded-md bg-saga-navy px-6 py-3 text-sm font-semibold text-white hover:bg-saga-dark-navy transition-colors"
            >
              {ctaText}
            </Link>
          </div>

          {/* Image */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative h-72 md:h-96 rounded-xl overflow-hidden">
              {(datasource?.image?.jsonValue?.value?.src || isPageEditing) && (
                <SitecoreImage
                  field={datasource?.image?.jsonValue}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Default TrustSection export with page editing mode
 */
export const Default: React.FC<TrustSectionProps> = (props) => {
  const { page } = useSitecore();
  const isPageEditing = props.isPageEditing ?? page.mode.isEditing;
  return <TrustSectionComponent {...props} isPageEditing={isPageEditing} />;
};
