'use client';

import type React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Text, Image as SitecoreImage, Link as SitecoreLink, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Default items when no datasource is configured (development fallback)
 */
const DEFAULT_ITEMS = [
  {
    image: '/images/health-insurance.jpg',
    title: 'Saga Health Insurance',
    description:
      "Get 3 months free + £125 Wellness Gift Card when you buy direct from us. Start your new policy by 19 Feb 2026. T&Cs apply.",
    cta: 'Get a quote now',
    href: '#',
  },
  {
    image: '/images/travel-offers.jpg',
    title: 'Do not miss these Saga travel offers',
    description:
      'New Lower Fares on cruises, plus 10% and more on tours and hotel stays of 14 nights or longer.',
    cta: 'Book now',
    href: '#',
  },
  {
    image: '/images/podcast.jpg',
    title: "Listen to Saga's new podcast",
    description:
      'Experience is Everything – Jenni Murray talks to household names about their extraordinary lives',
    cta: 'Listen now',
    href: '#',
  },
  {
    image: '/images/connections.jpg',
    title: 'Find friendship or romance',
    description:
      'Our online matching service brings you closer to like-minded people on a site you can trust. Join Saga Connections and create your free profile today.',
    cta: 'Find out more',
    href: '#',
  },
];

/**
 * MoreFromSagaItem child item structure (from Sitecore datasource)
 */
interface MoreFromSagaItem {
  id: string;
  image?: { jsonValue?: ImageField };
  title?: { jsonValue?: Field<string> };
  description?: { jsonValue?: Field<string> };
  ctaText?: { jsonValue?: Field<string> };
  link?: { jsonValue?: LinkField };
}

/**
 * MoreFromSaga component parameters
 */
