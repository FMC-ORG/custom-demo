import React, { JSX } from 'react';
import * as LucideIcons from 'lucide-react';
import { Sparkles } from 'lucide-react';
import {
  Field,
  RichTextField,
  Text,
  RichText as ContentSdkRichText,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface LandingFeaturesRouteFields {
  feature1IconName?: Field<string>;
  feature1Title?: Field<string>;
  feature1Description?: RichTextField;
  feature2IconName?: Field<string>;
  feature2Title?: Field<string>;
  feature2Description?: RichTextField;
  feature3IconName?: Field<string>;
  feature3Title?: Field<string>;
  feature3Description?: RichTextField;
}

const LandingFeaturesDefaultComponent = (): JSX.Element => (
  <div className="component landing-features">
    <div className="component-content">
      <span className="is-empty-hint">LandingFeatures</span>
    </div>
  </div>
);

function getRouteFields(page: ComponentProps['page']): LandingFeaturesRouteFields | null {
  const fields = page?.layout?.sitecore?.route?.fields;
  return fields ? (fields as unknown as LandingFeaturesRouteFields) : null;
}

function FeatureCard({
  index,
  iconName,
  title,
  description,
  isEditing,
}: {
  index: number;
  iconName?: Field<string>;
  title?: Field<string>;
  description?: RichTextField;
  isEditing?: boolean;
}) {
  const iconKey = iconName?.value;
  const hasContent = iconKey || title?.value || description?.value;
  if (!hasContent && !isEditing) return null;

  const Icon =
    iconKey && (LucideIcons as Record<string, unknown>)[iconKey]
      ? ((LucideIcons as unknown) as Record<string, React.ComponentType<{ className?: string }>>)[
          iconKey
        ]
      : Sparkles;

  return (
    <div
      className="flex flex-col items-start p-8 md:p-10"
      style={{
        borderRight: index < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
      }}
      data-testid="feature-card"
    >
      <div
        className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#d4d4d8',
        }}
      >
        <Icon className="h-5 w-5" />
      </div>
      {(title?.value || isEditing) && (
        <Text
          field={title}
          tag="h3"
          className="text-xl md:text-2xl font-light leading-tight"
          style={{
            fontFamily: 'var(--brand-heading-font)',
            background:
              'linear-gradient(180deg, #f5f5f5 0%, #d4d4d8 40%, #a3a3a3 80%, #6b7280 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          data-testid="feature-title"
        />
      )}
      {(description?.value || isEditing) && (
        <div
          className="mt-4 text-sm md:text-[15px] leading-relaxed font-light [&_p]:m-0"
          style={{ color: '#a3a3a3' }}
          data-testid="feature-description"
        >
          <ContentSdkRichText field={description} />
        </div>
      )}
    </div>
  );
}

export const Default = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);
  if (!routeFields) return <LandingFeaturesDefaultComponent />;

  return (
    <div className={cn('component landing-features', styles)} id={RenderingIdentifier}>
      <section className="py-16 md:py-20" data-testid="landing-features">
        <div className="mx-auto max-w-6xl px-4">
          <div
            className="grid grid-cols-1 md:grid-cols-3"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <FeatureCard
              index={1}
              iconName={routeFields.feature1IconName}
              title={routeFields.feature1Title}
              description={routeFields.feature1Description}
              isEditing={isEditing}
            />
            <FeatureCard
              index={2}
              iconName={routeFields.feature2IconName}
              title={routeFields.feature2Title}
              description={routeFields.feature2Description}
              isEditing={isEditing}
            />
            <FeatureCard
              index={3}
              iconName={routeFields.feature3IconName}
              title={routeFields.feature3Title}
              description={routeFields.feature3Description}
              isEditing={isEditing}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
