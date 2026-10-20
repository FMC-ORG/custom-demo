import React, { JSX } from 'react';
import { hasRichText, hasText } from '@/lib/field-utils';
import {
  Field,
  ImageField,
  LinkField,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';
import { SitecoreArrowLink } from '@/lib/demo-ui/sitecore-ui';

interface ValuePropositionItemFields {
  id: string;
  itemTitle: { jsonValue: Field<string> };
  itemDescription: { jsonValue: Field<string> };
  itemIcon: { jsonValue: ImageField };
  itemLink: { jsonValue: LinkField };
}

interface ValuePropositionGridDatasource {
  title: { jsonValue: Field<string> };
  description: { jsonValue: Field<string> };
  children: {
    results: ValuePropositionItemFields[];
  };
}

interface ValuePropositionGridFields {
  data: {
    datasource: ValuePropositionGridDatasource;
  };
}

type ValuePropositionGridProps = ComponentProps & {
  fields: ValuePropositionGridFields;
};

const ValuePropositionGridDefaultComponent = (): JSX.Element => (
  <div className="component value-proposition-grid">
    <div className="component-content">
      <span className="is-empty-hint">ValuePropositionGrid</span>
    </div>
  </div>
);

const SectionHeader = ({
  datasource,
  isEditing,
}: {
  datasource: ValuePropositionGridDatasource;
  isEditing?: boolean;
}) =>
  hasText(datasource.title?.jsonValue?.value) ||
  isEditing ||
  hasRichText(datasource.description?.jsonValue?.value) ? (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      {(hasText(datasource.title?.jsonValue?.value) || isEditing) && (
        <Text
          field={datasource.title?.jsonValue}
          tag="h2"
          className="text-3xl font-bold tracking-tight sm:text-4xl font-heading"
          style={{ color: 'var(--brand-fg, #111111)' }}
        />
      )}
      {(hasRichText(datasource.description?.jsonValue?.value) || isEditing) && (
        <ContentSdkRichText
          field={datasource.description?.jsonValue}
          className="mt-4 text-lg opacity-70 font-body"
          style={{ color: 'var(--brand-fg, #111111)' }}
        />
      )}
    </div>
  ) : null;

/* ────────────────────────────────────────────
   Default — 3-column grid, icons above text, centered
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: ValuePropositionGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ValuePropositionGridDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component value-proposition-grid', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-8 md:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col items-center text-center">
                {(item.itemIcon?.jsonValue?.value?.src || isEditing) && (
                  <div className="mb-4 h-16 w-16 overflow-hidden">
                    <ContentSdkImage
                      field={item.itemIcon?.jsonValue}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                {(hasText(item.itemTitle?.jsonValue?.value) || isEditing) && (
                  <Text
                    field={item.itemTitle?.jsonValue}
                    tag="h3"
                    className="text-xl font-semibold font-heading"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                {(hasRichText(item.itemDescription?.jsonValue?.value) || isEditing) && (
                  <ContentSdkRichText
                    field={item.itemDescription?.jsonValue}
                    className="mt-2 text-sm opacity-70 font-body"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                {(item.itemLink?.jsonValue?.value?.href || isEditing) && (
                  <ContentSdkLink
                    field={item.itemLink?.jsonValue}
                    className="mt-3 text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--brand-primary)' }}
                  />
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
   TwoColumn — 2 items side by side, larger
   ──────────────────────────────────────────── */
export const TwoColumn = ({ fields, params, page }: ValuePropositionGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ValuePropositionGridDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component value-proposition-grid', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-5xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-12 md:grid-cols-2">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col items-center text-center">
                {(item.itemIcon?.jsonValue?.value?.src || isEditing) && (
                  <div className="mb-5 h-20 w-20 overflow-hidden">
                    <ContentSdkImage
                      field={item.itemIcon?.jsonValue}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                {(hasText(item.itemTitle?.jsonValue?.value) || isEditing) && (
                  <Text
                    field={item.itemTitle?.jsonValue}
                    tag="h3"
                    className="text-2xl font-semibold font-heading"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                {(hasRichText(item.itemDescription?.jsonValue?.value) || isEditing) && (
                  <ContentSdkRichText
                    field={item.itemDescription?.jsonValue}
                    className="mt-3 text-base opacity-70 font-body"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                {(item.itemLink?.jsonValue?.value?.href || isEditing) && (
                  <ContentSdkLink
                    field={item.itemLink?.jsonValue}
                    className="mt-4 text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--brand-primary)' }}
                  />
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
   FourColumn — 4 compact items in a row
   ──────────────────────────────────────────── */
export const FourColumn = ({ fields, params, page }: ValuePropositionGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ValuePropositionGridDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component value-proposition-grid', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col items-center text-center">
                {(item.itemIcon?.jsonValue?.value?.src || isEditing) && (
                  <div className="mb-3 h-12 w-12 overflow-hidden">
                    <ContentSdkImage
                      field={item.itemIcon?.jsonValue}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                {(hasText(item.itemTitle?.jsonValue?.value) || isEditing) && (
                  <Text
                    field={item.itemTitle?.jsonValue}
                    tag="h3"
                    className="text-base font-semibold font-heading"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                {(hasRichText(item.itemDescription?.jsonValue?.value) || isEditing) && (
                  <ContentSdkRichText
                    field={item.itemDescription?.jsonValue}
                    className="mt-1.5 text-xs opacity-70 font-body"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
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
   Horizontal — icon left, text right, stacked vertically
   ──────────────────────────────────────────── */
export const Horizontal = ({ fields, params, page }: ValuePropositionGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ValuePropositionGridDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component value-proposition-grid', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-4xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="flex flex-col gap-8">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-5">
                {(item.itemIcon?.jsonValue?.value?.src || isEditing) && (
                  <div className="h-14 w-14 shrink-0 overflow-hidden">
                    <ContentSdkImage
                      field={item.itemIcon?.jsonValue}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                {(hasText(item.itemTitle?.jsonValue?.value) ||
                  isEditing ||
                  hasRichText(item.itemDescription?.jsonValue?.value) ||
                  item.itemLink?.jsonValue?.value?.href) && (
                  <div className="flex-1">
                    {(hasText(item.itemTitle?.jsonValue?.value) || isEditing) && (
                      <Text
                        field={item.itemTitle?.jsonValue}
                        tag="h3"
                        className="text-lg font-semibold font-heading"
                        style={{ color: 'var(--brand-fg, #111111)' }}
                      />
                    )}
                    {(hasRichText(item.itemDescription?.jsonValue?.value) || isEditing) && (
                      <ContentSdkRichText
                        field={item.itemDescription?.jsonValue}
                        className="mt-1.5 text-sm opacity-70 font-body"
                        style={{ color: 'var(--brand-fg, #111111)' }}
                      />
                    )}
                    {(item.itemLink?.jsonValue?.value?.href || isEditing) && (
                      <ContentSdkLink
                        field={item.itemLink?.jsonValue}
                        className="mt-2 inline-block text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
                        style={{ color: 'var(--brand-primary)' }}
                      />
                    )}
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
   SitecoreFooterCta variant — indigo band above the footer. Left: Title +
   Description (links inside the rich text render as gradient / white pills).
   Right: divided signpost rows with icon, title and arrow link.
   ──────────────────────────────────────────── */
export const SitecoreFooterCta = ({ fields, params, page }: ValuePropositionGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ValuePropositionGridDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component value-proposition-grid', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 pt-16 md:px-12 md:pt-[90px]"
        style={{ backgroundColor: 'var(--brand-footer-bg)', color: 'var(--brand-footer-fg)' }}
      >
        <div className="mx-auto grid max-w-[1360px] border-y border-white/20 lg:grid-cols-2">
          <div className="px-2 py-10 md:px-10 md:py-12">
            {(hasText(datasource.title?.jsonValue?.value) || isEditing) && (
              <Text
                field={datasource.title?.jsonValue}
                tag="h2"
                className="font-heading text-[32px] font-normal leading-[1.25] tracking-[-0.02em] md:text-[36px]"
              />
            )}
            {(hasRichText(datasource.description?.jsonValue?.value) || isEditing) && (
              <ContentSdkRichText
                field={datasource.description?.jsonValue}
                className={cn(
                  'max-w-[460px] font-body text-[17px] leading-[1.6] [&_p]:m-0 [&_p]:mt-4',
                  '[&_p:has(a)]:mt-6 [&_p:has(a)]:flex [&_p:has(a)]:flex-wrap [&_p:has(a)]:gap-3',
                  '[&_a]:inline-flex [&_a]:items-center [&_a]:rounded-[var(--brand-button-radius,9999px)] [&_a]:px-5 [&_a]:py-2 [&_a]:font-medium [&_a]:no-underline [&_a]:transition',
                  "[&_a]:after:ml-2.5 [&_a]:after:content-['→']",
                  '[&_a:first-child]:text-white [&_a:first-child]:[background-image:var(--brand-gradient,linear-gradient(90deg,var(--brand-primary),var(--brand-primary)))] [&_a:first-child]:hover:brightness-110',
                  '[&_a:not(:first-child)]:bg-white [&_a:not(:first-child)]:text-[var(--brand-fg)] [&_a:not(:first-child)]:after:text-[var(--brand-accent)]',
                )}
              />
            )}
          </div>
          <ul className="divide-y divide-white/20 lg:my-0">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-5 px-2 py-5 md:px-5">
                {(item.itemIcon?.jsonValue?.value?.src || isEditing) && (
                  <ContentSdkImage
                    field={item.itemIcon?.jsonValue}
                    className="h-9 w-9 shrink-0 object-contain"
                  />
                )}
                <div className="min-w-0 flex-1">
                  {(hasText(item.itemTitle?.jsonValue?.value) || isEditing) && (
                    <Text
                      field={item.itemTitle?.jsonValue}
                      tag="h3"
                      className="font-heading text-[22px] font-normal leading-7"
                    />
                  )}
                  {(hasRichText(item.itemDescription?.jsonValue?.value) || isEditing) && (
                    <ContentSdkRichText
                      field={item.itemDescription?.jsonValue}
                      className="mt-1 font-body text-[15px] opacity-80 [&_p]:m-0"
                    />
                  )}
                </div>
                <SitecoreArrowLink field={item.itemLink?.jsonValue} isEditing={isEditing} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
