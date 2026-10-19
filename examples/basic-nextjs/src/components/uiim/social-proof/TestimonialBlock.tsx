import React, { JSX } from 'react';
import { hasRichText, hasText } from '@/lib/field-utils';
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
        className={cn('rounded-full object-cover', size === 'lg' ? 'h-14 w-14' : 'h-12 w-12')}
      />
    )}
    {(hasText(item.authorName?.jsonValue?.value) ||
      isEditing ||
      hasText(item.authorRole?.jsonValue?.value) ||
      isEditing ||
      (hasText(item.authorRole?.jsonValue?.value) && hasText(item.companyName?.jsonValue?.value)) ||
      hasText(item.companyName?.jsonValue?.value) ||
      isEditing) && (
      <div>
        {(hasText(item.authorName?.jsonValue?.value) || isEditing) && (
          <Text
            field={item.authorName?.jsonValue}
            tag="p"
            className="font-semibold font-heading"
            style={{ color: 'var(--brand-fg, #111111)' }}
          />
        )}
        {(hasText(item.authorRole?.jsonValue?.value) ||
          isEditing ||
          (hasText(item.authorRole?.jsonValue?.value) &&
            hasText(item.companyName?.jsonValue?.value)) ||
          hasText(item.companyName?.jsonValue?.value) ||
          isEditing) && (
          <div
            className="flex flex-wrap items-center gap-1 text-sm"
            style={{ color: 'var(--brand-muted-foreground, #6b7280)' }}
          >
            {(hasText(item.authorRole?.jsonValue?.value) || isEditing) && (
              <Text field={item.authorRole?.jsonValue} tag="span" />
            )}
            {hasText(item.authorRole?.jsonValue?.value) &&
              hasText(item.companyName?.jsonValue?.value) && (
                <span aria-hidden="true">&middot;</span>
              )}
            {(hasText(item.companyName?.jsonValue?.value) || isEditing) && (
              <Text field={item.companyName?.jsonValue} tag="span" />
            )}
          </div>
        )}
      </div>
    )}
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
          {(hasText(datasource.sectionTitle?.jsonValue?.value) || isEditing) && (
            <Text
              field={datasource.sectionTitle?.jsonValue}
              tag="h2"
              className="mb-8 text-2xl font-bold font-heading"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          {item && (
            <>
              <QuoteMark />
              {(hasRichText(item.quoteText?.jsonValue?.value) || isEditing) && (
                <ContentSdkRichText
                  field={item.quoteText?.jsonValue}
                  className="mt-2 text-lg italic md:text-xl font-body"
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
          {(hasText(datasource.sectionTitle?.jsonValue?.value) || isEditing) && (
            <Text
              field={datasource.sectionTitle?.jsonValue}
              tag="h2"
              className="mb-8 text-center text-2xl font-bold font-heading"
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
                {(hasRichText(item.quoteText?.jsonValue?.value) || isEditing) && (
                  <ContentSdkRichText
                    field={item.quoteText?.jsonValue}
                    className="mt-2 text-sm italic font-body"
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
          {(hasText(datasource.sectionTitle?.jsonValue?.value) || isEditing) && (
            <Text
              field={datasource.sectionTitle?.jsonValue}
              tag="h2"
              className="mb-10 text-center text-2xl font-bold font-heading"
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
                {(hasRichText(item.quoteText?.jsonValue?.value) || isEditing) && (
                  <ContentSdkRichText
                    field={item.quoteText?.jsonValue}
                    className="mt-2 flex-1 text-sm italic font-body"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                <div
                  className="mt-4 pt-4"
                  style={{ borderTop: '1px solid var(--brand-border, #e5e7eb)' }}
                >
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
          {(hasText(datasource.sectionTitle?.jsonValue?.value) || isEditing) && (
            <Text
              field={datasource.sectionTitle?.jsonValue}
              tag="h2"
              className="mb-10 text-center text-2xl font-bold font-heading"
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
                {(hasRichText(item.quoteText?.jsonValue?.value) || isEditing) && (
                  <ContentSdkRichText
                    field={item.quoteText?.jsonValue}
                    className="mt-2 text-lg italic md:text-xl font-body"
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

/* Worley2HeroProof variant — glass proof card overlapping the hero */
export const Worley2HeroProof = ({
  fields,
  params,
  page,
}: TestimonialBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TestimonialBlockDefaultComponent />;
  const item = datasource.children?.results?.[0];

  return (
    <div
      className={cn(
        'component testimonial-block relative z-20 md:pointer-events-none md:-mt-[30rem] md:mb-[6rem]',
        styles,
      )}
      id={RenderingIdentifier}
    >
      <section className="w-full px-5 py-8 md:px-10 md:py-0">
        <div className="mx-auto flex max-w-[90rem] justify-end">
          <div className="pointer-events-auto w-full max-w-md rounded-[var(--brand-card-radius)] border border-[var(--brand-border)] bg-[var(--brand-header-bg)]/95 p-7 text-[var(--brand-header-fg)] shadow-2xl backdrop-blur-md md:p-9">
            {(hasText(datasource.sectionTitle?.jsonValue?.value) || isEditing) && (
              <Text
                field={datasource.sectionTitle?.jsonValue}
                tag="p"
                className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)]"
              />
            )}
            {item && (
              <>
                {(hasText(item.companyName?.jsonValue?.value) || isEditing) && (
                  <Text
                    field={item.companyName?.jsonValue}
                    tag="p"
                    className="mt-5 font-heading text-2xl font-bold leading-tight text-[var(--brand-accent)]"
                  />
                )}
                <div className="my-6 h-px bg-[var(--brand-border)]/40" />
                <span
                  aria-hidden="true"
                  className="font-heading text-5xl font-bold leading-none text-[var(--brand-accent)]"
                >
                  “
                </span>
                {(hasRichText(item.quoteText?.jsonValue?.value) || isEditing) && (
                  <ContentSdkRichText
                    field={item.quoteText?.jsonValue}
                    className="mt-2 font-body text-base leading-6"
                  />
                )}
                <div className="mt-6 space-y-1 font-body text-sm">
                  {(hasText(item.authorRole?.jsonValue?.value) || isEditing) && (
                    <Text field={item.authorRole?.jsonValue} tag="p" className="italic opacity-80" />
                  )}
                  {(hasText(item.authorName?.jsonValue?.value) || isEditing) && (
                    <Text field={item.authorName?.jsonValue} tag="p" className="pt-3 font-bold" />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
