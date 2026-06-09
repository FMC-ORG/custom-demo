'use client';

import React, { JSX, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Field,
  RichTextField,
  Text,
  RichText as ContentSdkRichText,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface LandingFAQRouteFields {
  faq1Question?: Field<string>;
  faq1Answer?: RichTextField;
  faq2Question?: Field<string>;
  faq2Answer?: RichTextField;
  faq3Question?: Field<string>;
  faq3Answer?: RichTextField;
  faq4Question?: Field<string>;
  faq4Answer?: RichTextField;
  faq5Question?: Field<string>;
  faq5Answer?: RichTextField;
}

const LandingFAQDefaultComponent = (): JSX.Element => (
  <div className="component landing-faq">
    <div className="component-content">
      <span className="is-empty-hint">LandingFAQ</span>
    </div>
  </div>
);

function getRouteFields(page: ComponentProps['page']): LandingFAQRouteFields | null {
  const fields = page?.layout?.sitecore?.route?.fields;
  return fields ? (fields as unknown as LandingFAQRouteFields) : null;
}

function FAQItem({
  index,
  question,
  answer,
  isOpen,
  onToggle,
  isEditing,
}: {
  index: number;
  question?: Field<string>;
  answer?: RichTextField;
  isOpen: boolean;
  onToggle: () => void;
  isEditing?: boolean;
}) {
  if (!question?.value && !answer?.value && !isEditing) return null;
  return (
    <div className="border-b border-gray-200" data-testid={`faq-item-${index}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={isOpen}
      >
        {(question?.value || isEditing) && (
          <Text
            field={question}
            tag="span"
            className="text-base font-semibold text-gray-900 md:text-lg"
            data-testid="faq-question"
          />
        )}
        <ChevronDown
          className={cn(
            'h-5 w-5 flex-shrink-0 text-gray-500 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && (answer?.value || isEditing) && (
        <div
          className="pb-5 pr-10 text-sm text-gray-600 md:text-base"
          data-testid="faq-answer"
        >
          <ContentSdkRichText field={answer} />
        </div>
      )}
    </div>
  );
}

export const Default = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!routeFields) return <LandingFAQDefaultComponent />;

  const items = [
    { question: routeFields.faq1Question, answer: routeFields.faq1Answer },
    { question: routeFields.faq2Question, answer: routeFields.faq2Answer },
    { question: routeFields.faq3Question, answer: routeFields.faq3Answer },
    { question: routeFields.faq4Question, answer: routeFields.faq4Answer },
    { question: routeFields.faq5Question, answer: routeFields.faq5Answer },
  ];

  return (
    <div className={cn('component landing-faq', styles)} id={RenderingIdentifier}>
      <section className="bg-white py-16 md:py-24" data-testid="landing-faq">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Frequently asked questions
          </h2>
          <div className="border-t border-gray-200">
            {items.map((item, i) => (
              <FAQItem
                key={i}
                index={i + 1}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                isEditing={isEditing}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
