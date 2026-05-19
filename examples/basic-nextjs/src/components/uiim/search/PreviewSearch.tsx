'use client';

import React, { JSX, useState, useEffect, useRef, useCallback } from 'react';
import {
  Field,
  LinkField,
  Text,
  Link as ContentSdkLink,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface PreviewSearchFields {
  SearchPlaceholderText: Field<string>;
  SearchLabel: Field<string>;
  ResultsPageLink: LinkField;
}

type PreviewSearchProps = ComponentProps & {
  fields: PreviewSearchFields;
};

const PreviewSearchDefaultComponent = (): JSX.Element => (
  <div className="component preview-search">
    <div className="component-content">
      <span className="is-empty-hint">PreviewSearch</span>
    </div>
  </div>
);

interface SearchSuggestion {
  id: string;
  title: string;
  url: string;
  description?: string;
}

function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const Default = ({ fields, params, page }: PreviewSearchProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <PreviewSearchDefaultComponent />;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [sdkAvailable, setSdkAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

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

  // Fetch suggestions on debounced query change
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2 || !sdkAvailable) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const { getWidgetData, SearchWidgetItem, WidgetRequestData, Context } =
          await import('@sitecore-cloudsdk/search/browser');

        const widget = new SearchWidgetItem('content', 'rfkid_6');
        widget.query = { keyphrase: debouncedQuery };
        widget.limit = 6;

        const context = new Context({
          locale: { language: 'en', country: 'us' },
        });

        const response = await getWidgetData(new WidgetRequestData([widget]), context);
        const items = response?.widgets?.[0]?.content || [];

        setSuggestions(
          items.map((item: Record<string, unknown>, index: number) => ({
            id: String(item.id || index),
            title: String(item.title || item.name || ''),
            url: String(item.url || '#'),
            description: item.description ? String(item.description) : undefined,
          }))
        );
        setIsOpen(items.length > 0);
      } catch {
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, sdkAvailable]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = useCallback(
    (keyphrase: string) => {
      const resultsHref = fields.ResultsPageLink?.value?.href;
      if (resultsHref && keyphrase) {
        const separator = resultsHref.includes('?') ? '&' : '?';
        window.location.href = `${resultsHref}${separator}q=${encodeURIComponent(keyphrase)}`;
      }
    },
    [fields.ResultsPageLink]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query) {
      setIsOpen(false);
      handleNavigate(query);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('component preview-search', styles)} id={RenderingIdentifier}>
      <div className="relative" data-testid="preview-search">
        {/* Label */}
        {(fields.SearchLabel?.value || isEditing) && (
          <Text
            field={fields.SearchLabel}
            tag="label"
            className="sr-only"
            data-testid="search-label"
          />
        )}

        {/* Search input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            placeholder={fields.SearchPlaceholderText?.value || 'Search...'}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            aria-label={fields.SearchLabel?.value || 'Search'}
            aria-expanded={isOpen}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
            role="combobox"
            data-testid="search-input"
            disabled={isEditing}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2" data-testid="search-loading">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
            </div>
          )}
        </div>

        {/* SDK not available message */}
        {sdkAvailable === false && query.length >= 2 && (
          <div
            className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700"
            data-testid="search-unavailable"
          >
            Search is not configured. Configure Sitecore Search to enable suggestions.
          </div>
        )}

        {/* Suggestions dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            id="search-suggestions"
            className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
            role="listbox"
            data-testid="search-dropdown"
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                className="w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                onClick={() => {
                  setIsOpen(false);
                  handleNavigate(suggestion.title);
                }}
                role="option"
                aria-selected={false}
                data-testid="search-suggestion"
              >
                <p className="font-medium text-gray-900">{suggestion.title}</p>
                {suggestion.description && (
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                    {suggestion.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Results page link (hidden, for editing visibility) */}
        {isEditing && (
          <div className="mt-2 text-sm text-gray-500">
            Results page: <ContentSdkLink field={fields.ResultsPageLink} />
          </div>
        )}
      </div>
    </div>
  );
};
