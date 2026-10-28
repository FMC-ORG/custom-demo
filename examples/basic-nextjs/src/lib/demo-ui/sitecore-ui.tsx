/**
 * Sitecore demo (branch sitecore-demo) — shared presentational helpers for the
 * client variants. Server-safe: no hooks. All colours come from --brand-* variables
 * (see docs/ai/themes/sitecore.theme.yaml); every Sitecore value is rendered
 * through a Content SDK helper so it stays editable.
 */
import React, { JSX } from 'react';
import {
  Field,
  LinkField,
  Link as ContentSdkLink,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ArrowRight, Sparkles } from 'lucide-react';
import { hasRichText, hasText } from '@/lib/field-utils';
import { cn } from '@/lib/utils';

export const SITECORE_GRADIENT = 'var(--brand-gradient, var(--brand-primary))';

/** Gradient text utility classes (eyebrows, hero headline). */
export const gradientText =
  'bg-clip-text text-transparent [background-image:var(--brand-gradient,linear-gradient(90deg,var(--brand-primary),var(--brand-primary)))]';

/**
 * Full-width section with the sitecore.com content frame: thin vertical rules
 * bounding a 1328px column, plus an optional top rule separating stacked sections.
 */
export const SitecoreFrame = ({
  children,
  className,
  frameClassName,
  style,
  dark = false,
  topRule = true,
  testId,
}: {
  children: React.ReactNode;
  className?: string;
  frameClassName?: string;
  style?: React.CSSProperties;
  dark?: boolean;
  topRule?: boolean;
  testId?: string;
}): JSX.Element => (
  <section
    // sitecore.com loads DM Sans without the opsz axis; pin it so large headings
    // don't switch to the tighter display cut that layout.tsx's font URL enables.
    className={cn('w-full px-4 font-body [font-optical-sizing:none] md:px-8 lg:px-12', className)}
    style={style}
    data-testid={testId}
  >
    <div
      className={cn(
        'mx-auto max-w-[1328px] md:border-x',
        topRule && 'border-t',
        dark ? 'border-white/15' : 'border-[var(--brand-border)]',
        frameClassName,
      )}
    >
      {children}
    </div>
  </section>
);

/** Gradient label chip with sparkles icon (sitecore.com product-page eyebrow). */
export const SitecoreEyebrowBadge = ({
  field,
  isEditing,
  className,
  testId,
}: {
  field?: Field<string>;
  isEditing?: boolean;
  className?: string;
  testId?: string;
}): JSX.Element | null => {
  if (!hasText(field?.value) && !isEditing) return null;
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 rounded-[2px] px-3.5 py-2 text-white',
        className,
      )}
      style={{ background: SITECORE_GRADIENT }}
    >
      <Sparkles aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
      <Text
        field={field}
        tag="p"
        className="m-0 font-body text-[15px] font-semibold uppercase leading-none tracking-[0.04em]"
        data-testid={testId}
      />
    </div>
  );
};

type PillTone = 'gradient' | 'outline' | 'white';

/** Pill-shaped CTA link with a trailing arrow, matching sitecore.com buttons. */
export const SitecorePill = ({
  field,
  isEditing,
  tone = 'gradient',
  size = 'md',
  className,
  testId,
}: {
  field?: LinkField;
  isEditing?: boolean;
  tone?: PillTone;
  size?: 'sm' | 'md';
  className?: string;
  testId?: string;
}): JSX.Element | null => {
  if (!field || (!field.value?.href && !isEditing)) return null;
  const toneClass: Record<PillTone, string> = {
    gradient: 'border border-transparent hover:brightness-110',
    outline: 'border bg-transparent hover:bg-[var(--brand-muted)]',
    white: 'border border-transparent bg-white hover:bg-[var(--brand-muted)]',
  };
  const style: React.CSSProperties =
    tone === 'gradient'
      ? { background: SITECORE_GRADIENT, color: 'var(--brand-primary-foreground)' }
      : tone === 'outline'
        ? { borderColor: 'var(--brand-border)', color: 'var(--brand-fg)' }
        : { color: 'var(--brand-fg)' };
  return (
    <ContentSdkLink
      field={field}
      showLinkTextWithChildrenPresent
      className={cn(
        'group inline-flex items-center gap-2.5 rounded-[var(--brand-button-radius,9999px)] font-body font-medium transition',
        size === 'md' ? 'px-6 py-3 text-[17px]' : 'px-5 py-2 text-[15px]',
        toneClass[tone],
        className,
      )}
      style={style}
      data-testid={testId}
    >
      <ArrowRight
        aria-hidden="true"
        className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: tone === 'gradient' ? 'currentColor' : 'var(--brand-accent)' }}
      />
    </ContentSdkLink>
  );
};

/** Small text link with arrow (footer signposts). */
export const SitecoreArrowLink = ({
  field,
  isEditing,
  className,
}: {
  field?: LinkField;
  isEditing?: boolean;
  className?: string;
}): JSX.Element | null => {
  if (!field || (!field.value?.href && !isEditing)) return null;
  return (
    <ContentSdkLink
      field={field}
      showLinkTextWithChildrenPresent
      className={cn('group inline-flex items-center gap-3 font-body text-[15px] hover:underline', className)}
    >
      <ArrowRight
        aria-hidden="true"
        className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:translate-x-0.5"
      />
    </ContentSdkLink>
  );
};

/** Centred section heading: light 40px title + muted description. */
export const SitecoreSectionHeading = ({
  title,
  description,
  isEditing,
  className,
  tone = 'light',
}: {
  title?: Field<string>;
  description?: Field<string>;
  isEditing?: boolean;
  className?: string;
  tone?: 'light' | 'eyebrow';
}): JSX.Element | null => {
  const showTitle = hasText(title?.value) || isEditing;
  const showDescription = hasRichText(description?.value) || isEditing;
  if (!showTitle && !showDescription) return null;
  return (
    <div className={cn('mx-auto mb-10 max-w-[760px] text-center', className)}>
      {showTitle && (
        <Text
          field={title}
          tag="h2"
          className={cn(
            'font-heading',
            tone === 'eyebrow'
              ? 'text-[15px] font-medium uppercase tracking-[0.06em]'
              : 'text-[32px] font-normal leading-[1.2] tracking-[-0.02em] md:text-[40px]',
          )}
          style={{ color: 'var(--brand-fg)' }}
        />
      )}
      {showDescription && (
        <ContentSdkRichText
          field={description}
          className="mt-4 font-body text-[17px] leading-[1.6] [&_p]:m-0"
          style={{ color: 'var(--brand-fg)' }}
        />
      )}
    </div>
  );
};
