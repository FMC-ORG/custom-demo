import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default, LoadMore } from '@/components/uiim/search/SearchExperienceV2';
import {
  defaultProps,
  propsEditing,
  propsEmptyFields,
  propsSingleColumn,
  mockSearchResults,
} from './SearchExperienceV2.mockProps';
import type { Field } from '@sitecore-content-sdk/nextjs';

// --- Mocks ---

// Mock useSearch
const mockUseSearch = jest.fn();
const mockUseInfiniteSearch = jest.fn();

jest.mock('@sitecore-content-sdk/nextjs/search', () => ({
  useSearch: (...args: unknown[]) => mockUseSearch(...args),
  useInfiniteSearch: (...args: unknown[]) => mockUseInfiniteSearch(...args),
}));

// Mock useSearchParams
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/search',
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock @sitecore-content-sdk/events
jest.mock('@sitecore-content-sdk/events', () => ({
  event: jest.fn(),
}));

// Mock @sitecore-content-sdk/nextjs
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag, className }: { field?: Field<string>; tag?: string; className?: string }) => {
    const Tag = (tag || 'span') as keyof JSX.IntrinsicElements;
    return React.createElement(Tag, { className, 'data-testid': 'text-field' }, field?.value || '');
  },
  Link: ({
    field,
    children,
    className,
    onClick,
  }: {
    field?: { href: string };
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) =>
    React.createElement('a', { href: field?.href, className, onClick, 'data-testid': 'sdk-link' }, children),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) =>
    // eslint-disable-next-line @next/next/no-img-element
    React.createElement('img', { src, alt, 'data-testid': 'next-image' }),
}));

// --- Helpers ---

const useSearchDefaults = {
  total: 0,
  totalPages: 0,
  results: [],
  isLoading: false,
  isSuccess: true,
  isError: false,
  error: null,
};

const useInfiniteSearchDefaults = {
  ...useSearchDefaults,
  loadMore: jest.fn(),
  isLoadingMore: false,
  hasNextPage: false,
};

// --- Tests ---

describe('SearchExperienceV2 — Default variant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearch.mockReturnValue(useSearchDefaults);
    mockUseInfiniteSearch.mockReturnValue(useInfiniteSearchDefaults);
  });

  it('renders the search input', () => {
    render(<Default {...defaultProps} />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('renders results count with aria-live', () => {
    mockUseSearch.mockReturnValue({ ...useSearchDefaults, total: 42 });
    render(<Default {...defaultProps} />);
    const resultsCount = screen.getByText(/42/);
    expect(resultsCount.closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
  });

  it('renders results grid with search results', () => {
    mockUseSearch.mockReturnValue({
      ...useSearchDefaults,
      total: 3,
      totalPages: 1,
      results: mockSearchResults,
    });
    render(<Default {...defaultProps} />);

    expect(screen.getByText('Widget Alpha')).toBeInTheDocument();
    expect(screen.getByText('Widget Beta')).toBeInTheDocument();
    expect(screen.getByText('Widget Gamma')).toBeInTheDocument();
  });

  it('renders empty results state when total is 0 and not loading', () => {
    mockUseSearch.mockReturnValue({ ...useSearchDefaults, total: 0 });
    render(<Default {...defaultProps} />);

    expect(screen.getByText('SearchExperience_NoResultsFound')).toBeInTheDocument();
  });

  it('renders error state when isError is true', () => {
    mockUseSearch.mockReturnValue({
      ...useSearchDefaults,
      isError: true,
      isSuccess: false,
      error: new Error('Search service unavailable'),
    });
    render(<Default {...defaultProps} />);

    expect(screen.getByText('SearchExperience_SomethingWentWrong')).toBeInTheDocument();
    expect(screen.getByText('Search service unavailable')).toBeInTheDocument();
  });

  it('renders skeleton items when loading', () => {
    mockUseSearch.mockReturnValue({ ...useSearchDefaults, isLoading: true });
    render(<Default {...defaultProps} />);

    // pageSize is 6, so 6 skeleton items
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders skeleton items in editing mode', () => {
    mockUseSearch.mockReturnValue({ ...useSearchDefaults, total: 0 });
    render(<Default {...propsEditing} />);

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders pagination when results exist', () => {
    mockUseSearch.mockReturnValue({
      ...useSearchDefaults,
      total: 18,
      totalPages: 3,
      results: mockSearchResults,
    });
    render(<Default {...defaultProps} />);

    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
  });

  it('does not render pagination when no results', () => {
    mockUseSearch.mockReturnValue({ ...useSearchDefaults, total: 0 });
    render(<Default {...defaultProps} />);

    expect(screen.queryByRole('navigation', { name: /pagination/i })).not.toBeInTheDocument();
  });

  it('applies params.styles and params.RenderingIdentifier', () => {
    mockUseSearch.mockReturnValue(useSearchDefaults);
    const { container } = render(<Default {...defaultProps} />);

    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass('custom-style');
    expect(wrapper).toHaveAttribute('id', 'search-v2-1');
  });

  it('passes searchIndexId from SearchIndex field', () => {
    render(<Default {...defaultProps} />);

    expect(mockUseSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        searchIndexId: 'test-search-index-guid',
      })
    );
  });

  it('handles empty/missing mapping fields gracefully', () => {
    mockUseSearch.mockReturnValue({
      ...useSearchDefaults,
      total: 3,
      totalPages: 1,
      results: mockSearchResults,
    });
    render(<Default {...propsEmptyFields} />);

    // Should render without crashing — results show but no mapped fields render
    expect(screen.getByRole('search')).toBeInTheDocument();
  });
});

