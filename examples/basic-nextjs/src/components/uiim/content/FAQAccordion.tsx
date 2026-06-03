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

interface FAQItemFields {
  id: string;
  question: { jsonValue: Field<string> };
  answer: { jsonValue: Field<string> };
}

interface FAQAccordionDatasource {
  title: { jsonValue: Field<string> };
  description: { jsonValue: Field<string> };
  eyebrow?: { jsonValue: Field<string> };
  image?: { jsonValue: ImageField };
  children: {
    results: FAQItemFields[];
  };
}

interface FAQAccordionFields {
  data: {
    datasource: FAQAccordionDatasource;
  };
}

type FAQAccordionProps = ComponentProps & {
  fields: FAQAccordionFields;
};

const FAQAccordionDefaultComponent = (): JSX.Element => (
  <div className="component faq-accordion">
    <div className="component-content">
      <span className="is-empty-hint">FAQAccordion</span>
    </div>
  </div>
);

const SectionHeader = ({
  datasource,
  isEditing,
}: {
  datasource: FAQAccordionDatasource;
  isEditing?: boolean;
}) => (
  <div className="mx-auto mb-10 max-w-3xl text-center">
    {(datasource.title?.jsonValue?.value || isEditing) && (
      <Text
        field={datasource.title?.jsonValue}
        tag="h2"
        className="text-3xl font-bold tracking-tight sm:text-4xl font-[var(--brand-heading-font,inherit)]"
        style={{ color: 'var(--brand-fg, #111111)' }}
      />
    )}
    {(datasource.description?.jsonValue?.value || isEditing) && (
      <ContentSdkRichText
        field={datasource.description?.jsonValue}
        className="mt-4 text-lg opacity-70 font-[var(--brand-body-font,inherit)]"
        style={{ color: 'var(--brand-fg, #111111)' }}
      />
    )}
  </div>
);

const AccordionItem = ({
  item,
  isEditing,
  defaultOpen = false,
}: {
  item: FAQItemFields;
  isEditing?: boolean;
  defaultOpen?: boolean;
}) => (
  <details
    className="group border-b"
    style={{ borderColor: 'var(--brand-border, #e5e7eb)' }}
    open={defaultOpen || undefined}
  >
    <summary
      className="flex cursor-pointer items-center justify-between py-4 text-left font-medium transition-colors hover:opacity-70 font-[var(--brand-heading-font,inherit)] [&::-webkit-details-marker]:hidden list-none"
      style={{ color: 'var(--brand-fg, #111111)' }}
    >
      {(item.question?.jsonValue?.value || isEditing) && (
        <Text field={item.question?.jsonValue} tag="span" className="flex-1 pr-4" />
      )}
      <svg
        className="h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </summary>
    <div className="pb-4">
      {(item.answer?.jsonValue?.value || isEditing) && (
        <ContentSdkRichText
          field={item.answer?.jsonValue}
          className="text-sm opacity-70 font-[var(--brand-body-font,inherit)]"
          style={{ color: 'var(--brand-fg, #111111)' }}
        />
      )}
    </div>
  </details>
);

/* ────────────────────────────────────────────
   Default — standard accordion, one item open at a time
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: FAQAccordionProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FAQAccordionDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component faq-accordion', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-3xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div
            className="border-t"
            style={{ borderColor: 'var(--brand-border, #e5e7eb)' }}
          >
            {items.map((item) => (
              <AccordionItem key={item.id} item={item} isEditing={isEditing} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   AllOpen — all items expanded by default
   ──────────────────────────────────────────── */
