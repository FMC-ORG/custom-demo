// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

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
import * as SearchItemTitle from 'src/components/basic/search-experience/search-components/SearchItem/SearchItemTitle';
import * as SearchItemSummary from 'src/components/basic/search-experience/search-components/SearchItem/SearchItemSummary';
import * as SearchItemSubTitle from 'src/components/basic/search-experience/search-components/SearchItem/SearchItemSubTitle';
import * as SearchItemLink from 'src/components/basic/search-experience/search-components/SearchItem/SearchItemLink';
import * as SearchItemCategory from 'src/components/basic/search-experience/search-components/SearchItem/SearchItemCategory';
import * as index from 'src/components/basic/search-experience/search-components/SearchItem/index';
import * as Navigation from 'src/components/basic/navigation/Navigation';
import * as SitecoreStyles from 'src/components/basic/content-sdk/SitecoreStyles';
import * as CdpPageView from 'src/components/basic/content-sdk/CdpPageView';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['trust-section', { ...trustsection }],
  ['travel-insurance-banner', { ...travelinsurancebanner }],
  ['subscription-popup', { ...subscriptionpopup }],
  ['promo-card', { ...promocard }],
  ['newsletter', { ...newsletter }],
  ['newsletter-signup-demo', { ...newslettersignupdemo }],
  ['more-from-saga', { ...morefromsaga }],
  ['hero', { ...hero }],
  ['header', { ...header }],
  ['footer', { ...footer }],
  ['category-directory', { ...categorydirectory }],
  ['breadcrumbs', { ...breadcrumbs }],
  ['breadcrumb', { ...breadcrumb }],
  ['awards-section', { ...awardssection }],
  ['article-title-excerpt', { ...articletitleexcerpt }],
  ['article-image-meta', { ...articleimagemeta }],
  ['article-content', { ...articlecontent }],
  ['article-cards', { ...articlecards }],
  ['SearchExperience', { ...SearchExperienceLoadMore, ...SearchExperience }],
  ['useSearchField', { ...useSearchField }],
  ['useRouter', { ...useRouter }],
  ['useParams', { ...useParams }],
  ['useEvent', { ...useEvent }],
  ['useDebounce', { ...useDebounce }],
  ['SearchSkeletonItem', { ...SearchSkeletonItem }],
  ['SearchPagination', { ...SearchPagination }],
  ['SearchItemCommon', { ...SearchItemCommon }],
  ['SearchInput', { ...SearchInput }],
  ['SearchError', { ...SearchError }],
  ['SearchEmptyResults', { ...SearchEmptyResults }],
  ['SearchItemTitle', { ...SearchItemTitle }],
  ['SearchItemSummary', { ...SearchItemSummary }],
  ['SearchItemSubTitle', { ...SearchItemSubTitle }],
  ['SearchItemLink', { ...SearchItemLink }],
  ['SearchItemCategory', { ...SearchItemCategory }],
  ['index', { ...index }],
  ['Navigation', { ...Navigation }],
  ['SitecoreStyles', { ...SitecoreStyles }],
  ['CdpPageView', { ...CdpPageView }],
]);

export default componentMap;
