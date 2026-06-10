import React, { JSX } from 'react';
import {
  Field,
  LinkField,
  Link as ContentSdkLink,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface EventDateVenueBlockFields {
  DateEyebrow: Field<string>;
  CityTitle: Field<string>;
  DayLabel: Field<string>;
  TimeRange: Field<string>;
  VenueName: Field<string>;
  AddressLines: Field<string>;
  PrimaryLink: LinkField;
}

type EventDateVenueBlockProps = ComponentProps & { fields: EventDateVenueBlockFields };

const Empty = (): JSX.Element => (
  <div className="component event-date-venue-block">
    <span className="is-empty-hint">EventDateVenueBlock</span>
  </div>
);

// Adds a space around every colon: "09:00 — 17:00" → "09 : 00 — 17 : 00"
const spaceColons = (s?: string): string => (s ? s.replace(/\s*:\s*/g, ' : ') : '');

export const Default = ({ fields, params, page }: EventDateVenueBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <Empty />;

  return (
    <div className={cn('component event-date-venue-block', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          {(fields.DateEyebrow?.value || isEditing) && (
            <Text
              field={fields.DateEyebrow}
              tag="p"
              className="text-xs md:text-sm font-light tracking-[0.5em] uppercase"
              style={{ color: '#a3a3a3' }}
            />
          )}

          {(fields.CityTitle?.value || isEditing) && (
            <Text
              field={fields.CityTitle}
              tag="h2"
              className="mt-6 text-5xl md:text-7xl font-light"
              style={{
                fontFamily: 'var(--brand-heading-font)',
                letterSpacing: '0.08em',
                background:
                  'linear-gradient(180deg, #f5f5f5 0%, #d4d4d8 40%, #a3a3a3 80%, #6b7280 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            />
          )}

          {(fields.DayLabel?.value || isEditing) && (
            <Text
              field={fields.DayLabel}
              tag="p"
              className="mt-4 text-xs md:text-sm font-light tracking-[0.4em] uppercase"
              style={{ color: '#a3a3a3' }}
            />
          )}

          {/* Thin divider */}
          <div
            className="mx-auto my-10"
            style={{
              width: '80px',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
            }}
            aria-hidden
          />

          {(fields.TimeRange?.value || isEditing) && (
            <p
              className="text-xl md:text-2xl font-light tabular-nums"
              style={{
                color: '#d4d4d8',
                letterSpacing: '0.4em',
                fontFamily: 'var(--brand-heading-font)',
              }}
            >
              {spaceColons(fields.TimeRange?.value)}
            </p>
          )}

          <div className="mt-6 space-y-1">
            {(fields.VenueName?.value || isEditing) && (
              <Text
                field={fields.VenueName}
                tag="p"
                className="text-sm md:text-base font-light"
                style={{ color: '#d4d4d8' }}
              />
            )}
            {(fields.AddressLines?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.AddressLines}
                className="text-sm md:text-base font-light leading-relaxed [&_p]:m-0"
                style={{ color: '#a3a3a3' }}
              />
            )}
          </div>

          {(fields.PrimaryLink?.value?.href || isEditing) && (
            <div className="mt-10">
              <ContentSdkLink
                field={fields.PrimaryLink}
                className="inline-flex items-center justify-center px-10 py-3.5 text-xs font-light tracking-[0.4em] uppercase transition-all hover:bg-white/5"
                style={{
                  color: '#d4d4d8',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  backgroundColor: 'transparent',
                  borderRadius: '2px',
                }}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
