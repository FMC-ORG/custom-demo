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

type PromoBannerFields = {
  Title: Field<string>;
  Description: Field<string>;
  BackgroundImage: ImageField;
  PrimaryLink: LinkField;
};

type PromoBannerProps = ComponentProps & {
  fields: PromoBannerFields;
};

// ---------------------------------------------------------------------------
// Empty-state fallback
// ---------------------------------------------------------------------------

const PromoBannerDefaultComponent = (): JSX.Element => (
  <div className="component promo-banner">
    <div className="component-content">
      <span className="is-empty-hint">PromoBanner</span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Default variant
// ---------------------------------------------------------------------------

export const Default = ({ fields, params, page }: PromoBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <PromoBannerDefaultComponent />;

  const { Title, Description, BackgroundImage, PrimaryLink } = fields;

  return (
    <div className={`component promo-banner ${styles}`} id={RenderingIdentifier}>
      <div className="component-content">
        <div className="relative w-full overflow-hidden rounded-xl min-h-[200px] md:min-h-[280px]">
          {/* Background image — always rendered in edit mode so authors can set it */}
          {(BackgroundImage?.value?.src || isEditing) && (
            <div className="absolute inset-0 z-0">
              <ContentSdkImage
                field={BackgroundImage}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Content card overlay */}
          <div className="relative z-10 flex items-stretch min-h-[200px] md:min-h-[280px]">
            <div className={cn('m-6 md:m-8 max-w-xs md:max-w-sm rounded-lg bg-white p-6 flex flex-col gap-4 justify-center')}>
              {/* Always rendered in edit mode so empty fields are clickable */}
              {(Title?.value || isEditing) && (
                <Text
                  tag="h2"
                  field={Title}
                  className="text-[#1a2d5a] text-xl md:text-2xl font-bold leading-tight"
                />
              )}

              {(Description?.value || isEditing) && (
                <ContentSdkRichText
                  field={Description}
                  className="text-[#1a2d5a] text-sm leading-relaxed"
                />
              )}

              {(PrimaryLink?.value?.href || isEditing) && (
                <div>
                  <ContentSdkLink
                    field={PrimaryLink}
                    className="inline-flex items-center justify-center bg-[#1a2d5a] text-white hover:bg-[#253d7a] rounded-md px-6 py-2 text-sm font-semibold transition-colors"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
