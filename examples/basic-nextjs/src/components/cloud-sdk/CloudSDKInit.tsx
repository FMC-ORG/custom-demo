'use client';

import { useEffect } from 'react';

const EDGE_CONTEXT_ID = process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;
const SITE_NAME = process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME;

export default function CloudSDKInit() {
  useEffect(() => {
    if (!EDGE_CONTEXT_ID) return;

    async function init() {
      try {
        const { CloudSDK } = await import('@sitecore-cloudsdk/core/browser');
        await import('@sitecore-cloudsdk/events/browser');
        await import('@sitecore-cloudsdk/search/browser');

        await CloudSDK({
          sitecoreEdgeContextId: EDGE_CONTEXT_ID!,
          siteName: SITE_NAME || '',
          enableBrowserCookie: true,
        })
          .addEvents()
          .addSearch()
          .initialize();
      } catch (error) {
        console.debug('Cloud SDK initialization skipped or failed:', error);
      }
    }

    init();
  }, []);

  return null;
}
