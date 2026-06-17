import React, { JSX } from 'react';
import { Field, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface LandingStatsRouteFields {
  stat1Number?: Field<string>;
  stat1Label?: Field<string>;
  stat2Number?: Field<string>;
  stat2Label?: Field<string>;
  stat3Number?: Field<string>;
  stat3Label?: Field<string>;
}

const LandingStatsDefaultComponent = (): JSX.Element => (
  <div className="component landing-stats">
    <div className="component-content">
      <span className="is-empty-hint">LandingStats</span>
    </div>
  </div>
);

function getRouteFields(page: ComponentProps['page']): LandingStatsRouteFields | null {
  const fields = page?.layout?.sitecore?.route?.fields;
  return fields ? (fields as unknown as LandingStatsRouteFields) : null;
}

function SageStatTile({
  number,
  label,
  isEditing,
}: {
  number?: Field<string>;
  label?: Field<string>;
  isEditing?: boolean;
}) {
  if (!number?.value && !label?.value && !isEditing) return null;
  return (
    <div className="text-center" data-testid="stat-tile">
      {(number?.value || isEditing) && (
        <Text
          field={number}
          tag="p"
          className="text-4xl font-black tracking-tight md:text-5xl"
          style={{
            color: 'var(--brand-fg)',
            fontFamily: 'var(--brand-heading-font)',
            fontWeight: 900,
          }}
          data-testid="stat-number"
        />
      )}
      {(label?.value || isEditing) && (
        <Text
          field={label}
          tag="p"
          className="mt-2 text-sm font-medium uppercase tracking-wider"
          style={{
            color: 'var(--brand-muted-foreground)',
            fontFamily: 'var(--brand-body-font)',
          }}
          data-testid="stat-label"
        />
      )}
    </div>
  );
}

export const Sage = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);
  if (!routeFields) return <LandingStatsDefaultComponent />;

  return (
    <div className={cn('component landing-stats', styles)} id={RenderingIdentifier}>
      <section
        className="py-20"
        style={{ backgroundColor: 'var(--brand-muted)', color: 'var(--brand-fg)' }}
        data-testid="landing-stats"
      >
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-3">
            <SageStatTile
              number={routeFields.stat1Number}
              label={routeFields.stat1Label}
              isEditing={isEditing}
            />
            <SageStatTile
              number={routeFields.stat2Number}
              label={routeFields.stat2Label}
              isEditing={isEditing}
            />
            <SageStatTile
              number={routeFields.stat3Number}
              label={routeFields.stat3Label}
              isEditing={isEditing}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export const Default = (props: ComponentProps): JSX.Element => <Sage {...props} />;
