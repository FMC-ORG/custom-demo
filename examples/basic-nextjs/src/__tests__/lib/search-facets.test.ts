import {
  buildFacetRequest,
  facetOptions,
  humanizeFacetName,
  normalizeItemId,
  parseFacetDefinitions,
  parseFacetValues,
  serializeFacetValues,
  toggleFacetValue,
} from '@/lib/search-ui/facets';

describe('parseFacetDefinitions', () => {
  it('parses names, optional labels, trims, and dedupes', () => {
    expect(parseFacetDefinitions(' ArticleTopic:Topic, ArticleAuthor ,ArticleTopic,, ')).toEqual([
      { name: 'ArticleTopic', label: 'Topic' },
      { name: 'ArticleAuthor', label: 'Author' },
    ]);
  });

  it('returns nothing for empty input', () => {
    expect(parseFacetDefinitions('')).toEqual([]);
    expect(parseFacetDefinitions(undefined)).toEqual([]);
  });
});

describe('humanizeFacetName', () => {
  it('drops a leading Article prefix and splits camel case', () => {
    expect(humanizeFacetName('ArticleTopic')).toBe('Topic');
    expect(humanizeFacetName('ContentType')).toBe('Content Type');
    expect(humanizeFacetName('Articles')).toBe('Articles');
  });
});

describe('buildFacetRequest', () => {
  const defs = parseFacetDefinitions('ArticleTopic,ArticleAuthor');

  it('requests counts for every facet and OR-filters selected ones', () => {
    expect(buildFacetRequest(defs, { ArticleTopic: ['AI', 'Engineering'] })).toEqual({
      fields: [
        { name: 'ArticleTopic', filters: [{ operator: 'eq', value: ['AI', 'Engineering'] }] },
        { name: 'ArticleAuthor' },
      ],
    });
  });

  it('is undefined without facets', () => {
    expect(buildFacetRequest([], {})).toBeUndefined();
  });
});

describe('selection helpers', () => {
  it('toggles values and removes emptied facets', () => {
    const one = toggleFacetValue({}, 'ArticleTopic', 'AI');
    expect(one).toEqual({ ArticleTopic: ['AI'] });
    expect(toggleFacetValue(one, 'ArticleTopic', 'AI')).toEqual({});
  });

  it('round-trips URL values with commas intact', () => {
    const values = ['Customer Data, Analytics', 'AI'];
    expect(parseFacetValues(serializeFacetValues(values))).toEqual(values);
  });

  it('keeps selected values missing from the API as count 0', () => {
    expect(facetOptions([{ text: 'AI', count: 2 }], ['Engineering'])).toEqual([
      { value: 'AI', count: 2, selected: false },
      { value: 'Engineering', count: 0, selected: true },
    ]);
  });
});

describe('normalizeItemId', () => {
  it('normalizes braces, case, and missing dashes to the dashed lowercase GUID', () => {
    const expected = '9a0d5430-275e-4663-bd5c-852659ae802b';
    expect(normalizeItemId('{9A0D5430-275E-4663-BD5C-852659AE802B}')).toBe(expected);
    expect(normalizeItemId('9a0d5430275e4663bd5c852659ae802b')).toBe(expected);
  });

  it('returns empty for non-GUIDs', () => {
    expect(normalizeItemId('home')).toBe('');
    expect(normalizeItemId(undefined)).toBe('');
  });
});
