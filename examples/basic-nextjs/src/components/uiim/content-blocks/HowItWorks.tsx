import React, { JSX } from 'react';
import {
  Text,
  RichText as ContentSdkRichText,
  Field,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// GraphQL datasource types
// ---------------------------------------------------------------------------

type HowItWorksStepResult = {
  id: string;
  description: { jsonValue: Field<string> };
};

type HowItWorksFields = {
  data: {
    datasource?: {
      eyebrowText?: { jsonValue: Field<string> };
      title?: { jsonValue: Field<string> };
      children?: {
        results: HowItWorksStepResult[];
      };
    };
  };
};

type HowItWorksProps = ComponentProps & {
  fields: HowItWorksFields;
};

// ---------------------------------------------------------------------------
// Empty-state fallback
// ---------------------------------------------------------------------------

const HowItWorksDefaultComponent = (): JSX.Element => (
  <div className="component how-it-works">
    <div className="component-content">
      <span className="is-empty-hint">HowItWorks</span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Default variant
// ---------------------------------------------------------------------------

export const Default = ({ fields, params }: HowItWorksProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;

  const { data } = fields || {};
  const { datasource } = data || {};

  if (!datasource) return <HowItWorksDefaultComponent />;

  const { eyebrowText, title, children } = datasource;
  const steps = children?.results ?? [];

  return (
    <div
      className={cn('component how-it-works', styles)}
      id={RenderingIdentifier}
    >
      <div className="component-content">
        <section className="bg-[#f5f5f5] py-14 px-4">
          <div className="mx-auto max-w-4xl text-center">
            {/* Eyebrow */}
            {eyebrowText?.jsonValue && (
              <Text
                tag="p"
                field={eyebrowText.jsonValue}
                className="text-[#e4002b] text-xs font-bold uppercase tracking-widest mb-3"
              />
            )}

            {/* Title */}
            {title?.jsonValue && (
              <Text
                tag="h2"
                field={title.jsonValue}
                className="text-[#1a2d5a] text-2xl md:text-3xl font-extrabold mb-10"
              />
            )}

            {/* Steps grid */}
            {steps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center gap-4 text-center">
                    {/* Step number circle */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a2d5a] text-white font-bold text-lg flex-shrink-0">
                      {index + 1}
                    </div>

                    {/* Step description */}
                    {step.description?.jsonValue && (
                      <ContentSdkRichText
                        field={step.description.jsonValue}
                        className="text-[#333] text-sm leading-relaxed max-w-[220px] mx-auto"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
