import React, { JSX } from 'react';
import { ImageField, NextImage as ContentSdkImage } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';

const DEFAULT_FALLBACK_WIDTH = 1600;
const DEFAULT_FALLBACK_HEIGHT = 900;

const VIDEO_EXTENSION_RE = /\.(mp4|webm|mov|ogg)(\?|$)/i;

export const isVideoAsset = (field: ImageField | undefined): boolean => {
  if (!field?.value) return false;
  const val = field.value as Record<string, unknown>;
  const damType = ((val['dam-content-type'] as string) || '').toLowerCase();
  if (damType === 'video') return true;
  const src = (val.src as string) || '';
  return VIDEO_EXTENSION_RE.test(src);
};

interface SmartMediaProps {
  field: ImageField | undefined;
  className?: string;
  isEditing?: boolean;

  // next/image-style sizing props, passed through to ContentSdkImage on the image branch
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  alt?: string;
}

/**
 * Drop-in replacement for ContentSdkImage that also handles Content Hub video assets.
 * Scoped to video-capable surfaces only (HeroBanner, HeroBannerCarousel, CTABanner,
 * FeatureHighlight, ArticleHero) — see docs/adr/0005-smartmedia-for-video-capable-surfaces.md.
 *
 * Image branch always renders ContentSdkImage to preserve Experience Editor editability;
 * when field-value dims AND sizing props are both missing, injects DEFAULT_FALLBACK_* dims
 * so next/image doesn't throw.
 *
 * Video branch suppresses autoplay in Experience Editor so authors aren't distracted while
 * editing. When fill is requested, auto-applies absolute positioning to mimic next/image fill.
 */
export const SmartMedia = ({
  field,
  className,
  isEditing,
  width,
  height,
  fill,
  sizes,
  priority,
  alt,
}: SmartMediaProps): JSX.Element | null => {
  const hasSrc = !!field?.value?.src;

  if (!hasSrc && !isEditing) return null;

  if (hasSrc && isVideoAsset(field)) {
    const src = field!.value!.src as string;
    const videoClassName = fill
      ? cn('absolute inset-0 h-full w-full object-cover', className)
      : className;

    if (isEditing) {
      return (
        <video
          src={src}
          controls
          preload="metadata"
          playsInline
          className={videoClassName}
        />
      );
    }

    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className={videoClassName}
      />
    );
  }

  // Image branch — always ContentSdkImage so Experience Editor wrappers stay intact.
  const val = field?.value as Record<string, unknown> | undefined;
  const hasFieldDims = !!(val?.width && val?.height);
  const hasExplicitSizing = fill || (typeof width === 'number' && typeof height === 'number');

  if (hasSrc && !hasFieldDims && !hasExplicitSizing) {
    // Last-resort safety net: inject default dims so next/image renders.
    // Editability is preserved (still ContentSdkImage). Devs see the warning and can
    // fix the upload pipeline to populate field-value dims (see ADR 0005, deferred work).
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn(
        `[SmartMedia] Image field is missing width/height and no sizing props were passed. Using ${DEFAULT_FALLBACK_WIDTH}x${DEFAULT_FALLBACK_HEIGHT} defaults. src=${val?.src as string}`
      );
    }
    return (
      <ContentSdkImage
        field={field}
        width={DEFAULT_FALLBACK_WIDTH}
        height={DEFAULT_FALLBACK_HEIGHT}
        sizes={sizes}
        priority={priority}
        alt={alt}
        className={className}
      />
    );
  }

  return (
    <ContentSdkImage
      field={field}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      priority={priority}
      alt={alt}
      className={className}
    />
  );
};
