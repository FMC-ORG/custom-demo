'use client';
import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ItemCardFrame, ItemListFrame } from './SearchItemCommon';
import { SearchFieldsMapping, SearchItemVariant } from './models';

type SearchSkeletonItemProps = {
  mapping: SearchFieldsMapping;
  variant?: SearchItemVariant;
} & HTMLAttributes<HTMLDivElement>;

export const SearchSkeletonItem = ({ mapping, variant = 'card' }: SearchSkeletonItemProps) => {
  const isCard = variant === 'card';

  const fields = (
    <>
      {mapping.type && <SkeletonCategory />}
      {mapping.title && <SkeletonTitle />}
      {mapping.description && <SkeletonSummary />}
      {mapping.link && <SkeletonLink />}
    </>
  );

  return isCard ? <ItemCardFrame>{fields}</ItemCardFrame> : <ItemListFrame>{fields}</ItemListFrame>;
};

const SkeletonTitle = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('h-6 w-3/4 bg-muted rounded mb-3 animate-pulse', className)} {...props} />
);

const SkeletonSummary = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-2 mb-4', className)} {...props}>
    <div className="h-4 w-full bg-muted rounded animate-pulse" />
    <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
  </div>
);

const SkeletonLink = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('h-5 w-24 bg-muted rounded animate-pulse', className)} {...props} />
);

const SkeletonCategory = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('h-6 w-1/4 bg-muted rounded mb-3 animate-pulse', className)} {...props} />
);
