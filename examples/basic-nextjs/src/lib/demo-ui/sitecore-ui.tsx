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
import { ArrowRight } from 'lucide-react';
import { hasRichText, hasText } from '@/lib/field-utils';
import { cn } from '@/lib/utils';

export const SITECORE_GRADIENT = 'var(--brand-gradient, var(--brand-primary))';

/** Gradient text utility classes (eyebrows, hero headline). */
export const gradientText =
  'bg-clip-text text-transparent [background-image:var(--brand-gradient,linear-gradient(90deg,var(--brand-primary),var(--brand-primary)))]';

type PillTone = 'gradient' | 'outline' | 'white';

/** Pill-shaped CTA link with a trailing arrow, matching sitecore.com buttons. */
export const SitecorePill = ({
  field,
  isEditing,
  tone = 'gradient',
  size = 'md',
  className,
}: {
  field?: LinkField;
  isEditing?: boolean;
  tone?: PillTone;
  size?: 'sm' | 'md';
  className?: string;
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
