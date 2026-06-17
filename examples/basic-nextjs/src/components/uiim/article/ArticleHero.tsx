'use client';

import React, { JSX, useState } from 'react';
import {
  Field,
  ImageField,
  Text,
  NextImage as ContentSdkImage,
  DateField,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';
import { PersonReference } from 'src/Layout';
import { SmartMedia } from '@/components/uiim/media/SmartMedia';

interface ArticleHeroRouteFields {
  Title?: Field<string>;
  ArticleImage?: ImageField;
  ArticleAuthor?: PersonReference;
  ArticlePublicationDate?: Field<string>;
  ArticleReadTime?: Field<string>;
}

const ArticleHeroDefaultComponent = (): JSX.Element => (
  <div className="component article-hero">
    <div className="component-content">
      <span className="is-empty-hint">ArticleHero</span>
    </div>
  </div>
);

function getRouteFields(page: ComponentProps['page']): ArticleHeroRouteFields | null {
  const fields = page?.layout?.sitecore?.route?.fields;
  return fields ? (fields as unknown as ArticleHeroRouteFields) : null;
}

function ShareButtons() {
  const [copied, setCopied] = useState(false);

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'email':
        window.location.href = `mailto:?subject=${title}&body=${url}`;
        return;
      case 'copy':
        navigator.clipboard.writeText(window.location.href).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        return;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex items-center gap-3" data-testid="share-buttons">
      <span className="text-sm font-medium opacity-70">Share</span>
      {['facebook', 'twitter', 'linkedin', 'email'].map((platform) => (
        <button
          key={platform}
          onClick={() => handleShare(platform)}
          className="rounded-full p-2 transition-colors hover:bg-white/10"
          aria-label={`Share on ${platform}`}
          data-testid={`share-${platform}`}
        >
          <span className="text-sm capitalize">{platform}</span>
        </button>
      ))}
      <button
        onClick={() => handleShare('copy')}
        className="rounded-full p-2 transition-colors hover:bg-white/10"
        aria-label={copied ? 'Link copied' : 'Copy link'}
        data-testid="share-copy"
      >
        <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
      </button>
    </div>
  );
}

function AuthorMeta({
  author,
  isEditing,
}: {
  author?: PersonReference;
  isEditing?: boolean;
}) {
  if (!author?.fields && !isEditing) return null;
  const fields = author?.fields;

  return (
    <div className="flex items-center gap-3" data-testid="author-meta">
      {fields?.personProfileImage?.value?.src && (
        <div className="h-10 w-10 overflow-hidden rounded-full">
          <ContentSdkImage
            field={fields.personProfileImage}
            className="h-full w-full object-cover"
            width={40}
            height={40}
          />
        </div>
      )}
      <div>
        {(fields?.personFirstName?.value || fields?.personLastName?.value || isEditing) && (
          <p className="text-sm font-medium" data-testid="author-name">
            {fields?.personFirstName?.value} {fields?.personLastName?.value}
          </p>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Sage — dark editorial hero, green accent eyebrow, Poppins-900 title,
   rounded hero image frame. Themed via CSS vars only.
   ──────────────────────────────────────────── */
export const Sage = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);

  if (!routeFields) return <ArticleHeroDefaultComponent />;

  const { Title: title, ArticleImage, ArticleAuthor, ArticlePublicationDate, ArticleReadTime } =
    routeFields;

  return (
    <div className={cn('component article-hero', styles)} id={RenderingIdentifier}>
      <header
        className="relative overflow-hidden"
        style={{
          backgroundColor: 'var(--brand-bg, #0a0a0a)',
          color: 'var(--brand-fg, #fff)',
        }}
        data-testid="article-hero-header"
      >
        <div className="mx-auto max-w-5xl px-4 py-20 md:py-28">
          {/* Eyebrow / category accent */}
          <span
            className="inline-block rounded-[var(--brand-button-radius,9999px)] px-3 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{
              backgroundColor: 'var(--brand-primary, #00D639)',
              color: 'var(--brand-primary-foreground, #000)',
            }}
            data-testid="article-eyebrow"
          >
            Article
          </span>

          {/* Title */}
          {(title?.value || isEditing) && (
            <Text
              field={title}
              tag="h1"
              className="mt-6 text-4xl font-[900] leading-tight tracking-tight sm:text-5xl font-[var(--brand-heading-font,inherit)]"
              data-testid="article-title"
            />
          )}

          {/* Metadata row */}
          <div
            className="mt-6 flex flex-wrap items-center gap-4 text-sm"
            style={{ color: 'var(--brand-muted-foreground, #a1a1aa)' }}
          >
            <AuthorMeta author={ArticleAuthor} isEditing={isEditing} />
            {(ArticlePublicationDate?.value || isEditing) && ArticlePublicationDate && (
              <time data-testid="article-date">
                <DateField
                  field={ArticlePublicationDate}
                  tag="span"
                  render={(date) =>
                    new Date(String(date)).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }
                />
              </time>
            )}
            {(ArticleReadTime?.value || isEditing) && ArticleReadTime && (
              <Text field={ArticleReadTime} tag="span" data-testid="article-read-time" />
            )}
          </div>

          {/* Hero image — rounded frame */}
          {(ArticleImage?.value?.src || isEditing) && (
            <div
              className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[var(--brand-card-radius,0.75rem)]"
              data-testid="article-hero-image"
            >
              <ContentSdkImage field={ArticleImage} fill sizes="100vw" className="object-cover" />
            </div>
          )}

          {/* Share buttons */}
          <div className="mt-8">
            <ShareButtons />
          </div>
        </div>
      </header>
    </div>
  );
};

