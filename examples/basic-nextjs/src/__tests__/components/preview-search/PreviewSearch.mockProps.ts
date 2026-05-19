import { Field, LinkField, Page, PageMode, ComponentRendering } from '@sitecore-content-sdk/nextjs';

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
  RenderingIdentifier: 'preview-search-1',
};

const mockRendering: ComponentRendering = {
  componentName: 'PreviewSearch',
} as ComponentRendering;

const mockFields = {
  SearchPlaceholderText: { value: 'Search articles, products...' } as Field<string>,
  SearchLabel: { value: 'Site Search' } as Field<string>,
  ResultsPageLink: {
    value: { href: '/search', text: 'Search Results', linktype: 'internal', target: '' },
  } as LinkField,
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

export const propsWithoutPlaceholder = {
  ...defaultProps,
  fields: {
    ...mockFields,
    SearchPlaceholderText: { value: '' } as Field<string>,
  },
};

export const propsWithoutLabel = {
  ...defaultProps,
  fields: {
    ...mockFields,
    SearchLabel: { value: '' } as Field<string>,
  },
};

export const propsWithoutResultsLink = {
  ...defaultProps,
  fields: {
    ...mockFields,
    ResultsPageLink: { value: { href: '' } } as LinkField,
  },
};
