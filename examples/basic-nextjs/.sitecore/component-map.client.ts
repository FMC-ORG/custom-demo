// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as ValuesBanner from 'src/components/ui/values-banner/ValuesBanner';
import * as StatsBar from 'src/components/ui/stats-bar/StatsBar';
import * as ServicesNav from 'src/components/ui/services-nav/ServicesNav';
import * as SectionHeader from 'src/components/ui/section-header/SectionHeader';
import * as PromotionalHeader from 'src/components/ui/promotional-header/PromotionalHeader';
import * as IntroStatement from 'src/components/ui/intro-statement/IntroStatement';
import * as HeroSlider from 'src/components/ui/hero-slider/HeroSlider';
import * as Header from 'src/components/ui/header/Header';
import * as Footer from 'src/components/ui/footer/Footer';
import * as ContentSplit from 'src/components/ui/content-split/ContentSplit';
import * as CaseHistoryCards from 'src/components/ui/case-history-cards/CaseHistoryCards';
import * as Navigation from 'src/components/basic/navigation/Navigation';
import * as SitecoreStyles from 'src/components/basic/content-sdk/SitecoreStyles';
import * as CdpPageView from 'src/components/basic/content-sdk/CdpPageView';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['ValuesBanner', { ...ValuesBanner }],
  ['StatsBar', { ...StatsBar }],
  ['ServicesNav', { ...ServicesNav }],
  ['SectionHeader', { ...SectionHeader }],
  ['PromotionalHeader', { ...PromotionalHeader }],
  ['IntroStatement', { ...IntroStatement }],
  ['HeroSlider', { ...HeroSlider }],
  ['Header', { ...Header }],
  ['Footer', { ...Footer }],
  ['ContentSplit', { ...ContentSplit }],
  ['CaseHistoryCards', { ...CaseHistoryCards }],
  ['Navigation', { ...Navigation }],
  ['SitecoreStyles', { ...SitecoreStyles }],
  ['CdpPageView', { ...CdpPageView }],
]);

export default componentMap;
