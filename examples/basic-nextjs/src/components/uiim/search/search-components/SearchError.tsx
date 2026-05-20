'use client';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DICTIONARY_KEYS } from './constants';

export const SearchError = ({
  onTryAgain,
  error,
}: {
  onTryAgain: () => void;
  error: Error;
}) => {
  const t = useTranslations();

  return (
    <div className="mb-8">
      <div className="bg-card border border-destructive/50 rounded-lg p-12 text-center">
        <AlertTriangle className="mx-auto size-10 text-destructive" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          {t(DICTIONARY_KEYS.SOMETHING_WENT_WRONG) || 'Something went wrong'}
        </h3>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <div className="mt-6">
          <Button variant="destructive" onClick={onTryAgain}>
            {t(DICTIONARY_KEYS.TRY_AGAIN) || 'Try again'}
          </Button>
        </div>
      </div>
    </div>
  );
};
