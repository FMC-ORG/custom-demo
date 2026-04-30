import React, { JSX } from 'react';
import { Field, ImageField, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { SitecoreNextImage } from '@/lib/sitecore-next-image';
import { cn } from '@/lib/utils';

interface ImageGalleryFields {
  GalleryImage: ImageField;
  Caption: Field<string>;
  AltText: Field<string>;
}

type ImageGalleryProps = ComponentProps & {
  fields: ImageGalleryFields;
};

const ImageGalleryDefaultComponent = (): JSX.Element => (
  <div className="component image-gallery">
    <div className="component-content">
      <span className="is-empty-hint">ImageGallery</span>
    </div>
  </div>
);

/* ────────────────────────────────────────────
   Default — full-width image, no max-width constraint
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: ImageGalleryProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <ImageGalleryDefaultComponent />;

  return (
    <div className={cn('component image-gallery', styles)} id={RenderingIdentifier}>
      <figure className="w-full">
        {(fields.GalleryImage?.value?.src || isEditing) && (
          <div className="relative aspect-video w-full max-h-[70vh]">
            <SitecoreNextImage
              field={fields.GalleryImage}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}
        {(fields.Caption?.value || isEditing) && (
          <figcaption
            className="px-4 py-3 text-center text-sm font-[var(--brand-body-font,inherit)]"
            style={{ color: 'var(--brand-muted-foreground, #6b7280)' }}
          >
            <Text field={fields.Caption} />
          </figcaption>
        )}
      </figure>
    </div>
  );
};

/* ────────────────────────────────────────────
   Gallery — container-constrained with rounded corners
   ──────────────────────────────────────────── */
export const Gallery = ({ fields, params, page }: ImageGalleryProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <ImageGalleryDefaultComponent />;

  return (
    <div className={cn('component image-gallery', styles)} id={RenderingIdentifier}>
      <figure className="mx-auto max-w-7xl px-4 py-8">
        {(fields.GalleryImage?.value?.src || isEditing) && (
          <div className="relative aspect-video w-full max-h-[60vh] overflow-hidden rounded-[var(--brand-card-radius,0.75rem)]">
            <SitecoreNextImage
              field={fields.GalleryImage}
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
        )}
        {(fields.Caption?.value || isEditing) && (
          <figcaption
            className="mt-3 text-center text-sm font-[var(--brand-body-font,inherit)]"
            style={{ color: 'var(--brand-muted-foreground, #6b7280)' }}
          >
            <Text field={fields.Caption} />
          </figcaption>
        )}
      </figure>
    </div>
  );
};

/* ────────────────────────────────────────────
   Parallax — full-width with fixed background effect
   ──────────────────────────────────────────── */
export const Parallax = ({ fields, params, page }: ImageGalleryProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <ImageGalleryDefaultComponent />;

  const imageSrc = fields.GalleryImage?.value?.src;

  return (
    <div className={cn('component image-gallery', styles)} id={RenderingIdentifier}>
      <figure className="w-full">
        {(imageSrc || isEditing) && (
          <div
            className="h-[60vh] w-full bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: imageSrc ? `url(${imageSrc})` : undefined,
            }}
          >
            {isEditing && (
              <div className="relative flex h-full items-center justify-center">
                <SitecoreNextImage
                  field={fields.GalleryImage}
                  className="object-contain opacity-50"
                  sizes="100vw"
                />
              </div>
            )}
          </div>
        )}
        {(fields.Caption?.value || isEditing) && (
          <figcaption
            className="px-4 py-3 text-center text-sm font-[var(--brand-body-font,inherit)]"
            style={{
              backgroundColor: 'var(--brand-bg, #ffffff)',
              color: 'var(--brand-muted-foreground, #6b7280)',
            }}
          >
            <Text field={fields.Caption} />
          </figcaption>
        )}
      </figure>
    </div>
  );
};

/* Howdens — inspiration row: caption-forward, tight square crop */
export const Howdens = ({ fields, params, page }: ImageGalleryProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <ImageGalleryDefaultComponent />;

  return (
    <div className={cn('component image-gallery', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-8 md:py-10" style={{ backgroundColor: 'var(--brand-muted)' }}>
        <div className="mx-auto max-w-5xl">
          {(fields.Caption?.value || isEditing) && (
            <Text
              field={fields.Caption}
              tag="p"
              className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-muted-foreground)' }}
            />
          )}
          <figure
            className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--brand-card-radius,0.25rem)] border shadow-sm md:aspect-[16/9]"
            style={{ borderColor: 'var(--brand-border)' }}
          >
            {(fields.GalleryImage?.value?.src || isEditing) && (
              <SitecoreNextImage
                field={fields.GalleryImage}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            )}
          </figure>
        </div>
      </section>
    </div>
  );
};
