'use client';
import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { useSearch } from '@sitecore-content-sdk/nextjs/search';
import { ComponentProps } from '@/lib/component-props';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { DEFAULT_MAX_SUGGESTIONS } from '@/lib/search-ui/constants';
import { navigateTo } from '@/lib/search-ui/navigate';
import { useDebouncedValue } from '@/lib/search-ui/useDebouncedValue';
import { useSearchLabels } from '@/lib/search-ui/useSearchLabels';
import { useSearchEvents } from '@/lib/search-ui/useSearchEvents';

interface SearchTypeaheadFields {
  SearchIndex?: Field<string>;
  TitleMapping?: Field<string>;
  LinkMapping?: Field<string>;
  ResultsPage?: LinkField;
  MaxSuggestions?: Field<string>;
}

interface SearchTypeaheadProps extends ComponentProps {
  fields: SearchTypeaheadFields;
}

// Structurally matches the SDK's SearchDocument constraint (not re-exported by
// the nextjs submodule).
type SearchDoc = { [key: string]: string | number | boolean | (string | number | boolean)[] };

const docValue = (doc: SearchDoc, attribute: string | undefined): string => {
  if (!attribute) return '';
  const value = doc[attribute];
  return typeof value === 'string' ? value : '';
};

const EmptyStateFallback = () => (
  <div className="component search-typeahead">
    <span className="is-empty-hint">SearchTypeahead</span>
  </div>
);

