import React, { JSX } from 'react';
import { ComponentProps } from 'lib/component-props';
import componentMap from '.sitecore/component-map';
import { AppPlaceholder } from "@sitecore-content-sdk/nextjs";

/**
 * The number of columns that can be inserted into the column splitter component.
 * The maximum number of columns is 8.
 */
type ColumnNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * The width specified for each rendered column.
 * The key is the column number, and the value is the width.
 */
type ColumnWidths = {
  [K in ColumnNumber as `ColumnWidth${K}`]?: string;
};

/**
 * The styles specified for each rendered column.
 * The key is the column number, and the value is the styles.
 */
type ColumnStyles = {
  [K in ColumnNumber as `Styles${K}`]?: string;
};

interface ColumnSplitterProps extends ComponentProps {
  params: ComponentProps["params"] & ColumnWidths & ColumnStyles;
}

/**
 * Parse a ColumnWidth param into a CSS flex-basis value.
 * Supports: "50%", "33.33%", "1/2", "1/3", "2/3", "1/4", "3/4"
 * Returns null if the value can't be parsed (falls back to auto-equal).
 */
function parseFlexBasis(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Already a percentage
  if (/^\d+(\.\d+)?%$/.test(trimmed)) return trimmed;
  // Fraction like "1/2", "2/3"
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    if (denominator > 0) return `${(numerator / denominator) * 100}%`;
  }
  return null;
}

export const Default = ({
  params,
  rendering,
  page,
}: ColumnSplitterProps): JSX.Element => {
  const { EnabledPlaceholders, RenderingIdentifier: id, styles } = params;

  const enabledColumns = EnabledPlaceholders?.split(",") ?? [];
  const defaultBasis = enabledColumns.length > 0
    ? `${100 / enabledColumns.length}%`
    : '100%';

  return (
    <div
      className={`component column-splitter ${styles}`}
      id={id}
      style={{ display: 'flex', flexWrap: 'nowrap', width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}
    >
      {enabledColumns.map((columnNum, index) => {
        const num = Number(columnNum) as ColumnNumber;
        const columnWidth = (params[`ColumnWidth${num}`] ?? "").trim();
        const columnStyle = (params[`Styles${num}`] ?? "").trim();
        const explicitBasis = parseFlexBasis(columnWidth);

        return (
          <div
            key={index}
            className={columnStyle || undefined}
            style={{ flexBasis: explicitBasis || defaultBasis, flexShrink: 0, minWidth: 0 }}
          >
            <div style={{ width: '100%', minWidth: 0 }}>
              <AppPlaceholder
                name={`column-${columnNum}-{*}`}
                rendering={rendering}
                page={page}
                componentMap={componentMap}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};