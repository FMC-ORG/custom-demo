'use client';
import type React from 'react';
import { Text, Image as JssImage, Link as JssLink, useSitecore, Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

interface ContentCardsParams {
  [key: string]: string;
}

interface ContentCardItem {
  id: string;
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
    results?: ContentCardItem[];
  };
}

interface ContentCardsProps extends ComponentProps {
  params: ContentCardsParams;
  fields: {
    data?: {
      datasource?: ContentCardsFields;
    };
  };
  isPageEditing?: boolean;
}

const DefaultComponent = (props: ContentCardsProps): React.JSX.Element => (
  <div className={`component content-cards ${props.params.styles ?? ''}`}>
    <span className="is-empty-hint">Assign a datasource to edit Content Cards content.</span>
  </div>
);

const ContentCardsDefault = (props: ContentCardsProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  const datasource = props.fields?.data?.datasource;
  const cards = datasource?.children?.results || [];

  return (
    <section className={`content-cards content-cards--default ${styles}`} id={id ?? undefined}>
      <div className="container mx-auto px-4 py-16">
        {datasource?.sectionTitle?.jsonValue && (
          <Text
            field={datasource.sectionTitle.jsonValue}
            tag="h2"
            className="content-cards__title text-4xl font-bold text-center mb-4"
          />
        )}
        {datasource?.sectionDescription?.jsonValue && (
          <Text
            field={datasource.sectionDescription.jsonValue}
            tag="div"
            className="content-cards__description text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto"
          />
        )}
        <div className="content-cards__grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div key={card.id} className="content-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              {card.image?.jsonValue && (
                <div className="content-card__image">
                  <JssImage
                    field={card.image.jsonValue}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              <div className="content-card__content p-6">
                {card.badgeText?.jsonValue && (
                  <Text
                    field={card.badgeText.jsonValue}
                    tag="span"
                    className="content-card__badge inline-block bg-[var(--vargroup-blue)] text-white px-3 py-1 rounded text-xs font-semibold mb-3"
                  />
                )}
                {card.title?.jsonValue && (
                  <Text
                    field={card.title.jsonValue}
                    tag="h3"
                    className="content-card__title text-xl font-bold mb-3"
                  />
                )}
                {card.description?.jsonValue && (
                  <Text
                    field={card.description.jsonValue}
                    tag="div"
                    className="content-card__description text-gray-600 mb-4"
                  />
                )}
                {card.link?.jsonValue && (
                  <JssLink
                    field={card.link.jsonValue}
                    className="content-card__link text-[var(--vargroup-blue)] hover:underline font-semibold"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContentCardsTwoColumn = (props: ContentCardsProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  const datasource = props.fields?.data?.datasource;
  const cards = datasource?.children?.results || [];

  return (
    <section className={`content-cards content-cards--two-column ${styles}`} id={id ?? undefined}>
      <div className="container mx-auto px-4 py-16">
        {datasource?.sectionTitle?.jsonValue && (
          <Text
            field={datasource.sectionTitle.jsonValue}
            tag="h2"
            className="content-cards__title text-4xl font-bold text-center mb-4"
          />
        )}
        {datasource?.sectionDescription?.jsonValue && (
          <Text
            field={datasource.sectionDescription.jsonValue}
            tag="div"
            className="content-cards__description text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto"
          />
        )}
        <div className="content-cards__grid grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card) => (
            <div key={card.id} className="content-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              {card.image?.jsonValue && (
                <div className="content-card__image">
                  <JssImage
                    field={card.image.jsonValue}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
              <div className="content-card__content p-8">
                {card.badgeText?.jsonValue && (
                  <Text
                    field={card.badgeText.jsonValue}
                    tag="span"
                    className="content-card__badge inline-block bg-[var(--vargroup-blue)] text-white px-3 py-1 rounded text-xs font-semibold mb-3"
                  />
                )}
                {card.title?.jsonValue && (
                  <Text
                    field={card.title.jsonValue}
                    tag="h3"
                    className="content-card__title text-2xl font-bold mb-4"
                  />
                )}
                {card.description?.jsonValue && (
                  <Text
                    field={card.description.jsonValue}
                    tag="div"
                    className="content-card__description text-gray-600 mb-4"
                  />
                )}
                {card.link?.jsonValue && (
                  <JssLink
                    field={card.link.jsonValue}
                    className="content-card__link text-[var(--vargroup-blue)] hover:underline font-semibold"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContentCardsOverlay = (props: ContentCardsProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  const datasource = props.fields?.data?.datasource;
  const cards = datasource?.children?.results || [];

  return (
    <section className={`content-cards content-cards--overlay ${styles}`} id={id ?? undefined}>
      <div className="container mx-auto px-4 py-16">
        {datasource?.sectionTitle?.jsonValue && (
          <Text
            field={datasource.sectionTitle.jsonValue}
            tag="h2"
            className="content-cards__title text-4xl font-bold text-center mb-4"
          />
        )}
        {datasource?.sectionDescription?.jsonValue && (
          <Text
            field={datasource.sectionDescription.jsonValue}
            tag="div"
            className="content-cards__description text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto"
          />
        )}
        <div className="content-cards__grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div key={card.id} className="content-card relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group">
              {card.image?.jsonValue && (
                <div className="content-card__image relative h-80">
                  <JssImage
                    field={card.image.jsonValue}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
              )}
              <div className="content-card__content absolute bottom-0 left-0 right-0 p-6 text-white">
                {card.badgeText?.jsonValue && (
                  <Text
                    field={card.badgeText.jsonValue}
                    tag="span"
                    className="content-card__badge inline-block bg-[var(--vargroup-green)] px-3 py-1 rounded text-xs font-semibold mb-2"
                  />
                )}
                {card.title?.jsonValue && (
                  <Text
                    field={card.title.jsonValue}
                    tag="h3"
                    className="content-card__title text-xl font-bold mb-2"
                  />
                )}
                {card.description?.jsonValue && (
                  <Text
                    field={card.description.jsonValue}
                    tag="div"
                    className="content-card__description text-white/90 text-sm mb-3"
                  />
                )}
                {card.link?.jsonValue && (
                  <JssLink
                    field={card.link.jsonValue}
                    className="content-card__link text-white hover:text-[var(--vargroup-green)] font-semibold transition-colors"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContentCardsMinimal = (props: ContentCardsProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  const datasource = props.fields?.data?.datasource;
  const cards = datasource?.children?.results || [];

  return (
    <section className={`content-cards content-cards--minimal ${styles}`} id={id ?? undefined}>
      <div className="container mx-auto px-4 py-16">
        {datasource?.sectionTitle?.jsonValue && (
          <Text
            field={datasource.sectionTitle.jsonValue}
            tag="h2"
            className="content-cards__title text-4xl font-bold text-center mb-4"
          />
        )}
        {datasource?.sectionDescription?.jsonValue && (
          <Text
            field={datasource.sectionDescription.jsonValue}
            tag="div"
            className="content-cards__description text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto"
          />
        )}
        <div className="content-cards__grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="content-card">
              {card.image?.jsonValue && (
                <div className="content-card__image mb-4">
                  <JssImage
                    field={card.image.jsonValue}
                    className="w-full h-40 object-cover rounded"
                  />
                </div>
              )}
              {card.badgeText?.jsonValue && (
                <Text
                  field={card.badgeText.jsonValue}
                  tag="span"
                  className="content-card__badge inline-block text-[var(--vargroup-blue)] text-xs font-semibold mb-2"
                />
              )}
              {card.title?.jsonValue && (
                <Text
                  field={card.title.jsonValue}
                  tag="h3"
                  className="content-card__title text-lg font-bold mb-2"
                />
              )}
              {card.link?.jsonValue && (
                <JssLink
                  field={card.link.jsonValue}
                  className="content-card__link text-[var(--vargroup-blue)] hover:underline text-sm font-semibold"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Default = (props: ContentCardsProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;

  if (!props.fields?.data?.datasource) {
    return <DefaultComponent {...props} />;
  }

  return <ContentCardsDefault {...props} isPageEditing={isEditing} />;
};

export const TwoColumn = (props: ContentCardsProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;

  if (!props.fields?.data?.datasource) {
    return <DefaultComponent {...props} />;
  }

  return <ContentCardsTwoColumn {...props} isPageEditing={isEditing} />;
};

export const Overlay = (props: ContentCardsProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;

  if (!props.fields?.data?.datasource) {
    return <DefaultComponent {...props} />;
  }

  return <ContentCardsOverlay {...props} isPageEditing={isEditing} />;
};

export const Minimal = (props: ContentCardsProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;

  if (!props.fields?.data?.datasource) {
    return <DefaultComponent {...props} />;
  }

  return <ContentCardsMinimal {...props} isPageEditing={isEditing} />;
};
