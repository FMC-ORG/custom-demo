'use client';

import React, { JSX } from 'react';
import { Text, Field, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

/** GraphQL: { id, value { jsonValue }, label { jsonValue } } */
interface StatsBarItemResult {
  id?: string;
  value?: { jsonValue?: Field<string> };
  Value?: Field<string>;
  label?: { jsonValue?: Field<string> };
  Label?: Field<string>;
}

/** Supports GraphQL camelCase (jsonValue) and default JSS PascalCase (value) */
interface StatsBarFields {
  children?: {
    results: StatsBarItemResult[];
  };
}

interface StatsBarProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: StatsBarFields;
    };
  } & StatsBarFields;
}

/**
 * StatsBar - Dark horizontal banner displaying key metrics or promotional statistics.
 * Renders 4 equal sections, each with a value and descriptive label.
 */
export const Default = ({ params, fields }: StatsBarProps): JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource ?? fields;
  const items = datasource?.children?.results ?? [];

  if (!datasource || items.length === 0) {
    return (
      <section
        className={cn('bg-slate-900 py-8', styles)}
        id={id}
        data-testid="stats-bar"
      >
        <div className="mx-auto max-w-7xl px-4">
          <span className="is-empty-hint text-slate-400">Stats Bar</span>
        </div>
      </section>
    );
  }

  const hasContent = items.some(
    (item) =>
      (item.value as { jsonValue?: Field<string> })?.jsonValue?.value ??
      (item.Value as Field<string>)?.value ??
      (item.label as { jsonValue?: Field<string> })?.jsonValue?.value ??
      (item.Label as Field<string>)?.value ??
      isEditing
  );

  if (!hasContent) {
    return (
      <section
        className={cn('bg-slate-900 py-8', styles)}
        id={id}
        data-testid="stats-bar"
      >
        <div className="mx-auto max-w-7xl px-4">
          <span className="is-empty-hint text-slate-400">Stats Bar</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn('bg-slate-900 py-12', styles)}
      id={id}
      data-testid="stats-bar"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const valueRaw = item.value ?? item.Value;
            const valueField =
              (valueRaw as { jsonValue?: Field<string> })?.jsonValue ??
              (valueRaw as Field<string>);
            const labelRaw = item.label ?? item.Label;
            const labelField =
              (labelRaw as { jsonValue?: Field<string> })?.jsonValue ??
              (labelRaw as Field<string>);
            const value =
              (valueField as Field<string>)?.value ??
              (valueRaw as { jsonValue?: Field<string> })?.jsonValue?.value;
            const label =
              (labelField as Field<string>)?.value ??
              (labelRaw as { jsonValue?: Field<string> })?.jsonValue?.value;

            if (!value && !label && !isEditing) return null;

            return (
              <div
                key={item.id ?? index}
                className="flex flex-col items-center justify-center gap-2 text-center"
              >
                <span className="rounded bg-sky-500/20 px-2 py-0.5 text-xs font-medium text-white">
                  StatsBar - Value
                </span>
                {(value || (isEditing && valueField)) && (
                  <Text
                    tag="div"
                    field={valueField as Field<string>}
                    className="text-2xl font-bold text-white sm:text-3xl"
                  />
                )}
                {(label || (isEditing && labelField)) && (
                  <Text
                    tag="div"
                    field={labelField as Field<string>}
                    className="text-sm text-slate-400"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
