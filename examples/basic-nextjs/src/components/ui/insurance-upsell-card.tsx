'use client';

import type React from 'react';
import {
  Text as ContentSdkText,
  Link as ContentSdkLink,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { Home, Clock, Building2, Tag, Check } from 'lucide-react';
import Link from 'next/link';

interface FeatureChild {
  id?: string;
  featureText?: { jsonValue?: Field<string> };
  featureLabel?: { jsonValue?: Field<string> };
  featureIcon?: { jsonValue?: Field<string> };
}

interface InsuranceUpsellCardFields {
  data?: {
    datasource?: {
      badgeText?: { jsonValue?: Field<string> };
      title?: { jsonValue?: Field<string> };
      headline?: { jsonValue?: Field<string> };
      ctaLink?: { jsonValue?: LinkField };
      ctaText?: { jsonValue?: Field<string> };
      savingAmount?: { jsonValue?: Field<string> };
      savingLabel?: { jsonValue?: Field<string> };
      coveredItems?: { jsonValue?: Field<string> };
      children?: {
        results?: FeatureChild[];
      };
    };
  };
}

type InsuranceUpsellCardProps = ComponentProps & {
  fields?: InsuranceUpsellCardFields;
};

const DEFAULT_BADGE = 'RECOMMENDED FOR YOU';
const DEFAULT_TITLE = 'Home insurance';
const DEFAULT_HEADLINE = "Protect your home while you're here";
const DEFAULT_CTA_TEXT = 'Bundle & save';
const DEFAULT_SAVING_AMOUNT = '£129';
const DEFAULT_SAVING_LABEL =
  'per year vs. auto-renewal on home insurance';
const DEFAULT_FEATURES = [
  { text: 'Takes just 2 minutes', label: 'Quick' },
  { text: 'Insurers compared', label: '60+' },
  { text: 'Prices from', label: '£8/mo' },
];
const DEFAULT_COVERED =
  'Buildings cover|Contents cover|Accidental damage|Legal expenses|Home emergency|Personal possessions';

const FEATURE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  Building2,
  Tag,
};

function getFeatureIcon(iconName: string | undefined) {
  if (!iconName) return Clock;
  const key = iconName.trim();
  return FEATURE_ICONS[key] ?? Clock;
}

/**
 * InsuranceUpsellCard - upsell/hero card for home insurance.
 * Uses parent/children for features; coveredItems as pipe-separated text.
 */
export const Default: React.FC<InsuranceUpsellCardProps> = (props) => {
  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing ?? false;

  const datasource = fields?.data?.datasource;
  const hasDatasource = Boolean(datasource);

  const badgeText =
    datasource?.badgeText?.jsonValue?.value ?? DEFAULT_BADGE;
  const title = datasource?.title?.jsonValue?.value ?? DEFAULT_TITLE;
  const headline =
    datasource?.headline?.jsonValue?.value ?? DEFAULT_HEADLINE;
  const ctaText = datasource?.ctaText?.jsonValue?.value ?? DEFAULT_CTA_TEXT;
  const savingAmount =
    datasource?.savingAmount?.jsonValue?.value ?? DEFAULT_SAVING_AMOUNT;
  const savingLabel =
    datasource?.savingLabel?.jsonValue?.value ?? DEFAULT_SAVING_LABEL;
  const coveredItemsRaw =
    datasource?.coveredItems?.jsonValue?.value ?? DEFAULT_COVERED;
  const coveredItems = coveredItemsRaw.split('|').map((s) => s.trim()).filter(Boolean);

  const ctaLink = datasource?.ctaLink?.jsonValue;
  const ctaHref = (ctaLink?.value?.href as string | undefined) ?? '#';

  const children = datasource?.children?.results ?? [];
  const features =
    hasDatasource && children.length > 0
      ? children.map((child) => ({
          id: child.id ?? '',
          text: child.featureText?.jsonValue?.value ?? '',
          label: child.featureLabel?.jsonValue?.value ?? '',
          iconName: child.featureIcon?.jsonValue?.value ?? 'Clock',
        }))
      : DEFAULT_FEATURES.map((f, i) => ({
          id: `feature-${i}`,
          text: f.text,
          label: f.label,
          iconName: 'Clock',
        }));

  const showPlaceholder = !hasDatasource && isEditing;

  if (showPlaceholder) {
    return (
      <div className="rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-8 text-center">
        <p className="text-white/60">Add InsuranceUpsellCard datasource</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-confused-container p-6 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <Home className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <span className="inline-block rounded-full bg-trustpilot-green/20 px-3 py-0.5 text-xs font-semibold text-trustpilot-green mb-1">
              {datasource?.badgeText?.jsonValue ? (
                <ContentSdkText
                  tag="span"
                  field={datasource.badgeText.jsonValue}
                  className="uppercase"
                />
              ) : (
                badgeText
              )}
            </span>
            {datasource?.title?.jsonValue ? (
              <ContentSdkText
                tag="h3"
                field={datasource.title.jsonValue}
                className="text-lg font-semibold"
              />
            ) : (
              <h3 className="text-lg font-semibold">{title}</h3>
            )}
          </div>
        </div>
        {datasource?.ctaLink?.jsonValue ? (
          <ContentSdkLink
            field={datasource.ctaLink.jsonValue as LinkField}
            className="shrink-0 rounded-lg bg-trustpilot-green px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            {ctaText}
          </ContentSdkLink>
        ) : (
          <Link
            href={ctaHref}
            className="shrink-0 rounded-lg bg-trustpilot-green px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            {ctaText}
          </Link>
        )}
      </div>

      {/* Headline */}
      {datasource?.headline?.jsonValue ? (
        <ContentSdkText
          tag="h4"
          field={datasource.headline.jsonValue}
          className="text-xl font-bold mb-6"
        />
      ) : (
        <h4 className="text-xl font-bold mb-6">{headline}</h4>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Saving + Features */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs text-white/70 uppercase tracking-wide mb-1">
              AVERAGE SAVING
            </p>
            <p className="text-3xl font-bold">
              {datasource?.savingAmount?.jsonValue ? (
                <ContentSdkText
                  tag="span"
                  field={datasource.savingAmount.jsonValue}
                />
              ) : (
                savingAmount
              )}
            </p>
            {datasource?.savingLabel?.jsonValue ? (
              <ContentSdkText
                tag="p"
                field={datasource.savingLabel.jsonValue}
                className="text-sm text-white/80 mt-1"
              />
            ) : (
              <p className="text-sm text-white/80 mt-1">{savingLabel}</p>
            )}
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {features.map((feature) => {
              const IconComponent = getFeatureIcon(feature.iconName);
              return (
                <div
                  key={feature.id}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2"
                >
                  <IconComponent className="h-4 w-4 text-white/80" aria-hidden />
                  <span className="text-sm">{feature.text}</span>
                  {feature.label && (
                    <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-medium">
                      {feature.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: What's covered */}
        <div>
          <p className="text-xs text-white/70 uppercase tracking-wide mb-3">
            WHAT&apos;S COVERED
          </p>
          <ul className="grid grid-cols-2 gap-2">
            {coveredItems.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-white/90"
              >
                <Check className="h-4 w-4 shrink-0 text-trustpilot-green" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
