'use client';

import type React from 'react';
import { useState } from 'react';
import { RichText as ContentSdkRichText } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { Plus, Minus } from 'lucide-react';
import Link from 'next/link';

interface FooterFields {
  DisclaimerText?: { value?: string };
}

type FooterProps = ComponentProps & {
  fields?: FooterFields;
};

const ACCORDION_ITEMS = [
  { title: 'Insurance', id: 'insurance' },
  { title: 'Energy', id: 'energy' },
  { title: 'Finance', id: 'finance' },
  { title: 'Broadband & Mobile', id: 'broadband-mobile' },
];

const DEFAULT_DISCLAIMER = `*Important information*

Rewards - Single annual policy. Qualifying products. App only. Maximum claim limit. One regular hot drink per month for a year, only available via the Confused.com app. T&Cs apply.

Savings - Based on data provided by Consumer Intelligence Ltd, www.consumerintelligence.com (January '26). 51% of Confused.com car insurance customers could save £529.15 and 51% of home insurance customers could save £196.91 on a combined policy.

Trustpilot - Based on data provided by Trustpilot, Confused.com scores a 4.3 out of 5 rating based on 9858 reviews as of 06/01/2026.

Insurance companies - Correct as of February 2026`;

const BOTTOM_LINKS = [
  { label: 'About us', href: '#' },
  { label: 'Help', href: '#' },
  { label: 'Contact us', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Magazine', href: '#' },
  { label: 'Press', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Accessibility', href: '#' },
  { label: 'Terms & conditions', href: '#' },
  { label: 'All products', href: '#' },
];

/**
 * Footer component styled after Confused.com - dark theme with accordion navigation,
 * important information/disclaimer section, and bottom navigation links.
 */
export const Default: React.FC<FooterProps> = (props) => {
  const { fields } = props;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const disclaimerContent = fields?.DisclaimerText?.value ?? DEFAULT_DISCLAIMER;
  const useContentSdkDisclaimer = Boolean(fields?.DisclaimerText);

  const handleAccordionClick = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <footer className="bg-confused-dark text-white">
      {/* Accordion navigation section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="divide-y divide-white/10">
          {ACCORDION_ITEMS.map((item, index) => (
            <div key={item.id} className="border-b border-white/10 last:border-b-0">
              <button
                type="button"
                onClick={() => handleAccordionClick(index)}
                className="flex w-full items-center justify-between py-4 text-left text-base font-medium text-white hover:bg-white/5 transition-colors"
                aria-expanded={expandedIndex === index}
                aria-controls={`footer-accordion-${item.id}`}
                id={`footer-accordion-trigger-${item.id}`}
              >
                <span>{item.title}</span>
                {expandedIndex === index ? (
                  <Minus className="h-5 w-5 flex-shrink-0" aria-hidden />
                ) : (
                  <Plus className="h-5 w-5 flex-shrink-0" aria-hidden />
                )}
              </button>
              <div
                id={`footer-accordion-${item.id}`}
                role="region"
                aria-labelledby={`footer-accordion-trigger-${item.id}`}
                hidden={expandedIndex !== index}
                className="overflow-hidden"
              >
                {expandedIndex === index && (
                  <div className="pb-4 pl-0 text-sm text-white/90">
                    <p className="text-white/70">Sub-navigation links would appear here when expanded.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important information section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-t border-white/10 pt-8">
          {useContentSdkDisclaimer && fields?.DisclaimerText ? (
            <div className="text-sm text-white/90 [&_*]:text-white/90 [&_p]:mb-1">
              <ContentSdkRichText field={fields.DisclaimerText} />
            </div>
          ) : (
            <div className="text-sm text-white/90 whitespace-pre-line">
              {disclaimerContent.split('\n').map((line, i) => (
                <p key={i} className={line.startsWith('*') ? 'italic mb-2' : 'mb-1'}>
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation links */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-6 text-sm"
            aria-label="Footer navigation"
          >
            {BOTTOM_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-white hover:text-white/80 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="h-px bg-white/10" />
      </div>
    </footer>
  );
};
