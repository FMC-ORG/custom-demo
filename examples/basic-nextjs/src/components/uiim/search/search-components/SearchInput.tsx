'use client';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DICTIONARY_KEYS } from './constants';

interface SearchInputProps {
  value: string;
  onChange: (query: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  const t = useTranslations();

  return (
    <div role="search" className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6 mb-6">
      <div className="relative flex-1">
        <Input
          type="text"
          aria-label={t(DICTIONARY_KEYS.SEARCH_INPUT_PLACEHOLDER) || 'Search items...'}
          placeholder={t(DICTIONARY_KEYS.SEARCH_INPUT_PLACEHOLDER) || 'Search items...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn('w-full py-3 pl-12 pr-10')}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded transition-colors"
            aria-label="Clear search"
          >
            <X className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
};
