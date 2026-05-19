'use client';
import { HTMLAttributes, useState } from 'react';
import Image from 'next/image';
import { cn } from 'lib/utils';
import { SearchItemFields } from './index';
import { SearchItemVariant } from '../SearchItemCommon';

type SearchItemImageProps = {
  image: SearchItemFields['image'];
  alt?: string;
  variant?: SearchItemVariant;
  width?: number;
  height?: number;
} & HTMLAttributes<HTMLDivElement>;

export const SearchItemImage = ({
  className,
  alt,
  image,
  variant = 'card',
  width = 400,
  height = 250,
  ...props
}: SearchItemImageProps) => {
  const [brokenImage, setBrokenImage] = useState<boolean>(false);
  const isCard = variant === 'card';

  return (
    image && (
      <div
        className={cn('bg-gray-900 relative', isCard ? 'w-full' : 'h-full', className)}
        style={isCard ? { height } : { width }}
        {...props}
      >
        {!brokenImage ? (
          <Image
            fill
            src={image.value}
            alt={alt || 'Product image'}
            onError={() => setBrokenImage(true)}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
    )
  );
};