interface MoreFromSagaParams {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * MoreFromSaga fields structure (GraphQL: children inside datasource)
 */
interface MoreFromSagaFields {
  data?: {
    datasource?: {
      sectionTitle?: { jsonValue?: Field<string> };
      sectionDescription?: { jsonValue?: Field<string> };
      children?: {
        results?: MoreFromSagaItem[];
      };
    };
  };
}

/**
 * MoreFromSaga component props
 */
interface MoreFromSagaProps extends ComponentProps {
  params: MoreFromSagaParams;
  fields: MoreFromSagaFields;
  isPageEditing?: boolean;
}

/**
 * MoreFromSaga component implementation
 * Renders a grid of promo cards with image, title, description, and CTA link.
 * Uses Sitecore datasource when available; falls back to default items when not.
 */
const MoreFromSagaComponent: React.FC<MoreFromSagaProps> = (props) => {
  const { fields, isPageEditing } = props;
  const { data } = fields || {};
  const { datasource } = data || {};
  const items = datasource?.children?.results || [];

  const hasSitecoreItems = items.length > 0;
  const fallbackItems =
    !hasSitecoreItems && !isPageEditing
      ? DEFAULT_ITEMS.map((item) => ({
          ...item,
          id: item.title,
        }))
      : [];

  const sectionTitle = datasource?.sectionTitle?.jsonValue;
  const sectionDescription = datasource?.sectionDescription?.jsonValue;
  const showSectionHeader =
    hasSitecoreItems || isPageEditing || fallbackItems.length > 0;
  const defaultSectionTitle = 'More from Saga';
  const defaultSectionDescription =
    "We've got loads of insider guides, expert advice and a bit of fun, from buying a house, investing in stocks and shares, budgeting and a shed-load more.";

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        {showSectionHeader && (
          <>
            <div className="flex items-start gap-3 mb-2">
              <div className="w-1 h-8 bg-saga-teal rounded-full mt-1 flex-shrink-0" />
              {(sectionTitle?.value || isPageEditing) ? (
                <Text
                  field={sectionTitle}
                  tag="h2"
                  className="text-2xl md:text-3xl font-bold text-saga-navy"
                />
              ) : (
                <h2 className="text-2xl md:text-3xl font-bold text-saga-navy">
                  {defaultSectionTitle}
                </h2>
              )}
            </div>
            {(sectionDescription?.value || isPageEditing) ? (
              <p className="text-sm md:text-base text-saga-navy/70 mb-8 ml-4 max-w-2xl">
                <Text
                  field={sectionDescription}
                  tag="span"
                  className="block"
                />
              </p>
            ) : (
              <p className="text-sm md:text-base text-saga-navy/70 mb-8 ml-4 max-w-2xl">
                {defaultSectionDescription}
              </p>
            )}
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {!hasSitecoreItems && isPageEditing ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No items configured. Add MoreFromSagaItem items as children.
            </div>
          ) : hasSitecoreItems ? (
            items.map((item) => {
              const ctaContent =
                item?.ctaText?.jsonValue?.value ?? item?.link?.jsonValue?.value?.text ?? 'Learn more';
              const linkHref = item?.link?.jsonValue?.value?.href ?? '#';

              return (
                <div
                  key={item?.id ?? ''}
                  className="bg-background rounded-lg overflow-hidden border border-border/50 shadow-sm"
                >
                  <div className="relative h-44 overflow-hidden">
                    {(item?.image?.jsonValue?.value?.src || isPageEditing) && item?.image?.jsonValue && (
                      <SitecoreImage
                        field={item.image.jsonValue}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div className="p-4 flex flex-col">
                    {(item?.title?.jsonValue?.value || isPageEditing) && (
                      <Text
                        field={item.title?.jsonValue}
                        tag="h3"
                        className="text-base font-bold text-saga-navy leading-snug"
                      />
                    )}
                    {(item?.description?.jsonValue?.value || isPageEditing) && (
                      <Text
                        field={item.description?.jsonValue}
                        tag="p"
                        className="mt-2 text-sm text-saga-navy/70 leading-relaxed flex-1"
                      />
                    )}
                    {(ctaContent || item?.link?.jsonValue?.value?.href || isPageEditing) &&
                      (item?.link?.jsonValue ? (
                        <SitecoreLink
                          field={item.link.jsonValue}
                          className="mt-4 inline-flex items-center gap-1 text-saga-navy font-semibold text-sm hover:underline"
                        >
                          <span className="flex items-center justify-center h-6 w-6 rounded-full border-2 border-saga-teal">
                            <ChevronRight className="h-3.5 w-3.5 text-saga-navy" />
                          </span>
                          <Text
                            field={item.ctaText?.jsonValue}
                            tag="span"
                          />
                        </SitecoreLink>
                      ) : (
                        <Link
                          href={linkHref}
                          className="mt-4 inline-flex items-center gap-1 text-saga-navy font-semibold text-sm hover:underline"
                        >
                          <span className="flex items-center justify-center h-6 w-6 rounded-full border-2 border-saga-teal">
                            <ChevronRight className="h-3.5 w-3.5 text-saga-navy" />
                          </span>
                          <Text
                            field={item.ctaText?.jsonValue}
                            tag="span"
                          />
                        </Link>
                      ))}
                  </div>
                </div>
              );
            })
          ) : (
            fallbackItems.map((item) => (
              <div
                key={item.id || item.title}
                className="bg-background rounded-lg overflow-hidden border border-border/50 shadow-sm"
              >
                <div className="relative h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4 flex flex-col">
                  <h3 className="text-base font-bold text-saga-navy leading-snug">{item.title}</h3>
                  <p className="mt-2 text-sm text-saga-navy/70 leading-relaxed flex-1">
                    {item.description}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-4 inline-flex items-center gap-1 text-saga-navy font-semibold text-sm hover:underline"
                  >
                    <span className="flex items-center justify-center h-6 w-6 rounded-full border-2 border-saga-teal">
                      <ChevronRight className="h-3.5 w-3.5 text-saga-navy" />
                    </span>
                    {item.cta}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * Default export for Sitecore component registration
 */
export const Default: React.FC<MoreFromSagaProps> = (props) => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  return <MoreFromSagaComponent {...props} isPageEditing={isPageEditing} />;
};
