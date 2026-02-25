'use client';

import type React from 'react';
import { RichText as ContentSdkRichText, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { RichTextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { cn } from '@/lib/utils';

type ArticleKeyTakeawaysProps = ComponentProps;

export const Default: React.FC<ArticleKeyTakeawaysProps> = (props) => {
  const { params } = props;
  const { page } = useSitecore();
  const routeFields = page?.layout?.sitecore?.route?.fields ?? {};
  const isEditing = page?.mode?.isEditing ?? false;

  const keyTakeaways = routeFields.KeyTakeaways as RichTextField | undefined;

  const hasContent = Boolean(
    keyTakeaways?.value ?? (keyTakeaways as { value?: string })?.value
  );
  const showSection = hasContent || isEditing;

  if (!showSection) return null;

  return (
    <div
      className={cn('article-key-takeaways', params?.styles)}
      id={params?.RenderingIdentifier}
    >
      <div className="mx-auto max-w-4xl px-4 mb-8">
        <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Key takeaways</h2>
          {keyTakeaways?.value ?? (keyTakeaways as { value?: string })?.value ? (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-ul:my-2">
              <ContentSdkRichText field={keyTakeaways} />
            </div>
          ) : (
            <div className="text-muted-foreground italic">[Key takeaways]</div>
          )}
        </div>
      </div>
    </div>
  );
};
