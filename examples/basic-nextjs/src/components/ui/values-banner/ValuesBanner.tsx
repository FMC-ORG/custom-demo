'use client';

import type React from 'react';
import { LocaleAwareLink } from '@/components/ui/locale-link/LocaleAwareLink';
import {
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Field,
  ImageField,
  LinkField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isVideoMedia, MediaFieldValue } from '@/utils/media';

/**
 * ValuesBanner fields — no ComponentQuery, default JSS PascalCase shape.
 */
interface ValuesBannerFields {
  Headline?: Field<string>;
  CTALabel?: Field<string>;
  CTALink?: LinkField;
  BackgroundFallbackImage?: ImageField;
}

interface ValuesBannerProps extends ComponentProps {
  params: { [key: string]: string };
  fields?: ValuesBannerFields;
}

/**
 * ValuesBanner — full-width section with background image, subtle dark overlay,
 * centered white headline and optional CTA link.
 */
export const Default: React.FC<ValuesBannerProps> = (props) => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const backgroundSrc = fields?.BackgroundFallbackImage?.value?.src as string | undefined;
  const isVideo = isVideoMedia(fields?.BackgroundFallbackImage?.value as MediaFieldValue | undefined);

  const hasHeadline = fields?.Headline?.value || (isEditing && fields?.Headline);
  const hasCta = fields?.CTALink?.value?.href || (isEditing && fields?.CTALink);
  const hasImage =
    fields?.BackgroundFallbackImage?.value?.src ||
    (isEditing && fields?.BackgroundFallbackImage);

  const hasContent = hasHeadline || hasCta || hasImage;

  if (!fields || !hasContent) {
    return (
      <section
        className={cn('values-banner relative overflow-hidden bg-vg-dark', styles)}
        id={id}
        data-testid="values-banner"
        style={{ minHeight: '400px' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="is-empty-hint text-white/60">ValuesBanner</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn('values-banner relative overflow-hidden', styles)}
      id={id}
      data-testid="values-banner"
      style={{ minHeight: '400px' }}
    >
      {/* Background media — video or image; editing mode always uses ContentSdkImage for authoring */}
      {hasImage && fields?.BackgroundFallbackImage && (
        isVideo && !isEditing ? (
          <video
            src={backgroundSrc}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          />
        ) : (
          <ContentSdkImage
            field={fields.BackgroundFallbackImage}
            editable={isEditing}
            fill
            className="object-cover"
            alt={(fields?.BackgroundFallbackImage?.value?.alt ?? '') as string}
          />
        )
      )}
      {/* Subtle dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px] px-6 py-16 text-center">
        {(hasHeadline || (isEditing && fields?.Headline)) && fields?.Headline && (
          <div className="field-headline text-2xl md:text-3xl font-bold text-white text-center max-w-2xl mx-auto leading-snug">
            <ContentSdkRichText field={fields.Headline} />
          </div>
        )}
        {(hasCta || (isEditing && fields?.CTALink)) && fields?.CTALink && (
          <div className="mt-6">
            <LocaleAwareLink
              field={fields.CTALink}
              editable={isEditing}
              className="text-sm text-white underline-offset-4 hover:underline inline-flex items-center gap-2"
            >
              {fields?.CTALabel?.value || fields?.CTALink?.value?.text || ''}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </LocaleAwareLink>
          </div>
        )}
      </div>
    </section>
  );
};
