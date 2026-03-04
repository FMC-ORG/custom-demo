'use client';

import React, { JSX } from 'react';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  Text,
  Field,
  ImageField,
  LinkField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface FeatureCardChildFields {
  id?: string;
  featureIcon?: { jsonValue?: ImageField };
  featureTitle?: { jsonValue?: Field<string> };
  featureDescription?: { jsonValue?: Field<string> };
  featureLink?: { jsonValue?: LinkField };
}

interface FeatureCardsFields {
  sectionTitle?: { jsonValue?: Field<string> };
  sectionDescription?: { jsonValue?: Field<string> };
  children?: {
    results?: FeatureCardChildFields[];
  };
}

interface FeatureCardsProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: FeatureCardsFields;
    };
  };
}

interface FeatureCardsLayoutProps extends FeatureCardsProps {
  columns: 2 | 3 | 4;
  cardAlignment: 'left' | 'center';
  cardPadding: 'normal' | 'compact';
}

function FeatureCardsLayout({
  params,
  fields,
  columns,
  cardAlignment,
  cardPadding,
}: FeatureCardsLayoutProps): JSX.Element {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource;
  const sectionTitle = datasource?.sectionTitle?.jsonValue;
  const sectionDescription = datasource?.sectionDescription?.jsonValue;
  const features = datasource?.children?.results || [];

  const hasTitle = sectionTitle?.value ?? (isEditing && sectionTitle);
  const hasDescription = sectionDescription?.value ?? (isEditing && sectionDescription);
  const hasFeatures = features.length > 0;

  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  if (!datasource || (!hasTitle && !hasDescription && !hasFeatures && !isEditing)) {
    return (
      <section
        className={cn('feature-cards py-16', styles)}
        id={id}
        data-testid="feature-cards"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-muted">
            <span className="is-empty-hint text-muted-foreground">
              Feature Cards - Add section title and features
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn('feature-cards py-16', styles)}
      id={id}
      data-testid="feature-cards"
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        {((hasTitle || (isEditing && sectionTitle)) || (hasDescription || (isEditing && sectionDescription))) && (
          <div className={cn('mb-12', cardAlignment === 'center' ? 'text-center' : 'text-left')}>
            {(hasTitle || (isEditing && sectionTitle)) && sectionTitle && (
              <Text
                tag="h2"
                field={sectionTitle}
                className="field-sectiontitle mb-4 text-3xl font-bold text-foreground sm:text-4xl"
              />
            )}
            {(hasDescription || (isEditing && sectionDescription)) && sectionDescription && (
              <Text
                tag="p"
                field={sectionDescription}
                className={cn(
                  'field-sectiondescription text-lg text-muted-foreground',
                  cardAlignment === 'center' && 'mx-auto max-w-3xl'
                )}
              />
            )}
          </div>
        )}

        {/* Feature Cards Grid */}
        {hasFeatures ? (
          <div className={cn('grid gap-8', columnClasses[columns])}>
            {features.map((feature, index) => {
              const icon = feature.featureIcon?.jsonValue;
              const title = feature.featureTitle?.jsonValue;
              const description = feature.featureDescription?.jsonValue;
              const link = feature.featureLink?.jsonValue;

              return (
                <div
                  key={feature.id || index}
                  className={cn(
                    'group transition-all',
                    cardAlignment === 'center' ? 'text-center' : 'text-left'
                  )}
                >
                  {/* Icon */}
                  {icon && (
                    <div
                      className={cn(
                        'mb-4',
                        cardAlignment === 'center' ? 'mx-auto' : ''
                      )}
                    >
                      <div className="relative h-16 w-16">
                        <ContentSdkImage
                          field={icon}
                          className="h-full w-full object-contain"
                          fill
                        />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className={cn(cardPadding === 'compact' ? 'space-y-2' : 'space-y-3')}>
                    {title && (
                      <Text
                        tag="h3"
                        field={title}
                        className="text-xl font-bold text-foreground group-hover:text-vargroup-blue transition-colors"
                      />
                    )}
                    {description && (
                      <Text
                        tag="p"
                        field={description}
                        className="text-base text-muted-foreground"
                      />
                    )}
                    {link && link.value?.href && (
                      <div className="pt-2">
                        <ContentSdkLink
                          field={link}
                          editable={isEditing}
                          className="inline-flex items-center font-medium text-vargroup-blue hover:underline"
                        >
                          {link.value?.text || 'Learn More'} →
                        </ContentSdkLink>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : isEditing ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
            <span className="is-empty-hint text-muted-foreground">
              Add feature cards to display
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Feature Cards - Grid of feature cards with icon, title, and description.
 * Default: 3 columns, left-aligned, normal padding
 */
export const Default = (props: FeatureCardsProps): JSX.Element => (
  <FeatureCardsLayout
    {...props}
    columns={3}
    cardAlignment="left"
    cardPadding="normal"
  />
);

/**
 * FourColumn: 4 columns, center-aligned
 */
export const FourColumn = (props: FeatureCardsProps): JSX.Element => (
  <FeatureCardsLayout
    {...props}
    columns={4}
    cardAlignment="center"
    cardPadding="compact"
  />
);

/**
 * TwoColumn: 2 columns, left-aligned, normal padding
 */
export const TwoColumn = (props: FeatureCardsProps): JSX.Element => (
  <FeatureCardsLayout
    {...props}
    columns={2}
    cardAlignment="left"
    cardPadding="normal"
  />
);

/**
 * Centered: 3 columns, center-aligned
 */
export const Centered = (props: FeatureCardsProps): JSX.Element => (
  <FeatureCardsLayout
    {...props}
    columns={3}
    cardAlignment="center"
    cardPadding="normal"
  />
);
