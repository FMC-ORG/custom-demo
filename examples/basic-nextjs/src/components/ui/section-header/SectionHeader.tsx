'use client';

import React, { JSX } from 'react';
import { Text, Field, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface SectionHeaderFields {
  SectionEyebrow?: Field<string>;
  SectionHeadline?: Field<string>;
  SectionSubheadline?: Field<string>;
  SectionSubtext?: Field<string>;
}

interface SectionHeaderProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: SectionHeaderFields;
    };
  } & SectionHeaderFields;
}

/**
 * SectionHeader - Centered section intro with eyebrow, headline, subheadline, and intro text.
 * Used to introduce content sections (e.g. FeatureCards) with clear visual hierarchy.
 */
export const Default = ({ params, fields }: SectionHeaderProps): JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource ?? fields;
  const eyebrow = datasource?.SectionEyebrow;
  const headline = datasource?.SectionHeadline;
  const subheadline = datasource?.SectionSubheadline;
  const subtext = datasource?.SectionSubtext;

  const hasContent =
    eyebrow?.value ||
    headline?.value ||
    subheadline?.value ||
    subtext?.value ||
    (isEditing && (eyebrow || headline || subheadline || subtext));

  if (!hasContent && !datasource) {
    return (
      <section
        className={cn('py-12', styles)}
        id={id}
        data-testid="section-header"
      >
        <div className="mx-auto max-w-3xl px-4 text-center">
          <span className="is-empty-hint text-muted-foreground">Section Header</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn('py-12', styles)}
      id={id}
      data-testid="section-header"
    >
      <div className="mx-auto max-w-3xl px-4 text-center">
        {(eyebrow?.value || (isEditing && eyebrow)) && (
          <Text
            tag="p"
            field={eyebrow}
            className="field-sectioneyebrow mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          />
        )}
        {(headline?.value || (isEditing && headline)) && (
          <Text
            tag="h2"
            field={headline}
            className="field-sectionheadline mb-2 text-3xl font-bold text-foreground sm:text-4xl"
          />
        )}
        {(subheadline?.value || (isEditing && subheadline)) && (
          <Text
            tag="p"
            field={subheadline}
            className="field-sectionsubheadline mb-4 text-lg text-muted-foreground"
          />
        )}
        {(subtext?.value || (isEditing && subtext)) && (
          <Text
            tag="p"
            field={subtext}
            className="field-sectionsubtext text-base text-muted-foreground"
          />
        )}
      </div>
    </section>
  );
};
