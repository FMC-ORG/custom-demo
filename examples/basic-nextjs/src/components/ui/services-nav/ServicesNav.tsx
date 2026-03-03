'use client';

import type React from 'react';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Field,
  ImageField,
  LinkField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceItemChild {
  id: string;
  itemLabel?: { jsonValue?: Field<string> };
  serviceLink?: { jsonValue?: LinkField };
}

interface ServicesNavFields {
  data?: {
    datasource?: {
      backgroundImage?: { jsonValue?: ImageField };
      sectionHeadline?: { jsonValue?: Field<string> };
      children?: {
        results?: ServiceItemChild[];
      };
    };
  };
}

interface ServicesNavProps extends ComponentProps {
  params: { [key: string]: string };
  fields?: ServicesNavFields;
}

/**
 * ServicesNav — dark background image with a statement headline, followed by
 * a white 4-column grid of service cells. Each cell shows a service label + arrow link.
 */
export const Default: React.FC<ServicesNavProps> = (props) => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource;
  const bgImage = datasource?.backgroundImage?.jsonValue;
  const headline = datasource?.sectionHeadline?.jsonValue;
  const services = datasource?.children?.results ?? [];

  const hasContent =
    bgImage?.value?.src || headline?.value || services.length > 0 || isEditing;

  if (!datasource || !hasContent) {
    return (
      <section
        className={cn('services-nav', styles)}
        id={id}
        data-testid="services-nav"
      >
        <div className="py-16 text-center">
          <span className="is-empty-hint text-muted-foreground">ServicesNav — add service children</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn('services-nav', styles)}
      id={id}
      data-testid="services-nav"
    >
      {/* Dark background image area with headline — render image in edit mode even when empty */}
      <div className="relative overflow-hidden" style={{ minHeight: '320px' }}>
        {(bgImage?.value?.src || (isEditing && bgImage)) && bgImage ? (
          <ContentSdkImage
            field={bgImage}
            fill
            className="object-cover"
            alt={(bgImage?.value?.alt ?? '') as string}
          />
        ) : (
          <div className="absolute inset-0 bg-vg-dark" />
        )}
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Headline */}
        {(headline?.value || (isEditing && headline)) && headline && (
          <div className="relative z-10 flex items-center justify-center h-full min-h-[320px] px-6 py-16">
            <div className="field-sectionheadline text-2xl md:text-3xl font-bold text-white text-center max-w-3xl mx-auto">
              <ContentSdkRichText field={headline} />
            </div>
          </div>
        )}
      </div>

      {/* White service grid */}
      <div className="bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const label = service.itemLabel?.jsonValue;
            const link = service.serviceLink?.jsonValue;

            return (
              <div
                key={service.id}
                className={cn(
                  'relative border border-vg-border p-6 min-h-[130px] flex flex-col justify-between',
                  'hover:bg-vg-surface transition-colors group'
                )}
              >
                {(label?.value || (isEditing && label)) && label && (
                  <span className="text-sm font-semibold text-[#1d4ed8] block field-itemlabel">
                    {label.value}
                  </span>
                )}
                {(link?.value?.href || (isEditing && link)) && link && (
                  <ContentSdkLink
                    field={link}
                    editable={isEditing}
                    className="absolute bottom-4 right-4 text-[#1d4ed8] text-sm"
                    aria-label={label?.value ?? 'Service link'}
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </ContentSdkLink>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
