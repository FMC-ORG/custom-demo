'use client';
import type React from 'react';
import { Text, Image as JssImage, Link as JssLink, useSitecore, Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

interface FeatureCardsParams {
  [key: string]: string;
}

interface FeatureCardItem {
  id: string;
  featureIcon?: { jsonValue?: ImageField };
  featureTitle?: { jsonValue?: Field<string> };
  featureDescription?: { jsonValue?: Field<string> };
  featureLink?: { jsonValue?: LinkField };
}

interface FeatureCardsFields {
  sectionTitle?: { jsonValue?: Field<string> };
  sectionDescription?: { jsonValue?: Field<string> };
  children?: {
    results?: FeatureCardItem[];
  };
}

interface FeatureCardsProps extends ComponentProps {
  params: FeatureCardsParams;
  fields: {
    data?: {
      datasource?: FeatureCardsFields;
    };
  };
  isPageEditing?: boolean;
}

const DefaultComponent = (props: FeatureCardsProps): React.JSX.Element => (
  <div className={`component feature-cards ${props.params.styles ?? ''}`}>
    <span className="is-empty-hint">Assign a datasource to edit Feature Cards content.</span>
  </div>
);

const FeatureCardsDefault = (props: FeatureCardsProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  const datasource = props.fields?.data?.datasource;
  const cards = datasource?.children?.results || [];

  return (
    <section className={`feature-cards feature-cards--default ${styles}`} id={id ?? undefined}>
      <div className="container mx-auto px-4 py-16">
        {datasource?.sectionTitle?.jsonValue && (
          <Text
            field={datasource.sectionTitle.jsonValue}
            tag="h2"
            className="feature-cards__title text-4xl font-bold text-center mb-4"
          />
        )}
        {datasource?.sectionDescription?.jsonValue && (
          <Text
            field={datasource.sectionDescription.jsonValue}
            tag="div"
            className="feature-cards__description text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto"
          />
        )}
        <div className="feature-cards__grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div key={card.id} className="feature-card bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
              {card.featureIcon?.jsonValue && (
                <div className="feature-card__icon mb-4">
                  <JssImage
                    field={card.featureIcon.jsonValue}
                    className="w-16 h-16 object-contain"
                  />
                </div>
              )}
              {card.featureTitle?.jsonValue && (
                <Text
                  field={card.featureTitle.jsonValue}
                  tag="h3"
                  className="feature-card__title text-xl font-bold mb-3"
                />
              )}
              {card.featureDescription?.jsonValue && (
                <Text
                  field={card.featureDescription.jsonValue}
                  tag="div"
                  className="feature-card__description text-gray-600 mb-4"
                />
              )}
              {card.featureLink?.jsonValue && (
                <JssLink
                  field={card.featureLink.jsonValue}
                  className="feature-card__link text-[var(--vargroup-blue)] hover:underline font-semibold"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCardsFourColumn = (props: FeatureCardsProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  const datasource = props.fields?.data?.datasource;
  const cards = datasource?.children?.results || [];

  return (
    <section className={`feature-cards feature-cards--four-column ${styles}`} id={id ?? undefined}>
      <div className="container mx-auto px-4 py-16">
        {datasource?.sectionTitle?.jsonValue && (
          <Text
            field={datasource.sectionTitle.jsonValue}
            tag="h2"
            className="feature-cards__title text-4xl font-bold text-center mb-4"
          />
        )}
        {datasource?.sectionDescription?.jsonValue && (
          <Text
            field={datasource.sectionDescription.jsonValue}
            tag="div"
            className="feature-cards__description text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto"
          />
        )}
        <div className="feature-cards__grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="feature-card text-center bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
              {card.featureIcon?.jsonValue && (
                <div className="feature-card__icon mb-4 flex justify-center">
                  <JssImage
                    field={card.featureIcon.jsonValue}
                    className="w-12 h-12 object-contain"
                  />
                </div>
              )}
              {card.featureTitle?.jsonValue && (
                <Text
                  field={card.featureTitle.jsonValue}
                  tag="h3"
                  className="feature-card__title text-lg font-bold mb-2"
                />
              )}
              {card.featureDescription?.jsonValue && (
                <Text
                  field={card.featureDescription.jsonValue}
                  tag="div"
                  className="feature-card__description text-sm text-gray-600 mb-3"
                />
              )}
              {card.featureLink?.jsonValue && (
                <JssLink
                  field={card.featureLink.jsonValue}
                  className="feature-card__link text-[var(--vargroup-blue)] hover:underline text-sm font-semibold"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCardsTwoColumn = (props: FeatureCardsProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  const datasource = props.fields?.data?.datasource;
  const cards = datasource?.children?.results || [];

  return (
    <section className={`feature-cards feature-cards--two-column ${styles}`} id={id ?? undefined}>
      <div className="container mx-auto px-4 py-16">
        {datasource?.sectionTitle?.jsonValue && (
          <Text
            field={datasource.sectionTitle.jsonValue}
            tag="h2"
            className="feature-cards__title text-4xl font-bold text-center mb-4"
          />
        )}
        {datasource?.sectionDescription?.jsonValue && (
          <Text
            field={datasource.sectionDescription.jsonValue}
            tag="div"
            className="feature-cards__description text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto"
          />
        )}
        <div className="feature-cards__grid grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card) => (
            <div key={card.id} className="feature-card bg-white rounded-lg p-8 hover:shadow-lg transition-shadow">
              {card.featureIcon?.jsonValue && (
                <div className="feature-card__icon mb-6">
                  <JssImage
                    field={card.featureIcon.jsonValue}
                    className="w-20 h-20 object-contain"
                  />
                </div>
              )}
              {card.featureTitle?.jsonValue && (
                <Text
                  field={card.featureTitle.jsonValue}
                  tag="h3"
                  className="feature-card__title text-2xl font-bold mb-4"
                />
              )}
              {card.featureDescription?.jsonValue && (
                <Text
                  field={card.featureDescription.jsonValue}
                  tag="div"
                  className="feature-card__description text-gray-600 mb-4"
                />
              )}
              {card.featureLink?.jsonValue && (
                <JssLink
                  field={card.featureLink.jsonValue}
                  className="feature-card__link text-[var(--vargroup-blue)] hover:underline font-semibold"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCardsCentered = (props: FeatureCardsProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  const datasource = props.fields?.data?.datasource;
  const cards = datasource?.children?.results || [];

  return (
    <section className={`feature-cards feature-cards--centered ${styles}`} id={id ?? undefined}>
      <div className="container mx-auto px-4 py-16">
        {datasource?.sectionTitle?.jsonValue && (
          <Text
            field={datasource.sectionTitle.jsonValue}
            tag="h2"
            className="feature-cards__title text-4xl font-bold text-center mb-4"
          />
        )}
        {datasource?.sectionDescription?.jsonValue && (
          <Text
            field={datasource.sectionDescription.jsonValue}
            tag="div"
            className="feature-cards__description text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto"
          />
        )}
        <div className="feature-cards__grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div key={card.id} className="feature-card text-center bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
              {card.featureIcon?.jsonValue && (
                <div className="feature-card__icon mb-4 flex justify-center">
                  <JssImage
                    field={card.featureIcon.jsonValue}
                    className="w-16 h-16 object-contain"
                  />
                </div>
              )}
              {card.featureTitle?.jsonValue && (
                <Text
                  field={card.featureTitle.jsonValue}
                  tag="h3"
                  className="feature-card__title text-xl font-bold mb-3"
                />
              )}
              {card.featureDescription?.jsonValue && (
                <Text
                  field={card.featureDescription.jsonValue}
                  tag="div"
                  className="feature-card__description text-gray-600 mb-4"
                />
              )}
              {card.featureLink?.jsonValue && (
                <JssLink
                  field={card.featureLink.jsonValue}
                  className="feature-card__link text-[var(--vargroup-blue)] hover:underline font-semibold"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Default = (props: FeatureCardsProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;

  if (!props.fields?.data?.datasource) {
    return <DefaultComponent {...props} />;
  }

  return <FeatureCardsDefault {...props} isPageEditing={isEditing} />;
};

export const FourColumn = (props: FeatureCardsProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;

  if (!props.fields?.data?.datasource) {
    return <DefaultComponent {...props} />;
  }

  return <FeatureCardsFourColumn {...props} isPageEditing={isEditing} />;
};

export const TwoColumn = (props: FeatureCardsProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;

  if (!props.fields?.data?.datasource) {
    return <DefaultComponent {...props} />;
  }

  return <FeatureCardsTwoColumn {...props} isPageEditing={isEditing} />;
};

export const Centered = (props: FeatureCardsProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;

  if (!props.fields?.data?.datasource) {
    return <DefaultComponent {...props} />;
  }

  return <FeatureCardsCentered {...props} isPageEditing={isEditing} />;
};
