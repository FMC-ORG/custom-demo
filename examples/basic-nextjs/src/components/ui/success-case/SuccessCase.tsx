'use client';

import type React from 'react';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text,
  Field,
  ImageField,
  LinkField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import {
  ArrowRight,
  Facebook,
  Linkedin,
  Mail,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/** SuccessCaseSection child item from GraphQL */
interface SuccessCaseSectionItem {
  id: string;
  sectionHeadline?: { jsonValue?: Field<string> };
  sectionBody?: { jsonValue?: Field<string> };
  sectionLogo?: { jsonValue?: ImageField };
}

/** SuccessCase datasource — GraphQL shape with jsonValue */
interface SuccessCaseFields {
  data?: {
    datasource?: {
      heroBackgroundImage?: { jsonValue?: ImageField };
      categoryTags?: { jsonValue?: Field<string> };
      mainTitle?: { jsonValue?: Field<string> };
      quoteText?: { jsonValue?: Field<string> };
      quoteAttribution?: { jsonValue?: Field<string> };
      ctaLabel?: { jsonValue?: Field<string> };
      ctaLink?: { jsonValue?: LinkField };
      children?: {
        results?: SuccessCaseSectionItem[];
      };
    };
  };
}

/** X (Twitter) icon — Lucide has no X icon, use minimal SVG */
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface SuccessCaseProps extends ComponentProps {
  params: { [key: string]: string };
  fields?: SuccessCaseFields;
}

/**
 * SuccessCase — unified component for Case History / Success Case pages.
 * Renders hero, content sections, quote, and CTA from a single datasource.
 */
export const Default: React.FC<SuccessCaseProps> = (props) => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource;
  const heroImage = datasource?.heroBackgroundImage?.jsonValue;
  const categoryTags = datasource?.categoryTags?.jsonValue;
  const mainTitle = datasource?.mainTitle?.jsonValue;
  const quoteText = datasource?.quoteText?.jsonValue;
  const quoteAttribution = datasource?.quoteAttribution?.jsonValue;
  const ctaLabel = datasource?.ctaLabel?.jsonValue;
  const ctaLink = datasource?.ctaLink?.jsonValue;
  const sections = datasource?.children?.results ?? [];

  const hasHero =
    heroImage?.value?.src ||
    categoryTags?.value ||
    mainTitle?.value ||
    (isEditing && (heroImage || categoryTags || mainTitle));
  const hasSections = sections.length > 0 || isEditing;
  const hasQuote =
    quoteText?.value ||
    quoteAttribution?.value ||
    (isEditing && (quoteText || quoteAttribution));
  const hasCta = ctaLink?.value?.href || (isEditing && ctaLink);

  const hasContent = hasHero || hasSections || hasQuote || hasCta;

  if (!datasource || !hasContent) {
    return (
      <article
        className={cn('success-case', styles)}
        id={id}
        data-testid="success-case"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <span className="is-empty-hint text-muted-foreground">
            Success Case — select a datasource
          </span>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn('success-case', styles)}
      id={id}
      data-testid="success-case"
    >
      {/* Hero Section */}
      <section
        className="success-case-hero relative overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        {(heroImage?.value?.src || (isEditing && heroImage)) && heroImage && (
          <ContentSdkImage
            field={heroImage}
            editable={isEditing}
            fill
            className="object-cover"
            alt={(heroImage?.value?.alt ?? '') as string}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex min-h-[400px] flex-col items-center justify-end px-6 pb-12 pt-16 text-center">
          {/* Category tags — Rich Text or plain; split by comma for pills */}
          {(categoryTags?.value || (isEditing && categoryTags)) &&
            categoryTags && (
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                {categoryTags.value
                  ?.replace(/<[^>]*>/g, '')
                  .split(/[,|]/)
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .map((tag, i) => (
                    <span
                      key={i}
                      className="rounded bg-white/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white"
                    >
                      {tag}
                    </span>
                  ))}
                {isEditing && categoryTags && !categoryTags.value && (
                  <span className="rounded bg-white/20 px-3 py-1 text-xs text-white/80">
                    [category tags]
                  </span>
                )}
              </div>
            )}
          {(mainTitle?.value || (isEditing && mainTitle)) && mainTitle && (
            <div className="field-maintitle max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl">
              <ContentSdkRichText field={mainTitle} />
            </div>
          )}
          {/* Hardcoded social share icons */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <a
              href="https://www.facebook.com/sharer/sharer.php?u="
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Share on Facebook"
            >
              <Facebook className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="https://www.linkedin.com/sharing/share-offsite/?url="
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="https://twitter.com/intent/tweet?url="
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Share on X"
            >
              <XIcon className="h-4 w-4" />
            </a>
            <a
              href="mailto:?subject=&body="
              className="flex h-9 w-9 items-center justify-center rounded bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Share via Email"
            >
              <Mail className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Copy link"
            >
              <Link2 className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      {sections.length > 0 && (
        <div className="success-case-sections bg-white">
          {sections.map((section) => {
            const headline = section?.sectionHeadline?.jsonValue;
            const body = section?.sectionBody?.jsonValue;
            const logo = section?.sectionLogo?.jsonValue;
            const hasSectionContent =
              headline?.value ||
              body?.value ||
              logo?.value?.src ||
              (isEditing && (headline || body || logo));

            if (!hasSectionContent) return null;

            return (
              <div key={section.id}>
                <section className="border-b border-gray-200 py-12 last:border-b-0">
                  <div className="mx-auto max-w-7xl px-4">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                      <div className="lg:col-span-1">
                        {(logo?.value?.src || (isEditing && logo)) &&
                          logo && (
                            <div className="mb-4">
                              <ContentSdkImage
                                field={logo}
                                editable={isEditing}
                                width={120}
                                height={80}
                                className="object-contain"
                                alt={(logo?.value?.alt ?? '') as string}
                              />
                            </div>
                          )}
                        {(headline?.value || (isEditing && headline)) &&
                          headline && (
                            <Text
                              tag="h2"
                              field={headline}
                              className="field-sectionheadline text-xl font-bold text-vg-dark sm:text-2xl"
                            />
                          )}
                      </div>
                      <div className="lg:col-span-2">
                        {(body?.value || (isEditing && body)) && body && (
                          <div className="field-sectionbody text-base text-vg-body">
                            <ContentSdkRichText field={body} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            );
          })}
        </div>
      )}

      {/* Quote Block */}
      {(quoteText?.value || quoteAttribution?.value || (isEditing && (quoteText || quoteAttribution))) && (
        <section className="success-case-quote bg-vg-surface py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            {(quoteText?.value || (isEditing && quoteText)) && quoteText && (
              <blockquote className="field-quotetext border-l-4 border-[#1d4ed8] pl-6 text-xl italic text-vg-dark md:text-2xl">
                <ContentSdkRichText field={quoteText} />
              </blockquote>
            )}
            {(quoteAttribution?.value ||
              (isEditing && quoteAttribution)) &&
              quoteAttribution && (
                <cite className="field-quoteattribution mt-4 block not-italic text-sm font-medium text-vg-muted">
                  <Text tag="span" field={quoteAttribution} />
                </cite>
              )}
          </div>
        </section>
      )}

      {/* CTA Block */}
      {(ctaLink?.value?.href || (isEditing && ctaLink)) && ctaLink && (
        <section className="success-case-cta bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <ContentSdkLink
              field={ctaLink}
              editable={isEditing}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1d4ed8] underline-offset-4 hover:underline"
            >
              {ctaLabel?.value || ctaLink?.value?.text || 'Contact us to learn more'}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ContentSdkLink>
          </div>
        </section>
      )}
    </article>
  );
};
