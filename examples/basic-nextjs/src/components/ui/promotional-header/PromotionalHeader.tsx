'use client';

import React, { JSX } from 'react';
import { Link as ContentSdkLink, Text, Field, LinkField, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromotionalHeaderFields {
  AnnouncementText?: Field<string>;
  CtaLink?: LinkField;
}

interface PromotionalHeaderProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: PromotionalHeaderFields;
    };
  } & PromotionalHeaderFields;
}

/**
 * Promotional Header - Dark top bar with announcement text and CTA link.
 * Displays above the main header for promotions, alerts, or announcements.
 */
export const Default = ({ params, fields }: PromotionalHeaderProps): JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource ?? fields;
  const announcementText = datasource?.AnnouncementText;
  const ctaLink = datasource?.CtaLink;

  const hasContent =
    announcementText?.value ||
    ctaLink?.value?.href ||
    (isEditing && (announcementText || ctaLink));

  if (!hasContent && !datasource) {
    return (
      <div
        className={cn('component promotional-header bg-primary py-2', styles)}
        id={id}
        data-testid="promotional-header"
      >
        <div className="component-content flex items-center justify-between px-4 text-sm text-primary-foreground">
          <span className="is-empty-hint">Promotional Header</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('component promotional-header bg-primary py-2', styles)}
      id={id}
      data-testid="promotional-header"
    >
      <div className="component-content mx-auto flex max-w-7xl items-center justify-between px-4 text-sm text-primary-foreground">
        <div className="flex-1 text-center">
          {(announcementText?.value || (isEditing && announcementText)) && (
            <Text
              tag="span"
              field={announcementText}
              className="field-announcementtext"
            />
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          {(ctaLink?.value?.href || (isEditing && ctaLink)) && (
            <ContentSdkLink
              field={ctaLink}
              editable={isEditing}
              className="inline-flex items-center gap-1 font-medium hover:underline"
            >
              {ctaLink?.value?.text ?? ''}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ContentSdkLink>
          )}
        </div>
      </div>
    </div>
  );
};
