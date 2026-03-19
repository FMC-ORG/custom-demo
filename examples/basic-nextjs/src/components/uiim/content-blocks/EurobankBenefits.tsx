import React, { JSX } from 'react';
import {
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import type { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types (GraphQL datasource shape)
// ---------------------------------------------------------------------------

type JsonValueField = { jsonValue?: Field<string> };

type EurobankBenefitCard = {
  id?: string;
  category?: JsonValueField;
  title?: JsonValueField;
  body?: JsonValueField;
};

type EurobankBenefitsDatasource = {
  eyebrowText?: JsonValueField;
  title?: JsonValueField;
  children?: {
    results?: EurobankBenefitCard[];
  };
};

type EurobankBenefitsFields = {
  data?: {
    datasource?: EurobankBenefitsDatasource;
  };
};

type EurobankBenefitsProps = ComponentProps & {
  fields: EurobankBenefitsFields;
};

// ---------------------------------------------------------------------------
// Empty-state fallback
// ---------------------------------------------------------------------------

const EurobankBenefitsEmptyState = (): JSX.Element => (
  <div className="component eurobank-benefits">
    <div className="component-content">
      <span className="is-empty-hint">EurobankBenefits</span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Default variant
// ---------------------------------------------------------------------------

export const Default = ({ fields, params, page }: EurobankBenefitsProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params ?? {};
  const isEditing = page?.mode?.isEditing ?? false;

  const datasource = fields?.data?.datasource;
  if (!datasource) return <EurobankBenefitsEmptyState />;

  const cards = datasource.children?.results ?? [];

  return (
    <section
      className={cn('component eurobank-benefits', styles)}
      id={RenderingIdentifier}
    >
      <div className="component-content bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          {/* Section header */}
          <header className="text-center mb-10 md:mb-12">
            {(datasource.eyebrowText?.jsonValue?.value || isEditing) && (
              <Text
                tag="p"
                field={datasource.eyebrowText?.jsonValue}
                className="text-sm font-semibold uppercase tracking-wide mb-2 text-[#C42730]"
              />
            )}
            {(datasource.title?.jsonValue?.value || isEditing) && (
              <Text
                tag="h2"
                field={datasource.title?.jsonValue}
                className="text-2xl md:text-3xl font-bold leading-tight text-[#101E5D]"
              />
            )}
          </header>

          {/* Benefit cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
              <article
                key={card.id ?? undefined}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden text-left flex flex-col border-t-[3px] border-t-[#C42730] p-6"
              >
                {(card.category?.jsonValue?.value || isEditing) && (
                  <Text
                    tag="p"
                    field={card.category?.jsonValue}
                    className="text-xs font-semibold uppercase tracking-wide mb-2 text-[#C42730]"
                  />
                )}
                {(card.title?.jsonValue?.value || isEditing) && (
                  <Text
                    tag="h3"
                    field={card.title?.jsonValue}
                    className="text-lg font-bold mb-3 leading-snug text-[#101E5D]"
                  />
                )}
                {(card.body?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={card.body?.jsonValue}
                    className="prose prose-sm max-w-none text-gray-700"
                  />
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
