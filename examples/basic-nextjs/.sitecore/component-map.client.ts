// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as trustsection from 'src/components/ui/trust-section';
import * as newsletter from 'src/components/ui/newsletter';
import * as hero from 'src/components/ui/hero';
import * as header from 'src/components/ui/header';
import * as footer from 'src/components/ui/footer';
import * as articlecards from 'src/components/ui/article-cards';
import * as Navigation from 'src/components/basic/navigation/Navigation';
import * as SitecoreStyles from 'src/components/basic/content-sdk/SitecoreStyles';
import * as CdpPageView from 'src/components/basic/content-sdk/CdpPageView';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['trust-section', { ...trustsection }],
  ['newsletter', { ...newsletter }],
  ['hero', { ...hero }],
  ['header', { ...header }],
  ['footer', { ...footer }],
  ['article-cards', { ...articlecards }],
  ['Navigation', { ...Navigation }],
  ['SitecoreStyles', { ...SitecoreStyles }],
  ['CdpPageView', { ...CdpPageView }],
]);

export default componentMap;
