'use client';

import React, { JSX, useEffect, useState } from 'react';
import {
  Field,
  ImageField,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface TestimonialItemFields {
  id: string;
  quoteText: { jsonValue: Field<string> };
  authorName: { jsonValue: Field<string> };
  authorRole: { jsonValue: Field<string> };
  authorImage: { jsonValue: ImageField };
  companyName: { jsonValue: Field<string> };
  companyLogo: { jsonValue: ImageField };
  videoUrl: { jsonValue: Field<string> };
}

interface TestimonialBlockDatasource {
  sectionTitle: { jsonValue: Field<string> };
  children: {
    results: TestimonialItemFields[];
  };
}

interface TestimonialBlockFields {
  data: {
    datasource: TestimonialBlockDatasource;
  };
}

type TestimonialBlockProps = ComponentProps & {
  fields: TestimonialBlockFields;
};

const TestimonialBlockDefaultComponent = (): JSX.Element => (
  <div className="component testimonial-block">
    <div className="component-content">
      <span className="is-empty-hint">TestimonialBlock</span>
    </div>
  </div>
);

const QuoteMark = () => (
  <span
    className="block text-6xl leading-none opacity-30 font-serif select-none"
    style={{ color: 'var(--brand-primary)' }}
    aria-hidden="true"
  >
    &ldquo;
  </span>
);

const AuthorAttribution = ({
  item,
  isEditing,
  size = 'sm',
}: {
  item: TestimonialItemFields;
  isEditing?: boolean;
  size?: 'sm' | 'lg';
}) => (
  <div className={cn('flex items-center', size === 'lg' ? 'gap-4' : 'gap-3')}>
    {(item.authorImage?.jsonValue?.value?.src || isEditing) && (
      <ContentSdkImage
        field={item.authorImage?.jsonValue}
        className={cn(
          'rounded-full object-cover',
          size === 'lg' ? 'h-14 w-14' : 'h-12 w-12'
        )}
      />
    )}
    <div>
      {(item.authorName?.jsonValue?.value || isEditing) && (
        <Text
          field={item.authorName?.jsonValue}
          tag="p"
          className="font-semibold font-[var(--brand-heading-font,inherit)]"
          style={{ color: 'var(--brand-fg, #111111)' }}
        />
      )}
      <div className="flex flex-wrap items-center gap-1 text-sm" style={{ color: 'var(--brand-muted-foreground, #6b7280)' }}>
        {(item.authorRole?.jsonValue?.value || isEditing) && (
          <Text field={item.authorRole?.jsonValue} tag="span" />
        )}
        {item.authorRole?.jsonValue?.value && item.companyName?.jsonValue?.value && (
          <span aria-hidden="true">&middot;</span>
        )}
        {(item.companyName?.jsonValue?.value || isEditing) && (
          <Text field={item.companyName?.jsonValue} tag="span" />
        )}
      </div>
    </div>
  </div>
);

/* ────────────────────────────────────────────
   Default — single large centered quote (first child)
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: TestimonialBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TestimonialBlockDefaultComponent />;
  const items = datasource.children?.results || [];
  const item = items[0];

  return (
    <div className={cn('component testimonial-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-3xl text-center">
          {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.sectionTitle?.jsonValue}
              tag="h2"
              className="mb-8 text-2xl font-bold font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          {item && (
            <>
              <QuoteMark />
              {(item.quoteText?.jsonValue?.value || isEditing) && (
                <ContentSdkRichText
                  field={item.quoteText?.jsonValue}
                  className="mt-2 text-lg italic md:text-xl font-[var(--brand-body-font,inherit)]"
                  style={{ color: 'var(--brand-fg, #111111)' }}
                />
              )}
              <div className="mt-6 flex justify-center">
                <AuthorAttribution item={item} isEditing={isEditing} />
              </div>
              {(item.companyLogo?.jsonValue?.value?.src || isEditing) && (
                <div className="mt-4 flex justify-center">
                  <ContentSdkImage
                    field={item.companyLogo?.jsonValue}
                    className="h-8 max-w-[120px] object-contain opacity-60"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Carousel — horizontal scrollable container
   ──────────────────────────────────────────── */
export const Carousel = ({ fields, params, page }: TestimonialBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TestimonialBlockDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component testimonial-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.sectionTitle?.jsonValue}
              tag="h2"
              className="mb-8 text-center text-2xl font-bold font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="min-w-[300px] max-w-[400px] shrink-0 snap-center p-6 rounded-[var(--brand-card-radius,0.75rem)]"
                style={{
                  backgroundColor: 'var(--brand-bg, #ffffff)',
                  border: '1px solid var(--brand-border, #e5e7eb)',
                }}
              >
                <QuoteMark />
                {(item.quoteText?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.quoteText?.jsonValue}
                    className="mt-2 text-sm italic font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                <div className="mt-4">
                  <AuthorAttribution item={item} isEditing={isEditing} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   getYouTubeId — pull the 11-char id from common YouTube URL shapes
   ──────────────────────────────────────────── */
const getYouTubeId = (url: string): string | null => {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
};

/* ────────────────────────────────────────────
   VideoModal — custom lightbox. YouTube URL → iframe, any other URL →
   HTML5 <video> (Content Hub public .mp4). Autoplays; closes on backdrop
   click + ESC; locks body scroll while open.
   ──────────────────────────────────────────── */
const VideoModal = ({ url, onClose }: { url: string; onClose: () => void }): JSX.Element => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const youTubeId = getYouTubeId(url);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute -top-10 right-0 flex h-9 w-9 items-center justify-center rounded-full text-white hover:opacity-80"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
          {youTubeId ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1&rel=0`}
              title="Customer story video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video className="absolute inset-0 h-full w-full" src={url} controls autoPlay playsInline>
              <track kind="captions" />
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

/* Sage variant */
/* ────────────────────────────────────────────
   Sage — carousel: quote panel left, customer image right with a play
   overlay; clicking the image opens the video popup. Arrows + dots.
   ──────────────────────────────────────────── */
export const Sage = ({ fields, params, page }: TestimonialBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  const items = datasource?.children?.results || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  if (!datasource) return <TestimonialBlockDefaultComponent />;

  const count = items.length;
  const safeIndex = count ? Math.min(activeIndex, count - 1) : 0;
  const item = items[safeIndex];
  const goPrev = () => setActiveIndex((i) => (i - 1 + count) % count);
  const goNext = () => setActiveIndex((i) => (i + 1) % count);
  const activeVideo = item?.videoUrl?.jsonValue?.value?.trim();
  const hasImage = !!item?.authorImage?.jsonValue?.value?.src;

  return (
    <div className={cn('component testimonial-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-6 py-16"
        style={{ backgroundColor: 'var(--brand-bg, #0a0a0a)', color: 'var(--brand-fg, #ffffff)' }}
      >
        {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
          <Text
            field={datasource.sectionTitle?.jsonValue}
            tag="h2"
            className="mb-10 text-center text-3xl font-[900] tracking-tight font-[var(--brand-heading-font,inherit)]"
            style={{ color: 'var(--brand-fg, #ffffff)' }}
          />
        )}

        {item && (
          <div className="mx-auto flex max-w-6xl items-center gap-4">
            {count > 1 && (
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous testimonial"
                className="hidden shrink-0 px-2 text-3xl text-white/60 transition-opacity hover:text-white md:block"
              >
                &larr;
              </button>
            )}

            <div className="grid flex-1 overflow-hidden rounded-2xl md:grid-cols-2">
              {/* Quote panel */}
              <div
                className="flex flex-col justify-center p-8 md:p-12"
                style={{ backgroundColor: 'var(--brand-muted, #1a1a1a)' }}
              >
                <span
                  className="block text-6xl leading-none font-[900] select-none"
                  style={{ color: 'var(--brand-primary)' }}
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                {(item.quoteText?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.quoteText?.jsonValue}
                    className="mt-2 text-lg font-medium md:text-xl font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #ffffff)' }}
                  />
                )}
                <div className="mt-6">
                  {(item.authorName?.jsonValue?.value || isEditing) && (
                    <Text
                      field={item.authorName?.jsonValue}
                      tag="p"
                      className="font-bold font-[var(--brand-heading-font,inherit)]"
                      style={{ color: 'var(--brand-fg, #ffffff)' }}
                    />
                  )}
                  <div
                    className="flex flex-wrap items-center gap-1 text-sm"
                    style={{ color: 'var(--brand-muted-foreground, #a1a1aa)' }}
                  >
                    {(item.authorRole?.jsonValue?.value || isEditing) && (
                      <Text field={item.authorRole?.jsonValue} tag="span" />
                    )}
                    {item.authorRole?.jsonValue?.value && item.companyName?.jsonValue?.value && (
                      <span aria-hidden="true">&middot;</span>
                    )}
                    {(item.companyName?.jsonValue?.value || isEditing) && (
                      <Text field={item.companyName?.jsonValue} tag="span" />
                    )}
                  </div>
                </div>
              </div>

              {/* Image + play overlay */}
              <div className="relative min-h-[260px] bg-black md:min-h-[420px]">
                {(hasImage || isEditing) && (
                  <ContentSdkImage
                    field={item.authorImage?.jsonValue}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {activeVideo && (
                  <button
                    type="button"
                    onClick={() => setVideoUrl(activeVideo)}
                    aria-label="Play video"
                    className="group absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/70 text-white transition-transform group-hover:scale-110">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <polygon points="7,4 20,12 7,20" />
                      </svg>
                    </span>
                  </button>
                )}
              </div>
            </div>

            {count > 1 && (
              <button
                type="button"
                onClick={goNext}
                aria-label="Next testimonial"
                className="hidden shrink-0 px-2 text-3xl text-white/60 transition-opacity hover:text-white md:block"
              >
                &rarr;
              </button>
            )}
          </div>
        )}

        {count > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {items.map((dot, i) => (
              <button
                key={dot.id}
                type="button"
                aria-label={`Show testimonial ${i + 1}`}
                aria-current={i === safeIndex}
                onClick={() => setActiveIndex(i)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === safeIndex ? '1.5rem' : '0.5rem',
                  backgroundColor:
                    i === safeIndex ? 'var(--brand-primary)' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>
        )}
      </section>

      {videoUrl && <VideoModal url={videoUrl} onClose={() => setVideoUrl(null)} />}
    </div>
  );
};

/* ────────────────────────────────────────────
   Grid — 2-3 testimonial cards
   ──────────────────────────────────────────── */
export const Grid = ({ fields, params, page }: TestimonialBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TestimonialBlockDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component testimonial-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.sectionTitle?.jsonValue}
              tag="h2"
              className="mb-10 text-center text-2xl font-bold font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col p-6 rounded-[var(--brand-card-radius,0.75rem)]"
                style={{
                  backgroundColor: 'var(--brand-bg, #ffffff)',
                  border: '1px solid var(--brand-border, #e5e7eb)',
                }}
              >
                <QuoteMark />
                {(item.quoteText?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.quoteText?.jsonValue}
                    className="mt-2 flex-1 text-sm italic font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--brand-border, #e5e7eb)' }}>
                  <AuthorAttribution item={item} isEditing={isEditing} />
                </div>
                {(item.companyLogo?.jsonValue?.value?.src || isEditing) && (
                  <div className="mt-3">
                    <ContentSdkImage
                      field={item.companyLogo?.jsonValue}
                      className="h-6 max-w-[100px] object-contain opacity-50"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   WithPhoto — single quote with large author photo
   ──────────────────────────────────────────── */
export const WithPhoto = ({ fields, params, page }: TestimonialBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TestimonialBlockDefaultComponent />;
  const items = datasource.children?.results || [];
  const item = items[0];

  return (
    <div className={cn('component testimonial-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-4xl">
          {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.sectionTitle?.jsonValue}
              tag="h2"
              className="mb-10 text-center text-2xl font-bold font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          {item && (
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
              {(item.authorImage?.jsonValue?.value?.src || isEditing) && (
                <div className="shrink-0">
                  <ContentSdkImage
                    field={item.authorImage?.jsonValue}
                    className="h-32 w-32 rounded-full object-cover shadow-md"
                  />
                </div>
              )}
              <div className="flex-1 text-center md:text-left">
                <QuoteMark />
                {(item.quoteText?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.quoteText?.jsonValue}
                    className="mt-2 text-lg italic md:text-xl font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                <div className="mt-6">
                  <AuthorAttribution item={item} isEditing={isEditing} size="lg" />
                </div>
                {(item.companyLogo?.jsonValue?.value?.src || isEditing) && (
                  <div className="mt-4">
                    <ContentSdkImage
                      field={item.companyLogo?.jsonValue}
                      className="h-8 max-w-[120px] object-contain opacity-60"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
