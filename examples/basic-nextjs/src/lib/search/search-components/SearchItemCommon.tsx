'use client';
import { HTMLAttributes } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ItemFrameProps = HTMLAttributes<HTMLDivElement> & { image?: React.ReactNode };

export const ItemCardFrame = ({ className, children, image, ...props }: ItemFrameProps) => {
  return (
    <Card
      className={cn('overflow-hidden hover:shadow-lg transition-shadow cursor-pointer', className)}
      {...props}
    >
      {image}
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
};

export const ItemListFrame = ({ className, children, image, ...props }: ItemFrameProps) => {
  return (
    <Card
      className={cn(
        'overflow-hidden hover:shadow-lg transition-shadow cursor-pointer md:h-57',
        className
      )}
      {...props}
    >
      <div className="flex flex-col md:flex-row w-full h-full">
        {image}
        <CardContent className="p-6 md:flex-1">{children}</CardContent>
      </div>
    </Card>
  );
};
