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
      <section
        className="bg-[var(--brand-muted,#f5f5f5)] py-16 md:py-20"
        data-testid="landing-final-cta"
      >
        <div className="mx-auto max-w-3xl px-4 text-center">
          {(finalCtaHeadline?.value || isEditing) && (
            <Text
              field={finalCtaHeadline}
              tag="h2"
              className="font-[var(--brand-heading-font,inherit)] text-[32px] font-semibold leading-tight tracking-tight text-[var(--brand-primary)]"
              data-testid="final-cta-headline"
            />
          )}
          {(finalCtaSubhead?.value || isEditing) && (
            <div
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--brand-fg,#333333)]"
              data-testid="final-cta-subhead"
            >
              <ContentSdkRichText field={finalCtaSubhead} />
            </div>
          )}
          {(finalCtaButton?.value?.href || isEditing) && finalCtaButton && (
            <div className="mt-8">
              <ContentSdkLink
                field={finalCtaButton}
                className="inline-flex items-center justify-center rounded-[var(--brand-button-radius,0px)] bg-[var(--brand-primary)] px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                data-testid="final-cta-button"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
