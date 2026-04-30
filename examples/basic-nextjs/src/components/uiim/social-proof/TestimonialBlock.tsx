import React, { JSX } from 'react';
import { Field, ImageField, RichText as ContentSdkRichText, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { SitecoreNextImage } from '@/lib/sitecore-next-image';
import { cn } from '@/lib/utils';

interface TestimonialItemFields {
  id: string;
  quoteText: { jsonValue: Field<string> };
  authorName: { jsonValue: Field<string> };
  authorRole: { jsonValue: Field<string> };
  authorImage: { jsonValue: ImageField };
  companyName: { jsonValue: Field<string> };
  companyLogo: { jsonValue: ImageField };
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
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-full',
          size === 'lg' ? 'h-14 w-14' : 'h-12 w-12'
        )}
      >
        <SitecoreNextImage
          field={item.authorImage?.jsonValue}
          className="object-cover"
          sizes={size === 'lg' ? '56px' : '48px'}
        />
      </div>
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
                <div className="relative mx-auto mt-4 h-8 w-[120px]">
                  <SitecoreNextImage
                    field={item.companyLogo?.jsonValue}
                    className="object-contain opacity-60"
                    sizes="120px"
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
                  <div className="relative mt-3 h-6 w-[100px]">
                    <SitecoreNextImage
                      field={item.companyLogo?.jsonValue}
                      className="object-contain opacity-50"
                      sizes="100px"
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
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full shadow-md">
                  <SitecoreNextImage
                    field={item.authorImage?.jsonValue}
                    className="object-cover"
                    sizes="128px"
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
                  <div className="relative mt-4 h-8 w-[120px]">
                    <SitecoreNextImage
                      field={item.companyLogo?.jsonValue}
                      className="object-contain opacity-60"
                      sizes="120px"
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

/* Howdens — Trustpilot-style summary + horizontal review scroller */
export const Howdens = ({ fields, params, page }: TestimonialBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TestimonialBlockDefaultComponent />;
  const reviewItems = datasource.children?.results || [];

  return (
    <div className={cn('component testimonial-block', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-12 md:py-16" style={{ backgroundColor: 'var(--brand-bg)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col items-center justify-between gap-4 border-b pb-8 text-center md:flex-row md:text-left" style={{ borderColor: 'var(--brand-border)' }}>
            <div>
              {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
                <Text
                  field={datasource.sectionTitle?.jsonValue}
                  tag="h2"
                  className="text-2xl font-bold uppercase tracking-tight md:text-3xl font-[var(--brand-heading-font,inherit)]"
                  style={{ color: 'var(--brand-fg)' }}
                />
              )}
              <p className="mt-1 text-sm font-[var(--brand-body-font,inherit)]" style={{ color: 'var(--brand-muted-foreground)' }}>
                Showing our latest reviews
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 md:items-end">
              <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--brand-accent)' }}>
                Excellent
              </span>
              <span className="text-lg tracking-tight" style={{ color: 'var(--brand-accent)' }} aria-hidden>
                ★★★★★
              </span>
              <span className="text-xs opacity-70" style={{ color: 'var(--brand-muted-foreground)' }}>
                4.5 · based on many reviews
              </span>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 pt-2 md:gap-6">
            {reviewItems.map((item) => (
              <div
                key={item.id}
                className="min-w-[280px] max-w-[340px] shrink-0 rounded-[var(--brand-card-radius,0.25rem)] border p-5 md:min-w-[300px]"
                style={{
                  backgroundColor: 'var(--brand-muted)',
                  borderColor: 'var(--brand-border)',
                }}
              >
                <div className="mb-2 text-sm" style={{ color: 'var(--brand-accent)' }} aria-hidden>
                  ★★★★★
                </div>
                {(item.quoteText?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.quoteText?.jsonValue}
                    className="line-clamp-4 text-sm leading-relaxed font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg)' }}
                  />
                )}
                <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--brand-border)' }}>
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
