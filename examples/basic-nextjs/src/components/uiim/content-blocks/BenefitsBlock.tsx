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

type BenefitsBlockFields = {
  Title: Field<string>;
  Subtitle: Field<string>;
  BenefitsList: Field<string>;
  SideImage: ImageField;
  PrimaryLink: LinkField;
};

type BenefitsBlockProps = ComponentProps & {
  fields: BenefitsBlockFields;
};

// ---------------------------------------------------------------------------
// Empty-state fallback
// ---------------------------------------------------------------------------

const BenefitsBlockDefaultComponent = (): JSX.Element => (
  <div className="component benefits-block">
    <div className="component-content">
      <span className="is-empty-hint">BenefitsBlock</span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Default variant
// ---------------------------------------------------------------------------

export const Default = ({ fields, params, page }: BenefitsBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <BenefitsBlockDefaultComponent />;

  const { Title, Subtitle, BenefitsList, SideImage, PrimaryLink } = fields;

  return (
    <div
      className={cn('component benefits-block', styles)}
      id={RenderingIdentifier}
    >
      <div className="component-content">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 items-center">
            {/* Left column */}
            <div className="flex flex-col gap-6">
              {/* Title */}
              {(Title?.value || isEditing) && (
                <Text
                  tag="h2"
                  field={Title}
                  className="text-[#1a2d5a] text-2xl md:text-3xl font-bold leading-tight border-l-4 border-[#5bb5c8] pl-4"
                />
              )}

              {/* Subtitle */}
              {(Subtitle?.value || isEditing) && (
                <Text
                  tag="p"
                  field={Subtitle}
                  className="text-[#1a2d5a] text-base font-semibold"
                />
              )}

              {/* Benefits list (Rich Text — authors add checkmark bullets via RTE) */}
              {(BenefitsList?.value || isEditing) && (
                <ContentSdkRichText
                  field={BenefitsList}
                  className="prose prose-sm max-w-none text-gray-700 [&_ul]:space-y-3 [&_li]:flex [&_li]:gap-2"
                />
              )}

              {/* CTA */}
              {(PrimaryLink?.value?.href || isEditing) && (
                <div>
                  <ContentSdkLink
                    field={PrimaryLink}
                    className="inline-flex items-center justify-center bg-[#1a2d5a] text-white hover:bg-[#253d7a] rounded-md px-6 py-3 text-sm font-semibold transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Right column — image */}
            {(SideImage?.value?.src || isEditing) && (
              <div className="overflow-hidden rounded-xl">
                <ContentSdkImage
                  field={SideImage}
                  className="w-full h-full object-cover aspect-[4/3]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
