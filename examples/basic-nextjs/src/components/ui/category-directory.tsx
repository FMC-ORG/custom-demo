'use client';

import type React from 'react';
import Link from 'next/link';
import {
  Shield,
  Umbrella,
  Ship,
  PiggyBank,
  BookOpen,
  Wine,
  Heart,
  User,
  type LucideIcon,
} from 'lucide-react';
import { Text, Link as SitecoreLink, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Icon name to Lucide component mapping for Sitecore-driven icon selection
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Umbrella,
  Ship,
  PiggyBank,
  BookOpen,
  Wine,
  Heart,
  User,
};

/**
 * Default categories when no datasource is configured (development fallback)
 */
const DEFAULT_CATEGORIES = [
  { icon: 'Shield', title: 'Saga Insurance', description: "Car, home, travel and health – we've got you covered.", cta: 'Go to Saga Insurance', href: '#' },
  { icon: 'Umbrella', title: 'Saga Holidays', description: 'Discover a holiday created with you in mind.', cta: 'Go to Saga Holidays', href: '#' },
  { icon: 'Ship', title: 'Saga Cruises', description: 'Luxury, all-inclusive cruising to a host of exciting destinations.', cta: 'Go to Saga Cruises', href: '#' },
  { icon: 'PiggyBank', title: 'Saga Money', description: 'Products to help you feel good about your finances.', cta: 'Go to Saga Money', href: '#' },
  { icon: 'BookOpen', title: 'Saga Magazine', description: 'Widen your world with our award-winning magazine.', cta: 'Go to Saga Magazine', href: '#' },
  { icon: 'Wine', title: 'Vintage by Saga', description: 'Great value, carefully chosen wines, by the bottle or case.', cta: 'Go to Vintage by Saga', href: '#' },
  { icon: 'Heart', title: 'Saga Connections', description: 'Find love, friendship and fun online.', cta: 'Join today', href: '#' },
  { icon: 'User', title: 'MySaga', description: 'View your quotes and manage holiday bookings.', cta: 'Log in to MySaga', href: '#' },
];

/**
 * CategoryDirectoryItem child item structure (from Sitecore datasource)
 */
interface CategoryDirectoryItem {
  id: string;
  title?: { jsonValue?: Field<string> };
  description?: { jsonValue?: Field<string> };
  ctaText?: { jsonValue?: Field<string> };
  link?: { jsonValue?: LinkField };
  iconName?: { jsonValue?: Field<string> };
}

/**
 * CategoryDirectory component parameters
 */
interface CategoryDirectoryParams {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * CategoryDirectory fields structure (GraphQL: children inside datasource)
 */
interface CategoryDirectoryFields {
  data?: {
    datasource?: {
      sectionTitle?: { jsonValue?: Field<string> };
      children?: {
        results?: CategoryDirectoryItem[];
      };
    };
  };
}

/**
 * CategoryDirectory component props
 */
interface CategoryDirectoryProps extends ComponentProps {
  params: CategoryDirectoryParams;
  fields: CategoryDirectoryFields;
  isPageEditing?: boolean;
}

/**
 * CategoryDirectory component implementation
 * Renders a grid of category cards with icon, title, description, and CTA.
 * Uses Sitecore datasource when available; falls back to default categories when not.
 */
const CategoryDirectoryComponent: React.FC<CategoryDirectoryProps> = (props) => {
  const { fields, isPageEditing } = props;
  const { data } = fields || {};
  const { datasource } = data || {};
  const items = datasource?.children?.results || [];

  const hasSitecoreItems = items.length > 0;
  const fallbackCategories =
    !hasSitecoreItems && !isPageEditing
      ? DEFAULT_CATEGORIES.map((cat) => ({
          icon: ICON_MAP[cat.icon] ?? Shield,
          title: cat.title,
          description: cat.description,
          cta: cat.cta,
          href: cat.href,
          id: cat.title,
        }))
      : [];

  return (
    <section className="bg-saga-light-blue py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {!hasSitecoreItems && isPageEditing ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No categories configured. Add CategoryDirectoryItem items as children.
            </div>
          ) : hasSitecoreItems ? (
            items.map((item) => {
              const iconName = item?.iconName?.jsonValue?.value ?? 'Shield';
              const IconComponent = ICON_MAP[iconName] ?? Shield;
              const ctaContent =
                item?.ctaText?.jsonValue?.value ?? item?.link?.jsonValue?.value?.text ?? 'Learn more';

              return (
                <div
                  key={item?.id ?? ''}
                  className="bg-background rounded-lg p-6 flex flex-col shadow-sm border border-border/50"
                >
                  <IconComponent className="h-8 w-8 text-saga-navy mb-3" strokeWidth={1.5} />
                  {(item?.title?.jsonValue?.value || isPageEditing) && (
                    <Text
                      field={item.title?.jsonValue}
                      tag="h3"
                      className="text-lg font-bold text-saga-navy"
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
                    (item.link?.jsonValue ? (
                      <SitecoreLink
                        field={item.link.jsonValue}
                        className="mt-4 inline-block w-fit rounded-md bg-saga-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-saga-dark-navy transition-colors"
                      >
                        <Text
                          field={item.ctaText?.jsonValue}
                          tag="span"
                        />
                      </SitecoreLink>
                    ) : (
                      <Link
                        href="#"
                        className="mt-4 inline-block w-fit rounded-md bg-saga-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-saga-dark-navy transition-colors"
                      >
                        <Text
                          field={item.ctaText?.jsonValue}
                          tag="span"
                        />
                      </Link>
                    ))}
                </div>
              );
            })
          ) : (
            fallbackCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id || cat.title}
                  className="bg-background rounded-lg p-6 flex flex-col shadow-sm border border-border/50"
                >
                  <Icon className="h-8 w-8 text-saga-navy mb-3" strokeWidth={1.5} />
                  <h3 className="text-lg font-bold text-saga-navy">{cat.title}</h3>
                  <p className="mt-2 text-sm text-saga-navy/70 leading-relaxed flex-1">
                    {cat.description}
                  </p>
                  <Link
                    href={cat.href}
                    className="mt-4 inline-block w-fit rounded-md bg-saga-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-saga-dark-navy transition-colors"
                  >
                    {cat.cta}
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * Default export for Sitecore component registration
 */
export const Default: React.FC<CategoryDirectoryProps> = (props) => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  return <CategoryDirectoryComponent {...props} isPageEditing={isPageEditing} />;
};
