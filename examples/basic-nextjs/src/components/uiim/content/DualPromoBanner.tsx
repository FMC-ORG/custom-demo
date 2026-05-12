'use client';

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

interface DualPromoBlockFields {
  id: string;
  blockTitle: { jsonValue: Field<string> };
  blockDescription: { jsonValue: Field<string> };
  blockLink: { jsonValue: LinkField };
}

interface DualPromoBannerDatasource {
  promoImage: { jsonValue: ImageField };
  children: {
    results: DualPromoBlockFields[];
  };
}

interface DualPromoBannerFields {
  data: {
    datasource: DualPromoBannerDatasource;
  };
}

type DualPromoBannerProps = ComponentProps & {
  fields: DualPromoBannerFields;
};

const DualPromoBannerDefaultComponent = (): JSX.Element => (
  <div className="component dual-promo-banner">
    <div className="component-content">
      <span className="is-empty-hint">DualPromoBanner</span>
    </div>
  </div>
);

/* ────────────────────────────────────────────
   Default — Worldpay GPR 2026 style: image left, two content blocks right
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: DualPromoBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;

  if (!datasource) return <DualPromoBannerDefaultComponent />;

  const blocks = datasource.children?.results || [];

  return (
    <div className={cn('component dual-promo-banner', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-12 md:py-20" style={{ backgroundColor: '#F8F7FC' }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid items-stretch gap-8 md:grid-cols-2">
            {/* Left — Promo image */}
            <div className="overflow-hidden rounded-2xl">
              {(datasource.promoImage?.jsonValue?.value?.src || isEditing) && (
                <ContentSdkImage
                  field={datasource.promoImage?.jsonValue}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            {/* Right — Stacked content blocks */}
            <div className="flex flex-col justify-center gap-8">
              {blocks.map((block, idx) => (
                <div key={block.id} className="space-y-3">
                  {(block.blockTitle?.jsonValue?.value || isEditing) && (
                    <Text
                      field={block.blockTitle?.jsonValue}
                      tag="h3"
                      className="text-2xl font-bold tracking-tight"
                      style={{ color: '#00237D' }}
                    />
                  )}
                  {(block.blockDescription?.jsonValue?.value || isEditing) && (
                    <ContentSdkRichText
                      field={block.blockDescription?.jsonValue}
                      className="text-base text-gray-600"
                    />
                  )}
                  {(block.blockLink?.jsonValue?.value?.href || isEditing) && (
                    <ContentSdkLink
                      field={block.blockLink?.jsonValue}
                      className={cn(
                        'mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90',
                        idx === 0
                          ? 'bg-[#00237D] text-white'
                          : 'border-2 border-[#00237D] bg-transparent text-[#00237D] hover:bg-[#00237D] hover:text-white'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
