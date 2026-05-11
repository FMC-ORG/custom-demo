import React, { JSX } from 'react';
import {
  Field,
  RichText as ContentSdkRichText,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface RouteFields {
  Content?: Field<string>;
}

type ArticleBodyProps = ComponentProps;

const ArticleBodyDefaultComponent = (): JSX.Element => (
  <div className="component article-body">
    <div className="component-content">
      <span className="is-empty-hint">ArticleBody</span>
    </div>
  </div>
);

const getRouteFields = (props: ArticleBodyProps): RouteFields => {
  return (props.page?.layout?.sitecore?.route?.fields as RouteFields) || {};
};

export const Default = (props: ArticleBodyProps): JSX.Element => {
  const { params, page } = props;
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(props);

  if (!routeFields.Content?.value && !isEditing) return <ArticleBodyDefaultComponent />;

  return (
    <div className={cn('component article-body', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-8 md:py-12"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-4xl">
          {(routeFields.Content?.value || isEditing) && (
            <ContentSdkRichText
              field={routeFields.Content}
              className="prose prose-lg max-w-none font-[var(--brand-body-font,inherit)]"
              style={{ color: 'var(--brand-fg, #333333)' }}
            />
          )}
        </div>
      </section>
    </div>
  );
};
