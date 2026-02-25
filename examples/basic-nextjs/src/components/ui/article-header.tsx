'use client';

import type React from 'react';
import { Text, NextImage as ContentSdkImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type ArticleHeaderProps = ComponentProps;

function formatPublicationDate(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') {
    try {
      const date = new Date(value);
      return isNaN(date.getTime())
        ? value
        : date.toLocaleDateString(undefined, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
    } catch {
      return value;
    }
  }
  if (value instanceof Date) {
    return value.toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  return String(value);
}

function getAuthorDisplayName(author: unknown): string {
  if (!author) return '';
  if (typeof author === 'string') return author;
  if (typeof author === 'object' && author !== null) {
    const obj = author as Record<string, unknown>;
    const firstName = obj.personFirstName as Field<string> | undefined;
    const lastName = obj.personLastName as Field<string> | undefined;
    const displayName = obj.displayName as string | undefined;
    if (displayName) return displayName;
    const first = firstName?.value ?? (typeof firstName === 'string' ? firstName : '');
    const last = lastName?.value ?? (typeof lastName === 'string' ? lastName : '');
    if (first || last) return [first, last].filter(Boolean).join(' ').trim();
    const fields = obj.fields as Record<string, unknown> | undefined;
    if (fields) {
      const fn = fields.personFirstName as Field<string> | undefined;
      const ln = fields.personLastName as Field<string> | undefined;
      const f = fn?.value ?? '';
      const l = ln?.value ?? '';
      if (f || l) return [f, l].filter(Boolean).join(' ').trim();
    }
  }
  return '';
}

function getAuthorJobTitle(author: unknown): string {
  if (!author || typeof author !== 'object') return '';
  const obj = author as Record<string, unknown>;
  const jobTitle = obj.personJobTitle as Field<string> | undefined;
  const fields = obj.fields as Record<string, unknown> | undefined;
  const fromField = jobTitle?.value ?? (typeof jobTitle === 'string' ? jobTitle : '');
  if (fromField) return fromField;
  const fromFields = fields?.personJobTitle as Field<string> | undefined;
  return fromFields?.value ?? '';
}

function getAuthorImageSrc(author: unknown): string | undefined {
  if (!author || typeof author !== 'object') return undefined;
  const obj = author as Record<string, unknown>;
  const img = obj.personProfileImage as ImageField | { value?: { src?: string } } | undefined;
  const src = img?.value?.src ?? (img as { value?: { src?: string } })?.value?.src;
  if (src) return src;
  const fields = obj.fields as Record<string, unknown> | undefined;
  const profileImg = fields?.personProfileImage as { value?: { src?: string } } | undefined;
  return profileImg?.value?.src;
}

function estimateReadTime(content: unknown): string {
  if (!content) return '';
  const html = typeof content === 'string' ? content : (content as { value?: string })?.value ?? '';
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

export const Default: React.FC<ArticleHeaderProps> = (props) => {
  const { params } = props;
  const { page } = useSitecore();
  const routeFields = page?.layout?.sitecore?.route?.fields ?? {};
  const context = page?.layout?.sitecore?.context;
  const itemPath = context?.itemPath ?? '';
  const isEditing = page?.mode?.isEditing ?? false;

  const title = routeFields.Title as Field<string> | undefined;
  const excerpt = routeFields.Excerpt as Field<string> | undefined;
  const author = routeFields.Author;
  const expert = routeFields.Expert as Field<string> | undefined;
  const publicationDate = routeFields.PublicationDate as Field<string> | undefined;
  const readTime = routeFields.ReadTime as Field<string> | undefined;
  const content = routeFields.Content;

  const authorValue =
    author && typeof author === 'object' && 'value' in author
      ? (author as { value?: unknown }).value
      : author;
  const authorDisplay = getAuthorDisplayName(authorValue ?? author);
  const authorJobTitle = getAuthorJobTitle(authorValue ?? author);
  const authorImageSrc = getAuthorImageSrc(authorValue ?? author);
  const expertValue = expert?.value ?? (expert as { value?: string })?.value;
  const jobTitle = authorJobTitle || expertValue;
  const dateValue = publicationDate?.value ?? (publicationDate as { value?: string })?.value;
  const formattedDate = formatPublicationDate(dateValue);
  const readTimeValue =
    readTime?.value ?? (readTime as { value?: string })?.value ?? estimateReadTime(content);
  const titleValue = title?.value ?? (title as { value?: string })?.value;
  const excerptValue = excerpt?.value ?? (excerpt as { value?: string })?.value;

  const breadcrumbSegments = itemPath
    ? itemPath.split('/').filter(Boolean)
    : ['Home'];
  const showBreadcrumbs = breadcrumbSegments.length > 0;
  const showAuthor = authorDisplay || isEditing;
  const showMeta = (readTimeValue || formattedDate) || isEditing;
  const showExcerpt = excerptValue || isEditing;

  return (
    <header className={cn('article-header', params?.styles)} id={params?.RenderingIdentifier}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <ol className="flex flex-wrap gap-1">
              {breadcrumbSegments.map((segment, index) => (
                <li key={index} className="flex items-center gap-1">
                  {index > 0 && <span>/</span>}
                  {index === breadcrumbSegments.length - 1 ? (
                    <span className="text-foreground font-medium">{segment}</span>
                  ) : (
                    <Link
                      href="#"
                      className="hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      {segment}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Title */}
        {(titleValue || isEditing) && (
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            {title ? (
              <Text field={title} tag="span" />
            ) : (
              <span className="italic">[Title]</span>
            )}
          </h1>
        )}

        {/* Author block */}
        {showAuthor && (
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              {authorImageSrc ? (
                <AvatarImage src={authorImageSrc} alt={authorDisplay} />
              ) : (
                <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                  {authorDisplay
                    ? authorDisplay
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : '?'}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                Written By {authorDisplay || '[Author]'}
                {jobTitle && (
                  <span className="text-muted-foreground font-normal"> {jobTitle}</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Metadata: read time | published date */}
        {showMeta && (
          <p className="text-sm text-muted-foreground mb-4">
            {readTimeValue && <span>{readTimeValue}</span>}
            {readTimeValue && formattedDate && <span> | </span>}
            {formattedDate && (
              <time dateTime={typeof dateValue === 'string' ? dateValue : undefined}>
                Published {formattedDate}
              </time>
            )}
          </p>
        )}

        {/* Excerpt */}
        {showExcerpt && (
          <p className="text-lg text-muted-foreground mb-6">
            {excerptValue ? (
              excerptValue
            ) : (
              <span className="italic">[Excerpt]</span>
            )}
          </p>
        )}
      </div>
    </header>
  );
};
