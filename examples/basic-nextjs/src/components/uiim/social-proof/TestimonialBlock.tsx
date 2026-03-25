import React, { JSX } from 'react';
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
