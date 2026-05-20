import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchItem } from '@/lib/search/search-components/SearchItem';
import { SearchPagination } from '@/lib/search/search-components/SearchPagination';
import { SearchInput } from '@/lib/search/search-components/SearchInput';
import type { Field, TextField } from '@sitecore-content-sdk/nextjs';
import type { SearchFieldsMapping } from '@/lib/search/search-components/models';

// --- Mocks ---

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

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

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) =>
    // eslint-disable-next-line @next/next/no-img-element
    React.createElement('img', { src, alt, 'data-testid': 'next-image' }),
}));

// --- SearchItem tests ---

describe('SearchItem', () => {
  const fullData = {
    sc_item_id: 'item-1',
    ProductName: 'Widget Alpha',
    Description: 'A fine widget.',
    ImageUrl: '/images/widget.jpg',
    Tags: ['electronics', 'gadgets'],
    Url: '/products/widget-alpha',
    Category: 'Electronics',
  };

  const fullMapping: SearchFieldsMapping = {
    title: 'ProductName',
    description: 'Description',
    images: 'ImageUrl',
    tags: 'Tags',
    link: 'Url',
    type: 'Category',
  };

  it('renders all mapped fields', () => {
    render(<SearchItem data={fullData} mapping={fullMapping} onClick={jest.fn()} />);

    expect(screen.getByText('Widget Alpha')).toBeInTheDocument();
    expect(screen.getByText('A fine widget.')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('electronics')).toBeInTheDocument();
    expect(screen.getByText('gadgets')).toBeInTheDocument();
    expect(screen.getByTestId('sdk-link')).toBeInTheDocument();
  });

  it('renders only title when only title is mapped', () => {
    const titleOnlyMapping: SearchFieldsMapping = { title: 'ProductName' };
    render(<SearchItem data={fullData} mapping={titleOnlyMapping} onClick={jest.fn()} />);

    expect(screen.getByText('Widget Alpha')).toBeInTheDocument();
    expect(screen.queryByText('A fine widget.')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sdk-link')).not.toBeInTheDocument();
  });

  it('renders nothing for unmapped fields', () => {
    const emptyMapping: SearchFieldsMapping = {};
    render(<SearchItem data={fullData} mapping={emptyMapping} onClick={jest.fn()} />);

    expect(screen.queryByText('Widget Alpha')).not.toBeInTheDocument();
    expect(screen.queryByText('A fine widget.')).not.toBeInTheDocument();
  });

  it('handles missing data fields gracefully', () => {
    const sparseData = { sc_item_id: 'item-sparse', ProductName: 'Sparse Widget' };
    render(<SearchItem data={sparseData} mapping={fullMapping} onClick={jest.fn()} />);

    expect(screen.getByText('Sparse Widget')).toBeInTheDocument();
    // Description, Image, Tags, Category are undefined in sparseData — should not crash
  });

  it('renders as card variant by default', () => {
    const { container } = render(
      <SearchItem data={fullData} mapping={fullMapping} onClick={jest.fn()} />
    );
    // Card variant should not have the flex-row layout
    expect(container.querySelector('.md\\:flex-row')).not.toBeInTheDocument();
  });

  it('renders as list variant when specified', () => {
    const { container } = render(
      <SearchItem data={fullData} mapping={fullMapping} variant="list" onClick={jest.fn()} />
    );
    expect(container.querySelector('.md\\:flex-row')).toBeInTheDocument();
  });

  it('calls onClick when link is clicked', () => {
    const onClick = jest.fn();
    render(<SearchItem data={fullData} mapping={fullMapping} onClick={onClick} />);

    fireEvent.click(screen.getByTestId('sdk-link'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

// --- SearchPagination tests ---

describe('SearchPagination', () => {
  it('renders navigation landmark', () => {
    render(<SearchPagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
  });

  it('marks current page with aria-current', () => {
    render(<SearchPagination currentPage={2} totalPages={5} onPageChange={jest.fn()} />);
    const currentBtn = screen.getByText('2');
    expect(currentBtn.closest('[aria-current="page"]')).toBeInTheDocument();
  });

  it('does not mark non-current pages with aria-current', () => {
    render(<SearchPagination currentPage={2} totalPages={5} onPageChange={jest.fn()} />);
    const otherBtn = screen.getByText('1');
    expect(otherBtn.closest('[aria-current]')).not.toBeInTheDocument();
  });

  it('disables Previous button on page 1', () => {
    render(<SearchPagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />);
    const prevBtn = screen.getByText('SearchExperience_PreviousPage').closest('button');
    expect(prevBtn).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(<SearchPagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />);
    const nextBtn = screen.getByText('SearchExperience_NextPage').closest('button');
    expect(nextBtn).toBeDisabled();
  });

  it('enables both buttons on middle page', () => {
    render(<SearchPagination currentPage={3} totalPages={5} onPageChange={jest.fn()} />);
    const prevBtn = screen.getByText('SearchExperience_PreviousPage').closest('button');
    const nextBtn = screen.getByText('SearchExperience_NextPage').closest('button');
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).not.toBeDisabled();
  });

  it('calls onPageChange with correct page number', () => {
    const onPageChange = jest.fn();
    render(<SearchPagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange with previous page', () => {
    const onPageChange = jest.fn();
    render(<SearchPagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByText('SearchExperience_PreviousPage'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with next page', () => {
    const onPageChange = jest.fn();
    render(<SearchPagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByText('SearchExperience_NextPage'));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('shows max 3 page buttons', () => {
    render(<SearchPagination currentPage={5} totalPages={10} onPageChange={jest.fn()} />);

    // Should show pages 4, 5, 6 (window of 3 centered on current)
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
    expect(screen.queryByText('7')).not.toBeInTheDocument();
  });

  it('shows ellipsis when pages are truncated', () => {
    render(<SearchPagination currentPage={5} totalPages={10} onPageChange={jest.fn()} />);
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBe(2); // left and right
  });

  it('handles single page (no ellipsis)', () => {
    render(<SearchPagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />);
    expect(screen.queryByText('…')).not.toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});

// --- SearchInput tests ---

describe('SearchInput', () => {
  it('renders with role="search"', () => {
    render(<SearchInput value="" onChange={jest.fn()} />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('renders input with aria-label', () => {
    render(<SearchInput value="" onChange={jest.fn()} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label');
  });

  it('does not render clear button when value is empty', () => {
    render(<SearchInput value="" onChange={jest.fn()} />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('renders clear button when value is non-empty', () => {
    render(<SearchInput value="test query" onChange={jest.fn()} />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('calls onChange with empty string when clear is clicked', () => {
    const onChange = jest.fn();
    render(<SearchInput value="test query" onChange={onChange} />);

    fireEvent.click(screen.getByLabelText('Clear search'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('calls onChange on input change', () => {
    const onChange = jest.fn();
    render(<SearchInput value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledWith('hello');
  });
});
