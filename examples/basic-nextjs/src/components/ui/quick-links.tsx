'use client';

import type React from 'react';
import {
  Text as ContentSdkText,
  Link as ContentSdkLink,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import {
  FileText,
  Car,
  Home,
  Lightbulb,
  Settings,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

const ICON_REGISTRY: Record<string, LucideIcon> = {
  FileText,
  Car,
  Home,
  Lightbulb,
  Settings,
};

interface QuickLinkItem {
  id?: string;
  linkText?: { jsonValue?: Field<string> };
  link?: { jsonValue?: LinkField };
  iconName?: { jsonValue?: Field<string> };
}

interface QuickLinksFields {
  data?: {
    datasource?: {
      heading?: { jsonValue?: Field<string> };
      links?: {
        targetItems?: QuickLinkItem[];
      };
    };
  };
}

type QuickLinksProps = ComponentProps & {
  fields?: QuickLinksFields;
};

const DEFAULT_HEADING = 'Quick links';
const DEFAULT_LINKS = [
  { linkText: 'View my recent quotes', iconName: 'FileText', href: '#' },
  { linkText: 'Update vehicle details', iconName: 'Car', href: '#' },
  { linkText: 'Get a home quote', iconName: 'Home', href: '#' },
  { linkText: 'Get help choosing', iconName: 'Lightbulb', href: '#' },
  { linkText: 'Account settings', iconName: 'Settings', href: '#' },
];

function getIcon(iconName: string | undefined): LucideIcon {
  if (!iconName) return FileText;
  const key = iconName.trim();
  return ICON_REGISTRY[key] ?? FileText;
}

/**
 * QuickLinks - list of quick links with icons for sidebar.
 * Uses Multilist datasource (links.targetItems).
 */
export const Default: React.FC<QuickLinksProps> = (props) => {
  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing ?? false;

  const datasource = fields?.data?.datasource;
  const hasDatasource = Boolean(datasource);
  const heading = datasource?.heading?.jsonValue?.value ?? DEFAULT_HEADING;
  const targetItems = datasource?.links?.targetItems ?? [];

  const items =
    hasDatasource && targetItems.length > 0
      ? targetItems.map((item) => ({
          id: item.id ?? '',
          linkText: item.linkText?.jsonValue?.value ?? 'Link',
          link: item.link?.jsonValue,
          href: (item.link?.jsonValue?.value?.href as string) ?? '#',
          iconName: item.iconName?.jsonValue?.value ?? 'FileText',
        }))
      : DEFAULT_LINKS.map((d, i) => ({
          id: `default-${i}`,
          linkText: d.linkText,
          link: undefined,
          href: d.href,
          iconName: d.iconName,
        }));

  const showPlaceholder = !hasDatasource && isEditing;

  if (showPlaceholder) {
    return (
      <div className="rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-6 text-center">
        <p className="text-white/60 text-sm">Add QuickLinks datasource</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-confused-container p-8 text-white mt-6">
      {datasource?.heading?.jsonValue ? (
        <ContentSdkText
          tag="h3"
          field={datasource.heading.jsonValue}
          className="mb-8 text-lg font-bold"
        />
      ) : (
        <h3 className="mb-8 text-lg font-bold">{heading}</h3>
      )}
      <ul className="flex flex-col gap-1">
        {items.map((item, index) => {
          const IconComponent = getIcon(item.iconName);
          const key = item.id || `link-${index}`;

          const linkContent = (
            <span className="flex items-center justify-between gap-3 py-4 px-3">
              <span className="flex items-center gap-3">
                <IconComponent className="h-5 w-5 shrink-0 text-white/80" aria-hidden />
                <span className="text-sm font-medium">{item.linkText}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/60" aria-hidden />
            </span>
          );

          if (item.link) {
            return (
              <li key={key}>
                <ContentSdkLink
                  field={item.link as LinkField}
                  className="block text-white hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors -mx-3 px-3"
                >
                  {linkContent}
                </ContentSdkLink>
              </li>
            );
          }

          return (
            <li key={key}>
              <Link
                href={item.href}
                className="block text-white hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors -mx-3 px-3"
              >
                {linkContent}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
