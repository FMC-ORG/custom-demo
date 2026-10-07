import React, { JSX } from 'react';
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
import { ScrollRail } from '@/components/uiim/media/ScrollRail';

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
}) => (
  <div className="mx-auto mb-10 max-w-3xl text-center">
    {(datasource.title?.jsonValue?.value || isEditing) && (
      <Text
        field={datasource.title?.jsonValue}
        tag="h2"
        className="text-3xl font-bold tracking-tight sm:text-4xl font-[var(--brand-heading-font,inherit)]"
        style={{ color: 'var(--brand-fg, #111111)' }}
      />
    )}
    {(datasource.description?.jsonValue?.value || isEditing) && (
      <ContentSdkRichText
        field={datasource.description?.jsonValue}
        className="mt-4 text-lg opacity-70 font-[var(--brand-body-font,inherit)]"
        style={{ color: 'var(--brand-fg, #111111)' }}
      />
    )}
  </div>
);

const Badge = ({ field, isEditing }: { field: Field<string>; isEditing?: boolean }) => {
  if (!field?.value && !isEditing) return null;
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
  if (!field?.value && !isEditing) return null;
  return (
    <Text
      field={field}
      tag="p"
      className="mt-2 text-lg font-semibold font-[var(--brand-body-font,inherit)]"
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
      <section className="w-full px-4 py-16" style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}>
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
                <div className="flex flex-1 flex-col p-6">
                  <Badge field={card.badgeText?.jsonValue} isEditing={isEditing} />
                  {(card.cardTitle?.jsonValue?.value || isEditing) && (
                    <Text
                      field={card.cardTitle?.jsonValue}
                      tag="h3"
                      className="text-xl font-bold font-[var(--brand-heading-font,inherit)]"
                      style={{ color: 'var(--brand-fg, #111111)' }}
                    />
                  )}
                  <Price field={card.priceText?.jsonValue} isEditing={isEditing} />
                  {(card.cardDescription?.jsonValue?.value || isEditing) && (
                    <ContentSdkRichText
                      field={card.cardDescription?.jsonValue}
                      className="mt-3 flex-1 text-sm opacity-70 font-[var(--brand-body-font,inherit)]"
                      style={{ color: 'var(--brand-fg, #111111)' }}
                    />
                  )}
                  <CardButton field={card.cardLink?.jsonValue} isEditing={isEditing} />
                </div>
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
      <section className="w-full px-4 py-16" style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}>
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
                <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
                  <Badge field={card.badgeText?.jsonValue} isEditing={isEditing} />
                  {(card.cardTitle?.jsonValue?.value || isEditing) && (
                    <Text
                      field={card.cardTitle?.jsonValue}
                      tag="h3"
                      className="text-xl font-bold font-[var(--brand-heading-font,inherit)]"
                      style={{ color: 'var(--brand-fg, #111111)' }}
                    />
                  )}
                  <Price field={card.priceText?.jsonValue} isEditing={isEditing} />
                  {(card.cardDescription?.jsonValue?.value || isEditing) && (
                    <ContentSdkRichText
                      field={card.cardDescription?.jsonValue}
                      className="mt-3 text-sm opacity-70 font-[var(--brand-body-font,inherit)]"
                      style={{ color: 'var(--brand-fg, #111111)' }}
                    />
                  )}
                  <div className="mt-4">
                    <CardButton field={card.cardLink?.jsonValue} isEditing={isEditing} />
                  </div>
                </div>
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
      <section className="w-full px-4 py-16" style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}>
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
                {(card.cardTitle?.jsonValue?.value || isEditing) && (
                  <Text
                    field={card.cardTitle?.jsonValue}
                    tag="h3"
                    className="text-lg font-bold font-[var(--brand-heading-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                <Price field={card.priceText?.jsonValue} isEditing={isEditing} />
                {(card.cardDescription?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={card.cardDescription?.jsonValue}
                    className="mt-2 flex-1 text-sm opacity-70 font-[var(--brand-body-font,inherit)]"
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
      <section className="w-full px-4 py-16" style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}>
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
                    isHighlighted && 'border-2 shadow-md'
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
                  <div className="flex flex-1 flex-col p-6">
                    <Badge field={card.badgeText?.jsonValue} isEditing={isEditing} />
                    {(card.cardTitle?.jsonValue?.value || isEditing) && (
                      <Text
                        field={card.cardTitle?.jsonValue}
                        tag="h3"
                        className="text-xl font-bold font-[var(--brand-heading-font,inherit)]"
                        style={{ color: 'var(--brand-fg, #111111)' }}
                      />
                    )}
                    <Price field={card.priceText?.jsonValue} isEditing={isEditing} />
                    {(card.cardDescription?.jsonValue?.value || isEditing) && (
                      <ContentSdkRichText
                        field={card.cardDescription?.jsonValue}
                        className="mt-3 flex-1 text-sm opacity-70 font-[var(--brand-body-font,inherit)]"
                        style={{ color: 'var(--brand-fg, #111111)' }}
                      />
                    )}
                    <CardButton field={card.cardLink?.jsonValue} isEditing={isEditing} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Worley shared — image-overlay card (projects mosaic + news rail)
   ──────────────────────────────────────────── */
const WorleyOverlayCard = ({
  card,
  isEditing,
  className,
  showDescription = true,
  showMeta = false,
  showLink = true,
}: {
  card: ProductCardFields;
  isEditing?: boolean;
  className?: string;
  showDescription?: boolean;
  showMeta?: boolean;
  showLink?: boolean;
}): JSX.Element => (
  <div
    className={cn(
      'group relative isolate flex h-[400px] flex-col justify-end overflow-hidden rounded-[24px]',
      className
    )}
    style={{ backgroundColor: 'var(--brand-secondary)' }}
  >
    {(card.cardImage?.jsonValue?.value?.src || isEditing) && (
      <div className="absolute inset-0 -z-10">
        <ContentSdkImage
          field={card.cardImage?.jsonValue}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    )}
    <div
      className="absolute inset-0 -z-10"
      style={{
        background:
          'linear-gradient(180deg, transparent 35%, color-mix(in srgb, var(--brand-secondary) 92%, transparent) 100%)',
      }}
    />
    {(card.badgeText?.jsonValue?.value || isEditing) && (
      <Text
        field={card.badgeText?.jsonValue}
        tag="span"
        className="absolute right-3 top-3 rounded-[2px] bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
        style={{ color: 'var(--brand-fg)' }}
      />
    )}
    <div className="p-6 pt-0">
      {showMeta && (card.priceText?.jsonValue?.value || isEditing) && (
        <Text
          field={card.priceText?.jsonValue}
          tag="span"
          className="mb-2 inline-block rounded-[2px] bg-black/50 px-1.5 py-0.5 text-[13px] text-white"
        />
      )}
      {(card.cardTitle?.jsonValue?.value || isEditing) && (
        <Text
          field={card.cardTitle?.jsonValue}
          tag="h3"
          className="text-xl font-bold leading-snug"
          style={{ color: 'var(--brand-highlight)', fontFamily: 'var(--brand-heading-font)' }}
        />
      )}
      {showDescription && (card.cardDescription?.jsonValue?.value || isEditing) && (
        <ContentSdkRichText
          field={card.cardDescription?.jsonValue}
          className="mt-2 text-[15px] leading-relaxed text-white"
        />
      )}
      {showLink && (card.cardLink?.jsonValue?.value?.href || isEditing) && (
        <ContentSdkLink
          field={card.cardLink?.jsonValue}
          className="mt-4 inline-block text-sm font-bold transition-opacity hover:opacity-80 after:absolute after:inset-0"
          style={{ color: 'var(--brand-link)' }}
        />
      )}
    </div>
  </div>
);

const WorleySectionTitle = ({
  datasource,
  isEditing,
}: {
  datasource: ProductPricingCardsDatasource;
  isEditing?: boolean;
}) =>
  datasource.title?.jsonValue?.value || isEditing ? (
    <Text
      field={datasource.title?.jsonValue}
      tag="h2"
      className="text-4xl font-bold tracking-tight md:text-5xl"
      style={{ color: 'var(--brand-secondary)', fontFamily: 'var(--brand-heading-font)' }}
    />
  ) : null;

/* ────────────────────────────────────────────
   WorleyProjects — pixel-perfect demo variant (worley.com "Projects delivered")
   Asymmetric mosaic: rows alternate narrow/wide then wide/narrow.
   ──────────────────────────────────────────── */
export const WorleyProjects = ({ fields, params, page }: ProductPricingCardsProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ProductPricingCardsDefaultComponent />;
  const cards = datasource.children?.results || [];

  // Pattern per 4 cards: [1/3, 2/3], [2/3, 1/3]
  const spanClass = (i: number) => {
    const pos = i % 4;
    return pos === 1 || pos === 2 ? 'md:col-span-2' : 'md:col-span-1';
  };

  return (
    <div className={cn('component product-pricing-cards', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-6 py-12 md:px-10"
        style={{ backgroundColor: 'var(--brand-bg)', fontFamily: 'var(--brand-body-font)' }}
      >
        <div className="mx-auto max-w-[1360px]">
          <WorleySectionTitle datasource={datasource} isEditing={isEditing} />
          {(datasource.description?.jsonValue?.value || isEditing) && (
            <ContentSdkRichText
              field={datasource.description?.jsonValue}
              className="mt-8 text-base"
              style={{ color: 'var(--brand-fg)' }}
            />
          )}
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {cards.map((card, i) => (
              <WorleyOverlayCard key={card.id} card={card} isEditing={isEditing} className={spanClass(i)} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   WorleyNews — pixel-perfect demo variant (worley.com "Our latest news")
   Title + circular arrows, scroll-snap rail of image cards with tag +
   "date · read time" (PriceText). Description link = centred secondary pill.
   ──────────────────────────────────────────── */
export const WorleyNews = ({ fields, params, page }: ProductPricingCardsProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ProductPricingCardsDefaultComponent />;
  const cards = datasource.children?.results || [];

  return (
    <div className={cn('component product-pricing-cards', styles)} id={RenderingIdentifier}>
      <section
        className="w-full overflow-hidden py-12"
        style={{ backgroundColor: 'var(--brand-bg)', fontFamily: 'var(--brand-body-font)' }}
      >
        <ScrollRail
          className="mx-auto max-w-[1440px]"
          header={<WorleySectionTitle datasource={datasource} isEditing={isEditing} />}
          headerClassName="px-6 md:px-10"
          railClassName="mt-12 px-6 md:px-10 scroll-px-6 md:scroll-px-10"
        >
          {cards.map((card) => (
            <WorleyOverlayCard
              key={card.id}
              card={card}
              isEditing={isEditing}
              className="w-[85vw] shrink-0 snap-start sm:w-[400px]"
              showDescription={false}
              showMeta
              showLink={false}
            />
          ))}
        </ScrollRail>
        {(datasource.description?.jsonValue?.value || isEditing) && (
          <ContentSdkRichText
            field={datasource.description?.jsonValue}
            className={cn(
              'mt-10 flex justify-center',
              '[&_a]:inline-flex [&_a]:items-center [&_a]:rounded-[var(--brand-button-radius)] [&_a]:border-2 [&_a]:border-[var(--brand-primary)] [&_a]:bg-[var(--brand-secondary)] [&_a]:px-14 [&_a]:py-2.5 [&_a]:text-base [&_a]:font-semibold [&_a]:text-white [&_a]:no-underline [&_a]:transition-opacity hover:[&_a]:opacity-90'
            )}
          />
        )}
      </section>
    </div>
  );
};
