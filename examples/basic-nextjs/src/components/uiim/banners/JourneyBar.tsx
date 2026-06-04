'use client';

import React, { JSX } from 'react';
import {
  Field,
  LinkField,
  Link as ContentSdkLink,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface JourneyBarFields {
  Title: Field<string>;
  ButtonLink: LinkField;
}

type JourneyBarProps = ComponentProps & {
  fields: JourneyBarFields;
};

const JourneyBarDefaultComponent = (): JSX.Element => (
  <div className="component journey-bar">
    <div className="component-content">
      <span className="is-empty-hint">JourneyBar</span>
    </div>
  </div>
);

/* ────────────────────────────────────────────
   Default — fixed sticky bottom bar, navy pill with mint CTA on the right.
   In Experience Editor / Page Builder, renders inline (not fixed) so authors
   can interact with it without it covering the chrome.
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: JourneyBarProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <JourneyBarDefaultComponent />;

  return (
    <div
      className={cn(
        'component journey-bar z-50',
        isEditing
          ? 'relative mx-auto my-8 w-full max-w-7xl px-4 md:px-6'
          : 'fixed inset-x-4 bottom-4 md:inset-x-8 md:bottom-6',
        styles
      )}
      id={RenderingIdentifier}
    >
      <div
        className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-full px-6 py-4 shadow-lg md:px-8 md:py-5"
        style={{
          backgroundColor: 'var(--brand-primary, #0C2141)',
          color: '#ffffff',
        }}
      >
        {(fields.Title?.value || isEditing) && (
          <Text
            field={fields.Title}
            tag="span"
            className="text-base font-semibold tracking-tight md:text-lg lg:text-xl"
          />
        )}
        {(fields.ButtonLink?.value?.href || isEditing) && (
          <ContentSdkLink
            field={fields.ButtonLink}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#A6E5DE] px-5 py-2.5 text-sm font-semibold text-[var(--brand-primary,#0C2141)] transition-colors duration-200 hover:bg-white md:px-8 md:py-3 md:text-base"
          />
        )}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   FullWidth — same intent, but edge-to-edge (no horizontal margins or pill rounding).
   Useful when authors want a full-bleed dock instead of a floating pill.
   ──────────────────────────────────────────── */
export const FullWidth = ({ fields, params, page }: JourneyBarProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <JourneyBarDefaultComponent />;

  return (
    <div
      className={cn(
        'component journey-bar z-50',
        isEditing ? 'relative w-full' : 'fixed inset-x-0 bottom-0',
        styles
      )}
      id={RenderingIdentifier}
    >
      <div
        className="flex w-full items-center justify-between gap-4 px-6 py-4 md:px-12 md:py-5"
        style={{
          backgroundColor: 'var(--brand-primary, #0C2141)',
          color: '#ffffff',
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          {(fields.Title?.value || isEditing) && (
            <Text
              field={fields.Title}
              tag="span"
              className="text-base font-semibold tracking-tight md:text-lg lg:text-xl"
            />
          )}
          {(fields.ButtonLink?.value?.href || isEditing) && (
            <ContentSdkLink
              field={fields.ButtonLink}
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#A6E5DE] px-5 py-2.5 text-sm font-semibold text-[var(--brand-primary,#0C2141)] transition-colors duration-200 hover:bg-white md:px-8 md:py-3 md:text-base"
            />
          )}
        </div>
      </div>
    </div>
  );
};
