'use client';
import type React from 'react';
import { Text, Image as JssImage, Link as JssLink, useSitecore, Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

interface HeroBannerParams {
  [key: string]: string; // eslint-disable-line
}

interface HeroBannerFields {
  BackgroundImage: ImageField;
  Headline: Field<string>;
  Subheadline: Field<string>;
  CtaLink: LinkField;
  SecondaryCtaLink: LinkField;
}

interface HeroBannerProps extends ComponentProps {
  params: HeroBannerParams;
  fields: HeroBannerFields;
  isPageEditing?: boolean;
}

const DefaultComponent = (props: HeroBannerProps): React.JSX.Element => (
  <div className={`component hero-banner ${props.params.styles ?? ''}`}>
    <span className="is-empty-hint">Assign a datasource to edit Hero Banner content.</span>
  </div>
);

const HeroBannerDefault = (props: HeroBannerProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  const { fields } = props;

  return (
    <section className={`hero-banner hero-banner--default ${styles}`} id={id ?? undefined}>
      <div className="hero-banner__background relative w-full min-h-[600px] flex items-center">
        {fields?.BackgroundImage && (
          <JssImage
            field={fields.BackgroundImage}
            className="hero-banner__bg-image absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="hero-banner__overlay absolute inset-0 bg-black/40" />
        <div className="hero-banner__content container mx-auto px-4 relative z-10">
          <div className="hero-banner__text max-w-3xl">
            {fields?.Headline && (
              <Text
                field={fields.Headline}
                tag="h1"
                className="hero-banner__headline text-5xl md:text-6xl font-bold text-white mb-6"
              />
            )}
            {fields?.Subheadline && (
              <Text
                field={fields.Subheadline}
                tag="div"
                className="hero-banner__subheadline text-xl text-white/90 mb-8"
              />
            )}
            <div className="hero-banner__ctas flex gap-4">
              {fields?.CtaLink && (
                <JssLink
                  field={fields.CtaLink}
                  className="btn btn--primary bg-[var(--vargroup-blue)] hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                />
              )}
              {fields?.SecondaryCtaLink && (
                <JssLink
                  field={fields.SecondaryCtaLink}
                  className="btn btn--secondary border-2 border-white text-white hover:bg-white hover:text-[var(--vargroup-blue)] px-8 py-3 rounded-lg font-semibold transition-colors"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HeroBannerCentered = (props: HeroBannerProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  const { fields } = props;

  return (
    <section className={`hero-banner hero-banner--centered ${styles}`} id={id ?? undefined}>
      <div className="hero-banner__background relative w-full min-h-[600px] flex items-center">
        {fields?.BackgroundImage && (
          <JssImage
            field={fields.BackgroundImage}
            className="hero-banner__bg-image absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="hero-banner__overlay absolute inset-0 bg-black/40" />
        <div className="hero-banner__content container mx-auto px-4 text-center relative z-10">
          <div className="hero-banner__text max-w-4xl mx-auto">
            {fields?.Headline && (
              <Text
                field={fields.Headline}
                tag="h1"
                className="hero-banner__headline text-5xl md:text-7xl font-bold text-white mb-6"
              />
            )}
            {fields?.Subheadline && (
              <Text
                field={fields.Subheadline}
                tag="div"
                className="hero-banner__subheadline text-xl text-white/90 mb-8"
              />
            )}
            <div className="hero-banner__ctas flex gap-4 justify-center">
              {fields?.CtaLink && (
                <JssLink
                  field={fields.CtaLink}
                  className="btn btn--primary bg-[var(--vargroup-blue)] hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                />
              )}
              {fields?.SecondaryCtaLink && (
                <JssLink
                  field={fields.SecondaryCtaLink}
                  className="btn btn--secondary border-2 border-white text-white hover:bg-white hover:text-[var(--vargroup-blue)] px-8 py-3 rounded-lg font-semibold transition-colors"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HeroBannerCompact = (props: HeroBannerProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  const { fields } = props;

  return (
    <section className={`hero-banner hero-banner--compact ${styles}`} id={id ?? undefined}>
      <div className="hero-banner__background relative w-full min-h-[400px] flex items-center">
        {fields?.BackgroundImage && (
          <JssImage
            field={fields.BackgroundImage}
            className="hero-banner__bg-image absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="hero-banner__overlay absolute inset-0 bg-black/40" />
        <div className="hero-banner__content container mx-auto px-4 relative z-10">
          <div className="hero-banner__text max-w-2xl">
            {fields?.Headline && (
              <Text
                field={fields.Headline}
                tag="h1"
                className="hero-banner__headline text-4xl md:text-5xl font-bold text-white mb-4"
              />
            )}
            {fields?.CtaLink && (
              <JssLink
                field={fields.CtaLink}
                className="btn btn--primary bg-[var(--vargroup-blue)] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors inline-block"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Default = (props: ComponentProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;

  if (!props.fields) {
    return <DefaultComponent {...props} />;
  }

  return <HeroBannerDefault {...props} isPageEditing={isEditing} />;
};

export const Centered = (props: ComponentProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;

  if (!props.fields) {
    return <DefaultComponent {...props} />;
  }

  return <HeroBannerCentered {...props} isPageEditing={isEditing} />;
};

export const Compact = (props: ComponentProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;

  if (!props.fields) {
    return <DefaultComponent {...props} />;
  }

  return <HeroBannerCompact {...props} isPageEditing={isEditing} />;
};
