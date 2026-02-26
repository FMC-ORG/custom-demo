'use client';

import type React from 'react';
import {
  Link as ContentSdkLink,
  Text as ContentSdkText,
  NextImage as ContentSdkImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import type { LinkField, Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PartnerLogoChild {
  id?: string;
  logoImage?: { jsonValue?: ImageField };
}

interface RewardOfferCardFields {
  data?: {
    datasource?: {
      headline?: { jsonValue?: Field<string> };
      rewardAmount?: { jsonValue?: Field<string> };
      ctaLink?: { jsonValue?: LinkField };
      ctaText?: { jsonValue?: Field<string> };
      children?: {
        results?: PartnerLogoChild[];
      };
    };
  };
}

type RewardOfferCardProps = ComponentProps & {
  fields?: RewardOfferCardFields;
};

const DEFAULT_HEADLINE =
  'Get £20 + free Greggs hot drinks when you buy car, home or van insurance*';
const DEFAULT_REWARD_AMOUNT = '£20 reward';
const DEFAULT_CTA_TEXT = 'Claim your reward';

/**
 * RewardOfferCard - £20 reward card with partner logos and CTA.
 * Uses parent/children datasource (children = partner logos).
 */
export const Default: React.FC<RewardOfferCardProps> = (props) => {
  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing ?? false;

  const datasource = fields?.data?.datasource;
  const hasDatasource = Boolean(datasource);

  const headline = datasource?.headline?.jsonValue?.value ?? DEFAULT_HEADLINE;
  const rewardAmount =
    datasource?.rewardAmount?.jsonValue?.value ?? DEFAULT_REWARD_AMOUNT;
  const ctaLink = datasource?.ctaLink?.jsonValue;
  const ctaText =
    datasource?.ctaText?.jsonValue?.value ?? DEFAULT_CTA_TEXT;
  const ctaHref = (ctaLink?.value?.href as string | undefined) ?? '#';

  const children = datasource?.children?.results ?? [];
  const partnerLogos =
    hasDatasource && children.length > 0
      ? children.map((child) => ({
          id: child.id ?? '',
          logoImage: child.logoImage?.jsonValue,
        }))
      : [];

  const showPlaceholder = !hasDatasource && isEditing;

  if (showPlaceholder) {
    return (
      <div className="rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-6 text-center">
        <p className="text-white/60 text-sm">Add RewardOfferCard datasource</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-confused-container p-6 text-white">
      <div className="flex flex-col items-center gap-6">
        {/* Reward amount circle */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-confused-reward-yellow">
          <span className="text-center text-lg font-bold text-gray-900">
            {datasource?.rewardAmount?.jsonValue ? (
              <ContentSdkText
                tag="span"
                field={datasource.rewardAmount.jsonValue}
                className="block"
              />
            ) : (
              rewardAmount
            )}
          </span>
        </div>

        {/* Headline */}
        {datasource?.headline?.jsonValue ? (
          <ContentSdkText
            tag="p"
            field={datasource.headline.jsonValue}
            className="text-center text-sm text-white/90"
          />
        ) : (
          <p className="text-center text-sm text-white/90">{headline}</p>
        )}

        {/* Partner logos */}
        {partnerLogos.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {partnerLogos.map((partner, index) => {
              const imageField = partner.logoImage;
              const alt =
                typeof imageField?.value?.alt === 'string'
                  ? imageField.value.alt
                  : 'Partner logo';
              return (
                <div
                  key={partner.id || `logo-${index}`}
                  className="flex h-10 w-16 items-center justify-center"
                >
                  {imageField ? (
                    <ContentSdkImage
                      field={imageField as ImageField}
                      className="max-h-10 w-auto object-contain"
                      alt={alt}
                    />
                  ) : (
                    <div className="h-8 w-12 rounded bg-white/10" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        {datasource?.ctaLink?.jsonValue ? (
          <ContentSdkLink
            field={datasource.ctaLink.jsonValue as LinkField}
            className="inline-flex items-center gap-2 rounded-lg bg-confused-reward-yellow px-6 py-3 text-sm font-semibold text-gray-900 hover:opacity-90 transition-opacity"
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ContentSdkLink>
        ) : (
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-lg bg-confused-reward-yellow px-6 py-3 text-sm font-semibold text-gray-900 hover:opacity-90 transition-opacity"
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
};