/* ────────────────────────────────────────────
   Default — delegates to the Sage variant
   ──────────────────────────────────────────── */
export const Default = (props: ComponentProps): JSX.Element => <Sage {...props} />;

/* ────────────────────────────────────────────
   Minimal — no image, clean background, large title
   ──────────────────────────────────────────── */
export const Minimal = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);

  if (!routeFields) return <ArticleHeroDefaultComponent />;

  const { Title: title, ArticleAuthor, ArticlePublicationDate, ArticleReadTime } = routeFields;

  return (
    <div className={cn('component article-hero', styles)} id={RenderingIdentifier}>
      <header className="bg-white" data-testid="article-hero-header">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
          {(title?.value || isEditing) && (
            <Text
              field={title}
              tag="h1"
              className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl"
              data-testid="article-title"
            />
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <AuthorMeta author={ArticleAuthor} isEditing={isEditing} />
            {(ArticlePublicationDate?.value || isEditing) && ArticlePublicationDate && (
              <time data-testid="article-date">
                <DateField
                  field={ArticlePublicationDate}
                  tag="span"
                  render={(date) =>
                    new Date(String(date)).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }
                />
              </time>
            )}
            {(ArticleReadTime?.value || isEditing) && ArticleReadTime && (
              <Text field={ArticleReadTime} tag="span" data-testid="article-read-time" />
            )}
          </div>

          <div className="mt-6">
            <ShareButtons />
          </div>
        </div>
      </header>
    </div>
  );
};

/* ────────────────────────────────────────────
   SplitImage — two-column: image right, title + metadata left
   ──────────────────────────────────────────── */
export const SplitImage = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);

  if (!routeFields) return <ArticleHeroDefaultComponent />;

  const { Title: title, ArticleImage, ArticleAuthor, ArticlePublicationDate, ArticleReadTime } =
    routeFields;

  return (
    <div className={cn('component article-hero', styles)} id={RenderingIdentifier}>
      <header data-testid="article-hero-header">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          {/* Left column — text */}
          <div className="flex flex-col justify-center">
            {(title?.value || isEditing) && (
              <Text
                field={title}
                tag="h1"
                className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl"
                data-testid="article-title"
              />
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <AuthorMeta author={ArticleAuthor} isEditing={isEditing} />
              {(ArticlePublicationDate?.value || isEditing) && ArticlePublicationDate && (
                <time data-testid="article-date">
                  <DateField
                    field={ArticlePublicationDate}
                    tag="span"
                    render={(date) =>
                      new Date(String(date)).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    }
                  />
                </time>
              )}
              {(ArticleReadTime?.value || isEditing) && ArticleReadTime && (
                <Text field={ArticleReadTime} tag="span" data-testid="article-read-time" />
              )}
            </div>

            <div className="mt-8">
              <ShareButtons />
            </div>
          </div>

          {/* Right column — image */}
          {(ArticleImage?.value?.src || isEditing) && (
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-lg"
              data-testid="split-image"
            >
              <SmartMedia
                field={ArticleImage}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </header>
    </div>
  );
};
