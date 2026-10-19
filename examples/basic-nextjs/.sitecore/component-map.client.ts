// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as SearchTypeahead from 'src/components/uiim/search/SearchTypeahead';
import * as SearchResults from 'src/components/uiim/search/SearchResults';
import * as SearchExperienceV2 from 'src/components/uiim/search/SearchExperienceV2';
import * as SearchCollection from 'src/components/uiim/search/SearchCollection';
import * as NavigationHeader from 'src/components/uiim/navigation/NavigationHeader';
import * as LandingFAQ from 'src/components/uiim/landing/LandingFAQ';
import * as NewsletterSignup from 'src/components/uiim/forms/NewsletterSignup';
import * as IdentityEventDevForm from 'src/components/uiim/forms/IdentityEventDevForm';
import * as IdentityCaptureForm from 'src/components/uiim/forms/IdentityCaptureForm';
import * as FeatureCardsGrid from 'src/components/uiim/cards/FeatureCardsGrid';
import * as HeroBannerCarousel from 'src/components/uiim/banners/HeroBannerCarousel';
import * as ArticleHero from 'src/components/uiim/article/ArticleHero';
import * as SearchExperienceLoadMore from 'src/components/search-experience/SearchExperience.LoadMore';
import * as SearchExperience from 'src/components/search-experience/SearchExperience';
import * as Navigation from 'src/components/basic/navigation/Navigation';
import * as ContentBlock from 'src/components/basic/content-block/ContentBlock';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['SearchTypeahead', { ...SearchTypeahead }],
  ['SearchResults', { ...SearchResults }],
  ['SearchExperienceV2', { ...SearchExperienceV2 }],
  ['SearchCollection', { ...SearchCollection }],
  ['NavigationHeader', { ...NavigationHeader }],
  ['LandingFAQ', { ...LandingFAQ }],
  ['NewsletterSignup', { ...NewsletterSignup }],
  ['IdentityEventDevForm', { ...IdentityEventDevForm }],
  ['IdentityCaptureForm', { ...IdentityCaptureForm }],
  ['FeatureCardsGrid', { ...FeatureCardsGrid }],
  ['HeroBannerCarousel', { ...HeroBannerCarousel }],
  ['ArticleHero', { ...ArticleHero }],
  ['SearchExperience', { ...SearchExperienceLoadMore, ...SearchExperience }],
  ['Navigation', { ...Navigation }],
  ['ContentBlock', { ...ContentBlock }],
]);

export default componentMap;
