import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default as ArticleBody, WithSidebar as ArticleBodyWithSidebar, Wide as ArticleBodyWide } from '@/components/uiim/article/ArticleBody';
import {
  defaultProps,
  propsEditing,
  propsNoRouteFields,
  propsWithoutTakeaways,
  propsWithoutAuthor,
  propsWithoutContent,
  propsMinimal,
  propsAuthorNoImage,
  propsAuthorNoBio,
} from './ArticleBody.mockProps';
import type { Field, RichTextField, LinkField, ImageField } from '@sitecore-content-sdk/nextjs';

// Mock @sitecore-content-sdk/nextjs
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
  RichText: ({
    field,
    className,
    ...rest
  }: {
    field?: RichTextField;
    className?: string;
  }) =>
    React.createElement('div', { className, 'data-testid': 'rich-text-field', ...rest }, field?.value || ''),
  NextImage: ({
    field,
    className,
  }: {
    field?: ImageField;
    className?: string;
  }) =>
    // eslint-disable-next-line @next/next/no-img-element
    React.createElement('img', {
      src: field?.value?.src,
      alt: field?.value?.alt,
      className,
      'data-testid': 'sdk-image',
    }),
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

describe('ArticleBody Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render article content', () => {
      render(<ArticleBody {...(defaultProps as unknown as Parameters<typeof ArticleBody>[0])} />);
      expect(screen.getByTestId('article-content')).toBeInTheDocument();
    });

    it('should render key takeaways when field has value', () => {
      render(<ArticleBody {...(defaultProps as unknown as Parameters<typeof ArticleBody>[0])} />);
      expect(screen.getByTestId('key-takeaways')).toBeInTheDocument();
    });

    it('should render author bio when author is set', () => {
      render(<ArticleBody {...(defaultProps as unknown as Parameters<typeof ArticleBody>[0])} />);
      expect(screen.getByTestId('author-bio')).toBeInTheDocument();
    });

    it('should render author name', () => {
      render(<ArticleBody {...(defaultProps as unknown as Parameters<typeof ArticleBody>[0])} />);
      expect(screen.getByTestId('author-bio-name')).toHaveTextContent('Jane Smith');
    });

    it('should render author job title', () => {
      render(<ArticleBody {...(defaultProps as unknown as Parameters<typeof ArticleBody>[0])} />);
      expect(screen.getByTestId('author-bio-title')).toBeInTheDocument();
    });

    it('should render author bio text', () => {
      render(<ArticleBody {...(defaultProps as unknown as Parameters<typeof ArticleBody>[0])} />);
      expect(screen.getByTestId('author-bio-text')).toBeInTheDocument();
    });

    it('should render author LinkedIn link', () => {
      render(<ArticleBody {...(defaultProps as unknown as Parameters<typeof ArticleBody>[0])} />);
      expect(screen.getByTestId('author-bio-linkedin')).toBeInTheDocument();
    });

    it('should render author profile image', () => {
      render(<ArticleBody {...(defaultProps as unknown as Parameters<typeof ArticleBody>[0])} />);
      const images = screen.getAllByTestId('sdk-image');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Conditional sections', () => {
    it('should hide key takeaways when field is empty', () => {
      render(<ArticleBody {...(propsWithoutTakeaways as unknown as Parameters<typeof ArticleBody>[0])} />);
      expect(screen.queryByTestId('key-takeaways')).not.toBeInTheDocument();
    });

    it('should hide author bio when author is not set', () => {
      render(<ArticleBody {...(propsWithoutAuthor as unknown as Parameters<typeof ArticleBody>[0])} />);
      expect(screen.queryByTestId('author-bio')).not.toBeInTheDocument();
    });

    it('should render with minimal props (content only)', () => {
      render(<ArticleBody {...(propsMinimal as unknown as Parameters<typeof ArticleBody>[0])} />);
      expect(screen.getByTestId('article-content')).toBeInTheDocument();
      expect(screen.queryByTestId('key-takeaways')).not.toBeInTheDocument();
      expect(screen.queryByTestId('author-bio')).not.toBeInTheDocument();
    });
  });

  describe('Author sub-fields', () => {
    it('should render author without profile image', () => {
      render(<ArticleBody {...(propsAuthorNoImage as unknown as Parameters<typeof ArticleBody>[0])} />);
      expect(screen.getByTestId('author-bio-name')).toHaveTextContent('John Doe');
      expect(screen.queryByTestId('sdk-image')).not.toBeInTheDocument();
    });

    it('should render author without job title, bio, or LinkedIn', () => {
      render(<ArticleBody {...(propsAuthorNoBio as unknown as Parameters<typeof ArticleBody>[0])} />);
      expect(screen.getByTestId('author-bio-name')).toHaveTextContent('Sam Lee');
      expect(screen.queryByTestId('author-bio-title')).not.toBeInTheDocument();
      expect(screen.queryByTestId('author-bio-text')).not.toBeInTheDocument();
      expect(screen.queryByTestId('author-bio-linkedin')).not.toBeInTheDocument();
    });
  });

  describe('Fallback rendering', () => {
    it('should render fallback when no route fields', () => {
      render(<ArticleBody {...(propsNoRouteFields as unknown as Parameters<typeof ArticleBody>[0])} />);
      expect(screen.getByText('ArticleBody')).toBeInTheDocument();
    });
  });

  describe('Editing mode', () => {
    it('should show conditional sections in editing mode', () => {
      render(<ArticleBody {...(propsEditing as unknown as Parameters<typeof ArticleBody>[0])} />);
      expect(screen.getByTestId('key-takeaways')).toBeInTheDocument();
      expect(screen.getByTestId('author-bio')).toBeInTheDocument();
    });
  });

  describe('WithSidebar variant', () => {
    it('should render content and sidebar', () => {
      render(<ArticleBodyWithSidebar {...(defaultProps as unknown as Parameters<typeof ArticleBodyWithSidebar>[0])} />);
      expect(screen.getByTestId('article-content')).toBeInTheDocument();
      expect(screen.getByTestId('article-sidebar')).toBeInTheDocument();
    });

    it('should render takeaways and author bio in sidebar', () => {
      render(<ArticleBodyWithSidebar {...(defaultProps as unknown as Parameters<typeof ArticleBodyWithSidebar>[0])} />);
      expect(screen.getByTestId('key-takeaways')).toBeInTheDocument();
      expect(screen.getByTestId('author-bio')).toBeInTheDocument();
    });

    it('should hide sidebar sections when fields are empty', () => {
      render(<ArticleBodyWithSidebar {...(propsMinimal as unknown as Parameters<typeof ArticleBodyWithSidebar>[0])} />);
      expect(screen.getByTestId('article-content')).toBeInTheDocument();
      expect(screen.queryByTestId('key-takeaways')).not.toBeInTheDocument();
      expect(screen.queryByTestId('author-bio')).not.toBeInTheDocument();
    });

    it('should render fallback when no route fields', () => {
      render(<ArticleBodyWithSidebar {...(propsNoRouteFields as unknown as Parameters<typeof ArticleBodyWithSidebar>[0])} />);
      expect(screen.getByText('ArticleBody')).toBeInTheDocument();
    });
  });

  describe('Wide variant', () => {
    it('should render full-width content', () => {
      render(<ArticleBodyWide {...(defaultProps as unknown as Parameters<typeof ArticleBodyWide>[0])} />);
      expect(screen.getByTestId('article-content')).toBeInTheDocument();
    });

    it('should render takeaways inline and author bio as full-width band', () => {
      render(<ArticleBodyWide {...(defaultProps as unknown as Parameters<typeof ArticleBodyWide>[0])} />);
      expect(screen.getByTestId('key-takeaways')).toBeInTheDocument();
      expect(screen.getByTestId('author-bio-band')).toBeInTheDocument();
    });

    it('should hide sections when fields are empty', () => {
      render(<ArticleBodyWide {...(propsMinimal as unknown as Parameters<typeof ArticleBodyWide>[0])} />);
      expect(screen.getByTestId('article-content')).toBeInTheDocument();
      expect(screen.queryByTestId('key-takeaways')).not.toBeInTheDocument();
      expect(screen.queryByTestId('author-bio-band')).not.toBeInTheDocument();
    });

    it('should render fallback when no route fields', () => {
      render(<ArticleBodyWide {...(propsNoRouteFields as unknown as Parameters<typeof ArticleBodyWide>[0])} />);
      expect(screen.getByText('ArticleBody')).toBeInTheDocument();
    });
  });
});
