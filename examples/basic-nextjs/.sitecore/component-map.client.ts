// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as testimonialtrustpilot from 'src/components/ui/testimonial-trustpilot';
import * as subscriptionform from 'src/components/ui/subscription-form';
import * as sidebarpromo from 'src/components/ui/sidebar-promo';
import * as rewardoffercard from 'src/components/ui/reward-offer-card';
import * as quicklinks from 'src/components/ui/quick-links';
import * as providerquotescarousel from 'src/components/ui/provider-quotes-carousel';
import * as policyrecommendationgrid from 'src/components/ui/policy-recommendation-grid';
import * as personalizedgreeting from 'src/components/ui/personalized-greeting';
import * as insuranceupsellcard from 'src/components/ui/insurance-upsell-card';
import * as insurancepartners from 'src/components/ui/insurance-partners';
import * as insurancedetailscard from 'src/components/ui/insurance-details-card';
import * as herobanner from 'src/components/ui/hero-banner';
import * as header from 'src/components/ui/header';
import * as footer from 'src/components/ui/footer';
import * as compareservicesgrid from 'src/components/ui/compare-services-grid';
import * as avatar from 'src/components/ui/avatar';
import * as articletableofcontents from 'src/components/ui/article-table-of-contents';
import * as articlekeytakeaways from 'src/components/ui/article-key-takeaways';
import * as articleheroimage from 'src/components/ui/article-hero-image';
import * as articleheader from 'src/components/ui/article-header';
import * as articleguidescarousel from 'src/components/ui/article-guides-carousel';
import * as articlecontent from 'src/components/ui/article-content';
import * as Navigation from 'src/components/basic/navigation/Navigation';
import * as SitecoreStyles from 'src/components/basic/content-sdk/SitecoreStyles';
import * as CdpPageView from 'src/components/basic/content-sdk/CdpPageView';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['testimonial-trustpilot', { ...testimonialtrustpilot }],
  ['subscription-form', { ...subscriptionform }],
  ['sidebar-promo', { ...sidebarpromo }],
  ['reward-offer-card', { ...rewardoffercard }],
  ['quick-links', { ...quicklinks }],
  ['provider-quotes-carousel', { ...providerquotescarousel }],
  ['policy-recommendation-grid', { ...policyrecommendationgrid }],
  ['personalized-greeting', { ...personalizedgreeting }],
  ['insurance-upsell-card', { ...insuranceupsellcard }],
  ['insurance-partners', { ...insurancepartners }],
  ['insurance-details-card', { ...insurancedetailscard }],
  ['hero-banner', { ...herobanner }],
  ['header', { ...header }],
  ['footer', { ...footer }],
  ['compare-services-grid', { ...compareservicesgrid }],
  ['avatar', { ...avatar }],
  ['article-table-of-contents', { ...articletableofcontents }],
  ['article-key-takeaways', { ...articlekeytakeaways }],
  ['article-hero-image', { ...articleheroimage }],
  ['article-header', { ...articleheader }],
  ['article-guides-carousel', { ...articleguidescarousel }],
  ['article-content', { ...articlecontent }],
  ['Navigation', { ...Navigation }],
  ['SitecoreStyles', { ...SitecoreStyles }],
  ['CdpPageView', { ...CdpPageView }],
]);

export default componentMap;
