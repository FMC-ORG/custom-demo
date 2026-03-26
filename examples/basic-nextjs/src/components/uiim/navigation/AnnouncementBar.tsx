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
 * Accepted tokens: "primary", "accent", "dark", "gradient". Falls back to gradient.
 */
function getBarStyles(token?: string): { bg: string; text: string } {
  switch (token?.toLowerCase()) {
    case 'primary':
      return { bg: 'bg-[var(--brand-primary)]', text: 'text-[var(--brand-primary-foreground)]' };
    case 'dark':
      return { bg: 'bg-[var(--brand-dark)]', text: 'text-[var(--brand-dark-foreground)]' };
    case 'accent':
      return { bg: 'bg-[var(--brand-accent)]', text: 'text-[var(--brand-accent-foreground)]' };
    case 'gradient':
    default:
      return { bg: 'bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600', text: 'text-white' };
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
          'w-full py-2.5 px-4 text-center text-sm',
          barStyles.bg,
          barStyles.text
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-1">
          {(fields.Message?.value || isEditing) && (
            <Text field={fields.Message} tag="span" />
          )}
          {(fields.BarLink?.value?.href || isEditing) && (
            <>
              <ContentSdkLink
                field={fields.BarLink}
                className="underline font-bold hover:opacity-80 transition-opacity"
              />
              <span aria-hidden="true" className="ml-0.5">&#8250;</span>
            </>
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
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-1">
          {(fields.Message?.value || isEditing) && (
            <Text field={fields.Message} tag="span" />
          )}
          {(fields.BarLink?.value?.href || isEditing) && (
            <>
              <ContentSdkLink
                field={fields.BarLink}
                className="underline decoration-2 font-extrabold hover:opacity-80 transition-opacity"
              />
              <span aria-hidden="true" className="ml-0.5">&#8250;</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
