'use client';

import type React from 'react';
import Link from 'next/link';
import { Text, Image as SitecoreImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Default layout service sends fields with PascalCase keys and .value
 * (no GraphQL query on rendering = no data.datasource / jsonValue wrapper)
 */
interface TravelInsuranceBannerFields {
  Title?: { value?: string };
  Description?: { value?: string };
  BackgroundImage?: { value?: { src?: string; alt?: string } };
  CtaLink?: { value?: { href?: string; text?: string } };
  BadgeMonthYear?: { value?: string };
  BadgeTitle?: { value?: string };
  BadgeSubtitle?: { value?: string };
  BadgeCategory?: { value?: string };
  BadgeLabel?: { value?: string };
}

interface TravelInsuranceBannerParams {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface TravelInsuranceBannerProps extends ComponentProps {
  params: TravelInsuranceBannerParams;
  fields: TravelInsuranceBannerFields;
  isPageEditing?: boolean;
}

const TravelInsuranceBannerComponent: React.FC<TravelInsuranceBannerProps> = (props) => {
  const { fields, isPageEditing } = props;
  const title = fields?.Title?.value;
  const description = fields?.Description?.value;
  const backgroundImage = fields?.BackgroundImage?.value;
  const ctaLink = fields?.CtaLink?.value;
  const ctaHref = ctaLink?.href || '#';
  const ctaText = ctaLink?.text || 'Get your quote today';
  const badgeMonthYear = fields?.BadgeMonthYear?.value;
  const badgeTitle = fields?.BadgeTitle?.value;
  const badgeSubtitle = fields?.BadgeSubtitle?.value;
  const badgeCategory = fields?.BadgeCategory?.value;
  const badgeLabel = fields?.BadgeLabel?.value;

  const hasContent =
    title ||
    description ||
    backgroundImage?.src ||
    ctaLink?.href ||
    badgeMonthYear ||
    badgeTitle ||
    badgeSubtitle ||
    badgeCategory ||
    badgeLabel;

  if (!hasContent && !isPageEditing) {
    return (
      <section className="relative overflow-hidden">
        <div className="relative h-[400px] md:h-[350px] flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">Travel Insurance Banner: No datasource configured</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="relative h-[400px] md:h-[350px]">
        {(backgroundImage?.src || isPageEditing) && fields.BackgroundImage && (
          <SitecoreImage
            field={fields.BackgroundImage}
            alt={backgroundImage?.alt || 'Beach chairs on a tropical beach at sunset'}
            fill
            className="object-cover"
          />
        )}
        {/* Overlay tint */}
        <div className="absolute inset-0 bg-saga-navy/40" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Left card */}
              <div className="bg-background/95 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-md shadow-lg">
                {(title || isPageEditing) && (
                  <Text
                    field={fields.Title}
                    tag="h2"
                    className="text-xl md:text-2xl font-bold text-saga-navy"
                  />
                )}
                {(description || isPageEditing) && (
                  <Text
                    field={fields.Description}
                    tag="p"
                    className="mt-3 text-sm text-saga-navy/80 leading-relaxed"
                  />
                )}
                {(ctaLink?.href || ctaText || isPageEditing) && (
                  <Link
                    href={ctaHref}
                    className="mt-5 inline-block rounded-md bg-saga-navy px-6 py-3 text-sm font-semibold text-white hover:bg-saga-dark-navy transition-colors"
                  >
                    {ctaText}
                  </Link>
                )}
              </div>

              {/* Right badge */}
              <div className="hidden md:flex flex-col items-center gap-2">
                {(badgeMonthYear || badgeTitle || badgeSubtitle || badgeCategory || isPageEditing) && (
                  <div className="bg-background rounded-full h-28 w-28 flex flex-col items-center justify-center shadow-lg">
                    {(badgeMonthYear || isPageEditing) && (
                      <Text
                        field={fields.BadgeMonthYear}
                        tag="span"
                        className="text-[10px] font-bold text-saga-navy uppercase"
                      />
                    )}
                    {(badgeTitle || isPageEditing) && (
                      <Text
                        field={fields.BadgeTitle}
                        tag="span"
                        className="text-lg font-extrabold text-saga-navy leading-tight"
                      />
                    )}
                    {(badgeSubtitle || isPageEditing) && (
                      <Text
                        field={fields.BadgeSubtitle}
                        tag="span"
                        className="text-xs font-bold text-saga-navy"
                      />
                    )}
                    {(badgeCategory || isPageEditing) && (
                      <Text
                        field={fields.BadgeCategory}
                        tag="span"
                        className="text-[9px] text-saga-navy/60 uppercase mt-0.5"
                      />
                    )}
                  </div>
                )}
                {(badgeLabel || isPageEditing) && (
                  <Text
                    field={fields.BadgeLabel}
                    tag="span"
                    className="text-sm font-semibold text-white"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Default export for Sitecore component registration
 */
export const Default: React.FC<TravelInsuranceBannerProps> = (props) => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  return <TravelInsuranceBannerComponent {...props} isPageEditing={isPageEditing} />;
};
