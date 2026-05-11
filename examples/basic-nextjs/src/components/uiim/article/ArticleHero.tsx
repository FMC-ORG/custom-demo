'use client';

import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  NextImage as ContentSdkImage,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface RouteFields {
  Title?: Field<string>;
  Subtitle?: Field<string>;
  ArticleImage?: ImageField;
  PublishDate?: Field<string>;
  Author?: Field<string>;
  Category?: Field<string>;
}

type ArticleHeroProps = ComponentProps;

const ArticleHeroDefaultComponent = (): JSX.Element => (
  <div className="component article-hero">
    <div className="component-content">
      <span className="is-empty-hint">ArticleHero</span>
    </div>
  </div>
);

const getRouteFields = (props: ArticleHeroProps): RouteFields => {
  return (props.page?.layout?.sitecore?.route?.fields as RouteFields) || {};
};

const formatDate = (dateValue: string | undefined): string => {
  if (!dateValue) return '';
  try {
    const date = new Date(dateValue);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateValue;
  }
};

export const Default = (props: ArticleHeroProps): JSX.Element => {
  const { params, page } = props;
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(props);

  if (!routeFields.Title?.value && !isEditing) return <ArticleHeroDefaultComponent />;

  const publishDate = formatDate(routeFields.PublishDate?.value);

  return (
    <div className={cn('component article-hero', styles)} id={RenderingIdentifier}>
      {/* Colored header band */}
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: 'var(--brand-primary, #003DA5)' }}
      >
        <div className="mx-auto max-w-4xl">
          {/* Category badge */}
          {(routeFields.Category?.value || isEditing) && (
            <Text
              field={routeFields.Category}
              tag="span"
              className="mb-3 inline-block rounded-[var(--brand-button-radius,6px)] px-3 py-1 text-xs font-semibold uppercase tracking-wider font-[var(--brand-body-font,inherit)]"
              style={{
                backgroundColor: 'var(--brand-accent, #DF3A56)',
                color: '#ffffff',
              }}
            />
          )}

          {/* Title */}
          {(routeFields.Title?.value || isEditing) && (
            <Text
              field={routeFields.Title}
              tag="h1"
              className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl font-[var(--brand-heading-font,inherit)]"
            />
          )}

          {/* Subtitle */}
          {(routeFields.Subtitle?.value || isEditing) && (
            <Text
              field={routeFields.Subtitle}
              tag="p"
              className="mt-3 text-lg text-white/80 font-[var(--brand-body-font,inherit)]"
            />
          )}

          {/* Byline */}
          {(routeFields.Author?.value || publishDate) && (
            <p className="mt-4 text-sm text-white/70 font-[var(--brand-body-font,inherit)]">
              {routeFields.Author?.value && (
                <span>By {routeFields.Author.value}</span>
              )}
              {routeFields.Author?.value && publishDate && (
                <span className="mx-2">|</span>
              )}
              {publishDate && (
                <span>Published {publishDate}</span>
              )}
            </p>
          )}
        </div>
      </section>

      {/* Article image below the band */}
      {(routeFields.ArticleImage?.value?.src || isEditing) && (
        <div className="mx-auto max-w-4xl px-4 py-6">
          <ContentSdkImage
            field={routeFields.ArticleImage}
            className="w-full rounded-[var(--brand-card-radius,8px)] object-cover"
          />
        </div>
      )}
    </div>
  );
};
