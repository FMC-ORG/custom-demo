// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as TestimonialBlock from 'src/components/uiim/social-proof/TestimonialBlock';
import * as LogoCloud from 'src/components/uiim/social-proof/LogoCloud';
import * as TabNavigationSection from 'src/components/uiim/navigation/TabNavigationSection';
import * as SiteFooter from 'src/components/uiim/navigation/SiteFooter';
import * as NavigationHeader from 'src/components/uiim/navigation/NavigationHeader';
import * as AnnouncementBar from 'src/components/uiim/navigation/AnnouncementBar';
import * as ImageGallery from 'src/components/uiim/media/ImageGallery';
import * as NewsletterSignup from 'src/components/uiim/forms/NewsletterSignup';
import * as ValuePropositionGrid from 'src/components/uiim/content/ValuePropositionGrid';
import * as TrustStatsRow from 'src/components/uiim/content/TrustStatsRow';
import * as RichTextBlock from 'src/components/uiim/content/RichTextBlock';
import * as LegalComplianceBanner from 'src/components/uiim/content/LegalComplianceBanner';
import * as FeatureHighlight from 'src/components/uiim/content/FeatureHighlight';
import * as FAQAccordion from 'src/components/uiim/content/FAQAccordion';
import * as ProductPricingCards from 'src/components/uiim/cards/ProductPricingCards';
import * as FeatureCardsGrid from 'src/components/uiim/cards/FeatureCardsGrid';
import * as HeroBanner from 'src/components/uiim/banners/HeroBanner';
import * as CTABanner from 'src/components/uiim/banners/CTABanner';
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
  ['TestimonialBlock', { ...TestimonialBlock }],
  ['LogoCloud', { ...LogoCloud }],
  ['TabNavigationSection', { ...TabNavigationSection }],
  ['SiteFooter', { ...SiteFooter }],
  ['NavigationHeader', { ...NavigationHeader, componentType: 'client' }],
  ['AnnouncementBar', { ...AnnouncementBar }],
  ['ImageGallery', { ...ImageGallery }],
  ['NewsletterSignup', { ...NewsletterSignup, componentType: 'client' }],
  ['ValuePropositionGrid', { ...ValuePropositionGrid }],
  ['TrustStatsRow', { ...TrustStatsRow }],
  ['RichTextBlock', { ...RichTextBlock }],
  ['LegalComplianceBanner', { ...LegalComplianceBanner }],
  ['FeatureHighlight', { ...FeatureHighlight }],
  ['FAQAccordion', { ...FAQAccordion }],
  ['ProductPricingCards', { ...ProductPricingCards }],
  ['FeatureCardsGrid', { ...FeatureCardsGrid }],
  ['HeroBanner', { ...HeroBanner }],
  ['CTABanner', { ...CTABanner }],
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
