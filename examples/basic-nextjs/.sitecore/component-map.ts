// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as trustsection from 'src/components/ui/trust-section';
import * as travelinsurancebanner from 'src/components/ui/travel-insurance-banner';
import * as newsletter from 'src/components/ui/newsletter';
import * as morefromsaga from 'src/components/ui/more-from-saga';
import * as hero from 'src/components/ui/hero';
import * as header from 'src/components/ui/header';
import * as footer from 'src/components/ui/footer';
import * as categorydirectory from 'src/components/ui/category-directory';
import * as awardssection from 'src/components/ui/awards-section';
import * as articlecards from 'src/components/ui/article-cards';
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
  ['trust-section', { ...trustsection, componentType: 'client' }],
  ['travel-insurance-banner', { ...travelinsurancebanner, componentType: 'client' }],
  ['newsletter', { ...newsletter, componentType: 'client' }],
  ['more-from-saga', { ...morefromsaga, componentType: 'client' }],
  ['hero', { ...hero, componentType: 'client' }],
  ['header', { ...header, componentType: 'client' }],
  ['footer', { ...footer, componentType: 'client' }],
  ['category-directory', { ...categorydirectory, componentType: 'client' }],
  ['awards-section', { ...awardssection }],
  ['article-cards', { ...articlecards, componentType: 'client' }],
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
