'use client';

import type React from 'react';
import {
  Text as ContentSdkText,
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import type { Field, LinkField, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { Car, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PolicyCardItem {
  id?: string;
  providerName?: { jsonValue?: Field<string> };
  price?: { jsonValue?: Field<string> };
  priceLabel?: { jsonValue?: Field<string> };
  accentColor?: { jsonValue?: Field<string> };
  badgeText?: { jsonValue?: Field<string> };
  providerLogo?: { jsonValue?: ImageField };
}

interface PolicyRecommendationGridFields {
  data?: {
    datasource?: {
      heading?: { jsonValue?: Field<string> };
      progressText?: { jsonValue?: Field<string> };
      primaryCtaLink?: { jsonValue?: LinkField };
      primaryCtaText?: { jsonValue?: Field<string> };
      secondaryCtaLink?: { jsonValue?: LinkField };
      secondaryCtaText?: { jsonValue?: Field<string> };
      policyCards?: {
        targetItems?: PolicyCardItem[];
      };
    };
  };
}

type PolicyRecommendationGridProps = ComponentProps & {
  fields?: PolicyRecommendationGridFields;
};

const ACCENT_COLORS: Record<string, string> = {
  orange: 'border-orange-500 text-orange-500',
  purple: 'border-purple-500 text-purple-500',
  blue: 'border-confused-cta-blue text-confused-cta-blue',
  teal: 'border-confused-cta-teal text-confused-cta-teal',
};

const DEFAULT_HEADING = 'Recommended policies for BX22 KGY';
const DEFAULT_PROGRESS = '80% complete - see all quotes in under 2 mins!';
const DEFAULT_PRIMARY_CTA = 'Compare renewal quotes';
const DEFAULT_SECONDARY_CTA = 'View all car insurance quotes';
const DEFAULT_CARDS = [
  { providerName: 'nutshell', price: '£294', accentColor: 'orange' },
  {
    providerName: 'Policy Expert BRONZE',
    price: '£306',
    badgeText: 'Best rated',
    accentColor: 'purple',
  },
  { providerName: 'yoga LITE', price: '£312', accentColor: 'blue' },
];

function getAccentClass(color: string | undefined): string {
  if (!color) return ACCENT_COLORS.orange ?? '';
  const key = color.trim().toLowerCase();
  return ACCENT_COLORS[key] ?? ACCENT_COLORS.orange ?? '';
}

/**
 * PolicyRecommendationGrid - grid of policy cards with Compare/View all CTAs.
 * Uses Multilist (policyCards.targetItems).
 */
export const Default: React.FC<PolicyRecommendationGridProps> = (props) => {
  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing ?? false;

  const datasource = fields?.data?.datasource;
  const hasDatasource = Boolean(datasource);

  const heading =
    datasource?.heading?.jsonValue?.value ?? DEFAULT_HEADING;
  const progressText =
    datasource?.progressText?.jsonValue?.value ?? DEFAULT_PROGRESS;
  const primaryCtaText =
    datasource?.primaryCtaText?.jsonValue?.value ?? DEFAULT_PRIMARY_CTA;
  const secondaryCtaText =
    datasource?.secondaryCtaText?.jsonValue?.value ?? DEFAULT_SECONDARY_CTA;
  const primaryCtaLink = datasource?.primaryCtaLink?.jsonValue;
  const secondaryCtaLink = datasource?.secondaryCtaLink?.jsonValue;
  const primaryHref = (primaryCtaLink?.value?.href as string) ?? '#';
  const secondaryHref = (secondaryCtaLink?.value?.href as string) ?? '#';

  const targetItems = datasource?.policyCards?.targetItems ?? [];
  const cards =
    hasDatasource && targetItems.length > 0
      ? targetItems.map((item) => ({
          id: item.id ?? '',
          providerName: item.providerName?.jsonValue?.value ?? '',
          price: item.price?.jsonValue?.value ?? '',
          priceLabel: item.priceLabel?.jsonValue?.value ?? 'per year',
          accentColor: item.accentColor?.jsonValue?.value ?? 'orange',
          badgeText: item.badgeText?.jsonValue?.value ?? '',
          providerLogo: item.providerLogo?.jsonValue,
        }))
      : DEFAULT_CARDS.map((c, i) => ({
          id: `card-${i}`,
          providerName: c.providerName,
          price: c.price,
          priceLabel: 'per year',
          accentColor: c.accentColor,
          badgeText: (c as { badgeText?: string }).badgeText ?? '',
          providerLogo: undefined,
        }));

  const showPlaceholder = !hasDatasource && isEditing;

  if (showPlaceholder) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">Add PolicyRecommendationGrid datasource</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {datasource?.heading?.jsonValue ? (
        <ContentSdkText
          tag="h2"
          field={datasource.heading.jsonValue}
          className="text-xl font-bold text-white"
        />
      ) : (
        <h2 className="text-xl font-bold text-white">{heading}</h2>
      )}

      {/* Policy cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const accentClass = getAccentClass(card.accentColor);
          return (
            <div
              key={card.id}
              className={cn(
                'relative rounded-xl border-2 bg-gray-100 p-6',
                accentClass ? `border-t-4 ${accentClass.split(' ')[0]}` : 'border-gray-200'
              )}
            >
              {card.badgeText && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-purple-500 px-3 py-0.5 text-xs font-medium text-white">
                  + {card.badgeText}
                </span>
              )}
              <div className="flex flex-col gap-2">
                {card.providerLogo ? (
                  <div className="h-8 w-24">
                    <ContentSdkImage
                      field={card.providerLogo as ImageField}
                      className="max-h-8 w-auto object-contain"
                      alt={card.providerName}
                    />
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {card.providerName}
                  </p>
                )}
                <p
                  className={cn(
                    'text-2xl font-bold',
                    accentClass.includes('orange') && 'text-orange-500',
                    accentClass.includes('purple') && 'text-purple-500',
                    accentClass.includes('blue') && 'text-confused-cta-blue',
                    accentClass.includes('teal') && 'text-confused-cta-teal'
                  )}
                >
                  {card.price}
                </p>
                <p className="text-sm text-gray-600">{card.priceLabel}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress text */}
      <p className="text-sm text-white/90">{progressText}</p>

      {/* CTAs */}
      <div className="flex flex-wrap gap-3">
        {primaryCtaLink ? (
          <ContentSdkLink
            field={primaryCtaLink as LinkField}
            className="inline-flex items-center gap-2 rounded-lg bg-trustpilot-green px-6 py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Car className="h-5 w-5" aria-hidden />
            <span>{primaryCtaText}</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ContentSdkLink>
        ) : (
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 rounded-lg bg-trustpilot-green px-6 py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Car className="h-5 w-5" aria-hidden />
            <span>{primaryCtaText}</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
        {secondaryCtaLink ? (
          <ContentSdkLink
            field={secondaryCtaLink as LinkField}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-3 text-base font-medium text-white hover:bg-gray-500 transition-colors"
          >
            <Eye className="h-5 w-5" aria-hidden />
            <span>{secondaryCtaText}</span>
          </ContentSdkLink>
        ) : (
          <Link
            href={secondaryHref}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-3 text-base font-medium text-white hover:bg-gray-500 transition-colors"
          >
            <Eye className="h-5 w-5" aria-hidden />
            <span>{secondaryCtaText}</span>
          </Link>
        )}
      </div>
    </div>
  );
};
