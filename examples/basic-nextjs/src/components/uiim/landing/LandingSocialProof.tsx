import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  RichTextField,
  Text,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  RichText as ContentSdkRichText,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface LandingSocialProofRouteFields {
  testimonialQuote?: RichTextField;
  testimonialAuthorName?: Field<string>;
  testimonialAuthorTitle?: Field<string>;
  testimonialAuthorImage?: ImageField;
  partnerLogosImage?: ImageField;
  socialProofVideoUrl?: LinkField;
}

const LandingSocialProofDefaultComponent = (): JSX.Element => (
  <div className="component landing-social-proof">
    <div className="component-content">
      <span className="is-empty-hint">LandingSocialProof</span>
    </div>
  </div>
);

function getRouteFields(page: ComponentProps['page']): LandingSocialProofRouteFields | null {
  const fields = page?.layout?.sitecore?.route?.fields;
  return fields ? (fields as unknown as LandingSocialProofRouteFields) : null;
}

/** Derives a YouTube embed URL from watch / youtu.be / shorts / embed href forms. */
function getYouTubeEmbedUrl(href: string): string | null {
  try {
    const url = new URL(href);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      const pathMatch = url.pathname.match(/^\/(embed|shorts|live|v)\/([^/?#]+)/);
      if (pathMatch) return `https://www.youtube.com/embed/${pathMatch[2]}`;
    }
  } catch {
    // not a parseable URL — fall through
  }
  return null;
}

function AuthorLine({
  name,
  title,
  image,
  isEditing,
  showImage,
}: {
  name?: Field<string>;
  title?: Field<string>;
  image?: ImageField;
  isEditing?: boolean;
  showImage?: boolean;
}) {
  const hasAuthor = name?.value || title?.value || (showImage && image?.value?.src) || isEditing;
  if (!hasAuthor) return null;
  return (
    <figcaption className="mt-6 flex items-center justify-center gap-3">
      {showImage && (image?.value?.src || isEditing) && (
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[var(--brand-muted,#f5f5f5)]">
          <ContentSdkImage
            field={image}
            className="h-full w-full object-cover"
            width={40}
            height={40}
          />
        </div>
      )}
      <div className="text-left">
        {(name?.value || isEditing) && (
          <Text
            field={name}
            tag="p"
            className="text-sm font-semibold text-[var(--brand-primary)]"
            data-testid="testimonial-author-name"
          />
        )}
        {(title?.value || isEditing) && (
          <Text
            field={title}
            tag="p"
            className="text-sm text-[var(--brand-muted-foreground,#6b7280)]"
            data-testid="testimonial-author-title"
          />
        )}
      </div>
    </figcaption>
  );
}

export const Default = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);
  if (!routeFields) return <LandingSocialProofDefaultComponent />;

  const {
    testimonialQuote,
    testimonialAuthorName,
    testimonialAuthorTitle,
    testimonialAuthorImage,
    partnerLogosImage,
    socialProofVideoUrl,
  } = routeFields;

  const videoHref = socialProofVideoUrl?.value?.href;
  const youTubeEmbedUrl = videoHref ? getYouTubeEmbedUrl(videoHref) : null;
  const hasLogos = partnerLogosImage?.value?.src || isEditing;

  return (
    <div className={cn('component landing-social-proof', styles)} id={RenderingIdentifier}>
      <section className="bg-white py-16 md:py-24" data-testid="landing-social-proof">
        <div className="mx-auto max-w-3xl px-4">
          {isEditing && socialProofVideoUrl && (
            <div className="mb-6 text-center text-xs text-[var(--brand-muted-foreground,#6b7280)]">
              <span className="mr-2">Video URL:</span>
              <ContentSdkLink field={socialProofVideoUrl} data-testid="social-proof-video-url" />
            </div>
          )}

          {videoHref ? (
            <figure className="text-center" data-testid="testimonial">
              <div
                className="mx-auto w-full overflow-hidden rounded-[var(--brand-card-radius,4px)]"
                data-testid="social-proof-video"
              >
                {youTubeEmbedUrl ? (
                  <div className="relative aspect-video w-full">
                    <iframe
                      src={youTubeEmbedUrl}
                      title="Testimonial video"
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video controls className="aspect-video w-full" src={videoHref} />
                )}
              </div>
              {(testimonialQuote?.value || isEditing) && (
                <blockquote
                  className="mx-auto mt-8 max-w-2xl text-base font-semibold leading-relaxed text-[var(--brand-primary)]"
                  data-testid="testimonial-quote"
                >
                  <ContentSdkRichText field={testimonialQuote} />
                </blockquote>
              )}
              <AuthorLine
                name={testimonialAuthorName}
                title={testimonialAuthorTitle}
                image={testimonialAuthorImage}
                isEditing={isEditing}
                showImage={false}
              />
            </figure>
          ) : (
            <figure className="text-center" data-testid="testimonial">
              <span
                aria-hidden="true"
                className="block font-[var(--brand-heading-font,inherit)] text-7xl leading-none text-[var(--brand-accent)]"
              >
                &ldquo;
              </span>
              {(testimonialQuote?.value || isEditing) && (
                <blockquote
                  className="mt-2 text-[22px] font-medium leading-relaxed text-[var(--brand-primary)]"
                  data-testid="testimonial-quote"
                >
                  <ContentSdkRichText field={testimonialQuote} />
                </blockquote>
              )}
              <AuthorLine
                name={testimonialAuthorName}
                title={testimonialAuthorTitle}
                image={testimonialAuthorImage}
                isEditing={isEditing}
                showImage
              />
            </figure>
          )}

          {hasLogos && (
            <div className="mt-14 flex justify-center" data-testid="partner-logos">
              <ContentSdkImage
                field={partnerLogosImage}
                className="h-auto max-w-full opacity-70 grayscale"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
