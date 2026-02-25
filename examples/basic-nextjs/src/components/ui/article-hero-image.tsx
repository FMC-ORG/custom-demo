'use client';

import type React from 'react';
import { NextImage as ContentSdkImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { cn } from '@/lib/utils';

type ArticleHeroImageProps = ComponentProps;

export const Default: React.FC<ArticleHeroImageProps> = (props) => {
  const { params } = props;
  const { page } = useSitecore();
  const routeFields = page?.layout?.sitecore?.route?.fields ?? {};
  const isEditing = page?.mode?.isEditing ?? false;

  const mainImage = routeFields.MainImage as ImageField | undefined;
  const title = routeFields.Title as { value?: string } | undefined;

  const hasImage = Boolean(
    mainImage?.value?.src ?? (mainImage as { value?: { src?: string } })?.value?.src
  );
  const showImage = hasImage || isEditing;

  if (!showImage) return null;

  const altText =
    (mainImage as { value?: { alt?: string } })?.value?.alt ??
    title?.value ??
    'Article image';

  return (
    <div
      className={cn('article-hero-image', params?.styles)}
      id={params?.RenderingIdentifier}
    >
      <div className="mx-auto max-w-4xl px-4 -mt-4 mb-8">
        <div className="overflow-hidden rounded-lg">
          {mainImage ? (
            <ContentSdkImage
              field={mainImage}
              alt={altText}
              className="w-full h-auto object-cover"
            />
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              [Hero image]
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
