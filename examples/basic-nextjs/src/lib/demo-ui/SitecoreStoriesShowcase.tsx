'use client';
/**
 * Sitecore demo — "customer stories" showcase (TestimonialBlock SitecoreStories variant).
 * Left: thumbnail of the active story with its company logo card and a logo row.
 * Right: list of story titles; the active row is filled with the brand gradient.
 */
import React, { JSX, useState } from 'react';
import {
  Field,
  ImageField,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { Play } from 'lucide-react';
import { hasRichText, hasText } from '@/lib/field-utils';
import { cn } from '@/lib/utils';

export interface SitecoreStoryItem {
  id: string;
  quoteText: { jsonValue: Field<string> };
  companyName: { jsonValue: Field<string> };
  authorImage: { jsonValue: ImageField };
  companyLogo: { jsonValue: ImageField };
}

export const SitecoreStoriesShowcase = ({
  items,
  isEditing,
}: {
  items: SitecoreStoryItem[];
  isEditing?: boolean;
}): JSX.Element | null => {
  const [active, setActive] = useState(Math.max(0, items.length - 1));
  if (!items.length) return null;
  const current = items[Math.min(active, items.length - 1)];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-4">
      <div>
        <div
          className="relative aspect-video w-full overflow-hidden rounded-[var(--brand-card-radius,9px)] shadow-[0_20px_40px_-20px_color-mix(in_srgb,var(--brand-accent)_35%,transparent)]"
          style={{ backgroundColor: 'var(--brand-muted)' }}
        >
          {(current.authorImage?.jsonValue?.value?.src || isEditing) && (
            <ContentSdkImage
              field={current.authorImage?.jsonValue}
              className="h-full w-full object-cover"
            />
          )}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg"
          >
            <Play className="ml-1 h-9 w-9" style={{ color: 'var(--brand-primary)', fill: 'var(--brand-primary)' }} />
          </span>
          {(current.companyLogo?.jsonValue?.value?.src || isEditing) && (
            <div className="absolute bottom-[10%] right-0 flex h-[22%] w-[39%] items-center justify-center rounded-l-[9px] bg-white px-5">
              <ContentSdkImage
                field={current.companyLogo?.jsonValue}
                className="max-h-[60%] w-auto max-w-full object-contain"
              />
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={item.companyName?.jsonValue?.value || `Story ${index + 1}`}
              aria-pressed={index === active}
              className={cn(
                'relative flex h-10 items-center opacity-70 transition hover:opacity-100',
                index === active && 'opacity-100',
              )}
            >
              {(item.companyLogo?.jsonValue?.value?.src || isEditing) && (
                <ContentSdkImage
                  field={item.companyLogo?.jsonValue}
                  className="h-6 w-auto max-w-[130px] object-contain"
                />
              )}
              {index === active && (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item, index) => {
          const selected = index === active;
          return (
            <li key={item.id}>
              <div
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                onClick={() => setActive(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActive(index);
                  }
                }}
                className={cn(
                  'cursor-pointer rounded-[4px] border px-3 py-2 font-body text-[17px] leading-[1.35] transition [&_p]:m-0',
                  !selected && 'bg-white hover:bg-[var(--brand-muted)]',
                )}
                style={
                  selected
                    ? {
                        background: 'var(--brand-gradient, var(--brand-primary))',
                        borderColor: 'transparent',
                        color: 'var(--brand-primary-foreground)',
                      }
                    : { borderColor: 'var(--brand-border)', color: 'var(--brand-fg)' }
                }
              >
                {(hasRichText(item.quoteText?.jsonValue?.value) || isEditing) && (
                  <ContentSdkRichText field={item.quoteText?.jsonValue} />
                )}
                {isEditing && (
                  <span className="mt-1 block text-xs opacity-70">
                    {(hasText(item.companyName?.jsonValue?.value) || isEditing) && (
                      <Text field={item.companyName?.jsonValue} />
                    )}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
