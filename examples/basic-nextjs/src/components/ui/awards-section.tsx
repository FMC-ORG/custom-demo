'use client';

import type React from 'react';
import { Award, Star, Trophy, type LucideIcon } from 'lucide-react';
import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Icon name to Lucide component mapping for Sitecore-driven icon selection
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  Star,
  Trophy,
};

/**
 * Default awards when no datasource is configured (development fallback)
 */
const DEFAULT_AWARDS = [
  {
    id: '1',
    topText: 'May 2025',
    title: 'Which?',
    subtitle: 'Best Buy',
    bottomText: 'Travel Insurance',
    detail: 'Standard & Plus',
    icon: 'Award',
  },
  {
    id: '2',
    topText: 'Winner',
    title: 'British Travel',
    subtitle: 'Awards 2024',
    bottomText: 'Best Cruise Line',
    detail: 'for Luxury Holidays',
    icon: 'Trophy',
  },
  {
    id: '3',
    topText: 'March 2025',
    title: 'Which?',
    subtitle: 'Recommended',
    bottomText: 'Provider',
    detail: 'Ocean Cruises',
    icon: 'Award',
  },
  {
    id: '4',
    topText: 'British Travel',
    title: 'Awards 2024',
    subtitle: 'Winner',
    bottomText: '19 Awards',
    detail: '',
    icon: 'Star',
  },
  {
    id: '5',
    topText: 'Silver Travel',
    title: 'Awards 2024',
    subtitle: 'Winner',
    bottomText: '',
    detail: '',
    icon: 'Trophy',
  },
];

/**
 * AwardItem child item structure (from Sitecore datasource)
 */
interface AwardItem {
  id: string;
  topText?: { jsonValue?: Field<string> };
  title?: { jsonValue?: Field<string> };
  subtitle?: { jsonValue?: Field<string> };
  bottomText?: { jsonValue?: Field<string> };
  detail?: { jsonValue?: Field<string> };
  icon?: { jsonValue?: Field<string> };
}

/**
 * AwardsSection component parameters
 */
