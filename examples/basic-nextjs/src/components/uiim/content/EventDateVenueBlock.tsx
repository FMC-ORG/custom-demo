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
              className="text-xs font-semibold tracking-[0.4em] uppercase"
              style={{ color: 'var(--brand-muted-foreground)' }}
            />
          )}

          {(fields.CityTitle?.value || isEditing) && (
            <Text
              field={fields.CityTitle}
              tag="h2"
              className="mt-4 text-5xl md:text-7xl font-bold tracking-wider"
              style={{
                color: 'var(--brand-fg)',
                fontFamily: 'var(--brand-heading-font)',
                letterSpacing: '0.05em',
              }}
            />
          )}

          {(fields.DayLabel?.value || isEditing) && (
            <Text
              field={fields.DayLabel}
              tag="p"
              className="mt-2 text-sm font-medium tracking-[0.3em] uppercase"
              style={{ color: 'var(--brand-muted-foreground)' }}
            />
          )}

          <div
            className="mt-10 mx-auto inline-block rounded-2xl px-8 py-6"
            style={{
              backgroundColor: 'var(--brand-muted)',
              border: '1px solid var(--brand-border)',
            }}
          >
            {(fields.TimeRange?.value || isEditing) && (
              <Text
                field={fields.TimeRange}
                tag="p"
                className="text-3xl md:text-4xl font-bold"
                style={{ color: 'var(--brand-fg)' }}
              />
            )}
            {(fields.VenueName?.value || isEditing) && (
              <Text
                field={fields.VenueName}
                tag="p"
                className="mt-3 text-base font-semibold"
                style={{ color: 'var(--brand-fg)' }}
              />
            )}
            {(fields.AddressLines?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.AddressLines}
                className="mt-1 text-sm leading-relaxed [&_p]:m-0"
                style={{ color: 'var(--brand-muted-foreground)' }}
              />
            )}
          </div>

          {(fields.PrimaryLink?.value?.href || isEditing) && (
            <div className="mt-8">
              <ContentSdkLink
                field={fields.PrimaryLink}
                className="inline-flex items-center justify-center px-8 py-3 text-sm font-bold tracking-wider uppercase"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'var(--brand-primary-foreground)',
                  borderRadius: 'var(--brand-button-radius)',
                }}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
