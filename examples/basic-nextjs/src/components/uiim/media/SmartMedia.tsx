import React, { JSX } from 'react';
import { ImageField, NextImage as ContentSdkImage } from '@sitecore-content-sdk/nextjs';

/**
 * Detects whether a Sitecore Image field holds a video asset from Content Hub.
 * Checks the dam-content-type attribute first, then falls back to URL extension.
 */
export const isVideoAsset = (field: ImageField | undefined): boolean => {
  if (!field?.value) return false;
  const val = field.value as Record<string, unknown>;
  const damType = ((val['dam-content-type'] as string) || '').toLowerCase();
  if (damType === 'video') return true;
  const src = (val.src as string) || '';
  return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(src);
};

interface SmartMediaProps {
  field: ImageField | undefined;
  className?: string;
  /** Show field in edit mode even when empty */
  isEditing?: boolean;
}

/**
 * Drop-in replacement for ContentSdkImage that auto-detects video assets.
 * - If the Content Hub asset is a video → renders <video autoPlay loop muted playsInline>
 * - If the asset is an image → delegates to ContentSdkImage (preserves Experience Editor editability)
 * - If the field is empty and not editing → renders nothing
 */
export const SmartMedia = ({ field, className, isEditing }: SmartMediaProps): JSX.Element | null => {
  const hasSrc = !!field?.value?.src;

  if (!hasSrc && !isEditing) return null;

  if (hasSrc && isVideoAsset(field)) {
    return (
      <video
        src={field!.value!.src as string}
        autoPlay
        loop
        muted
        playsInline
        className={className}
      />
    );
  }

  return <ContentSdkImage field={field} className={className} />;
};
