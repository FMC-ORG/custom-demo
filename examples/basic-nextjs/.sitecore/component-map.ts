// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as trustsection from 'src/components/ui/trust-section';
import * as travelinsurancebanner from 'src/components/ui/travel-insurance-banner';
import * as subscriptionpopup from 'src/components/ui/subscription-popup';
import * as promocard from 'src/components/ui/promo-card';
import * as newsletter from 'src/components/ui/newsletter';
import * as newslettersignupdemo from 'src/components/ui/newsletter-signup-demo';
import * as morefromsaga from 'src/components/ui/more-from-saga';
import * as hero from 'src/components/ui/hero';
import * as header from 'src/components/ui/header';
import * as footer from 'src/components/ui/footer';
import * as categorydirectory from 'src/components/ui/category-directory';
import * as breadcrumbs from 'src/components/ui/breadcrumbs';
import * as breadcrumb from 'src/components/ui/breadcrumb';
import * as awardssection from 'src/components/ui/awards-section';
import * as articletitleexcerpt from 'src/components/ui/article-title-excerpt';
import * as articleimagemeta from 'src/components/ui/article-image-meta';
import * as articlecontent from 'src/components/ui/article-content';
import * as articlecards from 'src/components/ui/article-cards';
import * as Title from 'src/components/basic/title/Title';
import * as SearchExperienceLoadMore from 'src/components/basic/search-experience/SearchExperience.LoadMore';
import * as SearchExperience from 'src/components/basic/search-experience/SearchExperience';
import * as useSearchField from 'src/components/basic/search-experience/search-components/useSearchField';
import * as useRouter from 'src/components/basic/search-experience/search-components/useRouter';
import * as useParams from 'src/components/basic/search-experience/search-components/useParams';
import * as useEvent from 'src/components/basic/search-experience/search-components/useEvent';
import * as useDebounce from 'src/components/basic/search-experience/search-components/useDebounce';
import * as SearchSkeletonItem from 'src/components/basic/search-experience/search-components/SearchSkeletonItem';
import * as SearchPagination from 'src/components/basic/search-experience/search-components/SearchPagination';
import * as SearchItemCommon from 'src/components/basic/search-experience/search-components/SearchItemCommon';
import * as SearchInput from 'src/components/basic/search-experience/search-components/SearchInput';
import * as SearchError from 'src/components/basic/search-experience/search-components/SearchError';
import * as SearchEmptyResults from 'src/components/basic/search-experience/search-components/SearchEmptyResults';
import * as models from 'src/components/basic/search-experience/search-components/models';
import * as constants from 'src/components/basic/search-experience/search-components/constants';
import * as SearchItemTitle from 'src/components/basic/search-experience/search-components/SearchItem/SearchItemTitle';
import * as SearchItemSummary from 'src/components/basic/search-experience/search-components/SearchItem/SearchItemSummary';
import * as SearchItemSubTitle from 'src/components/basic/search-experience/search-components/SearchItem/SearchItemSubTitle';
import * as SearchItemLink from 'src/components/basic/search-experience/search-components/SearchItem/SearchItemLink';
import * as SearchItemCategory from 'src/components/basic/search-experience/search-components/SearchItem/SearchItemCategory';
import * as index from 'src/components/basic/search-experience/search-components/SearchItem/index';
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
  ['subscription-popup', { ...subscriptionpopup, componentType: 'client' }],
  ['promo-card', { ...promocard, componentType: 'client' }],
  ['newsletter', { ...newsletter, componentType: 'client' }],
  ['newsletter-signup-demo', { ...newslettersignupdemo, componentType: 'client' }],
  ['more-from-saga', { ...morefromsaga, componentType: 'client' }],
  ['hero', { ...hero, componentType: 'client' }],
  ['header', { ...header, componentType: 'client' }],
  ['footer', { ...footer, componentType: 'client' }],
  ['category-directory', { ...categorydirectory, componentType: 'client' }],
  ['breadcrumbs', { ...breadcrumbs, componentType: 'client' }],
  ['breadcrumb', { ...breadcrumb, componentType: 'client' }],
  ['awards-section', { ...awardssection, componentType: 'client' }],
  ['article-title-excerpt', { ...articletitleexcerpt, componentType: 'client' }],
  ['article-image-meta', { ...articleimagemeta, componentType: 'client' }],
  ['article-content', { ...articlecontent, componentType: 'client' }],
  ['article-cards', { ...articlecards, componentType: 'client' }],
  ['Title', { ...Title }],
  ['SearchExperience', { ...SearchExperienceLoadMore, ...SearchExperience, componentType: 'client' }],
  ['useSearchField', { ...useSearchField, componentType: 'client' }],
  ['useRouter', { ...useRouter, componentType: 'client' }],
  ['useParams', { ...useParams, componentType: 'client' }],
  ['useEvent', { ...useEvent, componentType: 'client' }],
  ['useDebounce', { ...useDebounce, componentType: 'client' }],
  ['SearchSkeletonItem', { ...SearchSkeletonItem, componentType: 'client' }],
  ['SearchPagination', { ...SearchPagination, componentType: 'client' }],
  ['SearchItemCommon', { ...SearchItemCommon, componentType: 'client' }],
  ['SearchInput', { ...SearchInput, componentType: 'client' }],
  ['SearchError', { ...SearchError, componentType: 'client' }],
  ['SearchEmptyResults', { ...SearchEmptyResults, componentType: 'client' }],
  ['models', { ...models }],
  ['constants', { ...constants }],
  ['SearchItemTitle', { ...SearchItemTitle, componentType: 'client' }],
  ['SearchItemSummary', { ...SearchItemSummary, componentType: 'client' }],
  ['SearchItemSubTitle', { ...SearchItemSubTitle, componentType: 'client' }],
  ['SearchItemLink', { ...SearchItemLink, componentType: 'client' }],
  ['SearchItemCategory', { ...SearchItemCategory, componentType: 'client' }],
  ['index', { ...index, componentType: 'client' }],
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
