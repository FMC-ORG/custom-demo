'use client';
import { useCallback } from 'react';
import { Page } from '@sitecore-content-sdk/nextjs';
import { event } from '@sitecore-content-sdk/events';
import { getClientId } from '@sitecore-content-sdk/analytics-core';

/**
 * True when the analytics SDK is initialized AND has a browser ID (sc_cid cookie).
 * getClientId() throws when the analytics plugin was never registered and returns ''
 * before a browser ID exists. Sending without one makes POST /v1/events answer
 * 400 "Invalid UUID string" (empty browser_id) — observed on the Vercel showcase
 * 2026-10-27, where the Events SDK never initializes (ADR 0011).
 */
export const hasAnalyticsBrowserId = (): boolean => {
  try {
    return !!getClientId();
  } catch {
    return false;
  }
};

/**
 * Sends Sitecore search analytics events (viewed / clicked) for a search
 * component instance. Silent in development, editing, and preview, and
 * whenever analytics is not initialized (no browser ID) — never a failing request.
 */
export const useSearchEvents = ({
  query,
  uid,
  page,
}: {
  query: string;
  uid?: string;
  page: Page;
}) => {
  const isEditing = page?.mode?.isEditing ?? false;
  const isPreview = page?.mode?.isPreview ?? false;
  const route = page?.layout?.sitecore?.route;

  return useCallback(
    (type: 'clicked' | 'viewed') => {
      if (process.env.NODE_ENV === 'development' || isEditing || isPreview) return;
      if (!hasAnalyticsBrowserId()) return;

      // event() rejects when the Events plugin is missing; analytics must never break search.
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
      }).catch((e: unknown) => console.debug('Search analytics event skipped', e));
    },
    [route, page, uid, query, isEditing, isPreview]
  );
};
