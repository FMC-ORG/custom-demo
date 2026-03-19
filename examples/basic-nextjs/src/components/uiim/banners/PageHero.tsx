import React, { JSX } from 'react';
import {
  Field,
  NextImage as ContentSdkImage,
  ImageField,
  Link as ContentSdkLink,
  LinkField,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PageHeroFields = {
  EyebrowText: Field<string>;
  Title: Field<string>;
  Description: Field<string>;
  BackgroundImage: ImageField;
  PrimaryLink: LinkField;
};

type PageHeroProps = ComponentProps & {
  fields: PageHeroFields;
};

// ---------------------------------------------------------------------------
// Empty-state fallback
// ---------------------------------------------------------------------------

const PageHeroDefaultComponent = (): JSX.Element => (
  <div className="component page-hero">
    <div className="component-content">
      <span className="is-empty-hint">PageHero</span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Default variant
// ---------------------------------------------------------------------------

export const Default = ({ fields, params, page }: PageHeroProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <PageHeroDefaultComponent />;

  const { EyebrowText, Title, Description, BackgroundImage, PrimaryLink } = fields;

  return (
    <div className={cn('component page-hero', styles)} id={RenderingIdentifier}>
      <div className="component-content">
        <div className="relative w-full overflow-hidden min-h-[280px] md:min-h-[380px] lg:min-h-[440px]">
          {/* Background image */}
          {(BackgroundImage?.value?.src || isEditing) && (
            <div className="absolute inset-0 z-0">
              <ContentSdkImage
                field={BackgroundImage}
                className="h-full w-full object-cover object-center"
              />
            </div>
          )}

          {/* Dark gradient overlay for text legibility */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

          {/* Content */}
          <div className="relative z-[2] flex items-center h-full min-h-[280px] md:min-h-[380px] lg:min-h-[440px] px-6 md:px-12 lg:px-16 py-10">
            <div className="flex max-w-lg">
              {/* Orange left accent bar */}
              <div className="w-1 min-h-full bg-[#f47b20] rounded-full mr-5 flex-shrink-0" />

              {/* Text block */}
              <div className="flex flex-col gap-3">
                {(EyebrowText?.value || isEditing) && (
                  <Text
                    tag="p"
                    field={EyebrowText}
                    className="text-white text-xs md:text-sm font-semibold uppercase tracking-widest"
                  />
                )}

                {(Title?.value || isEditing) && (
                  <Text
                    tag="h1"
                    field={Title}
                    className="text-white text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight uppercase"
                  />
                )}

                {(Description?.value || isEditing) && (
                  <ContentSdkRichText
                    field={Description}
                    className="text-white/90 text-sm md:text-base leading-relaxed max-w-sm"
                  />
                )}

                {(PrimaryLink?.value?.href || isEditing) && (
                  <div className="mt-2">
                    <ContentSdkLink
                      field={PrimaryLink}
                      className="inline-flex items-center justify-center bg-[#f47b20] hover:bg-[#d9691a] text-white font-semibold text-sm rounded-md px-6 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47b20]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
