// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as ValuesBanner from 'src/components/ui/values-banner/ValuesBanner';
import * as SuccessCase from 'src/components/ui/success-case/SuccessCase';
import * as StatsBar from 'src/components/ui/stats-bar/StatsBar';
import * as ServicesNav from 'src/components/ui/services-nav/ServicesNav';
import * as SectionHeader from 'src/components/ui/section-header/SectionHeader';
import * as PromotionalHeader from 'src/components/ui/promotional-header/PromotionalHeader';
import * as LocaleAwareLink from 'src/components/ui/locale-link/LocaleAwareLink';
import * as LanguageSwitcher from 'src/components/ui/language-switcher/LanguageSwitcher';
import * as IntroStatement from 'src/components/ui/intro-statement/IntroStatement';
import * as HeroSlider from 'src/components/ui/hero-slider/HeroSlider';
import * as Header from 'src/components/ui/header/Header';
import * as Footer from 'src/components/ui/footer/Footer';
import * as ContentSplit from 'src/components/ui/content-split/ContentSplit';
import * as CaseHistoryCards from 'src/components/ui/case-history-cards/CaseHistoryCards';
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
  ['ValuesBanner', { ...ValuesBanner, componentType: 'client' }],
  ['SuccessCase', { ...SuccessCase, componentType: 'client' }],
  ['StatsBar', { ...StatsBar, componentType: 'client' }],
  ['ServicesNav', { ...ServicesNav, componentType: 'client' }],
  ['SectionHeader', { ...SectionHeader, componentType: 'client' }],
  ['PromotionalHeader', { ...PromotionalHeader, componentType: 'client' }],
  ['LocaleAwareLink', { ...LocaleAwareLink, componentType: 'client' }],
  ['LanguageSwitcher', { ...LanguageSwitcher, componentType: 'client' }],
  ['IntroStatement', { ...IntroStatement, componentType: 'client' }],
  ['HeroSlider', { ...HeroSlider, componentType: 'client' }],
  ['Header', { ...Header, componentType: 'client' }],
  ['Footer', { ...Footer, componentType: 'client' }],
  ['ContentSplit', { ...ContentSplit, componentType: 'client' }],
  ['CaseHistoryCards', { ...CaseHistoryCards, componentType: 'client' }],
  ['Title', { ...Title }],
  ['RowSplitter', { ...RowSplitter }],
  ['RichText', { ...RichText }],
  ['Promo', { ...Promo, componentType: 'client' }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['PageContent', { ...PageContent }],
  ['Navigation', { ...Navigation, componentType: 'client' }],
  ['LinkList', { ...LinkList }],
  ['Image', { ...Image, componentType: 'client' }],
  ['SitecoreStyles', { ...SitecoreStyles, componentType: 'client' }],
  ['CdpPageView', { ...CdpPageView, componentType: 'client' }],
  ['ContentBlock', { ...ContentBlock }],
  ['Container', { ...Container }],
  ['ColumnSplitter', { ...ColumnSplitter }],
]);

export default componentMap;
