import type { ImageField } from '@sitecore-content-sdk/nextjs';
import { NextImage as ContentSdkImage } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from 'react';

type ContentSdkNextImageProps = ComponentProps<typeof ContentSdkImage>;

export type SitecoreNextImageProps = Omit<ContentSdkNextImageProps, 'width' | 'height' | 'fill'> & {
  field?: ImageField | null;
  /**
   * `fill` — always use Next.js `fill` (parent must be positioned and sized).
   * `auto` (default) — use `field.value` width/height when both are positive numbers; otherwise `fill`.
   */
  layout?: 'auto' | 'fill';
};

function hasNumericDimensions(field: ImageField | null | undefined): boolean {
  const v = field?.value as { width?: unknown; height?: unknown } | undefined;
  const w = v?.width;
  const h = v?.height;
  return typeof w === 'number' && w > 0 && typeof h === 'number' && h > 0;
}

/**
 * Content SDK `NextImage` passes through to `next/image`. Remote DAM URLs (e.g. Content Hub)
 * often omit `width`/`height` on the field, which triggers a runtime error. This helper falls
 * back to `fill` when dimensions are missing; ensure the parent wrapper is `relative` (or
 * `absolute`/`fixed`) with a non-zero box when using `fill`.
 */
export function SitecoreNextImage({ field, layout = 'auto', ...rest }: SitecoreNextImageProps) {
  if (!field) {
    return null;
  }

  if (layout === 'fill' || !hasNumericDimensions(field)) {
    return <ContentSdkImage field={field} fill {...rest} />;
  }

  const v = field.value as { width: number; height: number };
  return <ContentSdkImage field={field} width={v.width} height={v.height} {...rest} />;
}
