'use client';

import type React from 'react';
import { useEffect, useRef } from 'react';
import { RichText as ContentSdkRichText, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { RichTextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { cn } from '@/lib/utils';

type ArticleContentProps = ComponentProps;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Article Content component - context-only, reads from page route fields.
 * Renders Content (Rich Text) only. Meta and hero image moved to article-header and article-hero-image.
 */
export const Default: React.FC<ArticleContentProps> = (props) => {
  const { params } = props;
  const { page } = useSitecore();
  const routeFields = page?.layout?.sitecore?.route?.fields ?? {};
  const isEditing = page?.mode?.isEditing ?? false;
  const contentRef = useRef<HTMLDivElement>(null);

  const content = routeFields.Content as RichTextField | undefined;

  const hasContent = Boolean(content?.value ?? (content as { value?: string })?.value);
  const showContent = hasContent || isEditing;

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const h2s = container.querySelectorAll('h2');
    h2s.forEach((h2, index) => {
      if (!h2.id) {
        const text = h2.textContent?.trim() ?? '';
        h2.id = text ? `section-${index}-${slugify(text)}` : `section-${index}`;
      }
    });
  }, [showContent, hasContent]);

  return (
    <article
      className={cn('article-content', params?.styles)}
      id={params?.RenderingIdentifier}
      data-article-body
    >
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div ref={contentRef} className="prose prose-lg max-w-none dark:prose-invert">
          {showContent && content ? (
            <ContentSdkRichText field={content} />
          ) : (
            <div className="rounded border border-dashed p-4 text-muted-foreground">
              [Article content]
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
