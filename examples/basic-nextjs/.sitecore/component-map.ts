// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
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
import * as Title from 'src/components/basic/title/Title';
import * as RowSplitter from 'src/components/basic/row-splitter/RowSplitter';
import * as RichText from 'src/components/basic/rich-text/RichText';
import * as Promo from 'src/components/basic/promo/Promo';
import * as PartialDesignDynamicPlaceholder from 'src/components/basic/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';
import * as PageContent from 'src/components/basic/page-content/PageContent';
import * as Navigation from 'src/components/basic/navigation/Navigation';
import * as LinkList from 'src/components/basic/link-list/LinkList';
import * as Image from 'src/components/basic/image/Image';
import * as SitecoreStyles from 'src/components/basic/content-sdk/SitecoreStyles';
import * as CdpPageView from 'src/components/basic/content-sdk/CdpPageView';
import * as ContentBlock from 'src/components/basic/content-block/ContentBlock';
import * as Container from 'src/components/basic/container/Container';
import * as ColumnSplitter from 'src/components/basic/column-splitter/ColumnSplitter';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCServerWrapper],
  ['FEaaSWrapper', FEaaSServerWrapper],
  ['Form', { ...Form, componentType: 'client' }],
  ['testimonial-trustpilot', { ...testimonialtrustpilot, componentType: 'client' }],
  ['subscription-form', { ...subscriptionform, componentType: 'client' }],
  ['sidebar-promo', { ...sidebarpromo, componentType: 'client' }],
  ['reward-offer-card', { ...rewardoffercard, componentType: 'client' }],
  ['quick-links', { ...quicklinks, componentType: 'client' }],
  ['provider-quotes-carousel', { ...providerquotescarousel, componentType: 'client' }],
  ['policy-recommendation-grid', { ...policyrecommendationgrid, componentType: 'client' }],
  ['personalized-greeting', { ...personalizedgreeting, componentType: 'client' }],
  ['insurance-upsell-card', { ...insuranceupsellcard, componentType: 'client' }],
  ['insurance-partners', { ...insurancepartners, componentType: 'client' }],
  ['insurance-details-card', { ...insurancedetailscard, componentType: 'client' }],
  ['hero-banner', { ...herobanner, componentType: 'client' }],
  ['header', { ...header, componentType: 'client' }],
  ['footer', { ...footer, componentType: 'client' }],
  ['compare-services-grid', { ...compareservicesgrid, componentType: 'client' }],
  ['avatar', { ...avatar, componentType: 'client' }],
  ['article-table-of-contents', { ...articletableofcontents, componentType: 'client' }],
  ['article-key-takeaways', { ...articlekeytakeaways, componentType: 'client' }],
  ['article-hero-image', { ...articleheroimage, componentType: 'client' }],
  ['article-header', { ...articleheader, componentType: 'client' }],
  ['article-guides-carousel', { ...articleguidescarousel, componentType: 'client' }],
  ['article-content', { ...articlecontent, componentType: 'client' }],
  ['Title', { ...Title }],
  ['RowSplitter', { ...RowSplitter }],
  ['RichText', { ...RichText }],
  ['Promo', { ...Promo }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['PageContent', { ...PageContent }],
  ['Navigation', { ...Navigation, componentType: 'client' }],
  ['LinkList', { ...LinkList }],
  ['Image', { ...Image }],
  ['SitecoreStyles', { ...SitecoreStyles, componentType: 'client' }],
  ['CdpPageView', { ...CdpPageView, componentType: 'client' }],
  ['ContentBlock', { ...ContentBlock }],
  ['Container', { ...Container }],
  ['ColumnSplitter', { ...ColumnSplitter }],
]);

export default componentMap;
