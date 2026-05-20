'use client';
import { useCallback } from 'react';
import { Page } from '@sitecore-content-sdk/nextjs';
import { event } from '@sitecore-content-sdk/events';

/**
 * Sends search analytics events to Sitecore.
 * Receives `page` as a parameter from ComponentProps instead of calling useSitecore() internally.
 */
export const useEvent = ({
  query,
  uid,
  page,
}: {
  query: string;
  uid?: string;
  page: Page;
}) => {
  const { isEditing, isPreview } = page.mode;
  const { route } = page?.layout?.sitecore;

  const sendEvent = useCallback(
    (type: 'clicked' | 'viewed') => {
      if (process.env.NODE_ENV === 'development' || isEditing || isPreview) return;

      event({
        type: 'search',
        siteId: page.siteName,
        channel: 'web',
        name: route?.name,
        language: route?.itemLanguage,
        core: {
          componentId: uid ?? '',
          interactionType: type,
          keyword: query ?? '',
          nullResults: false,
        },
      });
    },
    [route, page, uid, query, isEditing, isPreview]
  );

  return sendEvent;
};
