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

function SageFAQItem({
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
    <div
      className="border-b"
      style={{ borderColor: 'var(--brand-border)' }}
      data-testid={`faq-item-${index}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        style={{ color: 'var(--brand-fg)', fontFamily: 'var(--brand-body-font)' }}
        aria-expanded={isOpen}
      >
        {(question?.value || isEditing) && (
          <Text
            field={question}
            tag="span"
            className="text-base font-semibold md:text-lg"
            style={{ color: 'var(--brand-fg)' }}
            data-testid="faq-question"
          />
        )}
        <ChevronDown
          className={cn('h-5 w-5 flex-shrink-0 transition-transform', isOpen && 'rotate-180')}
          style={{ color: 'var(--brand-primary)' }}
        />
      </button>
      {isOpen && (answer?.value || isEditing) && (
        <div
          className="pb-5 pr-10 text-sm md:text-base"
          style={{
            color: 'var(--brand-muted-foreground)',
            borderLeft: '2px solid var(--brand-primary)',
            paddingLeft: '0.75rem',
          }}
          data-testid="faq-answer"
        >
          <ContentSdkRichText field={answer} />
        </div>
      )}
    </div>
  );
}

export const Sage = ({ params, page }: ComponentProps): JSX.Element => {
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
      <section
        className="py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg)', color: 'var(--brand-fg)' }}
        data-testid="landing-faq"
      >
        <div className="mx-auto max-w-3xl px-4">
          <h2
            className="mb-10 text-center text-3xl tracking-tight md:text-4xl"
            style={{
              color: 'var(--brand-fg)',
              fontFamily: 'var(--brand-heading-font)',
              fontWeight: 900,
            }}
          >
            Frequently asked questions
          </h2>
          <div className="border-t" style={{ borderColor: 'var(--brand-border)' }}>
            {items.map((item, i) => (
              <SageFAQItem
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

export const Default = (props: ComponentProps): JSX.Element => <Sage {...props} />;