export const AllOpen = ({ fields, params, page }: FAQAccordionProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FAQAccordionDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component faq-accordion', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-3xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div
            className="border-t"
            style={{ borderColor: 'var(--brand-border, #e5e7eb)' }}
          >
            {items.map((item) => (
              <AccordionItem
                key={item.id}
                item={item}
                isEditing={isEditing}
                defaultOpen
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   HCA — 50/50 split: title + description left, accordion items right with chevrons
   ──────────────────────────────────────────── */
export const HCA = ({ fields, params, page }: FAQAccordionProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FAQAccordionDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component faq-accordion', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto grid max-w-7xl items-start gap-10 md:grid-cols-2 md:gap-16 md:px-6">
          {/* Left column: title + description in a sticky/standalone panel */}
          <div className="md:pr-6">
            {(datasource.title?.jsonValue?.value || isEditing) && (
              <Text
                field={datasource.title?.jsonValue}
                tag="h2"
                className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl font-[var(--brand-heading-font,inherit)]"
                style={{ color: 'var(--brand-primary, #0C2141)' }}
              />
            )}
            {(datasource.description?.jsonValue?.value || isEditing) && (
              <ContentSdkRichText
                field={datasource.description?.jsonValue}
                className="mt-5 text-base opacity-80 font-[var(--brand-body-font,inherit)]"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
          </div>

          {/* Right column: accordion */}
          <div>
            {items.map((item) => (
              <details
                key={item.id}
                className="group border-b"
                style={{ borderColor: 'var(--brand-border, #e5e7eb)' }}
              >
                <summary
                  className="flex cursor-pointer items-center justify-between py-5 text-left font-semibold transition-colors hover:opacity-70 font-[var(--brand-heading-font,inherit)] [&::-webkit-details-marker]:hidden list-none"
                  style={{ color: 'var(--brand-primary, #0C2141)' }}
                >
                  {(item.question?.jsonValue?.value || isEditing) && (
                    <Text
                      field={item.question?.jsonValue}
                      tag="span"
                      className="flex-1 pr-4 text-base md:text-lg"
                    />
                  )}
                  <svg
                    className="h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="pb-5">
                  {(item.answer?.jsonValue?.value || isEditing) && (
                    <ContentSdkRichText
                      field={item.answer?.jsonValue}
                      className="text-sm opacity-75 font-[var(--brand-body-font,inherit)]"
                      style={{ color: 'var(--brand-fg, #111111)' }}
                    />
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   HCAWithImage — image left, eyebrow + title + description + cream-pill accordion right
   ──────────────────────────────────────────── */
export const HCAWithImage = ({ fields, params, page }: FAQAccordionProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FAQAccordionDefaultComponent />;
  const items = datasource.children?.results || [];
  const image = datasource.image?.jsonValue;
  const eyebrow = datasource.eyebrow?.jsonValue;

  return (
    <div className={cn('component faq-accordion', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-14 md:px-6">
          {/* Left column: image */}
          {(image?.value?.src || isEditing) && (
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
              <ContentSdkImage
                field={image}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          )}

          {/* Right column: eyebrow + title + description + accordion */}
          <div>
            {(eyebrow?.value || isEditing) && (
              <Text
                field={eyebrow}
                tag="p"
                className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] font-[var(--brand-heading-font,inherit)]"
                style={{ color: 'var(--brand-primary, #0C2141)' }}
              />
            )}
            {(datasource.title?.jsonValue?.value || isEditing) && (
              <Text
                field={datasource.title?.jsonValue}
                tag="h2"
                className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl font-[var(--brand-heading-font,inherit)]"
                style={{ color: 'var(--brand-primary, #0C2141)' }}
              />
            )}
            {(datasource.description?.jsonValue?.value || isEditing) && (
              <ContentSdkRichText
                field={datasource.description?.jsonValue}
                className="mt-5 text-base opacity-80 font-[var(--brand-body-font,inherit)] space-y-3"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}

            {/* Cream-pill accordion */}
            <div className="mt-8 space-y-3">
              {items.map((item) => (
                <details
                  key={item.id}
                  className="group rounded-xl px-6 py-1"
                  style={{ backgroundColor: '#FAF1DC' }}
                >
                  <summary
                    className="flex cursor-pointer items-center justify-between py-4 text-left font-semibold transition-colors hover:opacity-80 font-[var(--brand-heading-font,inherit)] [&::-webkit-details-marker]:hidden list-none"
                    style={{ color: 'var(--brand-primary, #0C2141)' }}
                  >
                    {(item.question?.jsonValue?.value || isEditing) && (
                      <Text
                        field={item.question?.jsonValue}
                        tag="span"
                        className="flex-1 pr-4 text-base"
                      />
                    )}
                    <svg
                      className="h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-45"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </summary>
                  <div className="pb-4">
                    {(item.answer?.jsonValue?.value || isEditing) && (
                      <ContentSdkRichText
                        field={item.answer?.jsonValue}
                        className="text-sm opacity-80 font-[var(--brand-body-font,inherit)]"
                        style={{ color: 'var(--brand-fg, #111111)' }}
                      />
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   TwoColumn — questions split into two columns
   ──────────────────────────────────────────── */
export const TwoColumn = ({ fields, params, page }: FAQAccordionProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <FAQAccordionDefaultComponent />;
  const items = datasource.children?.results || [];
  const mid = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, mid);
  const rightItems = items.slice(mid);

  return (
    <div className={cn('component faq-accordion', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-8 md:grid-cols-2">
            <div
              className="border-t"
              style={{ borderColor: 'var(--brand-border, #e5e7eb)' }}
            >
              {leftItems.map((item) => (
                <AccordionItem key={item.id} item={item} isEditing={isEditing} />
              ))}
            </div>
            <div
              className="border-t"
              style={{ borderColor: 'var(--brand-border, #e5e7eb)' }}
            >
              {rightItems.map((item) => (
                <AccordionItem key={item.id} item={item} isEditing={isEditing} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
