// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as NavigationHeader from 'src/components/uiim/navigation/NavigationHeader';
import * as NewsletterSignup from 'src/components/uiim/forms/NewsletterSignup';
import * as FeatureCardsGrid from 'src/components/uiim/cards/FeatureCardsGrid';
import * as HeroBannerCarousel from 'src/components/uiim/banners/HeroBannerCarousel';
import * as Navigation from 'src/components/basic/navigation/Navigation';
import * as SitecoreStyles from 'src/components/basic/content-sdk/SitecoreStyles';
import * as CdpPageView from 'src/components/basic/content-sdk/CdpPageView';
import * as ContentBlock from 'src/components/basic/content-block/ContentBlock';
import * as ArticleHero from 'src/components/uiim/article/ArticleHero';
import * as ArticleBody from 'src/components/uiim/article/ArticleBody';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['NavigationHeader', { ...NavigationHeader }],
  ['NewsletterSignup', { ...NewsletterSignup }],
  ['FeatureCardsGrid', { ...FeatureCardsGrid }],
  ['HeroBannerCarousel', { ...HeroBannerCarousel }],
  ['Navigation', { ...Navigation }],
  ['SitecoreStyles', { ...SitecoreStyles }],
  ['CdpPageView', { ...CdpPageView }],
  ['ContentBlock', { ...ContentBlock }],
  ['ArticleHero', { ...ArticleHero }],
  ['ArticleBody', { ...ArticleBody }],
]);

export default componentMap;
