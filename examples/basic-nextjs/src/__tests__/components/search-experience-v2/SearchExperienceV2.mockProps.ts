import { Field, Page, PageMode, ComponentRendering } from '@sitecore-content-sdk/nextjs';
import { SearchExperienceProps } from '@/lib/search/search-components/models';

const mockPageBase: Page = {
  mode: {
    isEditing: false,
    isPreview: false,
    isNormal: true,
    name: 'normal' as PageMode['name'],
    designLibrary: { isVariantGeneration: false },
    isDesignLibrary: false,
  },
  layout: {
    sitecore: {
      context: {},
      route: {
        fields: {},
        name: 'search-page',
        displayName: 'Search Page',
        placeholders: {},
      },
    },
  },
  locale: 'en',
  siteName: 'test-site',
};

const mockPageEditing: Page = {
  ...mockPageBase,
  mode: {
    isEditing: true,
    isPreview: false,
    isNormal: false,
    name: 'edit' as PageMode['name'],
    designLibrary: { isVariantGeneration: false },
    isDesignLibrary: false,
  },
};

const mockRendering: ComponentRendering = {
  componentName: 'SearchExperienceV2',
  uid: 'search-uid-1',
} as ComponentRendering;

const mockParams = {
  styles: 'custom-style',
  RenderingIdentifier: 'search-v2-1',
  pageSize: '6',
  columns: '3',
};

const allFieldsPopulated = {
  SearchIndex: { value: 'test-search-index-guid' } as Field<string>,
  TitleMapping: { value: 'ProductName' } as Field<string>,
  DescriptionMapping: { value: 'Description' } as Field<string>,
  ImageMapping: { value: 'ImageUrl' } as Field<string>,
  TagsMapping: { value: 'Tags' } as Field<string>,
  LinkMapping: { value: 'Url' } as Field<string>,
  TypeMapping: { value: 'Category' } as Field<string>,
};

export const defaultProps: SearchExperienceProps = {
  params: mockParams,
  rendering: mockRendering,
  page: mockPageBase,
  fields: allFieldsPopulated,
};

export const propsEditing: SearchExperienceProps = {
  params: mockParams,
  rendering: mockRendering,
  page: mockPageEditing,
  fields: allFieldsPopulated,
};

export const propsEmptyFields: SearchExperienceProps = {
  params: mockParams,
  rendering: mockRendering,
  page: mockPageBase,
  fields: {
    SearchIndex: { value: 'test-search-index-guid' } as Field<string>,
  },
};

export const propsSingleColumn: SearchExperienceProps = {
  params: { ...mockParams, columns: '1' },
  rendering: mockRendering,
  page: mockPageBase,
  fields: allFieldsPopulated,
};

export const mockSearchResults = [
  {
    sc_item_id: 'item-1',
    ProductName: 'Widget Alpha',
    Description: 'A fine widget for your needs.',
    ImageUrl: '/images/widget-alpha.jpg',
    Tags: ['electronics', 'gadgets'],
    Url: '/products/widget-alpha',
    Category: 'Electronics',
  },
  {
    sc_item_id: 'item-2',
    ProductName: 'Widget Beta',
    Description: 'An even finer widget.',
    ImageUrl: '/images/widget-beta.jpg',
    Tags: 'premium',
    Url: '/products/widget-beta',
    Category: 'Premium',
  },
  {
    sc_item_id: 'item-3',
    ProductName: 'Widget Gamma',
    Description: 'The finest widget.',
    Url: '/products/widget-gamma',
    Category: 'Standard',
  },
];
