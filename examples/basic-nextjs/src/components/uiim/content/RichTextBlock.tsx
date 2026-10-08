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
        <div className="mx-auto max-w-7xl">
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

/* Text fields may hold a single-space blank fallback — treat whitespace as empty. */
const hasText = (value?: string) => !!value && value.trim().length > 0;

/* ────────────────────────────────────────────
   Biffa variant — two-column intro: large Title left,
   Body right behind a thin primary divider; Body links in red
   ──────────────────────────────────────────── */
export const Biffa = ({ fields, params, page }: RichTextBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <RichTextBlockDefaultComponent />;

  return (
    <div className={cn('component rich-text-block', styles)} id={RenderingIdentifier}>
      <section className="w-full px-6 py-16 md:py-24" style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}>
        <div className="mx-auto grid max-w-[1100px] gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            {(hasText(fields.Title?.value) || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="text-[34px] font-bold leading-[1.15] md:text-[46px] font-[var(--brand-heading-font,inherit)]"
                style={{ color: 'var(--brand-fg)' }}
              />
            )}
          </div>
          <div className="md:col-span-7 md:border-l md:border-[var(--brand-primary)] md:pl-5">
            {(hasText(fields.Body?.value) || isEditing) && (
              <ContentSdkRichText
                field={fields.Body}
                className="space-y-6 text-xl leading-[1.35] md:text-2xl font-[var(--brand-body-font,inherit)] [&_a]:font-semibold [&_a]:text-[var(--brand-primary)] [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:opacity-80"
                style={{ color: 'var(--brand-fg)' }}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   BiffaCentered variant — centred 46px heading + 20px intro,
   tight bottom padding so a following stats grid sits close
   ──────────────────────────────────────────── */
export const BiffaCentered = ({ fields, params, page }: RichTextBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <RichTextBlockDefaultComponent />;

  return (
    <div className={cn('component rich-text-block', styles)} id={RenderingIdentifier}>
      <section className="w-full px-6 pb-6 pt-16 md:pt-24" style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}>
        <div className="mx-auto max-w-[880px] text-center">
          {(hasText(fields.Title?.value) || isEditing) && (
            <Text
              field={fields.Title}
              tag="h2"
              className="text-[34px] font-bold leading-[1.15] md:text-[46px] font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg)' }}
            />
          )}
          {(hasText(fields.Body?.value) || isEditing) && (
            <ContentSdkRichText
              field={fields.Body}
              className="mx-auto mt-8 max-w-[860px] text-lg leading-[1.5] md:text-xl font-[var(--brand-body-font,inherit)] [&_a]:font-semibold [&_a]:underline"
              style={{ color: 'var(--brand-fg)' }}
            />
          )}
        </div>
      </section>
    </div>
  );
};
