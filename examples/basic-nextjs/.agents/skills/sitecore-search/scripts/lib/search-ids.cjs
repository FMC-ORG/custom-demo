'use strict';
/**
 * Serialized framework IDs used by search seeding and connection (ADR 0013). These items are
 * serialized, so the IDs are the same in every environment.
 */
const TEMPLATES = {
  article: '74360ad2-d3df-4fce-834c-2f5420488677', // Article Page Template
  searchResults: '5cf70cbe-f1c9-4e58-a424-a6614ebd7071',
  searchCollection: '449fe2dc-8d9a-439e-8bb1-6ebb01d43083',
  searchTypeahead: '4fc72579-05b8-4334-8a6e-3307c335a7f7',
  navigationHeaderData: '9b720c4e-e7e7-4c12-bca1-e92270b476cc',
};

const RENDERINGS = {
  searchResults: 'd33f0079-e54f-48c3-a33a-6a3a83146da8',
  searchCollection: '158772e0-46fd-4626-9144-527c24854f97',
};

/** Data/ folders that hold search datasources (framework folder names). */
const DATA_FOLDERS = ['SearchResults', 'SearchCollections', 'SearchTypeaheads', 'NavigationHeaders'];

/**
 * Field mappings for the articles push source. The source UI stores field names lowercased, and
 * documents come back lowercase; facets keep their display name (ADR 0011).
 */
const ARTICLE_MAPPINGS = {
  TitleMapping: 'title',
  DescriptionMapping: 'articlecontent',
  ImageMapping: 'articleimage',
  LinkMapping: 'articleurl',
  DateMapping: 'articlepublicationdate',
};
const ARTICLE_SORT = 'articlepublicationdate';
const ARTICLE_FACETS = 'ArticleTopic';

const sameId = (a, b) =>
  String(a || '').replace(/[{}]/g, '').toLowerCase() === String(b || '').replace(/[{}]/g, '').toLowerCase();

module.exports = {
  TEMPLATES,
  RENDERINGS,
  DATA_FOLDERS,
  ARTICLE_MAPPINGS,
  ARTICLE_SORT,
  ARTICLE_FACETS,
  sameId,
};