describe('SearchExperienceV2 — LoadMore variant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearch.mockReturnValue(useSearchDefaults);
    mockUseInfiniteSearch.mockReturnValue(useInfiniteSearchDefaults);
  });

  it('renders the search input', () => {
    render(<LoadMore {...defaultProps} />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('renders load more button when hasNextPage is true', () => {
    mockUseInfiniteSearch.mockReturnValue({
      ...useInfiniteSearchDefaults,
      total: 12,
      results: mockSearchResults,
      hasNextPage: true,
    });
    render(<LoadMore {...defaultProps} />);

    expect(screen.getByText('SearchExperience_LoadMore')).toBeInTheDocument();
  });

  it('does not render load more button when hasNextPage is false', () => {
    mockUseInfiniteSearch.mockReturnValue({
      ...useInfiniteSearchDefaults,
      total: 3,
      results: mockSearchResults,
      hasNextPage: false,
    });
    render(<LoadMore {...defaultProps} />);

    expect(screen.queryByText('SearchExperience_LoadMore')).not.toBeInTheDocument();
  });

  it('disables load more button when isLoadingMore is true', () => {
    mockUseInfiniteSearch.mockReturnValue({
      ...useInfiniteSearchDefaults,
      total: 12,
      results: mockSearchResults,
      hasNextPage: true,
      isLoadingMore: true,
    });
    render(<LoadMore {...defaultProps} />);

    const loadMoreBtn = screen.getByText('SearchExperience_LoadMore');
    expect(loadMoreBtn.closest('button')).toBeDisabled();
  });

  it('renders empty state when no results', () => {
    mockUseInfiniteSearch.mockReturnValue({
      ...useInfiniteSearchDefaults,
      total: 0,
    });
    render(<LoadMore {...defaultProps} />);

    expect(screen.getByText('SearchExperience_NoResultsFound')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseInfiniteSearch.mockReturnValue({
      ...useInfiniteSearchDefaults,
      isError: true,
      isSuccess: false,
      error: new Error('Network timeout'),
    });
    render(<LoadMore {...defaultProps} />);

    expect(screen.getByText('Network timeout')).toBeInTheDocument();
  });

  it('does not render pagination (uses load more instead)', () => {
    mockUseInfiniteSearch.mockReturnValue({
      ...useInfiniteSearchDefaults,
      total: 12,
      results: mockSearchResults,
      hasNextPage: true,
    });
    render(<LoadMore {...defaultProps} />);

    expect(screen.queryByRole('navigation', { name: /pagination/i })).not.toBeInTheDocument();
  });
});
