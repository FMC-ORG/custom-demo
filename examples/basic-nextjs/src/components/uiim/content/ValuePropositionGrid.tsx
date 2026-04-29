import React, { JSX } from 'react';
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
}) => (
  <div className="mx-auto mb-12 max-w-3xl text-center">
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
                {(item.itemTitle?.jsonValue?.value || isEditing) && (
                  <Text
                    field={item.itemTitle?.jsonValue}
                    tag="h3"
                    className="text-xl font-semibold font-[var(--brand-heading-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                {(item.itemDescription?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.itemDescription?.jsonValue}
                    className="mt-2 text-sm opacity-70 font-[var(--brand-body-font,inherit)]"
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
                {(item.itemTitle?.jsonValue?.value || isEditing) && (
                  <Text
                    field={item.itemTitle?.jsonValue}
                    tag="h3"
                    className="text-2xl font-semibold font-[var(--brand-heading-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                {(item.itemDescription?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.itemDescription?.jsonValue}
                    className="mt-3 text-base opacity-70 font-[var(--brand-body-font,inherit)]"
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
                {(item.itemTitle?.jsonValue?.value || isEditing) && (
                  <Text
                    field={item.itemTitle?.jsonValue}
                    tag="h3"
                    className="text-base font-semibold font-[var(--brand-heading-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                {(item.itemDescription?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.itemDescription?.jsonValue}
                    className="mt-1.5 text-xs opacity-70 font-[var(--brand-body-font,inherit)]"
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
   Howdens — round colour-swatch row.
   Reads each child's ItemDescription RichText as a hex colour (e.g. "<p>#4A5D43</p>")
   and applies it as the swatch background. Used for "Explore our kitchens by colour".
   ──────────────────────────────────────────── */
export const Howdens = ({ fields, params, page }: ValuePropositionGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ValuePropositionGridDefaultComponent />;
  const items = datasource.children?.results || [];

  // Extract a hex colour from a RichText value like "<p>#4A5D43</p>".
  // Falls back to a neutral grey if no hex is found.
  const extractHex = (rt?: string): string => {
    if (!rt) return 'var(--brand-muted)';
    const match = rt.match(/#[0-9A-Fa-f]{3,8}/);
    return match ? match[0] : 'var(--brand-muted)';
  };

  return (
    <div className={cn('component value-proposition-grid', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-14 md:py-16" style={{ backgroundColor: 'var(--brand-bg)' }}>
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid grid-cols-3 gap-6 md:grid-cols-6 md:gap-8">
            {items.map((item) => {
              const hex = extractHex(item.itemDescription?.jsonValue?.value);
              const linkField = item.itemLink?.jsonValue;
              const hasLink = !!linkField?.value?.href || isEditing;
              const Swatch = (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div
                    className="h-20 w-20 md:h-24 md:w-24 ring-2 ring-[var(--brand-border)] transition-transform group-hover:scale-105"
                    style={{ backgroundColor: hex, borderRadius: '9999px' }}
                  />
                  {(item.itemTitle?.jsonValue?.value || isEditing) && (
                    <Text
                      field={item.itemTitle?.jsonValue}
                      tag="span"
                      className="text-sm font-semibold font-[var(--brand-body-font,inherit)]"
                      style={{ color: 'var(--brand-fg)' }}
                    />
                  )}
                </div>
              );

              return hasLink ? (
                <ContentSdkLink
                  key={item.id}
                  field={linkField}
                  className="group block"
                  // Suppress default underline; entire swatch is the link
                  style={{ textDecoration: 'none' }}
                >
                  {Swatch}
                </ContentSdkLink>
              ) : (
                <div key={item.id} className="group block">{Swatch}</div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   HowdensCTA — 3-col cards, large heading + body + green pill button per card
   Used for "Feel inspired / FREE design service / Ready to fit" 3-up.
   ──────────────────────────────────────────── */
export const HowdensCTA = ({ fields, params, page }: ValuePropositionGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ValuePropositionGridDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component value-proposition-grid', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-14 md:py-16" style={{ backgroundColor: 'var(--brand-bg)' }}>
        <div className="mx-auto max-w-6xl">
          {(datasource.title?.jsonValue?.value || isEditing) && (
            <SectionHeader datasource={datasource} isEditing={isEditing} />
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center text-center p-8"
                style={{
                  backgroundColor: 'var(--brand-muted)',
                  borderRadius: 'var(--brand-card-radius)',
                }}
              >
                {(item.itemTitle?.jsonValue?.value || isEditing) && (
                  <Text
                    field={item.itemTitle?.jsonValue}
                    tag="h3"
                    className="text-2xl font-bold font-[var(--brand-heading-font,inherit)]"
                    style={{ color: 'var(--brand-fg)' }}
                  />
                )}
                {(item.itemDescription?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.itemDescription?.jsonValue}
                    className="mt-3 max-w-xs flex-1 text-sm opacity-80 font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg)' }}
                  />
                )}
                {(item.itemLink?.jsonValue?.value?.href || isEditing) && (
                  <ContentSdkLink
                    field={item.itemLink?.jsonValue}
                    className="mt-6 inline-flex items-center justify-center px-7 py-3 text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--brand-accent)',
                      color: 'var(--brand-accent-foreground)',
                      borderRadius: 'var(--brand-button-radius)',
                    }}
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
                <div className="flex-1">
                  {(item.itemTitle?.jsonValue?.value || isEditing) && (
                    <Text
                      field={item.itemTitle?.jsonValue}
                      tag="h3"
                      className="text-lg font-semibold font-[var(--brand-heading-font,inherit)]"
                      style={{ color: 'var(--brand-fg, #111111)' }}
                    />
                  )}
                  {(item.itemDescription?.jsonValue?.value || isEditing) && (
                    <ContentSdkRichText
                      field={item.itemDescription?.jsonValue}
                      className="mt-1.5 text-sm opacity-70 font-[var(--brand-body-font,inherit)]"
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
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
