import React, { JSX } from "react";
import { hasRichText, hasText } from "@/lib/field-utils";
import {
  Field,
  ImageField,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text,
} from "@sitecore-content-sdk/nextjs";
import { ComponentProps } from "lib/component-props";
import { cn } from "@/lib/utils";

interface StatItemFields {
  id: string;
  statValue: { jsonValue: Field<string> };
  statLabel: { jsonValue: Field<string> };
  statDescription: { jsonValue: Field<string> };
  statIcon: { jsonValue: ImageField };
}

interface TrustStatsRowDatasource {
  title: { jsonValue: Field<string> };
  eyebrowText: { jsonValue: Field<string> };
  children: {
    results: StatItemFields[];
  };
}

interface TrustStatsRowFields {
  data: {
    datasource: TrustStatsRowDatasource;
  };
}

type TrustStatsRowProps = ComponentProps & {
  fields: TrustStatsRowFields;
};

const TrustStatsRowDefaultComponent = (): JSX.Element => (
  <div className="component trust-stats-row">
    <div className="component-content">
      <span className="is-empty-hint">TrustStatsRow</span>
    </div>
  </div>
);

const SectionHeader = ({
  datasource,
  isEditing,
}: {
  datasource: TrustStatsRowDatasource;
  isEditing?: boolean;
}) => {
  const hasEyebrow =
    hasText(datasource.eyebrowText?.jsonValue?.value) || isEditing;
  const hasTitle = hasText(datasource.title?.jsonValue?.value) || isEditing;
  if (!hasEyebrow && !hasTitle) return null;
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {hasEyebrow && (
        <Text
          field={datasource.eyebrowText?.jsonValue}
          tag="span"
          className="mb-2 inline-block text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--brand-primary)" }}
        />
      )}
      {hasTitle && (
        <Text
          field={datasource.title?.jsonValue}
          tag="h2"
          className="text-3xl font-bold tracking-tight sm:text-4xl font-heading"
          style={{ color: "var(--brand-fg, #111111)" }}
        />
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   Default — big centered numbers, 4-column grid
   ──────────────────────────────────────────── */
export const Default = ({
  fields,
  params,
  page,
}: TrustStatsRowProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TrustStatsRowDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div
      className={cn("component trust-stats-row", styles)}
      id={RenderingIdentifier}
    >
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: "var(--brand-bg, #ffffff)" }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) =>
              hasText(item.statValue?.jsonValue?.value) ||
              isEditing ||
              hasText(item.statLabel?.jsonValue?.value) ||
              hasRichText(item.statDescription?.jsonValue?.value) ? (
                <div key={item.id} className="text-center">
                  {(hasText(item.statValue?.jsonValue?.value) || isEditing) && (
                    <Text
                      field={item.statValue?.jsonValue}
                      tag="p"
                      className="text-4xl font-bold md:text-5xl font-heading"
                      style={{ color: "var(--brand-primary)" }}
                    />
                  )}
                  {(hasText(item.statLabel?.jsonValue?.value) || isEditing) && (
                    <Text
                      field={item.statLabel?.jsonValue}
                      tag="p"
                      className="mt-2 text-sm font-medium font-body"
                      style={{ color: "var(--brand-fg, #111111)" }}
                    />
                  )}
                  {(hasRichText(item.statDescription?.jsonValue?.value) ||
                    isEditing) && (
                    <ContentSdkRichText
                      field={item.statDescription?.jsonValue}
                      className="mt-1 text-xs opacity-60 font-body"
                      style={{ color: "var(--brand-fg, #111111)" }}
                    />
                  )}
                </div>
              ) : null,
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   WithIcons — icon above each stat number
   ──────────────────────────────────────────── */
export const WithIcons = ({
  fields,
  params,
  page,
}: TrustStatsRowProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TrustStatsRowDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div
      className={cn("component trust-stats-row", styles)}
      id={RenderingIdentifier}
    >
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: "var(--brand-bg, #ffffff)" }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center text-center"
              >
                {(item.statIcon?.jsonValue?.value?.src || isEditing) && (
                  <div className="mb-3 h-12 w-12 overflow-hidden">
                    <ContentSdkImage
                      field={item.statIcon?.jsonValue}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                {(hasText(item.statValue?.jsonValue?.value) || isEditing) && (
                  <Text
                    field={item.statValue?.jsonValue}
                    tag="p"
                    className="text-4xl font-bold md:text-5xl font-heading"
                    style={{ color: "var(--brand-primary)" }}
                  />
                )}
                {(hasText(item.statLabel?.jsonValue?.value) || isEditing) && (
                  <Text
                    field={item.statLabel?.jsonValue}
                    tag="p"
                    className="mt-2 text-sm font-medium font-body"
                    style={{ color: "var(--brand-fg, #111111)" }}
                  />
                )}
                {(hasRichText(item.statDescription?.jsonValue?.value) ||
                  isEditing) && (
                  <ContentSdkRichText
                    field={item.statDescription?.jsonValue}
                    className="mt-1 text-xs opacity-60 font-body"
                    style={{ color: "var(--brand-fg, #111111)" }}
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
   LogoRow — images/logos as primary visual, StatValue hidden
   ──────────────────────────────────────────── */
export const LogoRow = ({
  fields,
  params,
  page,
}: TrustStatsRowProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TrustStatsRowDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div
      className={cn("component trust-stats-row", styles)}
      id={RenderingIdentifier}
    >
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: "var(--brand-muted, #f5f5f5)" }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col items-center">
                {(item.statIcon?.jsonValue?.value?.src || isEditing) && (
                  <div className="h-12 w-auto overflow-hidden opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                    <ContentSdkImage
                      field={item.statIcon?.jsonValue}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                )}
                {(hasText(item.statLabel?.jsonValue?.value) || isEditing) && (
                  <Text
                    field={item.statLabel?.jsonValue}
                    tag="p"
                    className="mt-2 text-xs font-medium opacity-50 font-body"
                    style={{ color: "var(--brand-fg, #111111)" }}
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

/* Heineken market reach — compact two-stat cluster, with an intentionally blank heading. */
export const HeinekenMarkets = ({
  fields,
  params,
  page,
}: TrustStatsRowProps): JSX.Element => {
  const ds = fields?.data?.datasource;
  if (!ds) return <TrustStatsRowDefaultComponent />;
  const editing = page?.mode?.isEditing;
  return (
    <div
      className={cn("component heineken-markets", params.styles)}
      id={params.RenderingIdentifier}
    >
      <section
        className="px-6 py-20 lg:py-[110px]"
        style={{ background: "var(--brand-bg)", color: "var(--brand-primary)" }}
      >
        {(hasText(ds.title?.jsonValue?.value) || editing) && (
          <Text
            field={ds.title?.jsonValue}
            tag="h2"
            className="mb-8 text-center font-heading text-3xl"
          />
        )}
        {(hasText(ds.eyebrowText?.jsonValue?.value) || editing) && (
          <Text
            field={ds.eyebrowText?.jsonValue}
            tag="p"
            className="mb-6 text-center font-body"
          />
        )}
        <div className="mx-auto flex max-w-[680px] flex-col justify-center gap-10 sm:flex-row sm:gap-12">
          {(ds.children?.results ?? []).map((item) => (
            <div key={item.id} className="flex-1">
              {(item.statIcon?.jsonValue?.value?.src || editing) && (
                <ContentSdkImage
                  field={item.statIcon?.jsonValue}
                  className="mb-4 h-10 w-10 object-contain"
                />
              )}
              {(hasText(item.statValue?.jsonValue?.value) || editing) && (
                <Text
                  field={item.statValue?.jsonValue}
                  tag="p"
                  className="font-heading text-[42px] font-semibold leading-none"
                />
              )}
              {(hasText(item.statLabel?.jsonValue?.value) || editing) && (
                <Text
                  field={item.statLabel?.jsonValue}
                  tag="p"
                  className="mt-6 font-body text-base font-semibold"
                />
              )}
              {(hasRichText(item.statDescription?.jsonValue?.value) ||
                editing) && (
                <ContentSdkRichText
                  field={item.statDescription?.jsonValue}
                  className="mt-2 font-body text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
