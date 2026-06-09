import React, { JSX } from 'react';
import {
  Field,
  LinkField,
  RichTextField,
  Text,
  Link as ContentSdkLink,
  RichText as ContentSdkRichText,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface LandingFinalCTARouteFields {
  finalCtaHeadline?: Field<string>;
  finalCtaSubhead?: RichTextField;
  finalCtaButton?: LinkField;
}

const LandingFinalCTADefaultComponent = (): JSX.Element => (
  <div className="component landing-final-cta">
    <div className="component-content">
      <span className="is-empty-hint">LandingFinalCTA</span>
    </div>
  </div>
);

function getRouteFields(page: ComponentProps['page']): LandingFinalCTARouteFields | null {
  const fields = page?.layout?.sitecore?.route?.fields;
  return fields ? (fields as unknown as LandingFinalCTARouteFields) : null;
}

export const Default = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);
  if (!routeFields) return <LandingFinalCTADefaultComponent />;

  const { finalCtaHeadline, finalCtaSubhead, finalCtaButton } = routeFields;

  return (
    <div className={cn('component landing-final-cta', styles)} id={RenderingIdentifier}>
      <section className="bg-gray-900 py-16 md:py-24" data-testid="landing-final-cta">
        <div className="mx-auto max-w-3xl px-4 text-center">
          {(finalCtaHeadline?.value || isEditing) && (
            <Text
              field={finalCtaHeadline}
              tag="h2"
              className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl"
              data-testid="final-cta-headline"
            />
          )}
          {(finalCtaSubhead?.value || isEditing) && (
            <div
              className="mx-auto mt-6 max-w-xl text-lg text-white/80"
              data-testid="final-cta-subhead"
            >
              <ContentSdkRichText field={finalCtaSubhead} />
            </div>
          )}
          {(finalCtaButton?.value?.href || isEditing) && finalCtaButton && (
            <div className="mt-8">
              <ContentSdkLink
                field={finalCtaButton}
                className="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-semibold text-gray-900 transition hover:bg-gray-100"
                data-testid="final-cta-button"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
