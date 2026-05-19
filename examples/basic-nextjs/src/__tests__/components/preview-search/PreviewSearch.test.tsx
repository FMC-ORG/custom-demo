import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default as PreviewSearch } from '@/components/uiim/search/PreviewSearch';
import {
  defaultProps,
  propsEditing,
  propsNoFields,
  propsWithoutPlaceholder,
} from './PreviewSearch.mockProps';
import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';

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
  Link: ({
    field,
    className,
    ...rest
  }: {
    field?: LinkField;
    className?: string;
  }) =>
    React.createElement(
      'a',
      { href: field?.value?.href, className, 'data-testid': 'sdk-link', ...rest },
      field?.value?.text || 'Link'
    ),
}));

// Mock Cloud SDK - not available by default
jest.mock('@sitecore-cloudsdk/search/browser', () => {
  throw new Error('Cloud SDK not available');
});

describe('PreviewSearch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render search input', () => {
      render(<PreviewSearch {...(defaultProps as unknown as Parameters<typeof PreviewSearch>[0])} />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('should render with placeholder text from datasource', () => {
      render(<PreviewSearch {...(defaultProps as unknown as Parameters<typeof PreviewSearch>[0])} />);
      expect(screen.getByTestId('search-input')).toHaveAttribute(
        'placeholder',
        'Search articles, products...'
      );
    });

    it('should render with default placeholder when field is empty', () => {
      render(<PreviewSearch {...(propsWithoutPlaceholder as unknown as Parameters<typeof PreviewSearch>[0])} />);
      expect(screen.getByTestId('search-input')).toHaveAttribute('placeholder', 'Search...');
    });

    it('should render search label for accessibility', () => {
      render(<PreviewSearch {...(defaultProps as unknown as Parameters<typeof PreviewSearch>[0])} />);
      expect(screen.getByTestId('search-input')).toHaveAttribute('aria-label', 'Site Search');
    });

    it('should have combobox role', () => {
      render(<PreviewSearch {...(defaultProps as unknown as Parameters<typeof PreviewSearch>[0])} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Fallback rendering', () => {
    it('should render fallback when no fields', () => {
      render(<PreviewSearch {...(propsNoFields as unknown as Parameters<typeof PreviewSearch>[0])} />);
      expect(screen.getByText('PreviewSearch')).toBeInTheDocument();
    });
  });

  describe('Graceful degradation', () => {
    it('should render input even when Cloud SDK is not available', () => {
      render(<PreviewSearch {...(defaultProps as unknown as Parameters<typeof PreviewSearch>[0])} />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });
  });

  describe('Editing mode', () => {
    it('should disable input in editing mode', () => {
      render(<PreviewSearch {...(propsEditing as unknown as Parameters<typeof PreviewSearch>[0])} />);
      expect(screen.getByTestId('search-input')).toBeDisabled();
    });

    it('should show results page link in editing mode', () => {
      render(<PreviewSearch {...(propsEditing as unknown as Parameters<typeof PreviewSearch>[0])} />);
      expect(screen.getByTestId('sdk-link')).toBeInTheDocument();
    });
  });
});
