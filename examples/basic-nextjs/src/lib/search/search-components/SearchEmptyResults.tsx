'use client';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DICTIONARY_KEYS } from './constants';

export const SearchEmptyResults = ({
  query,
  onClearSearch,
}: {
  query: string;
  onClearSearch: () => void;
}) => {
  const t = useTranslations();

  return (
    <div className="mb-8">
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <Search className="mx-auto size-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          {t(DICTIONARY_KEYS.NO_RESULTS_FOUND) || 'No results found'}
        </h3>
        <p className="mt-2 text-muted-foreground">
          {t(DICTIONARY_KEYS.TRY_ADJUSTING_YOUR_SEARCH) || 'Try adjusting your search or clear it.'}
        </p>
        <div className="mt-6">
          <Button onClick={onClearSearch} disabled={!query}>
            {t(DICTIONARY_KEYS.CLEAR_SEARCH) || 'Clear search'}
          </Button>
        </div>
      </div>
    </div>
  );
};
