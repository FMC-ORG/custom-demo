'use client';

import React from 'react';
import Link from 'next/link';
import { ComponentProps } from '@/lib/component-props';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

/**
 * Breadcrumbs component parameters (context-only, no datasource)
 */
interface BreadcrumbsParams {
  [key: string]: any; // eslint-disable-line
}

/**
 * Breadcrumbs component props.
 * Uses only page context from ComponentProps - no datasource.
 */
interface BreadcrumbsProps extends ComponentProps {
  params: BreadcrumbsParams;
  fields?: Record<string, unknown>;
  isPageEditing?: boolean;
}

/**
 * Format a path segment for display (e.g. "saga-magazine" -> "Saga Magazine")
 */
function formatSegmentDisplay(segment: string): string {
  return segment
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

const BreadcrumbsComponent: React.FC<BreadcrumbsProps> = (props) => {
  console.log('BreadcrumbsComponent props', props);
  const { page } = props;
  const { layout } = page;
  const { context, route } = layout.sitecore;
  const itemPath = context?.itemPath ?? '';
  const language = context?.language ?? 'en';
  const siteName = page.siteName ?? context?.site?.name ?? 'saga-group';

  // Parse itemPath into segments (e.g. "/Home/Saga/Magazine" -> ["Home", "Saga", "Magazine"])
  const segments = itemPath
    .split('/')
    .filter(Boolean);

  const currentPageTitle =
    (route?.fields as { Title?: { value?: string } } | undefined)?.Title?.value?.toString() ?? '';

  if (segments.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home - always first with pill style */}
        <BreadcrumbItem>
          <Link
            href={`/${siteName}/${language}`}
            className="rounded-full bg-saga-teal/20 px-3 py-1 text-sm font-medium text-saga-navy hover:bg-saga-teal/30 transition-colors"
          >
            Home
          </Link>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const pathUpToHere = segments.slice(0, index + 1).join('/');
          const href = `/${siteName}/${language}/${pathUpToHere}`;
          const displayName = isLast && currentPageTitle
            ? currentPageTitle
            : formatSegmentDisplay(segment);

          return (
            <React.Fragment key={pathUpToHere}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage title={displayName}>{displayName}</BreadcrumbPage>
                ) : (
                  <Link
                    href={href}
                    className="transition-colors hover:text-foreground text-saga-navy hover:text-saga-dark-navy"
                  >
                    {displayName}
                  </Link>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export const Default: React.FC<BreadcrumbsProps> = (props) => {
  const { page } = props;
  const isPageEditing = page.mode.isEditing;
  return <BreadcrumbsComponent {...props} isPageEditing={isPageEditing} />;
};
