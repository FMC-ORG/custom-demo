'use client';

import type React from 'react';
import Link from 'next/link';
import { Text, Image as SitecoreImage, RichText } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Default layout service sends fields with PascalCase keys and .value
 * (no GraphQL query on rendering = no data.datasource / jsonValue wrapper)
 */
interface PromoCardFields {
  Image?: { value?: { src?: string; alt?: string } };
  Title?: { value?: string };
  IntroText?: { value?: string };
  BodyText?: { value?: string };
  CtaLink?: { value?: { href?: string; text?: string } };
}

interface PromoCardParams {
  [key: string]: any; // eslint-disable-line
}

interface PromoCardProps extends ComponentProps {
  params: PromoCardParams;
  fields: PromoCardFields;
  isPageEditing?: boolean;
}

const PromoCardComponent: React.FC<PromoCardProps> = (props) => {
  const { fields, isPageEditing } = props;
  const image = fields?.Image?.value;
  const title = fields?.Title?.value;
  const introText = fields?.IntroText?.value;
  const bodyText = fields?.BodyText?.value;
  const ctaLink = fields?.CtaLink?.value;
  const ctaHref = ctaLink?.href || '#';
  const ctaText = ctaLink?.text || 'Find out more';

  const hasContent =
    image?.src ||
    title ||
    introText ||
    bodyText ||
    ctaLink?.href ||
    ctaText;

  if (!hasContent && !isPageEditing) {
    return (
      <div className="rounded-t-xl overflow-hidden shadow-md bg-secondary p-6 font-serif">
        <p className="text-muted-foreground">PromoCard: No datasource configured</p>
      </div>
    );
  }

  return (
    <article className="rounded-t-xl overflow-hidden shadow-md">
      {(image?.src || isPageEditing) && fields.Image && (
        <SitecoreImage
          field={fields.Image}
          className="object-cover w-full aspect-[16/10]"
        />
      )}
      <div className="bg-secondary p-6 font-serif">
        {(title || isPageEditing) && (
          <Text
            field={fields.Title}
            tag="h2"
            className="text-xl font-bold text-saga-navy"
          />
        )}
        {(introText || isPageEditing) && fields.IntroText && (
          <div className="mt-2 [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80">
            <RichText field={fields.IntroText} />
          </div>
        )}
        {(bodyText || isPageEditing) && fields.BodyText && (
          <div className="mt-4 leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80 [&_p]:mb-2">
            <RichText field={fields.BodyText} />
          </div>
        )}
        {(ctaLink?.href || ctaText || isPageEditing) && (
          <Link
            href={ctaHref}
            className="mt-6 inline-block rounded-md bg-saga-navy px-6 py-3 text-sm font-semibold text-white hover:bg-saga-dark-navy transition-colors"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </article>
  );
};

export const Default: React.FC<PromoCardProps> = (props) => {
  const { page } = props;
  const isPageEditing = page?.mode?.isEditing ?? false;
  return <PromoCardComponent {...props} isPageEditing={isPageEditing} />;
};
