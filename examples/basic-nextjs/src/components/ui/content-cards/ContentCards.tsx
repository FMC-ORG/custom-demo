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

interface ContentCardChildFields {
  id?: string;
  title?: { jsonValue?: Field<string> };
  image?: { jsonValue?: ImageField };
  description?: { jsonValue?: Field<string> };
  link?: { jsonValue?: LinkField };
  badgeText?: { jsonValue?: Field<string> };
}

interface ContentCardsFields {
  sectionTitle?: { jsonValue?: Field<string> };
  sectionDescription?: { jsonValue?: Field<string> };
  children?: {
    results?: ContentCardChildFields[];
  };
}

interface ContentCardsProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: ContentCardsFields;
    };
  };
}

interface ContentCardsLayoutProps extends ContentCardsProps {
  columns: 2 | 3 | 4;
  cardStyle: 'default' | 'overlay' | 'minimal';
  showBadge: boolean;
}

function ContentCardsLayout({
  params,
  fields,
  columns,
  cardStyle,
  showBadge,
}: ContentCardsLayoutProps): JSX.Element {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource;
  const sectionTitle = datasource?.sectionTitle?.jsonValue;
  const sectionDescription = datasource?.sectionDescription?.jsonValue;
  const cards = datasource?.children?.results || [];

  const hasTitle = sectionTitle?.value ?? (isEditing && sectionTitle);
  const hasDescription = sectionDescription?.value ?? (isEditing && sectionDescription);
  const hasCards = cards.length > 0;

  const columnClasses = {
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  if (!datasource || (!hasTitle && !hasDescription && !hasCards && !isEditing)) {
    return (
      <section
        className={cn('content-cards py-16', styles)}
        id={id}
        data-testid="content-cards"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-muted">
            <span className="is-empty-hint text-muted-foreground">
              Content Cards - Add section title and cards
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn('content-cards py-16', styles)}
      id={id}
      data-testid="content-cards"
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        {((hasTitle || (isEditing && sectionTitle)) || (hasDescription || (isEditing && sectionDescription))) && (
          <div className="mb-12 text-center">
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
                className="field-sectiondescription mx-auto max-w-3xl text-lg text-muted-foreground"
              />
            )}
          </div>
        )}

        {/* Cards Grid */}
        {hasCards ? (
          <div className={cn('grid gap-6', columnClasses[columns])}>
            {cards.map((card, index) => {
              const cardTitle = card.title?.jsonValue;
              const cardImage = card.image?.jsonValue;
              const cardDescription = card.description?.jsonValue;
              const cardLink = card.link?.jsonValue;
              const badge = card.badgeText?.jsonValue;

              return (
                <div
                  key={card.id || index}
                  className={cn(
                    'group relative overflow-hidden rounded-lg transition-all',
                    cardStyle === 'default' && 'bg-card shadow-md hover:shadow-xl',
                    cardStyle === 'overlay' && 'bg-transparent',
                    cardStyle === 'minimal' && 'bg-transparent'
                  )}
                >
                  {/* Image */}
                  {cardImage && (
                    <div
                      className={cn(
                        'relative overflow-hidden',
                        cardStyle === 'overlay' ? 'aspect-[4/3]' : 'aspect-video'
                      )}
                    >
                      <ContentSdkImage
                        field={cardImage}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                      />
                      {cardStyle === 'overlay' && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      )}

                      {/* Badge */}
                      {showBadge && badge?.value && (
                        <div className="absolute left-4 top-4">
                          <span className="rounded-full bg-vargroup-blue px-3 py-1 text-xs font-semibold text-white">
                            {badge.value}
                          </span>
                        </div>
                      )}

                      {/* Overlay Content */}
                      {cardStyle === 'overlay' && (
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          {cardTitle && (
                            <Text
                              tag="h3"
                              field={cardTitle}
                              className="mb-2 text-xl font-bold"
                            />
                          )}
                          {cardDescription && (
                            <Text
                              tag="p"
                              field={cardDescription}
                              className="text-sm text-white/90"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Content (for default and minimal styles) */}
                  {cardStyle !== 'overlay' && (
                    <div className={cn('p-6', cardStyle === 'minimal' && 'px-0')}>
                      {cardTitle && (
                        <Text
                          tag="h3"
                          field={cardTitle}
                          className="mb-3 text-xl font-bold text-foreground group-hover:text-vargroup-blue transition-colors"
                        />
                      )}
                      {cardDescription && (
                        <Text
                          tag="p"
                          field={cardDescription}
                          className="mb-4 text-base text-muted-foreground line-clamp-3"
                        />
                      )}
                      {cardLink && cardLink.value?.href && (
                        <ContentSdkLink
                          field={cardLink}
                          editable={isEditing}
                          className="inline-flex items-center font-medium text-vargroup-blue hover:underline"
                        >
                          {cardLink.value?.text || 'Read More'} →
                        </ContentSdkLink>
                      )}
                    </div>
                  )}

                  {/* Full Card Link */}
                  {cardLink && cardLink.value?.href && (
                    <ContentSdkLink
                      field={cardLink}
                      editable={false}
                      className="absolute inset-0 z-10"
                    >
                      <span className="sr-only">{cardTitle?.value || 'View'}</span>
                    </ContentSdkLink>
                  )}
                </div>
              );
            })}
          </div>
        ) : isEditing ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
            <span className="is-empty-hint text-muted-foreground">
              Add cards to display
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Content Cards - Grid of content cards with image, title, description, and link.
 * Default: 3 columns, card style with shadow
 */
export const Default = (props: ContentCardsProps): JSX.Element => (
  <ContentCardsLayout
    {...props}
    columns={3}
    cardStyle="default"
    showBadge={true}
  />
);

/**
 * TwoColumn: 2 columns, default card style
 */
export const TwoColumn = (props: ContentCardsProps): JSX.Element => (
  <ContentCardsLayout
    {...props}
    columns={2}
    cardStyle="default"
    showBadge={true}
  />
);

/**
 * Overlay: 3 columns, content overlaid on image
 */
export const Overlay = (props: ContentCardsProps): JSX.Element => (
  <ContentCardsLayout
    {...props}
    columns={3}
    cardStyle="overlay"
    showBadge={false}
  />
);

/**
 * Minimal: 4 columns, minimal style without shadows
 */
export const Minimal = (props: ContentCardsProps): JSX.Element => (
  <ContentCardsLayout
    {...props}
    columns={4}
    cardStyle="minimal"
    showBadge={false}
  />
);
