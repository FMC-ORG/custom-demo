'use client';

import type React from 'react';
import {
  Link as ContentSdkLink,
  Text as ContentSdkText,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import type { LinkField, Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import {
  Car,
  Home,
  Truck,
  Bike,
  Plane,
  Zap,
  Heart,
  Dog,
  Wifi,
  Smartphone,
  Clock,
  Landmark,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from 'lib/utils';

const ICON_REGISTRY: Record<string, LucideIcon> = {
  Car,
  Home,
  Truck,
  Bike,
  Plane,
  Zap,
  Heart,
  Dog,
  Wifi,
  Smartphone,
  Clock,
  Landmark,
};

const COLOR_THEMES: Record<string, string> = {
  blue: 'bg-compare-blue',
  teal: 'bg-compare-teal',
  coral: 'bg-compare-coral',
  purple: 'bg-compare-purple',
  orange: 'bg-compare-orange',
  green: 'bg-compare-green',
};

interface CompareServiceItemChild {
  id?: string;
  title?: { jsonValue?: Field<string> };
  link?: { jsonValue?: LinkField };
  iconName?: { jsonValue?: Field<string> };
  colorTheme?: { jsonValue?: Field<string> };
}

interface CompareServicesGridFields {
  data?: {
    datasource?: {
      heading?: { jsonValue?: Field<string> };
      ctaLink?: { jsonValue?: LinkField };
      children?: {
        results?: CompareServiceItemChild[];
      };
    };
  };
}

type CompareServicesGridProps = ComponentProps & {
  fields?: CompareServicesGridFields;
};

const DEFAULT_HEADING = 'More ways to compare and save';
const DEFAULT_CTA_TEXT = 'See everything we compare';
const DEFAULT_CTA_HREF = '#';

const DEFAULT_ITEMS: Array<{
  title: string;
  iconName: string;
  colorTheme: string;
  href: string;
}> = [
  { title: 'Car Insurance', iconName: 'Car', colorTheme: 'blue', href: '#' },
  { title: 'Home Insurance', iconName: 'Home', colorTheme: 'teal', href: '#' },
  { title: 'Van Insurance', iconName: 'Truck', colorTheme: 'blue', href: '#' },
  { title: 'Motorbike Insurance', iconName: 'Bike', colorTheme: 'blue', href: '#' },
  { title: 'Temp car Insurance', iconName: 'Clock', colorTheme: 'blue', href: '#' },
  { title: 'Travel Insurance', iconName: 'Plane', colorTheme: 'coral', href: '#' },
  { title: 'Energy', iconName: 'Zap', colorTheme: 'purple', href: '#' },
  { title: 'Life Insurance', iconName: 'Heart', colorTheme: 'blue', href: '#' },
  { title: 'Mortgages', iconName: 'Landmark', colorTheme: 'orange', href: '#' },
  { title: 'Pet Insurance', iconName: 'Dog', colorTheme: 'green', href: '#' },
  { title: 'Broadband', iconName: 'Wifi', colorTheme: 'purple', href: '#' },
  { title: 'Mobile phones', iconName: 'Smartphone', colorTheme: 'purple', href: '#' },
];

function getIcon(iconName: string | undefined): LucideIcon {
  if (!iconName) return Car;
  const key = iconName.trim();
  return ICON_REGISTRY[key] ?? Car;
}

function getColorClass(colorTheme: string | undefined): string {
  if (!colorTheme) return COLOR_THEMES.blue ?? 'bg-compare-blue';
  const key = colorTheme.trim().toLowerCase();
  return COLOR_THEMES[key] ?? COLOR_THEMES.blue ?? 'bg-compare-blue';
}

/**
 * CompareServicesGrid component - grid of service tiles with icons, links, and colored backgrounds.
 * Supports Sitecore datasource with parent/children structure and fallback to static content for disconnected demo.
 */
export const Default: React.FC<CompareServicesGridProps> = (props) => {
  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing ?? false;

  const datasource = fields?.data?.datasource;
  const hasDatasource = Boolean(datasource);

  const heading =
    datasource?.heading?.jsonValue?.value ?? DEFAULT_HEADING;
  const ctaLink =
    datasource?.ctaLink?.jsonValue;
  const ctaHref =
    (ctaLink?.value?.href as string | undefined) ?? DEFAULT_CTA_HREF;
  const ctaText =
    (ctaLink?.value?.text as string | undefined) ?? DEFAULT_CTA_TEXT;

  const useContentSdkHeading = Boolean(datasource?.heading?.jsonValue);
  const useContentSdkCta = Boolean(ctaLink);

  const children = datasource?.children?.results ?? [];
  const items = hasDatasource && children.length > 0
    ? children.map((child) => ({
        id: child.id ?? '',
        title: child.title?.jsonValue?.value ?? '',
        link: child.link?.jsonValue,
        href: (child.link?.jsonValue?.value?.href as string) ?? '#',
        iconName: child.iconName?.jsonValue?.value ?? 'Car',
        colorTheme: child.colorTheme?.jsonValue?.value ?? 'blue',
      }))
    : DEFAULT_ITEMS.map((d) => ({
        id: d.title,
        title: d.title,
        link: undefined,
        href: d.href,
        iconName: d.iconName,
        colorTheme: d.colorTheme,
      }));

  const showPlaceholder = !hasDatasource && isEditing;

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          {useContentSdkHeading && datasource?.heading?.jsonValue ? (
            <ContentSdkText
              tag="h2"
              field={datasource.heading.jsonValue}
              className="text-2xl sm:text-3xl font-bold text-gray-900"
            />
          ) : (
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {heading}
            </h2>
          )}

          {showPlaceholder ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">Add Compare Services Grid datasource</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {items.map((item, index) => {
                const IconComponent = getIcon(item.iconName);
                const bgClass = getColorClass(item.colorTheme);

                const tileContent = (
                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-2xl p-4 flex-1 min-w-0',
                      bgClass
                    )}
                  >
                    <div
                      className="flex-shrink-0 rounded-full bg-gray-700 p-2"
                      aria-hidden
                    >
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </span>
                  </div>
                );

                const key = item.id || `item-${index}`;

                if (item.link) {
                  return (
                    <ContentSdkLink
                      key={key}
                      field={item.link as LinkField}
                      className="block w-full h-full hover:opacity-90 transition-opacity"
                    >
                      {tileContent}
                    </ContentSdkLink>
                  );
                }

                return (
                  <Link
                    key={key}
                    href={item.href ?? '#'}
                    className="block w-full h-full hover:opacity-90 transition-opacity"
                  >
                    {tileContent}
                  </Link>
                );
              })}
            </div>
          )}

          {!showPlaceholder && (
            <div className="flex justify-center">
              {useContentSdkCta && ctaLink ? (
                <ContentSdkLink
                  field={ctaLink as LinkField}
                  className="inline-flex items-center gap-2 text-base font-medium text-gray-900 underline hover:text-gray-700"
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </ContentSdkLink>
              ) : (
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-2 text-base font-medium text-gray-900 underline hover:text-gray-700"
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