// The whole combobox — state, search, keyboard handling, dropdown. Variants
// differ only in the chrome around this and the size treatment of the input.
const TypeaheadSearchBox = ({
  fields,
  page,
  rendering,
  className,
  compact = false,
}: Pick<SearchTypeaheadProps, 'fields' | 'page' | 'rendering'> & {
  className?: string;
  compact?: boolean;
}) => {
  const label = useSearchLabels();

  const isEditing = page?.mode?.isEditing ?? false;
  const isPreview = page?.mode?.isPreview ?? false;
  const live = !isEditing && !isPreview;

  const searchIndexId = fields?.SearchIndex?.value ?? '';
  const titleAttribute = fields?.TitleMapping?.value || undefined;
  const linkAttribute = fields?.LinkMapping?.value || undefined;
  const resultsHref = fields?.ResultsPage?.value?.href || '';
  const maxSuggestions = Number(fields?.MaxSuggestions?.value) || DEFAULT_MAX_SUGGESTIONS;

  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const query = useDebouncedValue(inputValue);

  const { results, isSuccess } = useSearch<SearchDoc>({
    searchIndexId,
    page: 1,
    pageSize: maxSuggestions,
    enabled: live && !!searchIndexId && !!query,
    query,
  });

  const sendEvent = useSearchEvents({ query, uid: rendering?.uid, page });

  const suggestions = query ? results : [];
  const showDropdown = isOpen && query.length > 0;

  // Reset keyboard position whenever the suggestion list changes.
  useEffect(() => {
    setActiveIndex(-1);
  }, [query, results]);

  useEffect(() => {
    if (isSuccess && query) sendEvent('viewed');
  }, [isSuccess, query, sendEvent]);

  // Close on outside click.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const listboxId = `typeahead-listbox-${rendering?.uid ?? 'default'}`;

  const seeAllHref = resultsHref
    ? `${resultsHref}?q=${encodeURIComponent(inputValue.trim())}`
    : '';

  const goToResults = () => {
    if (seeAllHref && inputValue.trim()) navigateTo(seeAllHref);
  };

  const chooseSuggestion = (doc: SearchDoc) => {
    sendEvent('clicked');
    const link = docValue(doc, linkAttribute);
    if (link) {
      navigateTo(link);
      return;
    }
    // Graceful degradation without a link mapping: hand the suggestion title
    // to the results page as the query.
    const title = docValue(doc, titleAttribute);
    if (resultsHref && title) {
      navigateTo(`${resultsHref}?q=${encodeURIComponent(title)}`);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        chooseSuggestion(suggestions[activeIndex]);
      } else {
        goToResults();
      }
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!suggestions.length) return;
      setIsOpen(true);
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((prev) => (prev + delta + suggestions.length) % suggestions.length);
    }
  };

  return (
    <div
      ref={containerRef}
      role="combobox"
      aria-expanded={showDropdown}
      aria-haspopup="listbox"
      className={cn('relative', className)}
    >
      <Input
        type="text"
        value={inputValue}
        disabled={!live}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={label('SEARCH_INPUT_PLACEHOLDER')}
        aria-label={label('SEARCH_INPUT_PLACEHOLDER')}
        aria-autocomplete="list"
        aria-controls={listboxId}
        className={cn(
          'w-full',
          compact
            ? 'h-9 rounded-full border-0 bg-white pl-9 pr-4 text-sm text-gray-900 shadow-sm ring-1 ring-black/10 placeholder:text-gray-500 focus-visible:ring-2'
            : 'py-2 pl-10'
        )}
      />
      <Search
        className={cn(
          'text-muted-foreground absolute top-1/2 -translate-y-1/2',
          compact ? 'left-3 size-4 text-gray-400' : 'left-3 size-4'
        )}
      />

      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label('SUGGESTIONS')}
          className={cn(
            'bg-background absolute z-50 mt-1 w-full overflow-hidden border shadow-md',
            compact ? 'min-w-72 rounded-lg shadow-lg' : 'rounded-md'
          )}
        >
          {suggestions.map((doc, i) => {
            const title = docValue(doc, titleAttribute);
            if (!title) return null;
            return (
              <li
                key={docValue(doc, 'sc_item_id') || title}
                role="option"
                aria-selected={i === activeIndex}
                className={cn(
                  'cursor-pointer px-4 py-2 text-sm',
                  i === activeIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                )}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => chooseSuggestion(doc)}
              >
                {title}
              </li>
            );
          })}
          {seeAllHref && (
            <li role="option" aria-selected={false} className="border-t">
              <a
                href={seeAllHref}
                className="text-primary block px-4 py-2 text-sm font-medium"
                onClick={() => sendEvent('clicked')}
              >
                {label('SEE_ALL_RESULTS')}
              </a>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export const Default = (props: SearchTypeaheadProps) => {
  const { fields, params, page, rendering } = props;
  const isEditing = page?.mode?.isEditing ?? false;

  if (!fields || !fields?.SearchIndex?.value) {
    return isEditing ? <EmptyStateFallback /> : null;
  }

  return (
    <section
      className={cn('component search-typeahead', params?.styles)}
      id={params?.RenderingIdentifier || undefined}
    >
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <TypeaheadSearchBox
          fields={fields}
          page={page}
          rendering={rendering}
          className="max-w-md"
        />
      </div>
    </section>
  );
};

// Slim strip that extends the site header: brand header background, hairline
// bottom border, right-aligned compact pill search box. Designed to sit in the
// headless-header placeholder directly below NavigationHeader.
export const Header = (props: SearchTypeaheadProps) => {
  const { fields, params, page, rendering } = props;
  const isEditing = page?.mode?.isEditing ?? false;

  if (!fields || !fields?.SearchIndex?.value) {
    return isEditing ? <EmptyStateFallback /> : null;
  }

  return (
    <section
      className={cn('component search-typeahead', params?.styles)}
      id={params?.RenderingIdentifier || undefined}
    >
      <div
        className="w-full border-b"
        style={{
          backgroundColor: 'var(--brand-header-bg, #ffffff)',
          borderColor: 'var(--brand-border, #e5e7eb)',
        }}
      >
        <div className="mx-auto flex max-w-7xl justify-end px-4 py-2 sm:px-6">
          <TypeaheadSearchBox
            fields={fields}
            page={page}
            rendering={rendering}
            compact
            className="w-full max-w-xs"
          />
        </div>
      </div>
    </section>
  );
};
