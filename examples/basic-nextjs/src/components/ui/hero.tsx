'use client';

import type React from 'react';
import Link from 'next/link';
import { Text, Image as SitecoreImage } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Default layout service sends fields with PascalCase keys and .value
 * (no GraphQL query on rendering = no data.datasource / jsonValue wrapper)
 */
interface HeroFields {
  Title?: { value?: string };
  Description?: { value?: string };
  BackgroundImage?: { value?: { src?: string; alt?: string } };
  CtaLink?: { value?: { href?: string; text?: string } };
}

interface HeroParams {
  [key: string]: any; // eslint-disable-line
}

interface HeroProps extends ComponentProps {
  params: HeroParams;
  fields: HeroFields;
  isPageEditing?: boolean;
}

const HeroComponent: React.FC<HeroProps> = (props) => {
  const { fields, isPageEditing } = props;
  const title = fields?.Title?.value;
  const description = fields?.Description?.value;
  const backgroundImage = fields?.BackgroundImage?.value;
  const ctaLink = fields?.CtaLink?.value;
  const ctaHref = ctaLink?.href || '#';
  const ctaText = ctaLink?.text || 'Boost your savings';

  const hasContent = title || description || backgroundImage?.src || ctaLink?.href;

  if (!hasContent && !isPageEditing) {
    return (
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[500px] md:h-[560px] flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">Hero: No datasource configured</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[500px] md:h-[560px]">
        {(backgroundImage?.src || isPageEditing) && fields.BackgroundImage && (
          <SitecoreImage
            field={fields.BackgroundImage}
            className="object-cover w-full h-full"
          />
        )}

        <div className="absolute inset-0 flex items-center">
          <div className="mx-4 sm:mx-8 md:mx-16 lg:mx-20 max-w-lg">
            <div className="bg-background/95 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg">
              {(title || isPageEditing) && (
                <Text
                  field={fields.Title}
                  tag="h1"
                  className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-saga-navy leading-tight tracking-tight text-balance"
                />
              )}
              {(description || isPageEditing) && (
                <Text
                  field={fields.Description}
                  tag="p"
                  className="mt-4 text-sm md:text-base text-saga-navy/80 leading-relaxed"
                />
              )}
              {(ctaLink?.href || ctaText || isPageEditing) && (
                <Link
                  href={ctaHref}
                  className="mt-6 inline-block w-full text-center rounded-md bg-saga-navy px-8 py-3.5 text-sm font-semibold text-white hover:bg-saga-dark-navy transition-colors"
                >
                  {ctaText}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Default: React.FC<HeroProps> = (props) => {
  const { page } = props;
  const isPageEditing = page.mode.isEditing;
  return <HeroComponent {...props} isPageEditing={isPageEditing} />;
};
