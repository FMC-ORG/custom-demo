import React, { JSX } from 'react';
import {
  Field,
  Link as ContentSdkLink,
  LinkField,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface AnnouncementBarFields {
  Message: Field<string>;
  BarLink: LinkField;
  BackgroundColor: Field<string>;
}

type AnnouncementBarProps = ComponentProps & {
  fields: AnnouncementBarFields;
};

const AnnouncementBarDefaultComponent = (): JSX.Element => (
  <div className="component announcement-bar">
    <div className="component-content">
      <span className="is-empty-hint">AnnouncementBar</span>
    </div>
  </div>
);

/**
 * Maps the BackgroundColor token to CSS variable-based styles.
 * Accepted tokens: "primary", "accent", "dark". Falls back to accent.
 */
function getBarStyles(token?: string): { bg: string; text: string } {
  switch (token?.toLowerCase()) {
    case 'primary':
      return { bg: 'bg-[var(--brand-primary)]', text: 'text-[var(--brand-primary-foreground)]' };
    case 'dark':
      return { bg: 'bg-[var(--brand-dark)]', text: 'text-[var(--brand-dark-foreground)]' };
    case 'accent':
    default:
      return { bg: 'bg-[var(--brand-accent)]', text: 'text-[var(--brand-accent-foreground)]' };
  }
}

export const Default = ({ fields, params, page }: AnnouncementBarProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <AnnouncementBarDefaultComponent />;

  const barStyles = getBarStyles(fields.BackgroundColor?.value);

  return (
    <div
      className={cn('component announcement-bar', styles)}
      id={RenderingIdentifier}
    >
      <div
        className={cn(
          'w-full py-2 px-4 text-center text-sm',
          barStyles.bg,
          barStyles.text
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3">
          {(fields.Message?.value || isEditing) && (
            <Text field={fields.Message} tag="span" />
          )}
          {(fields.BarLink?.value?.href || isEditing) && (
            <ContentSdkLink
              field={fields.BarLink}
              className="underline font-medium hover:opacity-80 transition-opacity"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const Highlight = ({ fields, params, page }: AnnouncementBarProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <AnnouncementBarDefaultComponent />;

  const barStyles = getBarStyles(fields.BackgroundColor?.value);

  return (
    <div
      className={cn('component announcement-bar', styles)}
      id={RenderingIdentifier}
    >
      <div
        className={cn(
          'w-full py-3 px-4 text-center text-sm font-bold tracking-wide uppercase',
          barStyles.bg,
          barStyles.text
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3">
          {(fields.Message?.value || isEditing) && (
            <Text field={fields.Message} tag="span" />
          )}
          {(fields.BarLink?.value?.href || isEditing) && (
            <ContentSdkLink
              field={fields.BarLink}
              className="underline decoration-2 font-extrabold hover:opacity-80 transition-opacity"
            />
          )}
        </div>
      </div>
    </div>
  );
};
