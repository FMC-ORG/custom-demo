'use client';
import type React from 'react';
import { Text, Link as JssLink, useSitecore, Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

interface CtaBannerParams {
  [key: string]: string; // eslint-disable-line
}

interface CtaBannerFields {
  Headline: Field<string>;
  Subheadline: Field<string>;
  CtaLink: LinkField;
}

interface CtaBannerProps extends ComponentProps {
  params: CtaBannerParams;
  fields: CtaBannerFields;
  isPageEditing?: boolean;
}

const DefaultComponent = (props: CtaBannerProps): React.JSX.Element => (
  <div className={`component cta-banner ${props.params.styles ?? ''}`}>
    <span className="is-empty-hint">Assign a datasource to edit CTA Banner content.</span>
  </div>
);

const CtaBannerDefault = (props: CtaBannerProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  const { fields } = props;

  return (
    <section className={`cta-banner cta-banner--default ${styles}`} id={id ?? undefined}>
      <div className="bg-[var(--vargroup-blue)] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          {fields?.Headline && (
            <Text
              field={fields.Headline}
              tag="h2"
              className="cta-banner__headline text-4xl font-bold mb-4"
            />
          )}
          {fields?.Subheadline && (
            <Text
              field={fields.Subheadline}
              tag="div"
              className="cta-banner__subheadline text-xl mb-8 max-w-2xl mx-auto"
            />
          )}
          {fields?.CtaLink && (
            <JssLink
              field={fields.CtaLink}
              className="cta-banner__link inline-block bg-white text-[var(--vargroup-blue)] hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
            />
          )}
        </div>
      </div>
    </section>
  );
};

const CtaBannerLight = (props: CtaBannerProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  const { fields } = props;

  return (
    <section className={`cta-banner cta-banner--light ${styles}`} id={id ?? undefined}>
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          {fields?.Headline && (
            <Text
              field={fields.Headline}
              tag="h2"
              className="cta-banner__headline text-4xl font-bold text-gray-900 mb-4"
            />
          )}
          {fields?.Subheadline && (
            <Text
              field={fields.Subheadline}
              tag="div"
              className="cta-banner__subheadline text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            />
          )}
          {fields?.CtaLink && (
            <JssLink
              field={fields.CtaLink}
              className="cta-banner__link inline-block bg-[var(--vargroup-blue)] text-white hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            />
          )}
        </div>
      </div>
    </section>
  );
};

const CtaBannerGreen = (props: CtaBannerProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  const { fields } = props;

  return (
    <section className={`cta-banner cta-banner--green ${styles}`} id={id ?? undefined}>
      <div className="bg-[var(--vargroup-green)] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          {fields?.Headline && (
            <Text
              field={fields.Headline}
              tag="h2"
              className="cta-banner__headline text-4xl font-bold mb-4"
            />
          )}
          {fields?.Subheadline && (
            <Text
              field={fields.Subheadline}
              tag="div"
              className="cta-banner__subheadline text-xl mb-8 max-w-2xl mx-auto"
            />
          )}
          {fields?.CtaLink && (
            <JssLink
              field={fields.CtaLink}
              className="cta-banner__link inline-block bg-white text-[var(--vargroup-green)] hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export const Default = (props: CtaBannerProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;

  if (!props.fields) {
    return <DefaultComponent {...props} />;
  }

  return <CtaBannerDefault {...props} isPageEditing={isEditing} />;
};

export const Light = (props: CtaBannerProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;

  if (!props.fields) {
    return <DefaultComponent {...props} />;
  }

  return <CtaBannerLight {...props} isPageEditing={isEditing} />;
};

export const Green = (props: CtaBannerProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;

  if (!props.fields) {
    return <DefaultComponent {...props} />;
  }

  return <CtaBannerGreen {...props} isPageEditing={isEditing} />;
};
