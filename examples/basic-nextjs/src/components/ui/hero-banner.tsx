'use client';

import type React from 'react';
import {
  RichText as ContentSdkRichText,
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
} from '@sitecore-content-sdk/nextjs';
import type { LinkField, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { Car, Home, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface HeroBannerFields {
  Heading?: { value?: string };
  Cta1Link?: LinkField | { value?: { href?: string; text?: string } };
  Cta1Text?: { value?: string };
  Cta2Link?: LinkField | { value?: { href?: string; text?: string } };
  Cta2Text?: { value?: string };
  SecondaryLink?: LinkField | { value?: { href?: string; text?: string } };
  SecondaryLinkText?: { value?: string };
  Disclaimer?: { value?: string };
  RewardValueText?: { value?: string };
  RewardDescription?: { value?: string };
  RewardImage?: ImageField | { value?: { src?: string; alt?: string } };
  BrandsText?: { value?: string };
}

type HeroBannerProps = ComponentProps & {
  fields?: HeroBannerFields;
};

const DEFAULT_HEADING =
  'Get £20 to spend with 100+ brands plus year-round hot drinks when you buy car, home or van insurance*';
const DEFAULT_CTA1_TEXT = 'Get a car quote';
const DEFAULT_CTA2_TEXT = 'Get a home quote';
const DEFAULT_SECONDARY_TEXT = 'View my recent quotes';
const DEFAULT_DISCLAIMER =
  '*Single annual policy. Qualifying products. App only. Maximum claim limit. One regular hot drink per month for a year, only available via the Confused.com app. T&Cs apply.';
const DEFAULT_REWARD_VALUE = '£20';
const DEFAULT_REWARD_DESCRIPTION = 'plus FREE Greggs hot drinks';
const DEFAULT_BRANDS_TEXT = 'choose from Over 100 brands when you buy insurance*';

/**
 * HeroBanner component styled after Confused.com rewards - two-column layout with
 * heading, CTAs, disclaimer (left) and reward visual (right). Supports Sitecore
 * datasource with fallback to static content for disconnected demo.
 */
export const Default: React.FC<HeroBannerProps> = (props) => {
  const { fields } = props;

  const heading = fields?.Heading?.value ?? DEFAULT_HEADING;
  const cta1Text = fields?.Cta1Text?.value ?? DEFAULT_CTA1_TEXT;
  const cta2Text = fields?.Cta2Text?.value ?? DEFAULT_CTA2_TEXT;
  const secondaryText = fields?.SecondaryLinkText?.value ?? DEFAULT_SECONDARY_TEXT;
  const disclaimer = fields?.Disclaimer?.value ?? DEFAULT_DISCLAIMER;
  const rewardValue = fields?.RewardValueText?.value ?? DEFAULT_REWARD_VALUE;
  const rewardDescription = fields?.RewardDescription?.value ?? DEFAULT_REWARD_DESCRIPTION;
  const brandsText = fields?.BrandsText?.value ?? DEFAULT_BRANDS_TEXT;

  const cta1Href = fields?.Cta1Link?.value?.href ?? '#';
  const cta2Href = fields?.Cta2Link?.value?.href ?? '#';
  const secondaryHref = fields?.SecondaryLink?.value?.href ?? '#';

  const useContentSdkHeading = Boolean(fields?.Heading);
  const useContentSdkCta1 = Boolean(fields?.Cta1Link);
  const useContentSdkCta2 = Boolean(fields?.Cta2Link);
  const useContentSdkSecondary = Boolean(fields?.SecondaryLink);
  const useContentSdkDisclaimer = Boolean(fields?.Disclaimer);
  const useContentSdkImage = Boolean(fields?.RewardImage?.value?.src);

  return (
    <section className="bg-confused-dark text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Heading, CTAs, disclaimer */}
          <div className="flex flex-col gap-6">
            <div
              className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white"
              role="heading"
              aria-level={1}
            >
              {useContentSdkHeading && fields?.Heading ? (
                <ContentSdkRichText field={fields.Heading} className="[&_*]:text-white [&_*]:font-bold [&_p]:mb-0" />
              ) : (
                heading
              )}
            </div>

            <div className="flex flex-col gap-3">
              {useContentSdkCta1 && fields?.Cta1Link ? (
                <ContentSdkLink
                  field={fields.Cta1Link as LinkField}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-confused-cta-blue px-6 py-3.5 text-base font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <Car className="h-5 w-5" aria-hidden />
                  <span>{cta1Text}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </ContentSdkLink>
              ) : (
                <Link
                  href={cta1Href}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-confused-cta-blue px-6 py-3.5 text-base font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <Car className="h-5 w-5" aria-hidden />
                  <span>{cta1Text}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              )}

              {useContentSdkCta2 && fields?.Cta2Link ? (
                <ContentSdkLink
                  field={fields.Cta2Link as LinkField}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-confused-cta-teal px-6 py-3.5 text-base font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <Home className="h-5 w-5" aria-hidden />
                  <span>{cta2Text}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </ContentSdkLink>
              ) : (
                <Link
                  href={cta2Href}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-confused-cta-teal px-6 py-3.5 text-base font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <Home className="h-5 w-5" aria-hidden />
                  <span>{cta2Text}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>

            {useContentSdkSecondary && fields?.SecondaryLink ? (
              <ContentSdkLink
                field={fields.SecondaryLink as LinkField}
                className="inline-flex items-center gap-2 text-sm font-medium text-white underline hover:text-white/80"
              >
                <span>{secondaryText}</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ContentSdkLink>
            ) : (
              <Link
                href={secondaryHref}
                className="inline-flex items-center gap-2 text-sm font-medium text-white underline hover:text-white/80"
              >
                <span>{secondaryText}</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}

            {useContentSdkDisclaimer && fields?.Disclaimer ? (
              <div className="text-xs text-white/90 [&_*]:text-white/90">
                <ContentSdkRichText field={fields.Disclaimer} />
              </div>
            ) : (
              <p className="text-xs text-white/90">{disclaimer}</p>
            )}
          </div>

          {/* Right: Reward visual */}
          <div className="relative flex flex-col items-center lg:items-end gap-6">
            <div className="rounded-full bg-confused-reward-yellow px-8 py-6 text-center">
              <p className="text-3xl font-bold text-black">{rewardValue}</p>
              <p className="text-sm font-medium text-black mt-1">{rewardDescription}</p>
            </div>

            {useContentSdkImage && fields?.RewardImage?.value?.src ? (
              <div className="relative w-full max-w-sm aspect-square">
                <ContentSdkImage
                  field={fields.RewardImage as ImageField}
                  alt={typeof fields.RewardImage?.value?.alt === 'string' ? fields.RewardImage.value.alt : 'Rewards'}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-full max-w-sm aspect-square rounded-lg bg-white/10 flex items-center justify-center">
                <p className="text-white/60 text-sm">Reward image placeholder</p>
              </div>
            )}

            <p className="text-sm text-white/90 text-center lg:text-right">
              {brandsText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
