'use client';

import type React from 'react';
import {
  Text as ContentSdkText,
  Link as ContentSdkLink,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import type { LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface SidebarPromoFields {
  Heading?: { value?: string };
  Subtitle?: { value?: string };
  CtaLink?: LinkField | { value?: { href?: string; text?: string } };
  CtaText?: { value?: string };
}

type SidebarPromoProps = ComponentProps & {
  fields?: SidebarPromoFields;
};

const DEFAULT_HEADING = 'ASK CONFUSED.COM';
const DEFAULT_SUBTITLE = 'Need help choosing a policy?';
const DEFAULT_CTA_TEXT = 'Get help';

/**
 * SidebarPromo - small sidebar card for promos (Ask Confused.com, etc.).
 */
export const Default: React.FC<SidebarPromoProps> = (props) => {
  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing ?? false;

  const heading = fields?.Heading?.value ?? DEFAULT_HEADING;
  const subtitle = fields?.Subtitle?.value ?? DEFAULT_SUBTITLE;
  const ctaText = fields?.CtaText?.value ?? DEFAULT_CTA_TEXT;
  const ctaHref = fields?.CtaLink?.value?.href ?? '#';
  const hasDatasource = Boolean(fields);
  const showPlaceholder = !hasDatasource && isEditing;

  if (showPlaceholder) {
    return (
      <div className="rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-6 text-center">
        <p className="text-white/60 text-sm">Add SidebarPromo datasource</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-confused-container p-6 text-white">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/80">
          <HelpCircle className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          {fields?.Heading ? (
            <ContentSdkText
              tag="h3"
              field={fields.Heading}
              className="text-sm font-bold uppercase tracking-wide"
            />
          ) : (
            <h3 className="text-sm font-bold uppercase tracking-wide">{heading}</h3>
          )}
          {fields?.Subtitle ? (
            <ContentSdkText
              tag="p"
              field={fields.Subtitle}
              className="text-sm text-white/90"
            />
          ) : (
            <p className="text-sm text-white/90">{subtitle}</p>
          )}
          {fields?.CtaLink ? (
            <ContentSdkLink
              field={fields.CtaLink as LinkField}
              className="mt-2 inline-flex items-center text-sm font-medium text-confused-cta-teal hover:underline"
            >
              {ctaText}
            </ContentSdkLink>
          ) : (
            <Link
              href={ctaHref}
              className="mt-2 inline-flex items-center text-sm font-medium text-confused-cta-teal hover:underline"
            >
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
