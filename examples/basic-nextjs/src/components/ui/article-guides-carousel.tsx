'use client';

import type React from 'react';
import { useState, useCallback, useEffect } from 'react';
import {
  Text as ContentSdkText,
  NextImage as ContentSdkImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import type { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';

interface ArticlePageItem {
  id?: string;
  url?: { path?: string };
  title?: { jsonValue?: Field<string> };
  excerpt?: { jsonValue?: Field<string> };
  mainImage?: { jsonValue?: ImageField };
}

interface ArticleGuidesCarouselFields {
  data?: {
    datasource?: {
      title?: { jsonValue?: Field<string> };
      featuredArticles?: {
        targetItems?: ArticlePageItem[];
      };
    };
  };
}

type ArticleGuidesCarouselProps = ComponentProps & {
  fields?: ArticleGuidesCarouselFields;
};

const DEFAULT_HEADING = 'Our helpful guides and articles';

/**
 * ArticleGuidesCarousel - carousel of article cards (image, title, excerpt, link).
 * Uses Multilist datasource (featuredArticles.targetItems) to select Article Page items.
 */
export const Default: React.FC<ArticleGuidesCarouselProps> = (props) => {

  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing ?? false;

  const datasource = fields?.data?.datasource;
  const hasDatasource = Boolean(datasource);

  const title = datasource?.title?.jsonValue?.value ?? DEFAULT_HEADING;
  const useContentSdkTitle = Boolean(datasource?.title?.jsonValue);

  const articles = datasource?.featuredArticles?.targetItems ?? [];
  const showPlaceholder = !hasDatasource && isEditing;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
    containScroll: 'trimSnaps',
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          {useContentSdkTitle && datasource?.title?.jsonValue ? (
            <ContentSdkText
              tag="h2"
              field={datasource.title.jsonValue}
              className="text-2xl sm:text-3xl font-bold text-gray-900"
            />
          ) : (
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {title}
            </h2>
          )}

          {showPlaceholder ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">
                Add Article Guides datasource and select articles
              </p>
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">
                No articles selected. Add Article Pages to the featured articles
                list.
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-6 -ml-6">
                  {articles.map((article, index) => (
                    <ArticleCard
                      key={article.id ?? `article-${index}`}
                      article={article}
                    />
                  ))}
                </div>
              </div>

              {articles.length > 1 && (
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={scrollPrev}
                    disabled={!canScrollPrev}
                    className="rounded-lg bg-gray-200 p-2 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous articles"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={scrollNext}
                    disabled={!canScrollNext}
                    className="rounded-lg bg-gray-200 p-2 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next articles"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

function ArticleCard({ article }: { article: ArticlePageItem }) {
  const title = article.title?.jsonValue?.value ?? 'Untitled';
  const excerpt = article.excerpt?.jsonValue?.value ?? '';
  const imageField = article.mainImage?.jsonValue;
  const url = article.url?.path ?? '#';

  const cardContent = (
    <div className="flex flex-col h-full rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gray-100 relative">
        {imageField ? (
          <ContentSdkImage
            field={imageField as ImageField}
            fill
            className="object-cover"
            alt={
              typeof imageField?.value?.alt === 'string'
                ? imageField.value.alt
                : title
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sm text-gray-400">No image</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-4 gap-2">
        {article.title?.jsonValue ? (
          <ContentSdkText
            tag="h3"
            field={article.title.jsonValue}
            className="text-lg font-semibold text-gray-900 line-clamp-2"
          />
        ) : (
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {title}
          </h3>
        )}
        {excerpt && (
          <p className="text-sm text-gray-600 line-clamp-3 flex-1">{excerpt}</p>
        )}
        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 mt-auto">
          Read article
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex-[0_0_100%] min-w-0 pl-6 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
      <Link
        href={url || '#'}
        className="block h-full min-h-[320px]"
      >
        {cardContent}
      </Link>
    </div>
  );
}
