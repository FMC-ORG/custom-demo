'use client';

import React from 'react';
import { RichText } from '@sitecore-content-sdk/nextjs';
import type { RichTextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { MOCK_ARTICLE } from '@/lib/mock-content';

/**
 * Article Content component parameters (context-only, no datasource)
 */
interface ArticleContentParams {
  [key: string]: any; // eslint-disable-line
}

/**
 * Route fields shape from page context
 */
interface ArticleContentRouteFields {
  Content?: RichTextField;
}

/**
 * Article Content component props.
 * Uses only page context from ComponentProps - no datasource.
 * Reads Content (Rich Text) from route.fields (current page).
 */
interface ArticleContentProps extends ComponentProps {
  params: ArticleContentParams;
  fields?: Record<string, unknown>;
  isPageEditing?: boolean;
}

const ArticleContentComponent: React.FC<ArticleContentProps> = (props) => {
  const { page, isPageEditing } = props;
  const { layout } = page;
  const { route } = layout.sitecore;
  const fields = route?.fields as ArticleContentRouteFields | undefined;
  const contentField = fields?.Content;
  const hasContent =
    contentField?.value != null && String(contentField.value).trim().length > 0;

  const articleClassName =
    'article-content font-serif text-foreground [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80 [&_img]:w-full [&_img]:my-6 [&_img]:rounded-lg [&_figure]:my-6 [&_figcaption]:text-sm [&_figcaption]:italic [&_figcaption]:text-muted-foreground [&_figcaption]:mt-2';

  return (
    <article
      className={articleClassName}
      data-testid="article-content"
    >
      {hasContent && contentField ? (
        <RichText field={contentField} />
      ) : isPageEditing ? (
        <div className="rounded border border-dashed border-muted-foreground/30 p-6 text-center text-muted-foreground">
          [Content] - Add article body in the page Content field
        </div>
      ) : (
        <>
          {MOCK_ARTICLE.content.map((paragraph, index) => (
            <p key={index} className="mb-4 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </>
      )}
    </article>
  );
};

export const Default: React.FC<ArticleContentProps> = (props) => {
  const { page } = props;
  const isPageEditing = page.mode.isEditing;
  return (
    <ArticleContentComponent {...props} isPageEditing={isPageEditing} />
  );
};
