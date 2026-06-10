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
        className="relative py-20 md:py-28 overflow-hidden"
        data-testid="landing-final-cta"
      >
        {/* Faint radial glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.04), transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          {/* Thin divider above headline */}
          <div
            className="mx-auto mb-10"
            style={{
              width: '60px',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
            }}
            aria-hidden
          />
          {(finalCtaHeadline?.value || isEditing) && (
            <Text
              field={finalCtaHeadline}
              tag="h2"
              className="text-3xl md:text-5xl font-light leading-tight"
              style={{
                fontFamily: 'var(--brand-heading-font)',
                letterSpacing: '-0.01em',
                background:
                  'linear-gradient(180deg, #f5f5f5 0%, #d4d4d8 40%, #a3a3a3 80%, #6b7280 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              data-testid="final-cta-headline"
            />
          )}
          {(finalCtaSubhead?.value || isEditing) && (
            <div
              className="mx-auto mt-8 max-w-xl text-base md:text-lg font-light leading-relaxed [&_p]:m-0"
              style={{ color: '#a3a3a3' }}
              data-testid="final-cta-subhead"
            >
              <ContentSdkRichText field={finalCtaSubhead} />
            </div>
          )}
          {(finalCtaButton?.value?.href || isEditing) && finalCtaButton && (
            <div className="mt-10">
              <ContentSdkLink
                field={finalCtaButton}
                className="inline-flex items-center justify-center px-10 py-3.5 text-xs font-light uppercase transition-all hover:bg-white/5"
                style={{
                  color: '#d4d4d8',
                  border: '1px solid rgba(255,255,255,0.25)',
                  backgroundColor: 'transparent',
                  borderRadius: '2px',
                  letterSpacing: '0.4em',
                }}
                data-testid="final-cta-button"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
