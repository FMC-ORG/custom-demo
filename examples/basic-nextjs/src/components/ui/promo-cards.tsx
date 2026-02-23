'use client';

import type React from 'react';
import Link from 'next/link';
import { Text, Image as SitecoreImage, Link as SitecoreLink } from '@sitecore-content-sdk/nextjs';
import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * PromoCard child item structure (from Sitecore datasource)
 */
interface PromoCardItem {
  id: string;
  image?: { jsonValue?: ImageField };
  title?: { jsonValue?: Field<string> };
  ctaLink?: { jsonValue?: LinkField };
  badgeText?: { jsonValue?: Field<string> };
  description?: { jsonValue?: Field<string> };
  accentColor?: { jsonValue?: Field<string> };
}

/**
 * PromoCards component parameters
 */
interface PromoCardsParams {
  [key: string]: any; // eslint-disable-line
}

/**
 * PromoCards fields structure (GraphQL: children inside datasource)
 */
interface PromoCardsFields {
  data?: {
    datasource?: {
      title?: { jsonValue?: Field<string> };
      children?: {
        results?: PromoCardItem[];
      };
    };
  };
}

/**
 * PromoCards component props
 */
interface PromoCardsProps extends ComponentProps {
  params: PromoCardsParams;
  fields: PromoCardsFields;
  isPageEditing?: boolean;
}

/** Map accent color field value to Tailwind background class */
const ACCENT_CLASSES: Record<string, string> = {
  lavender: 'bg-purple-100',
  'light-blue': 'bg-blue-100',
  'light-orange': 'bg-orange-100',
};

/**
 * PromoCards component implementation
 * Renders a horizontal row of promo cards with image overlay, title, description, and CTA.
 * @param {PromoCardsProps} props - Component props from XM Cloud datasource
 * @returns {JSX.Element} The rendered promo cards component
 */
const PromoCardsComponent: React.FC<PromoCardsProps> = (props) => {
  const { fields, isPageEditing } = props;
  const { data } = fields || {};
  const { datasource } = data || {};
  const { children } = datasource || {};

  if (!data?.datasource && !isPageEditing) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            PromoCards component: No datasource configured
          </div>
        </div>
      </section>
    );
  }

  const cards = children?.results || [];
  const sectionTitle = datasource?.title?.jsonValue;

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(sectionTitle?.value || isPageEditing) && (
          <div className="mb-8">
            <Text
              field={sectionTitle}
              tag="h2"
              className="text-2xl md:text-3xl font-bold text-saga-navy"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.length > 0 ? (
            cards.map((card) => {
              const { id, image, title, ctaLink, badgeText, description, accentColor } = card;
              const accentValue = accentColor?.jsonValue?.value || '';
              const bgClass =
                ACCENT_CLASSES[accentValue] || 'bg-secondary';
              const linkHref = ctaLink?.jsonValue?.value?.href || '#';
              const linkText = ctaLink?.jsonValue?.value?.text || 'See offers';

              const cardContent = (
                <>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {(badgeText?.jsonValue?.value || isPageEditing) && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <span className="bg-white/90 text-saga-navy text-sm md:text-base font-bold px-4 py-2 rounded text-center">
                          <Text
                            field={badgeText?.jsonValue}
                            tag="span"
                            editable={false}
                          />
                        </span>
                      </div>
                    )}
                    {(image?.jsonValue?.value?.src || isPageEditing) && image?.jsonValue && (
                      <SitecoreImage
                        field={image.jsonValue}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div className={`p-6 ${bgClass} rounded-b-lg`}>
                    {(title?.jsonValue?.value || isPageEditing) && (
                      <Text
                        field={title?.jsonValue}
                        tag="h3"
                        className="text-lg font-bold text-saga-navy uppercase tracking-wide"
                      />
                    )}
                    {(description?.jsonValue?.value || isPageEditing) && (
                      <Text
                        field={description?.jsonValue}
                        tag="p"
                        className="mt-2 text-sm text-saga-navy/80 leading-relaxed"
                      />
                    )}
                    {(ctaLink?.jsonValue?.value?.href || linkText || isPageEditing) &&
                      (ctaLink?.jsonValue ? (
                        <SitecoreLink
                          field={ctaLink.jsonValue}
                          className="mt-4 inline-block rounded-md bg-saga-navy px-6 py-3 text-sm font-semibold text-white hover:bg-saga-dark-navy transition-colors"
                        >
                          {linkText}
                        </SitecoreLink>
                      ) : (
                        <Link
                          href={linkHref}
                          className="mt-4 inline-block rounded-md bg-saga-navy px-6 py-3 text-sm font-semibold text-white hover:bg-saga-dark-navy transition-colors"
                        >
                          {linkText}
                        </Link>
                      ))}
                  </div>
                </>
              );

              return (
                <div
                  key={id}
                  className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  {cardContent}
                </div>
              );
            })
          ) : (
            isPageEditing && (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No promo cards configured. Add PromoCard items as children.
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * Default export for Sitecore component registration
 */
export const Default: React.FC<PromoCardsProps> = (props) => {
  const { page } = props;
  const isPageEditing = page?.mode?.isEditing ?? false;
  return <PromoCardsComponent {...props} isPageEditing={isPageEditing} />;
};

export { PromoCardsComponent as PromoCards };
