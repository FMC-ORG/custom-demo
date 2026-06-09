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

function StatTile({
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
          className="text-5xl font-bold tracking-tight text-gray-900 md:text-6xl"
          data-testid="stat-number"
        />
      )}
      {(label?.value || isEditing) && (
        <Text
          field={label}
          tag="p"
          className="mt-2 text-sm font-medium uppercase tracking-wider text-gray-600"
          data-testid="stat-label"
        />
      )}
    </div>
  );
}

export const Default = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);
  if (!routeFields) return <LandingStatsDefaultComponent />;

  return (
    <div className={cn('component landing-stats', styles)} id={RenderingIdentifier}>
      <section className="bg-white py-16 md:py-20" data-testid="landing-stats">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-12 md:grid-cols-3">
            <StatTile
              number={routeFields.stat1Number}
              label={routeFields.stat1Label}
              isEditing={isEditing}
            />
            <StatTile
              number={routeFields.stat2Number}
              label={routeFields.stat2Label}
              isEditing={isEditing}
            />
            <StatTile
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
