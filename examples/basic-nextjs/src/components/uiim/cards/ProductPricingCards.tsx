import React, { JSX } from 'react';
import { hasRichText, hasText } from '@/lib/field-utils';
import {
  Field,
  ImageField,
  LinkField,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';
import { SitecoreSectionHeading, gradientText } from '@/lib/demo-ui/sitecore-ui';
import { SitecoreCarousel } from '@/lib/demo-ui/SitecoreCarousel';

interface ProductCardFields {
  id: string;
  cardTitle: { jsonValue: Field<string> };
  cardDescription: { jsonValue: Field<string> };
  cardImage: { jsonValue: ImageField };
  badgeText: { jsonValue: Field<string> };
  priceText: { jsonValue: Field<string> };
  cardLink: { jsonValue: LinkField };
}

interface ProductPricingCardsDatasource {
  title: { jsonValue: Field<string> };
  description: { jsonValue: Field<string> };
  children: {
    results: ProductCardFields[];
  };
}

interface ProductPricingCardsFields {
  data: {
    datasource: ProductPricingCardsDatasource;
  };
}

type ProductPricingCardsProps = ComponentProps & {
  fields: ProductPricingCardsFields;
};

const ProductPricingCardsDefaultComponent = (): JSX.Element => (
  <div className="component product-pricing-cards">
    <div className="component-content">
      <span className="is-empty-hint">ProductPricingCards</span>
    </div>
  </div>
);

const SectionHeader = ({
  datasource,
  isEditing,
}: {
  datasource: ProductPricingCardsDatasource;
  isEditing?: boolean;
}) =>
  hasText(datasource.title?.jsonValue?.value) ||
  isEditing ||
  hasRichText(datasource.description?.jsonValue?.value) ? (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {(hasText(datasource.title?.jsonValue?.value) || isEditing) && (
        <Text
          field={datasource.title?.jsonValue}
          tag="h2"
          className="text-3xl font-bold tracking-tight sm:text-4xl font-heading"
          style={{ color: 'var(--brand-fg, #111111)' }}
        />
      )}
      {(hasRichText(datasource.description?.jsonValue?.value) || isEditing) && (
        <ContentSdkRichText
          field={datasource.description?.jsonValue}
          className="mt-4 text-lg opacity-70 font-body"
          style={{ color: 'var(--brand-fg, #111111)' }}
        />
      )}
    </div>
  ) : null;

const Badge = ({ field, isEditing }: { field: Field<string>; isEditing?: boolean }) => {
  if (!hasText(field?.value) && !isEditing) return null;
  return (
    <Text
      field={field}
      tag="span"
      className="mb-2 inline-block text-xs font-semibold uppercase tracking-wider"
      style={{ color: 'var(--brand-primary)' }}
    />
  );
};

const Price = ({ field, isEditing }: { field: Field<string>; isEditing?: boolean }) => {
  if (!hasText(field?.value) && !isEditing) return null;
  return (
    <Text
      field={field}
      tag="p"
      className="mt-2 text-lg font-semibold font-body"
      style={{ color: 'var(--brand-fg, #111111)' }}
    />
  );
};

const CardButton = ({ field, isEditing }: { field: LinkField; isEditing?: boolean }) => {
  if (!field?.value?.href && !isEditing) return null;
  return (
    <ContentSdkLink
      field={field}
      className="mt-4 inline-flex w-full items-center justify-center px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 rounded-[var(--brand-button-radius,0.375rem)]"
      style={{
        backgroundColor: 'var(--brand-fg, #111111)',
        color: 'var(--brand-bg, #ffffff)',
      }}
    />
  );
};

/* ────────────────────────────────────────────
   Default — vertical card grid
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: ProductPricingCardsProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ProductPricingCardsDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component product-pricing-cards', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col overflow-hidden shadow-sm rounded-[var(--brand-card-radius,0.75rem)]"
                style={{
                  backgroundColor: 'var(--brand-bg, #ffffff)',
                  border: '1px solid var(--brand-border, #e5e7eb)',
                }}
              >
                {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
                  <ContentSdkImage
                    field={card.cardImage?.jsonValue}
                    className="h-48 w-full object-cover"
                  />
                )}
                {(isEditing ||
                  hasText(card.badgeText?.jsonValue?.value) ||
                  hasText(card.cardTitle?.jsonValue?.value) ||
                  hasText(card.priceText?.jsonValue?.value) ||
                  hasRichText(card.cardDescription?.jsonValue?.value) ||
                  card.cardLink?.jsonValue?.value?.href) && (
                  <div className="flex flex-1 flex-col p-6">
                    <Badge field={card.badgeText?.jsonValue} isEditing={isEditing} />
                    {(hasText(card.cardTitle?.jsonValue?.value) || isEditing) && (
                      <Text
                        field={card.cardTitle?.jsonValue}
                        tag="h3"
                        className="text-xl font-bold font-heading"
                        style={{ color: 'var(--brand-fg, #111111)' }}
                      />
                    )}
                    <Price field={card.priceText?.jsonValue} isEditing={isEditing} />
                    {(hasRichText(card.cardDescription?.jsonValue?.value) || isEditing) && (
                      <ContentSdkRichText
                        field={card.cardDescription?.jsonValue}
                        className="mt-3 flex-1 text-sm opacity-70 font-body"
                        style={{ color: 'var(--brand-fg, #111111)' }}
                      />
                    )}
                    <CardButton field={card.cardLink?.jsonValue} isEditing={isEditing} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Horizontal — wide cards stacked vertically
   ──────────────────────────────────────────── */
export const Horizontal = ({ fields, params, page }: ProductPricingCardsProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ProductPricingCardsDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component product-pricing-cards', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="flex flex-col gap-6">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col overflow-hidden shadow-sm md:flex-row rounded-[var(--brand-card-radius,0.75rem)]"
                style={{
                  backgroundColor: 'var(--brand-bg, #ffffff)',
                  border: '1px solid var(--brand-border, #e5e7eb)',
                }}
              >
                {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
                  <div className="md:w-1/3">
                    <ContentSdkImage
                      field={card.cardImage?.jsonValue}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                {(isEditing ||
                  hasText(card.badgeText?.jsonValue?.value) ||
                  hasText(card.cardTitle?.jsonValue?.value) ||
                  hasText(card.priceText?.jsonValue?.value) ||
                  hasRichText(card.cardDescription?.jsonValue?.value) ||
                  card.cardLink?.jsonValue?.value?.href) && (
                  <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
                    <Badge field={card.badgeText?.jsonValue} isEditing={isEditing} />
                    {(hasText(card.cardTitle?.jsonValue?.value) || isEditing) && (
                      <Text
                        field={card.cardTitle?.jsonValue}
                        tag="h3"
                        className="text-xl font-bold font-heading"
                        style={{ color: 'var(--brand-fg, #111111)' }}
                      />
                    )}
                    <Price field={card.priceText?.jsonValue} isEditing={isEditing} />
                    {(hasRichText(card.cardDescription?.jsonValue?.value) || isEditing) && (
                      <ContentSdkRichText
                        field={card.cardDescription?.jsonValue}
                        className="mt-3 text-sm opacity-70 font-body"
                        style={{ color: 'var(--brand-fg, #111111)' }}
                      />
                    )}
                    {(card.cardLink?.jsonValue?.value?.href || isEditing) && (
                      <div className="mt-4">
                        <CardButton field={card.cardLink?.jsonValue} isEditing={isEditing} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Compact — dense cards without images
   ──────────────────────────────────────────── */
export const Compact = ({ fields, params, page }: ProductPricingCardsProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ProductPricingCardsDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component product-pricing-cards', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col p-5 rounded-[var(--brand-card-radius,0.75rem)]"
                style={{
                  backgroundColor: 'var(--brand-bg, #ffffff)',
                  border: '1px solid var(--brand-border, #e5e7eb)',
                }}
              >
                <Badge field={card.badgeText?.jsonValue} isEditing={isEditing} />
                {(hasText(card.cardTitle?.jsonValue?.value) || isEditing) && (
                  <Text
                    field={card.cardTitle?.jsonValue}
                    tag="h3"
                    className="text-lg font-bold font-heading"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                <Price field={card.priceText?.jsonValue} isEditing={isEditing} />
                {(hasRichText(card.cardDescription?.jsonValue?.value) || isEditing) && (
                  <ContentSdkRichText
                    field={card.cardDescription?.jsonValue}
                    className="mt-2 flex-1 text-sm opacity-70 font-body"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                <CardButton field={card.cardLink?.jsonValue} isEditing={isEditing} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Highlighted — second card gets primary border + recommended badge
   ──────────────────────────────────────────── */
export const Highlighted = ({ fields, params, page }: ProductPricingCardsProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ProductPricingCardsDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component product-pricing-cards', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => {
              const isHighlighted = index === 1;
              return (
                <div
                  key={card.id}
                  className={cn(
                    'relative flex flex-col overflow-hidden shadow-sm rounded-[var(--brand-card-radius,0.75rem)]',
                    isHighlighted && 'border-2 shadow-md',
                  )}
                  style={{
                    backgroundColor: 'var(--brand-bg, #ffffff)',
                    borderColor: isHighlighted
                      ? 'var(--brand-primary)'
                      : 'var(--brand-border, #e5e7eb)',
                    borderWidth: isHighlighted ? '2px' : '1px',
                    borderStyle: 'solid',
                  }}
                >
                  {isHighlighted && (
                    <div
                      className="px-4 py-1.5 text-center text-xs font-semibold uppercase tracking-wider"
                      style={{
                        backgroundColor: 'var(--brand-primary)',
                        color: 'var(--brand-primary-foreground)',
                      }}
                    >
                      Recommended
                    </div>
                  )}
                  {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
                    <ContentSdkImage
                      field={card.cardImage?.jsonValue}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  {(isEditing ||
                    hasText(card.badgeText?.jsonValue?.value) ||
                    hasText(card.cardTitle?.jsonValue?.value) ||
                    hasText(card.priceText?.jsonValue?.value) ||
                    hasRichText(card.cardDescription?.jsonValue?.value) ||
                    card.cardLink?.jsonValue?.value?.href) && (
                    <div className="flex flex-1 flex-col p-6">
                      <Badge field={card.badgeText?.jsonValue} isEditing={isEditing} />
                      {(hasText(card.cardTitle?.jsonValue?.value) || isEditing) && (
                        <Text
                          field={card.cardTitle?.jsonValue}
                          tag="h3"
                          className="text-xl font-bold font-heading"
                          style={{ color: 'var(--brand-fg, #111111)' }}
                        />
                      )}
                      <Price field={card.priceText?.jsonValue} isEditing={isEditing} />
                      {(hasRichText(card.cardDescription?.jsonValue?.value) || isEditing) && (
                        <ContentSdkRichText
                          field={card.cardDescription?.jsonValue}
                          className="mt-3 flex-1 text-sm opacity-70 font-body"
                          style={{ color: 'var(--brand-fg, #111111)' }}
                        />
                      )}
                      <CardButton field={card.cardLink?.jsonValue} isEditing={isEditing} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ════════════════════════════════════════════
   Sitecore demo variants (sitecore.com)
   ════════════════════════════════════════════ */

/** Gradient uppercase eyebrow rendered from BadgeText. */
const SitecoreEyebrow = ({ field, isEditing }: { field: Field<string>; isEditing?: boolean }) => {
  if (!hasText(field?.value) && !isEditing) return null;
  return (
    <Text
      field={field}
      tag="span"
      className={cn(
        'block font-body text-[13px] font-semibold uppercase leading-5 tracking-[0.08em]',
        gradientText,
      )}
    />
  );
};

/** Card shell: whole card links to CardLink outside editing; editable link row while editing. */
const SitecoreCardShell = ({
  card,
  isEditing,
  className,
  children,
}: {
  card: ProductCardFields;
  isEditing?: boolean;
  className: string;
  children: React.ReactNode;
}) => {
  const link = card.cardLink?.jsonValue;
  if (link?.value?.href && !isEditing) {
    return (
      <ContentSdkLink field={link} className={cn('group', className)}>
        {children}
      </ContentSdkLink>
    );
  }
  return (
    <div className={className}>
      {children}
      {isEditing && (
        <ContentSdkLink field={link} className="mt-3 block text-xs underline opacity-70" />
      )}
    </div>
  );
};

const sitecoreCardClass =
  'flex h-full flex-col rounded-[var(--brand-card-radius,9px)] border bg-white transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]';

/* SitecorePlatformCarousel — "One intelligent system": small uppercase heading,
   3-up carousel of bordered cards with icon, gradient eyebrow, title, text. */
export const SitecorePlatformCarousel = ({
  fields,
  params,
  page,
}: ProductPricingCardsProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ProductPricingCardsDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component product-pricing-cards', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 pb-12 pt-6 md:pb-16" style={{ color: 'var(--brand-fg)' }}>
        <div className="mx-auto max-w-[1100px]">
          <SitecoreSectionHeading
            title={datasource.title?.jsonValue}
            description={datasource.description?.jsonValue}
            isEditing={isEditing}
            tone="eyebrow"
            className="mb-8"
          />
          <SitecoreCarousel
            label="Platform capabilities"
            isEditing={isEditing}
            slideClassName="w-[85%] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
          >
            {cards.map((card) => (
              <SitecoreCardShell
                key={card.id}
                card={card}
                isEditing={isEditing}
                className={cn(sitecoreCardClass, 'min-h-[256px] px-6 pb-8 pt-6')}
              >
                {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
                  <ContentSdkImage
                    field={card.cardImage?.jsonValue}
                    className="mb-4 h-8 w-8 object-contain"
                  />
                )}
                <SitecoreEyebrow field={card.badgeText?.jsonValue} isEditing={isEditing} />
                {(hasText(card.cardTitle?.jsonValue?.value) || isEditing) && (
                  <Text
                    field={card.cardTitle?.jsonValue}
                    tag="h3"
                    className="mt-3 font-heading text-[21px] font-medium leading-7"
                    style={{ color: 'var(--brand-fg)' }}
                  />
                )}
                {(hasRichText(card.cardDescription?.jsonValue?.value) || isEditing) && (
                  <ContentSdkRichText
                    field={card.cardDescription?.jsonValue}
                    className="mt-3 font-body text-[15px] leading-[1.6] [&_p]:m-0"
                    style={{ color: 'var(--brand-muted-foreground)' }}
                  />
                )}
              </SitecoreCardShell>
            ))}
          </SitecoreCarousel>
        </div>
      </section>
    </div>
  );
};

/* SitecoreValueCards — "Be the answer your customer trusts": centred light heading,
   static 3-column bordered cards with gradient eyebrow, title, text. */
export const SitecoreValueCards = ({
  fields,
  params,
  page,
}: ProductPricingCardsProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ProductPricingCardsDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component product-pricing-cards', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-16 md:py-20" style={{ backgroundColor: 'var(--brand-bg)' }}>
        <div className="mx-auto max-w-[1240px]">
          <SitecoreSectionHeading
            title={datasource.title?.jsonValue}
            description={datasource.description?.jsonValue}
            isEditing={isEditing}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <SitecoreCardShell
                key={card.id}
                card={card}
                isEditing={isEditing}
                className={cn(sitecoreCardClass, 'px-6 pb-10 pt-6')}
              >
                <SitecoreEyebrow field={card.badgeText?.jsonValue} isEditing={isEditing} />
                {(hasText(card.cardTitle?.jsonValue?.value) || isEditing) && (
                  <Text
                    field={card.cardTitle?.jsonValue}
                    tag="h3"
                    className="mt-3 font-heading text-[21px] font-medium leading-7"
                    style={{ color: 'var(--brand-fg)' }}
                  />
                )}
                {(hasRichText(card.cardDescription?.jsonValue?.value) || isEditing) && (
                  <ContentSdkRichText
                    field={card.cardDescription?.jsonValue}
                    className="mt-3 font-body text-[15px] leading-[1.6] [&_p]:m-0"
                    style={{ color: 'var(--brand-muted-foreground)' }}
                  />
                )}
              </SitecoreCardShell>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* SitecoreEventCarousel — "Explore Sitecore events and webinars": centred heading,
   carousel of image-top cards with a grey tag chip, title and clamped text. */
export const SitecoreEventCarousel = ({
  fields,
  params,
  page,
}: ProductPricingCardsProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ProductPricingCardsDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component product-pricing-cards', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-16 md:py-20" style={{ backgroundColor: 'var(--brand-bg)' }}>
        <div className="mx-auto max-w-[1120px]">
          <SitecoreSectionHeading
            title={datasource.title?.jsonValue}
            description={datasource.description?.jsonValue}
            isEditing={isEditing}
          />
          <SitecoreCarousel
            label="Events and webinars"
            isEditing={isEditing}
            slideClassName="w-[80%] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
          >
            {cards.map((card) => (
              <SitecoreCardShell
                key={card.id}
                card={card}
                isEditing={isEditing}
                className={cn(sitecoreCardClass, 'min-h-[372px] overflow-hidden')}
              >
                {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
                  <ContentSdkImage
                    field={card.cardImage?.jsonValue}
                    className="aspect-[600/315] w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col px-4 pb-6 pt-4">
                  {(hasText(card.badgeText?.jsonValue?.value) || isEditing) && (
                    <Text
                      field={card.badgeText?.jsonValue}
                      tag="span"
                      className="self-start rounded-[3px] px-2 py-1 font-body text-[15px] font-medium leading-5"
                      style={{ backgroundColor: 'var(--brand-muted)', color: 'var(--brand-fg)' }}
                    />
                  )}
                  {(hasText(card.cardTitle?.jsonValue?.value) || isEditing) && (
                    <Text
                      field={card.cardTitle?.jsonValue}
                      tag="h3"
                      className="mt-4 font-heading text-[20px] font-medium leading-[1.3]"
                      style={{ color: 'var(--brand-fg)' }}
                    />
                  )}
                  {(hasRichText(card.cardDescription?.jsonValue?.value) || isEditing) && (
                    <ContentSdkRichText
                      field={card.cardDescription?.jsonValue}
                      className={cn(
                        'mt-3 font-body text-[15px] leading-[1.6] [&_p]:m-0',
                        !isEditing && 'line-clamp-3',
                      )}
                      style={{ color: 'var(--brand-muted-foreground)' }}
                    />
                  )}
                </div>
              </SitecoreCardShell>
            ))}
          </SitecoreCarousel>
        </div>
      </section>
    </div>
  );
};
