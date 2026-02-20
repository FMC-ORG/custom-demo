'use client';

import React from 'react';
import { Text, Image as SitecoreImage } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { format, parseISO, isValid } from 'date-fns';
import { MOCK_ARTICLE } from '@/lib/mock-content';

/**
 * Article Image Meta component parameters (context-only, no datasource)
 */
interface ArticleImageMetaParams {
  [key: string]: any; // eslint-disable-line
}

/**
 * Route fields shape from page context
 */
interface ArticleImageMetaRouteFields {
  MainImage?: { value?: { src?: string; alt?: string } };
  Author?: { value?: string };
  PublishedDate?: { value?: string };
}

/**
 * Article Image Meta component props.
 * Uses only page context from ComponentProps - no datasource.
 * Reads MainImage, Author, PublishedDate from route.fields (current page).
 */
interface ArticleImageMetaProps extends ComponentProps {
  params: ArticleImageMetaParams;
  fields?: Record<string, unknown>;
  isPageEditing?: boolean;
}

/**
 * Format published date for display (e.g. "29 Jan 2026")
 */
function formatPublishedDate(dateValue?: string): string {
  if (!dateValue) return '';
  try {
    const date = parseISO(dateValue);
    if (!isValid(date)) return '';
    return format(date, 'd MMM yyyy');
  } catch {
    return '';
  }
}

/**
 * Social share icons (visual only, no functionality)
 */
const SocialIcons: React.FC = () => (
  <div className="flex items-center gap-3">
    <span
      aria-label="Share on Facebook"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm"
    >
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    </span>
    <span
      aria-label="Share on X"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm"
    >
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </span>
    <span
      aria-label="Share on Pinterest"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm"
    >
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    </span>
    <span
      aria-label="Share via Email"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm"
    >
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    </span>
  </div>
);

const ArticleImageMetaComponent: React.FC<ArticleImageMetaProps> = (props) => {
  const { page, isPageEditing } = props;
  const { layout } = page;
  const { route } = layout.sitecore;
  const fields = route?.fields as ArticleImageMetaRouteFields | undefined;

  const mainImage = fields?.MainImage?.value;
  const author = fields?.Author?.value;
  const publishedDateValue = fields?.PublishedDate?.value;
  const formattedDate = formatPublishedDate(publishedDateValue);
  const mockDate = format(new Date(), 'd MMM yyyy');

  const hasRealImage = mainImage?.src || (isPageEditing && fields?.MainImage);
  const hasRealAuthor = author || (isPageEditing && fields?.Author);
  const hasRealDate = formattedDate || (isPageEditing && fields?.PublishedDate);
  const showMock = !isPageEditing;

  return (
    <section className="mb-8">
      {/* Article main image */}
      {hasRealImage && fields?.MainImage ? (
        <div className="relative w-full aspect-[16/10] overflow-hidden">
          <SitecoreImage
            field={fields.MainImage}
            className="object-cover w-full h-full"
          />
        </div>
      ) : showMock ? (
        <div
          className="relative w-full aspect-[16/10] overflow-hidden bg-muted flex items-center justify-center"
          aria-hidden
        >
          <span className="text-muted-foreground text-sm">Image placeholder</span>
        </div>
      ) : null}

      {/* Meta bar: By Author | Published - Date + Social icons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-3 bg-violet-400 text-white">
        <div className="flex items-center gap-2 text-sm font-medium">
          {(hasRealAuthor || showMock) && (
            <>
              <span>By </span>
              {hasRealAuthor && fields?.Author ? (
                <Text
                  field={fields.Author}
                  tag="span"
                  className="font-medium"
                />
              ) : (
                <span className="font-medium">{MOCK_ARTICLE.author}</span>
              )}
              {(hasRealDate || showMock) && <span className="text-white/80">|</span>}
            </>
          )}
          {(hasRealDate || showMock) && (
            <span>
              Published - {formattedDate || mockDate}
            </span>
          )}
        </div>
        <SocialIcons />
      </div>
    </section>
  );
};

export const Default: React.FC<ArticleImageMetaProps> = (props) => {
  const { page } = props;
  const isPageEditing = page.mode.isEditing;
  return (
    <ArticleImageMetaComponent {...props} isPageEditing={isPageEditing} />
  );
};
