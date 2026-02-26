'use client';

import type React from 'react';
import {
  Text as ContentSdkText,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { Car, Shield, Play } from 'lucide-react';
import Link from 'next/link';

interface MetricChild {
  id?: string;
  metricLabel?: { jsonValue?: Field<string> };
  metricValue?: { jsonValue?: Field<string> };
}

interface InsuranceDetailsCardFields {
  data?: {
    datasource?: {
      cardTitle?: { jsonValue?: Field<string> };
      vehicleName?: { jsonValue?: Field<string> };
      licensePlate?: { jsonValue?: Field<string> };
      insurerLogo?: { jsonValue?: ImageField };
      videoLink?: { jsonValue?: LinkField };
      videoLinkText?: { jsonValue?: Field<string> };
      policyLink?: { jsonValue?: LinkField };
      policyLinkText?: { jsonValue?: Field<string> };
      children?: {
        results?: MetricChild[];
      };
    };
  };
}

type InsuranceDetailsCardProps = ComponentProps & {
  fields?: InsuranceDetailsCardFields;
};

const DEFAULT_CARD_TITLE = 'Car insurance';
const DEFAULT_VEHICLE = 'Hyundai Ioniq 5';
const DEFAULT_PLATE = 'BX22 KGY';
const DEFAULT_METRICS = [
  { label: 'until expiry', value: '20 days' },
  { label: 'No claims bonus', value: '8 years' },
  { label: 'Car value', value: '£18.2k' },
  { label: 'Voluntary excess', value: '£500' },
];
const DEFAULT_VIDEO_TEXT = 'Watch: understanding your renewal quote';
const DEFAULT_POLICY_TEXT = 'View full policy';

/**
 * InsuranceDetailsCard - policy/vehicle details card with metrics grid.
 * Uses parent/children datasource (children = metric items).
 */
export const Default: React.FC<InsuranceDetailsCardProps> = (props) => {
  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing ?? false;

  const datasource = fields?.data?.datasource;
  const hasDatasource = Boolean(datasource);

  const cardTitle =
    datasource?.cardTitle?.jsonValue?.value ?? DEFAULT_CARD_TITLE;
  const vehicleName =
    datasource?.vehicleName?.jsonValue?.value ?? DEFAULT_VEHICLE;
  const licensePlate =
    datasource?.licensePlate?.jsonValue?.value ?? DEFAULT_PLATE;
  const videoLink = datasource?.videoLink?.jsonValue;
  const videoLinkText =
    datasource?.videoLinkText?.jsonValue?.value ?? DEFAULT_VIDEO_TEXT;
  const policyLink = datasource?.policyLink?.jsonValue;
  const policyLinkText =
    datasource?.policyLinkText?.jsonValue?.value ?? DEFAULT_POLICY_TEXT;

  const children = datasource?.children?.results ?? [];
  const metrics =
    hasDatasource && children.length > 0
      ? children.map((child) => ({
          id: child.id ?? '',
          label: child.metricLabel?.jsonValue?.value ?? '',
          value: child.metricValue?.jsonValue?.value ?? '',
        }))
      : DEFAULT_METRICS.map((m, i) => ({
          id: `metric-${i}`,
          label: m.label,
          value: m.value,
        }));

  const insurerLogo = datasource?.insurerLogo?.jsonValue;
  const showPlaceholder = !hasDatasource && isEditing;

  if (showPlaceholder) {
    return (
      <div className="rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-8 text-center">
        <p className="text-white/60">Add InsuranceDetailsCard datasource</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl bg-confused-container p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-white/80" aria-hidden />
          {datasource?.cardTitle?.jsonValue ? (
            <ContentSdkText
              tag="h3"
              field={datasource.cardTitle.jsonValue}
              className="text-lg font-semibold"
            />
          ) : (
            <h3 className="text-lg font-semibold">{cardTitle}</h3>
          )}
        </div>
        {insurerLogo && (
          <div className="h-8 w-24 flex items-center">
            <ContentSdkImage
              field={insurerLogo as ImageField}
              className="max-h-8 w-auto object-contain"
              alt="Current insurer"
            />
          </div>
        )}
      </div>

      {/* Vehicle info */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-white/5">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
          <Car className="h-6 w-6" aria-hidden />
        </div>
        <div>
          {datasource?.vehicleName?.jsonValue ? (
            <ContentSdkText
              tag="p"
              field={datasource.vehicleName.jsonValue}
              className="text-sm text-white/80"
            />
          ) : (
            <p className="text-sm text-white/80">{vehicleName}</p>
          )}
          {datasource?.licensePlate?.jsonValue ? (
            <ContentSdkText
              tag="p"
              field={datasource.licensePlate.jsonValue}
              className="text-xl font-bold"
            />
          ) : (
            <p className="text-xl font-bold">{licensePlate}</p>
          )}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="rounded-lg bg-white/5 p-4"
          >
            <p className="text-xs text-white/70 uppercase tracking-wide">
              {metric.label}
            </p>
            <p className="mt-1 text-lg font-bold">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Links */}
      <div className="flex flex-col gap-2">
        {videoLink ? (
          <ContentSdkLink
            field={videoLink as LinkField}
            className="inline-flex items-center gap-2 text-sm text-confused-cta-teal hover:underline"
          >
            <Play className="h-4 w-4" aria-hidden />
            {videoLinkText}
          </ContentSdkLink>
        ) : (
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-sm text-confused-cta-teal hover:underline"
          >
            <Play className="h-4 w-4" aria-hidden />
            {videoLinkText}
          </Link>
        )}
        {policyLink ? (
          <ContentSdkLink
            field={policyLink as LinkField}
            className="inline-flex items-center gap-2 text-sm text-white/90 hover:underline"
          >
            <Shield className="h-4 w-4" aria-hidden />
            Comprehensive cover — {policyLinkText}
          </ContentSdkLink>
        ) : (
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-sm text-white/90 hover:underline"
          >
            <Shield className="h-4 w-4" aria-hidden />
            Comprehensive cover — {policyLinkText}
          </Link>
        )}
      </div>
    </div>
  );
};