interface AwardsSectionParams {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * AwardsSection fields structure (GraphQL: children inside datasource)
 */
interface AwardsSectionFields {
  data?: {
    datasource?: {
      sectionTitle?: { jsonValue?: Field<string> };
      sectionDescription?: { jsonValue?: Field<string> };
      children?: {
        results?: AwardItem[];
      };
    };
  };
}

/**
 * AwardsSection component props
 */
interface AwardsSectionProps extends ComponentProps {
  params: AwardsSectionParams;
  fields: AwardsSectionFields;
  isPageEditing?: boolean;
}

/**
 * AwardsSection component implementation
 * Renders a strip of award badges with icon, title, subtitle, and detail.
 * Uses Sitecore datasource when available; falls back to default awards when not.
 */
const AwardsSectionComponent: React.FC<AwardsSectionProps> = (props) => {
  const { fields, isPageEditing } = props;
  const { data } = fields || {};
  const { datasource } = data || {};
  const items = datasource?.children?.results || [];

  const hasSitecoreItems = items.length > 0;
  const hasDatasource = !!data?.datasource;
  const fallbackAwards =
    !hasSitecoreItems && !hasDatasource && !isPageEditing ? DEFAULT_AWARDS : [];

  const displayItems = hasSitecoreItems ? items : fallbackAwards;

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-1 h-8 bg-saga-teal rounded-full mt-1 flex-shrink-0" />
          {hasDatasource && (datasource?.sectionTitle?.jsonValue?.value || isPageEditing) ? (
            <Text
              field={datasource?.sectionTitle?.jsonValue}
              tag="h2"
              className="text-2xl md:text-3xl font-bold text-saga-navy text-balance"
            />
          ) : (
            <h2 className="text-2xl md:text-3xl font-bold text-saga-navy text-balance">
              Award-winning service you can trust
            </h2>
          )}
        </div>
        {hasDatasource && (datasource?.sectionDescription?.jsonValue?.value || isPageEditing) ? (
          <Text
            field={datasource?.sectionDescription?.jsonValue}
            tag="p"
            className="text-sm md:text-base text-saga-navy/70 mb-10 ml-4 max-w-xl"
          />
        ) : (
          <p className="text-sm md:text-base text-saga-navy/70 mb-10 ml-4 max-w-xl">
            We are delighted that our dedication to providing our customers with products and
            services tailored to them has been recognised through a variety of awards and reviews.
          </p>
        )}

        {/* Awards strip */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 via-amber-50/50 to-rose-50 py-10 px-6">
          {!hasSitecoreItems && isPageEditing ? (
            <div className="text-center text-muted-foreground py-8">
              No awards configured. Add AwardItem items as children.
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {displayItems.map((award) => {
                const isSitecoreItem = hasSitecoreItems;
                const iconName = isSitecoreItem
                  ? (award as AwardItem)?.icon?.jsonValue?.value ?? 'Award'
                  : (award as (typeof DEFAULT_AWARDS)[0]).icon;
                const IconComponent = ICON_MAP[iconName] ?? Award;

                return (
                  <div
                    key={isSitecoreItem ? (award as AwardItem).id : (award as (typeof DEFAULT_AWARDS)[0]).id}
                    className="flex flex-col items-center text-center gap-1.5"
                  >
                    <div className="h-20 w-20 rounded-full border-2 border-saga-navy/20 flex flex-col items-center justify-center bg-background shadow-sm gap-0.5">
                      {isSitecoreItem ? (
                        <>
                          <IconComponent className="h-4 w-4 text-saga-navy/50 shrink-0" strokeWidth={1.5} aria-hidden />
                          {((award as AwardItem)?.topText?.jsonValue?.value || isPageEditing) && (
                            <Text
                              field={(award as AwardItem).topText?.jsonValue}
                              tag="span"
                              className="text-[8px] text-saga-navy/50 uppercase font-semibold leading-none"
                            />
                          )}
                          {((award as AwardItem)?.title?.jsonValue?.value || isPageEditing) && (
                            <Text
                              field={(award as AwardItem).title?.jsonValue}
                              tag="span"
                              className="text-sm font-extrabold text-saga-navy leading-tight"
                            />
                          )}
                          {((award as AwardItem)?.subtitle?.jsonValue?.value || isPageEditing) && (
                            <Text
                              field={(award as AwardItem).subtitle?.jsonValue}
                              tag="span"
                              className="text-[10px] font-bold text-saga-navy leading-none"
                            />
                          )}
                          {((award as AwardItem)?.bottomText?.jsonValue?.value || isPageEditing) && (
                            <Text
                              field={(award as AwardItem).bottomText?.jsonValue}
                              tag="span"
                              className="text-[8px] text-saga-navy/50 uppercase leading-none"
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <IconComponent className="h-4 w-4 text-saga-navy/50 shrink-0" strokeWidth={1.5} aria-hidden />
                          <span className="text-[8px] text-saga-navy/50 uppercase font-semibold leading-none">
                            {(award as (typeof DEFAULT_AWARDS)[0]).topText}
                          </span>
                          <span className="text-sm font-extrabold text-saga-navy leading-tight">
                            {(award as (typeof DEFAULT_AWARDS)[0]).title}
                          </span>
                          <span className="text-[10px] font-bold text-saga-navy leading-none">
                            {(award as (typeof DEFAULT_AWARDS)[0]).subtitle}
                          </span>
                          {(award as (typeof DEFAULT_AWARDS)[0]).bottomText && (
                            <span className="text-[8px] text-saga-navy/50 uppercase leading-none">
                              {(award as (typeof DEFAULT_AWARDS)[0]).bottomText}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {isSitecoreItem ? (
                      ((award as AwardItem)?.detail?.jsonValue?.value || isPageEditing) && (
                        <Text
                          field={(award as AwardItem).detail?.jsonValue}
                          tag="span"
                          className="text-xs text-saga-navy/60 font-medium"
                        />
                      )
                    ) : (
                      (award as (typeof DEFAULT_AWARDS)[0]).detail && (
                        <span className="text-xs text-saga-navy/60 font-medium">
                          {(award as (typeof DEFAULT_AWARDS)[0]).detail}
                        </span>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * Default export for Sitecore component registration
 */
export const Default: React.FC<AwardsSectionProps> = (props) => {
  const { page } = useSitecore();
  const isPageEditing = props.isPageEditing ?? page.mode.isEditing;
  return <AwardsSectionComponent {...props} isPageEditing={isPageEditing} />;
};
