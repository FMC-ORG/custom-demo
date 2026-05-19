import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default as SearchResults } from '@/components/uiim/search/SearchResults';
import {
  defaultProps,
  propsEditing,
  propsNoFields,
  propsWithoutHeading,
} from './SearchResults.mockProps';
import type { Field } from '@sitecore-content-sdk/nextjs';

// Mock SDK
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({
    field,
    tag,
    className,
    ...rest
  }: {
    field?: Field<string>;
    tag?: string;
    className?: string;
  }) => {
    const Tag = (tag || 'span') as keyof JSX.IntrinsicElements;
    return React.createElement(Tag, { className, 'data-testid': 'text-field', ...rest }, field?.value || '');
  },
}));

// Mock Cloud SDK - not available by default
jest.mock('@sitecore-cloudsdk/search/browser', () => {
  throw new Error('Cloud SDK not available');
});

// Mock window.location
const mockLocation = {
  search: '?q=test',
  href: 'http://localhost/search?q=test',
};
Object.defineProperty(window, 'location', {
  writable: true,
  value: mockLocation,
});

// Mock window.history
window.history.pushState = jest.fn();

describe('SearchResults Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.search = '?q=test';
    mockLocation.href = 'http://localhost/search?q=test';
  });

  describe('Basic rendering', () => {
    it('should render search heading', () => {
      render(<SearchResults {...(defaultProps as unknown as Parameters<typeof SearchResults>[0])} />);
      expect(screen.getByTestId('search-heading')).toHaveTextContent('Search Results');
    });

    it('should render search input', () => {
      render(<SearchResults {...(defaultProps as unknown as Parameters<typeof SearchResults>[0])} />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<SearchResults {...(defaultProps as unknown as Parameters<typeof SearchResults>[0])} />);
      expect(screen.getByTestId('search-submit')).toBeInTheDocument();
    });

    it('should read keyphrase from URL query parameter', () => {
      render(<SearchResults {...(defaultProps as unknown as Parameters<typeof SearchResults>[0])} />);
      expect(screen.getByTestId('search-input')).toHaveValue('test');
    });
  });

  describe('No heading', () => {
    it('should not render heading when field is empty', () => {
      render(<SearchResults {...(propsWithoutHeading as unknown as Parameters<typeof SearchResults>[0])} />);
      expect(screen.queryByTestId('search-heading')).not.toBeInTheDocument();
    });
  });

  describe('Fallback rendering', () => {
    it('should render fallback when no fields', () => {
      render(<SearchResults {...(propsNoFields as unknown as Parameters<typeof SearchResults>[0])} />);
      expect(screen.getByText('SearchResults')).toBeInTheDocument();
    });
  });

  describe('Graceful degradation', () => {
    it('should show unavailable message when Cloud SDK is not available', async () => {
      render(<SearchResults {...(defaultProps as unknown as Parameters<typeof SearchResults>[0])} />);
      // Wait for SDK check
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(screen.getByTestId('search-unavailable')).toBeInTheDocument();
    });
  });

  describe('Editing mode', () => {
    it('should disable input and submit in editing mode', () => {
      render(<SearchResults {...(propsEditing as unknown as Parameters<typeof SearchResults>[0])} />);
      expect(screen.getByTestId('search-input')).toBeDisabled();
      expect(screen.getByTestId('search-submit')).toBeDisabled();
    });

    it('should render heading in editing mode', () => {
      render(<SearchResults {...(propsEditing as unknown as Parameters<typeof SearchResults>[0])} />);
      expect(screen.getByTestId('search-heading')).toBeInTheDocument();
    });
  });
});
