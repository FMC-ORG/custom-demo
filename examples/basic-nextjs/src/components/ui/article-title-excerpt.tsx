'use client';

import React from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Article Title Excerpt component parameters (context-only, no datasource)
 */
interface ArticleTitleExcerptParams {
  [key: string]: any; // eslint-disable-line
}

/**
 * Route fields shape from page context
 */
interface RouteFields {
  Title?: { value?: string };
  Excerpt?: { value?: string };
}

/**
 * Article Title Excerpt component props.
 * Uses only page context from ComponentProps - no datasource.
 * Reads Title and Excerpt from route.fields (current page).
 */
interface ArticleTitleExcerptProps extends ComponentProps {
  params: ArticleTitleExcerptParams;
  fields?: Record<string, unknown>;
  isPageEditing?: boolean;
}

const ArticleTitleExcerptComponent: React.FC<ArticleTitleExcerptProps> = (props) => {
  const { page, isPageEditing } = props;
  const { layout } = page;
  const { route } = layout.sitecore;
  const fields = route?.fields as RouteFields | undefined;

  const title = fields?.Title?.value;
  const excerpt = fields?.Excerpt?.value;

  const hasContent = title || excerpt;

  if (!hasContent && !isPageEditing) {
    return null;
  }

  return (
    <header className="mb-8">
      {(title || isPageEditing) && fields?.Title && (
        <Text
          field={fields.Title}
          tag="h1"
          className="text-3xl md:text-4xl font-extrabold text-saga-navy leading-tight tracking-tight"
        />
      )}
      {(excerpt || isPageEditing) && fields?.Excerpt && (
        <Text
          field={fields.Excerpt}
          tag="p"
          className="mt-4 text-lg text-saga-navy/80 leading-relaxed"
        />
      )}
    </header>
  );
};

export const Default: React.FC<ArticleTitleExcerptProps> = (props) => {
  const { page } = props;
  const isPageEditing = page.mode.isEditing;
  return (
    <ArticleTitleExcerptComponent {...props} isPageEditing={isPageEditing} />
  );
};
