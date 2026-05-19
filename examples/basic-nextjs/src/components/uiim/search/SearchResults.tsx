'use client';

import React, { JSX, useState, useEffect, useCallback } from 'react';
import {
  Field,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface SearchResultsFields {
  SearchHeading: Field<string>;
  NoResultsMessage: Field<string>;
  SearchPlaceholderText: Field<string>;
}

type SearchResultsProps = ComponentProps & {
  fields: SearchResultsFields;
};

const SearchResultsDefaultComponent = (): JSX.Element => (
  <div className="component search-results">
    <div className="component-content">
      <span className="is-empty-hint">SearchResults</span>
    </div>
  </div>
);

interface SearchResult {
  id: string;
  title: string;
  url: string;
  description?: string;
  image_url?: string;
}

interface SearchFacet {
  name: string;
  label: string;
  values: { id: string; text: string; count: number }[];
}

const PAGE_SIZE = 10;

export const Default = ({ fields, params, page }: SearchResultsProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <SearchResultsDefaultComponent />;

  const [keyphrase, setKeyphrase] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [facets, setFacets] = useState<SearchFacet[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [sdkAvailable, setSdkAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Read keyphrase from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    setKeyphrase(q);
    setInputValue(q);
  }, []);

  // Check SDK availability
  useEffect(() => {
    const checkSdk = async () => {
      try {
        const searchModule = await import('@sitecore-cloudsdk/search/browser');
        setSdkAvailable(!!searchModule.getWidgetData);
      } catch {
        setSdkAvailable(false);
      }
    };
    checkSdk();
  }, []);

  // Fetch results
  const fetchResults = useCallback(
    async (phrase: string, page: number) => {
      if (!phrase || !sdkAvailable) return;

      setIsLoading(true);
      try {
        const { getWidgetData, SearchWidgetItem, WidgetRequestData, Context } =
          await import('@sitecore-cloudsdk/search/browser');

        const widget = new SearchWidgetItem('content', 'rfkid_7');
        widget.query = { keyphrase: phrase };
        widget.content = {};
        widget.limit = PAGE_SIZE;
        widget.offset = page * PAGE_SIZE;

        if (sortBy !== 'relevance') {
          widget.sort = { value: [{ name: sortBy, order: 'desc' }] };
        }

        const context = new Context({
          locale: { language: 'en', country: 'us' },
        });

        const response = await getWidgetData(new WidgetRequestData([widget]), context);
        const widgetData = response?.widgets?.[0];
        const items = widgetData?.content || [];

        setResults(
          items.map((item: Record<string, unknown>, index: number) => ({
            id: String(item.id || index),
            title: String(item.title || item.name || ''),
            url: String(item.url || '#'),
            description: item.description ? String(item.description) : undefined,
            image_url: item.image_url ? String(item.image_url) : undefined,
          }))
        );

        setTotalResults(widgetData?.total_item || 0);

        // Extract facets dynamically
        const facetData = widgetData?.facet || [];
        setFacets(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          facetData.map((f: any) => ({
            name: String(f.name || ''),
            label: String(f.label || f.name || ''),
            values: Array.isArray(f.value)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ? f.value.map((v: any) => ({
                  id: String(v.id || ''),
                  text: String(v.text || ''),
                  count: Number(v.count || 0),
                }))
              : [],
          }))
        );
      } catch {
        setResults([]);
        setFacets([]);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    },
    [sdkAvailable, sortBy]
  );

  useEffect(() => {
    if (keyphrase) {
      fetchResults(keyphrase, currentPage);
    }
  }, [keyphrase, currentPage, fetchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyphrase(inputValue);
    setCurrentPage(0);
    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set('q', inputValue);
    window.history.pushState({}, '', url.toString());
  };

  const totalPages = Math.ceil(totalResults / PAGE_SIZE);

  return (
    <div className={cn('component search-results', styles)} id={RenderingIdentifier}>
      <div className="mx-auto max-w-7xl px-4 py-12" data-testid="search-results">
        {/* Heading */}
        {(fields.SearchHeading?.value || isEditing) && (
          <Text
            field={fields.SearchHeading}
            tag="h1"
            className="mb-6 text-3xl font-bold"
            data-testid="search-heading"
          />
        )}

        {/* Search input */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={fields.SearchPlaceholderText?.value || 'Search...'}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              data-testid="search-input"
              disabled={isEditing}
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              data-testid="search-submit"
              disabled={isEditing}
            >
              Search
            </button>
          </div>
        </form>

        {/* SDK not available */}
        {sdkAvailable === false && (
          <div
            className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700"
            data-testid="search-unavailable"
          >
            Search is not configured. Configure Sitecore Search to enable results.
          </div>
        )}

        {/* Results layout */}
        {sdkAvailable !== false && keyphrase && (
          <div className="grid gap-8 md:grid-cols-[240px_1fr]">
            {/* Facets sidebar */}
            {facets.length > 0 && (
              <aside data-testid="search-facets">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Filters
                </h2>
                {facets.map((facet) => (
                  <div key={facet.name} className="mb-6">
                    <h3 className="mb-2 text-sm font-medium text-gray-900">{facet.label}</h3>
                    <ul className="space-y-1">
                      {facet.values.map((value) => (
                        <li key={value.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{value.text}</span>
                          <span className="text-xs text-gray-400">{value.count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </aside>
            )}

            {/* Results */}
            <div>
              {/* Sort + count */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500" data-testid="results-count">
                  {isLoading ? 'Searching...' : `${totalResults} results for "${keyphrase}"`}
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="rounded border border-gray-300 px-2 py-1 text-sm"
                  data-testid="sort-select"
                >
                  <option value="relevance">Relevance</option>
                  <option value="created_at">Newest</option>
                </select>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="py-12 text-center" data-testid="search-loading">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
                </div>
              )}

              {/* No results */}
              {!isLoading && results.length === 0 && keyphrase && (
                <div className="py-12 text-center" data-testid="no-results">
                  <Text
                    field={fields.NoResultsMessage}
                    tag="p"
                    className="text-gray-500"
                  />
                </div>
              )}

              {/* Result items */}
              {!isLoading && results.length > 0 && (
                <ul className="space-y-6" data-testid="results-list">
                  {results.map((result) => (
                    <li key={result.id} className="border-b border-gray-100 pb-6">
                      <a
                        href={result.url}
                        className="group block"
                        data-testid="result-item"
                      >
                        <h3 className="text-lg font-medium text-blue-600 group-hover:underline">
                          {result.title}
                        </h3>
                        {result.description && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">{result.url}</p>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {/* Pagination */}
              {!isLoading && totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-2" data-testid="pagination">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="rounded px-3 py-1 text-sm transition-colors hover:bg-gray-100 disabled:opacity-50"
                    data-testid="pagination-prev"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="rounded px-3 py-1 text-sm transition-colors hover:bg-gray-100 disabled:opacity-50"
                    data-testid="pagination-next"
                  >
                    Next
                  </button>
                </nav>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
