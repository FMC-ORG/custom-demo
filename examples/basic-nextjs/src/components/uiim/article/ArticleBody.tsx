import React, { JSX } from 'react';
import { hasRichText, hasText } from '@/lib/field-utils';
import {
  Field,
  ImageField,
  LinkField,
  RichText as ContentSdkRichText,
  RichTextField,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';
import { PersonReference } from 'src/Layout';

interface ArticleBodyRouteFields {
  ArticleContent?: RichTextField;
  ArticleKeyTakeaways?: RichTextField;
  ArticleAuthor?: PersonReference;
}

const ArticleBodyDefaultComponent = (): JSX.Element => (
  <div className="component article-body">
    <div className="component-content">
      <span className="is-empty-hint">ArticleBody</span>
    </div>
  </div>
);

function getRouteFields(page: ComponentProps['page']): ArticleBodyRouteFields | null {
  const fields = page?.layout?.sitecore?.route?.fields;
  return fields ? (fields as unknown as ArticleBodyRouteFields) : null;
}

function KeyTakeaways({ field, isEditing }: { field?: RichTextField; isEditing?: boolean }) {
  if (!hasRichText(field?.value) && !isEditing) return null;

  return (
    <aside
      className="mb-10 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-6"
      data-testid="key-takeaways"
    >
      <h2 className="mb-3 text-lg font-semibold text-blue-900">Key Takeaways</h2>
      <ContentSdkRichText field={field} className="prose prose-sm max-w-none text-blue-800" />
    </aside>
  );
}

function AuthorBio({ author, isEditing }: { author?: PersonReference; isEditing?: boolean }) {
  if (!author?.fields && !isEditing) return null;
  const fields = author?.fields;

  return (
    <div className="mt-12 border-t pt-8" data-testid="author-bio">
      <div className="flex items-start gap-5">
        {(fields?.personProfileImage?.value?.src || isEditing) && (
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
            <ContentSdkImage
              field={fields?.personProfileImage as ImageField}
              className="h-full w-full object-cover"
              width={64}
              height={64}
            />
          </div>
        )}
        {(hasText(fields?.personFirstName?.value) ||
          hasText(fields?.personLastName?.value) ||
          isEditing ||
          hasText(fields?.personJobTitle?.value) ||
          hasRichText(fields?.personBio?.value) ||
          fields?.personLinkedIn?.value?.href) && (
          <div className="flex-1">
            {(hasText(fields?.personFirstName?.value) ||
              hasText(fields?.personLastName?.value) ||
              isEditing) && (
              <p className="text-lg font-semibold" data-testid="author-bio-name">
                <Text field={fields?.personFirstName as Field<string>} />{' '}
                <Text field={fields?.personLastName as Field<string>} />
              </p>
            )}
            {(hasText(fields?.personJobTitle?.value) || isEditing) && (
              <Text
                field={fields?.personJobTitle as Field<string>}
                tag="p"
                className="text-sm text-gray-500"
                data-testid="author-bio-title"
              />
            )}
            {(hasRichText(fields?.personBio?.value) || isEditing) && (
              <ContentSdkRichText
                field={fields?.personBio as RichTextField}
                className="mt-2 text-sm text-gray-600"
                data-testid="author-bio-text"
              />
            )}
            {(fields?.personLinkedIn?.value?.href || isEditing) && (
              <ContentSdkLink
                field={fields?.personLinkedIn as LinkField}
                className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
                data-testid="author-bio-linkedin"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Default — narrow centered column, takeaways above, bio below
   ──────────────────────────────────────────── */
export const Default = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);

  if (!routeFields) return <ArticleBodyDefaultComponent />;

  const { ArticleContent, ArticleKeyTakeaways, ArticleAuthor } = routeFields;

  return (
    <div className={cn('component article-body', styles)} id={RenderingIdentifier}>
      <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <KeyTakeaways field={ArticleKeyTakeaways} isEditing={isEditing} />

        {(hasRichText(ArticleContent?.value) || isEditing) && (
          <ContentSdkRichText
            field={ArticleContent}
            className="prose prose-lg max-w-none"
            data-testid="article-content"
          />
        )}

        <AuthorBio author={ArticleAuthor} isEditing={isEditing} />
      </article>
    </div>
  );
};

/* ────────────────────────────────────────────
   WithSidebar — body left (~65%), sticky sidebar right
   ──────────────────────────────────────────── */
export const WithSidebar = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);

  if (!routeFields) return <ArticleBodyDefaultComponent />;

  const { ArticleContent, ArticleKeyTakeaways, ArticleAuthor } = routeFields;

  return (
    <div className={cn('component article-body', styles)} id={RenderingIdentifier}>
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1fr_340px]">
          {/* Main content */}
          <article>
            {(hasRichText(ArticleContent?.value) || isEditing) && (
              <ContentSdkRichText
                field={ArticleContent}
                className="prose prose-lg max-w-none"
                data-testid="article-content"
              />
            )}
          </article>

          {/* Sidebar */}
          <aside className="md:sticky md:top-8 md:self-start" data-testid="article-sidebar">
            <KeyTakeaways field={ArticleKeyTakeaways} isEditing={isEditing} />
            <AuthorBio author={ArticleAuthor} isEditing={isEditing} />
          </aside>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   Wide — full-width body, inline takeaways, full-width author bio
   ──────────────────────────────────────────── */
export const Wide = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);

  if (!routeFields) return <ArticleBodyDefaultComponent />;

  const { ArticleContent, ArticleKeyTakeaways, ArticleAuthor } = routeFields;

  return (
    <div className={cn('component article-body', styles)} id={RenderingIdentifier}>
      <article className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <KeyTakeaways field={ArticleKeyTakeaways} isEditing={isEditing} />

          {(hasRichText(ArticleContent?.value) || isEditing) && (
            <ContentSdkRichText
              field={ArticleContent}
              className="prose prose-lg max-w-none"
              data-testid="article-content"
            />
          )}
        </div>

        {/* Full-width author bio band */}
        {(ArticleAuthor?.fields || isEditing) && (
          <div className="mt-12 bg-gray-50 px-4 py-10" data-testid="author-bio-band">
            <div className="mx-auto max-w-3xl">
              <AuthorBio author={ArticleAuthor} isEditing={isEditing} />
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

/* ────────────────────────────────────────────
   HeinekenPressRelease — corporate results release body: highlight sections (headings + bullets),
   executive quote attributed to ArticleAuthor, outlook body, conference-call details, PDF download.
   Section headings are authored inside the rich-text fields, never hardcoded.
   ──────────────────────────────────────────── */
interface PressReleaseBodyFields extends ArticleBodyRouteFields {
  ReleaseQuote?: Field<string>;
  ConferenceCallDetails?: RichTextField;
  ReleaseDownload?: LinkField;
}

const releaseProse =
  'font-body text-base leading-7 [&_a]:underline [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-[var(--brand-primary)] [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-[var(--brand-primary)] [&_li]:mb-2 [&_li]:pl-1 [&_li::marker]:text-[var(--brand-accent)] [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5';

export const HeinekenPressRelease = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page) as PressReleaseBodyFields | null;

  if (!routeFields) return <ArticleBodyDefaultComponent />;

  const { ArticleKeyTakeaways, ArticleContent, ArticleAuthor, ReleaseQuote, ConferenceCallDetails, ReleaseDownload } =
    routeFields;
  const author = ArticleAuthor?.fields;
  const hasAuthor =
    hasText(author?.personFirstName?.value) || hasText(author?.personLastName?.value) || isEditing;

  return (
    <div className={cn('component article-body heineken-press-release', styles)} id={RenderingIdentifier}>
      <article className="px-6 pb-16 lg:pb-20" style={{ background: 'var(--brand-bg)', color: 'var(--brand-fg)' }}>
        <div className="mx-auto max-w-[1024px]">
          {(hasRichText(ArticleKeyTakeaways?.value) || isEditing) && (
            <ContentSdkRichText field={ArticleKeyTakeaways} className={releaseProse} data-testid="release-highlights" />
          )}

          {(hasText(ReleaseQuote?.value) || isEditing) && (
            <figure
              className="my-12 rounded-[var(--brand-card-radius)] px-8 py-10 lg:px-14"
              style={{ background: 'color-mix(in srgb, var(--brand-primary) 7%, white)' }}
              data-testid="release-quote"
            >
              <span aria-hidden="true" className="block font-heading text-6xl leading-none" style={{ color: 'var(--brand-accent)' }}>
                &ldquo;
              </span>
              <Text
                field={ReleaseQuote}
                tag="blockquote"
                className="mt-2 font-heading text-lg italic leading-8 lg:text-xl"
                style={{ color: 'var(--brand-secondary)' }}
              />
              {hasAuthor && (
                <figcaption className="mt-6 font-body text-base" data-testid="release-quote-author">
                  <span className="font-semibold">
                    <Text field={author?.personFirstName as Field<string>} />{' '}
                    <Text field={author?.personLastName as Field<string>} />
                  </span>
                  {(hasText(author?.personJobTitle?.value) || isEditing) && (
                    <>
                      {', '}
                      <Text field={author?.personJobTitle as Field<string>} />
                    </>
                  )}
                </figcaption>
              )}
            </figure>
          )}

          {(hasRichText(ArticleContent?.value) || isEditing) && (
            <ContentSdkRichText field={ArticleContent} className={releaseProse} data-testid="release-outlook" />
          )}

          {(ReleaseDownload?.value?.href || isEditing) && (
            <div className="my-10" data-testid="release-download">
              <ContentSdkLink
                field={ReleaseDownload as LinkField}
                className="inline-flex items-center gap-3 rounded-[var(--brand-button-radius)] px-6 py-3 font-body font-semibold text-white hover:opacity-90"
                style={{ background: 'var(--brand-primary)' }}
              />
            </div>
          )}

          {(hasRichText(ConferenceCallDetails?.value) || isEditing) && (
            <ContentSdkRichText
              field={ConferenceCallDetails}
              className={cn(releaseProse, 'mt-10 border-t pt-8 text-sm')}
              data-testid="release-conference-call"
            />
          )}
        </div>
      </article>
    </div>
  );
};
