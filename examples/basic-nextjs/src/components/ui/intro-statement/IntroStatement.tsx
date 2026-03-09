'use client';

import type React from 'react';
import { LocaleAwareLink } from '@/components/ui/locale-link/LocaleAwareLink';
import {
  RichText as ContentSdkRichText,
  Text,
  Field,
  LinkField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * IntroStatement fields — no ComponentQuery, default JSS PascalCase shape.
 */
interface IntroStatementFields {
  Eyebrow?: Field<string>;
  Headline?: Field<string>;
  BodyText?: Field<string>;
  CTALabel?: Field<string>;
  CTALink?: LinkField;
}

interface IntroStatementProps extends ComponentProps {
  params: { [key: string]: string };
  fields?: IntroStatementFields;
}

/**
 * IntroStatement — centered text-only section, white background.
 * Displays an optional eyebrow tag, a headline (supports dual-tone via RichText bold),
 * body copy, and an optional CTA link.
 */
export const Default: React.FC<IntroStatementProps> = (props) => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const hasEyebrow = fields?.Eyebrow?.value || (isEditing && fields?.Eyebrow);
  const hasHeadline = fields?.Headline?.value || (isEditing && fields?.Headline);
  const hasBody = fields?.BodyText?.value || (isEditing && fields?.BodyText);
  const hasCta = fields?.CTALink?.value?.href || (isEditing && fields?.CTALink);

  const hasContent = hasEyebrow || hasHeadline || hasBody || hasCta;

  if (!fields || !hasContent) {
    return (
      <section
        className={cn('intro-statement py-16 bg-white text-center', styles)}
        id={id}
        data-testid="intro-statement"
      >
        <div className="max-w-3xl mx-auto px-6">
          <span className="is-empty-hint text-muted-foreground">Intro Statement</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn('intro-statement py-16 bg-white text-center', styles)}
      id={id}
      data-testid="intro-statement"
    >
      <div className="max-w-3xl mx-auto px-6">
        {(hasEyebrow || (isEditing && fields?.Eyebrow)) && fields?.Eyebrow && (
          <Text
            tag="p"
            field={fields.Eyebrow}
            className="field-eyebrow text-xs font-bold uppercase tracking-widest text-vg-muted mb-4"
          />
        )}
        {(hasHeadline || (isEditing && fields?.Headline)) && fields?.Headline && (
          <div className="field-headline text-4xl md:text-5xl font-bold leading-tight text-vg-dark mb-6">
            <ContentSdkRichText field={fields.Headline} />
          </div>
        )}
        {(hasBody || (isEditing && fields?.BodyText)) && fields?.BodyText && (
          <div className="field-bodytext text-base text-vg-body text-center max-w-xl mx-auto">
            <ContentSdkRichText field={fields.BodyText} />
          </div>
        )}
        {(hasCta || (isEditing && fields?.CTALink)) && fields?.CTALink && (
          <div className="mt-6">
            <LocaleAwareLink
              field={fields.CTALink}
              editable={isEditing}
              className="text-sm text-[#1d4ed8] font-medium hover:underline underline-offset-4 inline-flex items-center gap-1"
            >
              {fields?.CTALabel?.value || fields?.CTALink?.value?.text || ''}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </LocaleAwareLink>
          </div>
        )}
      </div>
    </section>
  );
};
