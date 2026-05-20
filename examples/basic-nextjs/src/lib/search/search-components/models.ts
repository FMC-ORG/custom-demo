import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * A search result document from the Sitecore search index.
 * Only `sc_item_id` is guaranteed — all other fields depend on the index schema.
 */
export type SearchDocument = {
  sc_item_id: string;
  [key: string]: string | string[];
};

/**
 * Mapping of UI display slots to search index field names.
 * Values are the field names as they appear in the search index.
 */
export interface SearchFieldsMapping {
  description?: string;
  type?: string;
  title?: string;
  link?: string;
  images?: string;
  tags?: string;
}

/**
 * Datasource fields for SearchExperienceV2.
 * Each field is a Single-Line Text in Sitecore containing a search index field name.
 */
export interface SearchExperienceFields {
  SearchIndex?: Field<string>;
  TitleMapping?: Field<string>;
  DescriptionMapping?: Field<string>;
  ImageMapping?: Field<string>;
  TagsMapping?: Field<string>;
  LinkMapping?: Field<string>;
  TypeMapping?: Field<string>;
}

export type SearchExperienceProps = ComponentProps & {
  fields: SearchExperienceFields;
};

export type SearchItemVariant = 'card' | 'list';
