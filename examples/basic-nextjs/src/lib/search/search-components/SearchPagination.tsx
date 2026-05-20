'use client';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DICTIONARY_KEYS } from './constants';

export const SearchPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const t = useTranslations();
  const maxVisiblePages = 3;

  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  startPage = Math.max(1, Math.min(startPage, Math.max(1, endPage - maxVisiblePages + 1)));
  endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  const pages: number[] = [];
  for (let p = startPage; p <= endPage; p++) {
    pages.push(p);
  }

  const showLeftEllipsis = startPage > 1;
  const showRightEllipsis = endPage < totalPages;

  return (
    <nav aria-label="Search results pagination" className="flex justify-center items-center gap-2">
      <Button
        variant="ghost"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="size-4" />
        {t(DICTIONARY_KEYS.PREVIOUS_PAGE) || 'Previous'}
      </Button>

      {showLeftEllipsis && (
        <span className="w-10 h-10 flex items-center justify-center text-muted-foreground select-none" aria-hidden>
          …
        </span>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onPageChange(page)}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </Button>
      ))}

      {showRightEllipsis && (
        <span className="w-10 h-10 flex items-center justify-center text-muted-foreground select-none" aria-hidden>
          …
        </span>
      )}

      <Button
        variant="ghost"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        {t(DICTIONARY_KEYS.NEXT_PAGE) || 'Next'}
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
};
