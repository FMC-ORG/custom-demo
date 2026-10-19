import React, { JSX } from 'react';
import { hasRichText, hasText } from '@/lib/field-utils';
import { Field, RichText as ContentSdkRichText, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface RichTextBlockFields {
  Title: Field<string>;
  Body: Field<string>;
}

type RichTextBlockProps = ComponentProps & {
  fields: RichTextBlockFields;
};

const RichTextBlockDefaultComponent = (): JSX.Element => (
  <div className="component rich-text-block">
    <div className="component-content">
      <span className="is-empty-hint">RichTextBlock</span>
    </div>
  </div>
);

/* ────────────────────────────────────────────
   Default — left-aligned, full container width
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: RichTextBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <RichTextBlockDefaultComponent />;

  return (
    <div className={cn('component rich-text-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        {(hasText(fields.Title?.value) || isEditing || hasRichText(fields.Body?.value)) && (
          <div className="mx-auto max-w-7xl">
            {(hasText(fields.Title?.value) || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="mb-6 text-2xl font-bold md:text-3xl font-heading"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            {(hasRichText(fields.Body?.value) || isEditing) && (
              <ContentSdkRichText
                field={fields.Body}
                className="prose prose-neutral max-w-none font-body"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Centered — centered text
   ──────────────────────────────────────────── */
export const Centered = ({ fields, params, page }: RichTextBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <RichTextBlockDefaultComponent />;

  return (
    <div className={cn('component rich-text-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        {(hasText(fields.Title?.value) || isEditing || hasRichText(fields.Body?.value)) && (
          <div className="mx-auto max-w-3xl text-center">
            {(hasText(fields.Title?.value) || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="mb-6 text-2xl font-bold md:text-3xl font-heading"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            {(hasRichText(fields.Body?.value) || isEditing) && (
              <ContentSdkRichText
                field={fields.Body}
                className="prose prose-neutral mx-auto max-w-none font-body"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Narrow — constrained width for long-form readability
   ──────────────────────────────────────────── */
export const Narrow = ({ fields, params, page }: RichTextBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <RichTextBlockDefaultComponent />;

  return (
    <div className={cn('component rich-text-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        {(hasText(fields.Title?.value) || isEditing || hasRichText(fields.Body?.value)) && (
          <div className="mx-auto max-w-2xl">
            {(hasText(fields.Title?.value) || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="mb-6 text-2xl font-bold md:text-3xl font-heading"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            {(hasRichText(fields.Body?.value) || isEditing) && (
              <ContentSdkRichText
                field={fields.Body}
                className="prose prose-neutral max-w-none font-body"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
};
