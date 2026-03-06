// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as StatsBar from 'src/components/ui/stats-bar/StatsBar';
import * as SectionHeader from 'src/components/ui/section-header/SectionHeader';
import * as PromotionalHeader from 'src/components/ui/promotional-header/PromotionalHeader';
import * as Header from 'src/components/ui/header/Header';
import * as Footer from 'src/components/ui/footer/Footer';
import * as featurecards from 'src/components/ui/feature-cards/feature-cards';
import * as ctabanner from 'src/components/ui/cta-banner/cta-banner';
import * as ContentSplit from 'src/components/ui/content-split/ContentSplit';
import * as contentcards from 'src/components/ui/content-cards/content-cards';
import * as Navigation from 'src/components/basic/navigation/Navigation';
import * as SitecoreStyles from 'src/components/basic/content-sdk/SitecoreStyles';
import * as CdpPageView from 'src/components/basic/content-sdk/CdpPageView';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['StatsBar', { ...StatsBar }],
  ['SectionHeader', { ...SectionHeader }],
  ['PromotionalHeader', { ...PromotionalHeader }],
  ['Header', { ...Header }],
  ['Footer', { ...Footer }],
  ['feature-cards', { ...featurecards }],
  ['cta-banner', { ...ctabanner }],
  ['ContentSplit', { ...ContentSplit }],
  ['content-cards', { ...contentcards }],
  ['Navigation', { ...Navigation }],
  ['SitecoreStyles', { ...SitecoreStyles }],
  ['CdpPageView', { ...CdpPageView }],
]);

export default componentMap;
