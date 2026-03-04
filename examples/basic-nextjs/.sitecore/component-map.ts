// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as StatsBar from 'src/components/ui/stats-bar/StatsBar';
import * as SectionHeader from 'src/components/ui/section-header/SectionHeader';
import * as PromotionalHeader from 'src/components/ui/promotional-header/PromotionalHeader';
import * as HeroBanner from 'src/components/ui/hero-banner/HeroBanner';
import * as Header from 'src/components/ui/header/Header';
import * as Footer from 'src/components/ui/footer/Footer';
import * as FeatureCards from 'src/components/ui/feature-cards/FeatureCards';
import * as CtaBanner from 'src/components/ui/cta-banner/CtaBanner';
import * as ContentSplit from 'src/components/ui/content-split/ContentSplit';
import * as ContentCards from 'src/components/ui/content-cards/ContentCards';
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
  ['StatsBar', { ...StatsBar, componentType: 'client' }],
  ['SectionHeader', { ...SectionHeader, componentType: 'client' }],
  ['PromotionalHeader', { ...PromotionalHeader, componentType: 'client' }],
  ['HeroBanner', { ...HeroBanner, componentType: 'client' }],
  ['Header', { ...Header, componentType: 'client' }],
  ['Footer', { ...Footer, componentType: 'client' }],
  ['FeatureCards', { ...FeatureCards, componentType: 'client' }],
  ['CtaBanner', { ...CtaBanner, componentType: 'client' }],
  ['ContentSplit', { ...ContentSplit, componentType: 'client' }],
  ['ContentCards', { ...ContentCards, componentType: 'client' }],
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
