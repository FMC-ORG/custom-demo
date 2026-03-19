import React, { JSX } from 'react';
import {
  Field,
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

type EurobankPremiumHeroFields = {
  Title: Field<string>;
  Description: Field<string>;
  PrimaryLink: LinkField;
  HelperText: Field<string>;
};

type EurobankPremiumHeroProps = ComponentProps & {
  fields: EurobankPremiumHeroFields;
};

// ---------------------------------------------------------------------------
// Empty-state fallback
// ---------------------------------------------------------------------------

const EurobankPremiumHeroDefaultComponent = (): JSX.Element => (
  <div className="component eurobank-premium-hero">
    <div className="component-content">
      <span className="is-empty-hint">EurobankPremiumHero</span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Default variant
// ---------------------------------------------------------------------------

export const Default = ({
  fields,
  params,
  page,
}: EurobankPremiumHeroProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <EurobankPremiumHeroDefaultComponent />;

  const { Title, Description, PrimaryLink, HelperText } = fields;

  return (
    <div
      className={cn(
        'component eurobank-premium-hero border-t-4 border-[#E31B23] bg-[#121A5E] py-16 md:py-20',
        styles
      )}
      id={RenderingIdentifier}
    >
      <div className="component-content mx-auto max-w-3xl px-6 text-center">
        {(Title?.value || isEditing) && (
          <Text
            tag="h1"
            field={Title}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight"
          />
        )}

        {(Description?.value || isEditing) && (
          <ContentSdkRichText
            field={Description}
            className="mt-4 text-base md:text-lg text-white leading-relaxed"
          />
        )}

        {(PrimaryLink?.value?.href || isEditing) && (
          <div className="mt-6">
            <ContentSdkLink
              field={PrimaryLink}
              className="inline-flex items-center justify-center bg-[#E31B23] text-white font-bold rounded-md px-8 py-3 text-base transition-colors hover:bg-[#c7181f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E31B23]"
            />
          </div>
        )}

        {(HelperText?.value || isEditing) && (
          <Text
            tag="p"
            field={HelperText}
            className="mt-3 text-sm text-[#CCCCCC]"
          />
        )}
      </div>
    </div>
  );
};
