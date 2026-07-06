import React, { JSX } from 'react';
import * as LucideIcons from 'lucide-react';
import { Sparkles } from 'lucide-react';
import {
  Field,
  ImageField,
  LinkField,
  RichTextField,
  Text,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  RichText as ContentSdkRichText,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface LandingFeaturesRouteFields {
  feature1IconName?: Field<string>;
  feature1Title?: Field<string>;
  feature1Description?: RichTextField;
  feature1Image?: ImageField;
  feature1Link?: LinkField;
  feature2IconName?: Field<string>;
  feature2Title?: Field<string>;
  feature2Description?: RichTextField;
  feature2Image?: ImageField;
  feature2Link?: LinkField;
  feature3IconName?: Field<string>;
  feature3Title?: Field<string>;
  feature3Description?: RichTextField;
  feature3Image?: ImageField;
  feature3Link?: LinkField;
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
  iconName,
  title,
  description,
  image,
  link,
  isEditing,
}: {
  iconName?: Field<string>;
  title?: Field<string>;
  description?: RichTextField;
  image?: ImageField;
  link?: LinkField;
  isEditing?: boolean;
}) {
  const iconKey = iconName?.value;
  const hasContent =
    iconKey || title?.value || description?.value || image?.value?.src || link?.value?.href;
  if (!hasContent && !isEditing) return null;

  const Icon =
    iconKey && (LucideIcons as Record<string, unknown>)[iconKey]
      ? ((LucideIcons as unknown) as Record<string, React.ComponentType<{ className?: string }>>)[
          iconKey
        ]
      : Sparkles;

  const hasImage = Boolean(image?.value?.src);

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[var(--brand-card-radius,4px)] bg-[var(--brand-muted,#f5f5f5)]"
      data-testid="feature-card"
    >
      {hasImage || isEditing ? (
        <div className="aspect-video w-full overflow-hidden">
          <ContentSdkImage field={image} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="px-6 pt-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--brand-card-radius,4px)] bg-[var(--brand-primary)] text-white">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        {(title?.value || isEditing) && (
          <Text
            field={title}
            tag="h3"
            className="font-[var(--brand-heading-font,inherit)] text-lg font-semibold text-[var(--brand-primary)]"
            data-testid="feature-title"
          />
        )}
        {(description?.value || isEditing) && (
          <div
            className="mt-2 text-sm leading-relaxed text-[var(--brand-fg,#333333)]"
            data-testid="feature-description"
          >
            <ContentSdkRichText field={description} />
          </div>
        )}
        {(link?.value?.href || isEditing) && link && (
          <div className="mt-auto pt-4">
            <ContentSdkLink
              field={link}
              className="text-sm font-semibold text-[var(--brand-accent)] no-underline transition hover:underline"
              data-testid="feature-link"
            />
          </div>
        )}
      </div>
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
      <section className="bg-white py-16 md:py-24" data-testid="landing-features">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              iconName={routeFields.feature1IconName}
              title={routeFields.feature1Title}
              description={routeFields.feature1Description}
              image={routeFields.feature1Image}
              link={routeFields.feature1Link}
              isEditing={isEditing}
            />
            <FeatureCard
              iconName={routeFields.feature2IconName}
              title={routeFields.feature2Title}
              description={routeFields.feature2Description}
              image={routeFields.feature2Image}
              link={routeFields.feature2Link}
              isEditing={isEditing}
            />
            <FeatureCard
              iconName={routeFields.feature3IconName}
              title={routeFields.feature3Title}
              description={routeFields.feature3Description}
              image={routeFields.feature3Image}
              link={routeFields.feature3Link}
              isEditing={isEditing}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
