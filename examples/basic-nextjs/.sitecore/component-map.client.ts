// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as newsletter from 'src/components/ui/newsletter';
import * as header from 'src/components/ui/header';
import * as articlecards from 'src/components/ui/article-cards';
import * as Navigation from 'src/components/basic/navigation/Navigation';
import * as SitecoreStyles from 'src/components/basic/content-sdk/SitecoreStyles';
import * as CdpPageView from 'src/components/basic/content-sdk/CdpPageView';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['newsletter', { ...newsletter }],
  ['header', { ...header }],
  ['article-cards', { ...articlecards }],
  ['Navigation', { ...Navigation }],
  ['SitecoreStyles', { ...SitecoreStyles }],
  ['CdpPageView', { ...CdpPageView }],
]);

export default componentMap;
