'use client';

import React, { JSX, useEffect, useRef } from 'react';
import {
  ImageField,
  NextImage as ContentSdkImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';

const DEFAULT_FALLBACK_WIDTH = 1600;
const DEFAULT_FALLBACK_HEIGHT = 900;

const VIDEO_EXTENSION_RE = /\.(mp4|webm|mov|ogg|m4v|ogv)(\?|#|\/|$)/i;

// Module-level dedupe so each missing-dims src warns at most once per session in prod.
const warnedSrcs = new Set<string>();

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

  // next/image-style sizing props, passed through to ContentSdkImage on the image branch.
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  alt?: string;

  /** Poster image URL shown before/during video load. Caller-supplied per surface. */
  poster?: string;

  /** Dev escape hatch: pin behavior when inference is wrong. 'auto' falls back to detection. */
  forceMode?: 'auto' | 'image' | 'video';
}

/**
 * Drop-in replacement for ContentSdkImage that also handles Content Hub video assets.
 *
 * SCOPE — use ONLY on these surfaces (per ADR 0005):
 *   - HeroBanner
 *   - HeroBannerCarousel (main slide background only; thumbnails stay on ContentSdkImage)
 *   - CTABanner (WithImage background variant)
 *   - FeatureHighlight
 *   - ArticleHero (background image only; author avatar stays on ContentSdkImage)
 *
 * DO NOT use on logos, icons, avatars, thumbnails, or card images. A 48x48 icon slot must
 * not be able to author an autoplay video. Scope enforcement is documentation-only —
 * adding a new use site is a deliberate, reviewed decision, not a search-and-replace.
 *
 * Image branch always renders ContentSdkImage to preserve Experience Editor editability.
 * When field-value dims AND sizing props are both missing, injects 1600x900 defaults.
 * Dev (NODE_ENV !== 'production') throws so the wiring bug surfaces immediately;
 * prod warns once per src and continues.
 *
 * Video branch:
 *   - Detection: dam-content-type='video' first, file-extension regex fallback.
 *   - View mode: muted loop playsInline. Playback is triggered imperatively after mount,
 *     respecting prefers-reduced-motion. Avoids hydration mismatch and avoids the
 *     pre-effect motion flash.
 *   - Editor mode: controls, no autoplay, preload="metadata". Authors can preview on demand
 *     without being distracted while editing copy.
 *   - fill=true auto-applies absolute inset-0 h-full w-full object-cover to mimic
 *     next/image fill behavior.
 *
 * isEditing is read internally via useSitecore() — callers do not pass it.
 *
 * See: docs/adr/0005-smartmedia-for-video-capable-surfaces.md
 */
export const SmartMedia = ({
  field,
  className,
  width,
  height,
  fill,
  sizes,
  priority,
  alt,
  poster,
  forceMode = 'auto',
}: SmartMediaProps): JSX.Element | null => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;

  const hasSrc = !!field?.value?.src;

  if (!hasSrc && !isEditing) return null;

  const renderAsVideo =
    forceMode === 'video' || (forceMode !== 'image' && hasSrc && isVideoAsset(field));

  if (renderAsVideo && hasSrc) {
    return (
      <VideoBranch
        src={field!.value!.src as string}
        poster={poster}
        fill={fill}
        className={className}
        isEditing={isEditing}
      />
    );
  }

  // Image branch — always ContentSdkImage so Experience Editor wrappers stay intact.
  const val = field?.value as Record<string, unknown> | undefined;
  const hasFieldDims = !!(val?.width && val?.height);
  const hasExplicitSizing = fill || (typeof width === 'number' && typeof height === 'number');

  if (hasSrc && !hasFieldDims && !hasExplicitSizing) {
    const src = (val?.src as string) || '<unknown>';
    const message =
      `[SmartMedia] Image field is missing width/height and no sizing props were passed. ` +
      `Using ${DEFAULT_FALLBACK_WIDTH}x${DEFAULT_FALLBACK_HEIGHT} defaults. src=${src}`;

    if (process.env.NODE_ENV !== 'production') {
      throw new Error(message);
    }

    if (!warnedSrcs.has(src) && typeof window !== 'undefined') {
      warnedSrcs.add(src);
      // eslint-disable-next-line no-console
      console.warn(message);
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

interface VideoBranchProps {
  src: string;
  poster?: string;
  fill?: boolean;
  className?: string;
  isEditing: boolean;
}

const VideoBranch = ({
  src,
  poster,
  fill,
  className,
  isEditing,
}: VideoBranchProps): JSX.Element => {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isEditing) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = (matches: boolean): void => {
      const el = ref.current;
      if (!el) return;
      if (matches) {
        el.pause();
      } else {
        // play() returns a promise that rejects if autoplay is blocked — swallow silently.
        el.play().catch(() => {
          /* autoplay blocked by browser policy */
        });
      }
    };

    apply(mq.matches);

    const onChange = (e: MediaQueryListEvent): void => apply(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [isEditing]);

  const videoClassName = fill
    ? cn('absolute inset-0 h-full w-full object-cover', className)
    : className;

  if (isEditing) {
    return (
      <video
        ref={ref}
        src={src}
        controls
        preload="metadata"
        playsInline
        poster={poster}
        className={videoClassName}
      />
    );
  }

  // View mode: no static autoPlay attribute — the effect above triggers .play()
  // imperatively only when prefers-reduced-motion is not set. This eliminates the
  // SSR/hydration mismatch and prevents the brief motion flash before the effect runs.
  return (
    <video
      ref={ref}
      src={src}
      loop
      muted
      playsInline
      preload="auto"
      poster={poster}
      aria-hidden="true"
      className={videoClassName}
    />
  );
};
