import React, { JSX } from 'react';
import {
  Field,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
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
   Sage — dark, constrained long-form column with green links
   ──────────────────────────────────────────── */
export const Sage = ({ fields, params, page }: RichTextBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <RichTextBlockDefaultComponent />;

  return (
    <div className={cn('component rich-text-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: 'var(--brand-bg, #0a0a0a)' }}
      >
        <div className="mx-auto max-w-3xl">
          {(fields.Title?.value || isEditing) && (
            <Text
              field={fields.Title}
              tag="h2"
              className="mb-6 text-3xl font-black md:text-4xl font-[family-name:var(--brand-heading-font,Poppins)]"
              style={{ color: 'var(--brand-fg, #ffffff)' }}
            />
          )}
          {(fields.Body?.value || isEditing) && (
            <ContentSdkRichText
              field={fields.Body}
              className="prose prose-invert max-w-none font-[family-name:var(--brand-body-font,Inter)] prose-a:[color:var(--brand-primary)] prose-headings:[font-family:var(--brand-heading-font)]"
              style={{ color: 'var(--brand-fg, #ffffff)' }}
            />
          )}
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Default — baked to Sage look-and-feel
   ──────────────────────────────────────────── */
export const Default = (props: RichTextBlockProps): JSX.Element => <Sage {...props} />;

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
        <div className="mx-auto max-w-3xl text-center">
          {(fields.Title?.value || isEditing) && (
            <Text
              field={fields.Title}
              tag="h2"
              className="mb-6 text-2xl font-bold md:text-3xl font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          {(fields.Body?.value || isEditing) && (
            <ContentSdkRichText
              field={fields.Body}
              className="prose prose-neutral mx-auto max-w-none font-[var(--brand-body-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
        </div>
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
        <div className="mx-auto max-w-2xl">
          {(fields.Title?.value || isEditing) && (
            <Text
              field={fields.Title}
              tag="h2"
              className="mb-6 text-2xl font-bold md:text-3xl font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          {(fields.Body?.value || isEditing) && (
            <ContentSdkRichText
              field={fields.Body}
              className="prose prose-neutral max-w-none font-[var(--brand-body-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
        </div>
      </section>
    </div>
  );
};
