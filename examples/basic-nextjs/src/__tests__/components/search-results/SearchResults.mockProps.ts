import { Field, Page, PageMode, ComponentRendering } from '@sitecore-content-sdk/nextjs';

const mockPageBase: Page = {
  mode: {
    isEditing: false,
    isPreview: false,
    isNormal: true,
    name: 'normal' as PageMode['name'],
    designLibrary: { isVariantGeneration: false },
    isDesignLibrary: false,
  },
  layout: { sitecore: { context: {}, route: null } },
  locale: 'en',
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

const mockParams = {
  styles: 'custom-style',
  RenderingIdentifier: 'search-results-1',
};

const mockRendering: ComponentRendering = {
  componentName: 'SearchResults',
} as ComponentRendering;

const mockFields = {
  SearchHeading: { value: 'Search Results' } as Field<string>,
  NoResultsMessage: { value: 'No results found for your query. Try different search terms.' } as Field<string>,
  SearchPlaceholderText: { value: 'Search...' } as Field<string>,
};

export const defaultProps = {
  params: mockParams,
  rendering: mockRendering,
  page: mockPageBase,
  fields: mockFields,
};

export const propsEditing = {
  ...defaultProps,
  page: mockPageEditing,
};

export const propsNoFields = {
  params: mockParams,
  rendering: mockRendering,
  page: mockPageBase,
  fields: null as typeof mockFields | null,
};

export const propsWithoutHeading = {
  ...defaultProps,
  fields: {
    ...mockFields,
    SearchHeading: { value: '' } as Field<string>,
  },
};
