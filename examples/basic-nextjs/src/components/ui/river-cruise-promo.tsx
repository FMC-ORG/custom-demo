'use client';

import type React from 'react';
import Link from 'next/link';
import { Text, Image as SitecoreImage } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { Home } from 'lucide-react';

/**
 * River Cruise Promo component — single-datasource, default JSS props (PascalCase, .value).
 * No Component GraphQL Query on rendering.
 */
interface RiverCruisePromoFields {
  SmallHeader?: { value?: string };
  Headline?: { value?: string };
  Description?: { value?: string };
  AddOnLabel?: { value?: string };
  AddOnTitle?: { value?: string };
  AddOnDescription?: { value?: string };
  AddOnIcon?: { value?: { src?: string; alt?: string } };
  CtaLink?: { value?: { href?: string; text?: string } };
}

interface RiverCruisePromoParams {
  [key: string]: any; // eslint-disable-line
}

interface RiverCruisePromoProps extends ComponentProps {
  params: RiverCruisePromoParams;
  fields: RiverCruisePromoFields;
  isPageEditing?: boolean;
}

const RiverCruisePromoComponent: React.FC<RiverCruisePromoProps> = (props) => {
  const { fields, isPageEditing } = props;
  const smallHeader = fields?.SmallHeader?.value;
  const headline = fields?.Headline?.value;
  const description = fields?.Description?.value;
  const addOnLabel = fields?.AddOnLabel?.value;
  const addOnTitle = fields?.AddOnTitle?.value;
  const addOnDescription = fields?.AddOnDescription?.value;
  const addOnIcon = fields?.AddOnIcon?.value;
  const ctaLink = fields?.CtaLink?.value;
  const ctaHref = ctaLink?.href || '#';
  const ctaText = ctaLink?.text || 'Request a callback';

  const hasContent =
    smallHeader ||
    headline ||
    description ||
    addOnTitle ||
    addOnDescription ||
    ctaLink?.href;

  if (!hasContent && !isPageEditing) {
    return (
      <section className="py-12 md:py-16 bg-saga-light-blue">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">River Cruise Promo: No datasource configured</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-saga-light-blue">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {(smallHeader || isPageEditing) && fields.SmallHeader && (
          <Text
            field={fields.SmallHeader}
            tag="p"
            className="text-xs md:text-sm uppercase tracking-widest font-semibold text-saga-teal"
          />
        )}
        {(headline || isPageEditing) && fields.Headline && (
          <Text
            field={fields.Headline}
            tag="h2"
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-saga-navy mt-2"
          />
        )}
        {(description || isPageEditing) && fields.Description && (
          <Text
            field={fields.Description}
            tag="p"
            className="text-base text-saga-navy/70 mt-4"
          />
        )}

        {(addOnTitle || addOnDescription || addOnLabel || isPageEditing) && (
          <div className="mt-6 rounded-lg border-2 border-saga-gold bg-background p-4 flex items-start gap-3 text-left">
            {(addOnIcon?.src || isPageEditing) && fields.AddOnIcon ? (
              <SitecoreImage
                field={fields.AddOnIcon}
                className="w-10 h-10 flex-shrink-0 object-contain"
              />
            ) : (
              <div className="w-10 h-10 flex-shrink-0 rounded flex items-center justify-center bg-saga-gold/20">
                <Home className="h-5 w-5 text-saga-navy" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {(addOnLabel || isPageEditing) && fields.AddOnLabel && (
                <Text
                  field={fields.AddOnLabel}
                  tag="span"
                  className="font-bold text-saga-navy"
                />
              )}{' '}
              {(addOnTitle || isPageEditing) && fields.AddOnTitle && (
                <Text
                  field={fields.AddOnTitle}
                  tag="span"
                  className="font-semibold text-saga-navy"
                />
              )}
              {(addOnDescription || isPageEditing) && fields.AddOnDescription && (
                <Text
                  field={fields.AddOnDescription}
                  tag="p"
                  className="mt-1 text-sm text-saga-navy/70 leading-relaxed"
                />
              )}
            </div>
          </div>
        )}

        {(ctaLink?.href || ctaText || isPageEditing) && (
          <Link
            href={ctaHref}
            className="mt-8 inline-block rounded-md bg-saga-navy px-8 py-3.5 text-sm font-semibold text-white hover:bg-saga-dark-navy transition-colors"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </section>
  );
};

export const Default: React.FC<RiverCruisePromoProps> = (props) => {
  const { page } = props;
  const isPageEditing = page.mode.isEditing;
  return <RiverCruisePromoComponent {...props} isPageEditing={isPageEditing} />;
};
