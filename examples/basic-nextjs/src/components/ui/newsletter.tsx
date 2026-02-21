'use client';

import type React from 'react';
import { useState } from 'react';
import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Default layout service sends fields with PascalCase keys and .value
 * (no GraphQL query on rendering = no data.datasource / jsonValue wrapper)
 */
interface NewsletterFields {
  Title?: { value?: string };
  Description?: { value?: string };
  FirstNameLabel?: { value?: string };
  LastNameLabel?: { value?: string };
  EmailLabel?: { value?: string };
  PlaceholderFirst?: { value?: string };
  PlaceholderLast?: { value?: string };
  PlaceholderEmail?: { value?: string };
  SubmitButtonText?: { value?: string };
  PrivacyDisclaimer?: { value?: string };
}

interface NewsletterParams {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface NewsletterProps extends ComponentProps {
  params: NewsletterParams;
  fields: NewsletterFields;
  isPageEditing?: boolean;
}

const DEFAULT_NEWSLETTER = {
  Title: 'Sign up to our free Saga Magazine newsletter',
  Description:
    'Get inspiring real-life stories, expert health advice, finance news and our hugely popular puzzles delivered direct to your inbox. Plus news and offers from Saga Magazine and our carefully chosen partners.',
  FirstNameLabel: 'First name',
  LastNameLabel: 'Last name',
  EmailLabel: 'Email Address',
  PlaceholderFirst: 'First name',
  PlaceholderLast: 'Last name',
  PlaceholderEmail: 'Email Address',
  SubmitButtonText: 'Subscribe',
  PrivacyDisclaimer:
    'By providing your details you will receive emails with related content and offers from Saga. You can unsubscribe at any time.',
};

const NewsletterComponent: React.FC<NewsletterProps> = (props) => {
  const { fields, isPageEditing } = props;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const title = fields?.Title?.value;
  const description = fields?.Description?.value;
  const firstNameLabel = fields?.FirstNameLabel?.value;
  const lastNameLabel = fields?.LastNameLabel?.value;
  const emailLabel = fields?.EmailLabel?.value;
  const placeholderFirst = fields?.PlaceholderFirst?.value;
  const placeholderLast = fields?.PlaceholderLast?.value;
  const placeholderEmail = fields?.PlaceholderEmail?.value;
  const submitButtonText = fields?.SubmitButtonText?.value;
  const privacyDisclaimer = fields?.PrivacyDisclaimer?.value;

  const hasContent =
    title ||
    description ||
    firstNameLabel ||
    lastNameLabel ||
    emailLabel ||
    submitButtonText ||
    privacyDisclaimer;

  if (!hasContent && !isPageEditing) {
    return (
      <section className="py-12 md:py-16 bg-saga-light-blue w-screen relative left-1/2 -translate-x-1/2 overflow-x-hidden">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">Newsletter: No datasource configured</p>
        </div>
      </section>
    );
  }

  const d = DEFAULT_NEWSLETTER;
  const showTitle = title || isPageEditing;
  const showDescription = description || isPageEditing;
  const showFirstNameLabel = firstNameLabel || isPageEditing;
  const showLastNameLabel = lastNameLabel || isPageEditing;
  const showEmailLabel = emailLabel || isPageEditing;
  const showSubmitButton = submitButtonText || isPageEditing;
  const showPrivacyDisclaimer = privacyDisclaimer || isPageEditing;

  return (
    <section className="py-12 md:py-16 bg-saga-light-blue w-screen relative left-1/2 -translate-x-1/2 overflow-x-hidden">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-1 h-8 bg-saga-teal rounded-full mt-1 flex-shrink-0" />
          {showTitle &&
            (fields?.Title ? (
              <Text
                field={fields.Title}
                tag="h2"
                className="text-2xl md:text-3xl font-bold text-saga-navy text-balance"
              />
            ) : (
              <h2 className="text-2xl md:text-3xl font-bold text-saga-navy text-balance">
                {title || d.Title}
              </h2>
            ))}
        </div>
        {(showDescription || description) && (
          fields?.Description ? (
            <Text
              field={fields.Description}
              tag="p"
              className="text-sm text-saga-navy/70 mb-8 ml-4 leading-relaxed"
            />
          ) : (
            <p className="text-sm text-saga-navy/70 mb-8 ml-4 leading-relaxed">
              {description || d.Description}
            </p>
          )
        )}

        {/* Form */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-background rounded-xl p-6 md:p-8 shadow-sm border border-border/50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              {showFirstNameLabel && (
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-saga-navy mb-1.5"
                >
                  {fields?.FirstNameLabel ? (
                    <>
                      <Text
                        field={fields.FirstNameLabel}
                        tag="span"
                        className="text-sm font-semibold text-saga-navy"
                      />{' '}
                      <span className="text-destructive">*</span>
                    </>
                  ) : (
                    <>
                      {firstNameLabel || d.FirstNameLabel} <span className="text-destructive">*</span>
                    </>
                  )}
                </label>
              )}
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={placeholderFirst || d.PlaceholderFirst}
                className="w-full rounded-md border border-input px-3 py-2.5 text-sm text-saga-navy placeholder:text-saga-navy/40 focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>
            <div>
              {showLastNameLabel && (
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-saga-navy mb-1.5"
                >
                  {fields?.LastNameLabel ? (
                    <>
                      <Text
                        field={fields.LastNameLabel}
                        tag="span"
                        className="text-sm font-semibold text-saga-navy"
                      />{' '}
                      <span className="text-destructive">*</span>
                    </>
                  ) : (
                    <>
                      {lastNameLabel || d.LastNameLabel} <span className="text-destructive">*</span>
                    </>
                  )}
                </label>
              )}
              <input
                id="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={placeholderLast || d.PlaceholderLast}
                className="w-full rounded-md border border-input px-3 py-2.5 text-sm text-saga-navy placeholder:text-saga-navy/40 focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              {showEmailLabel && (
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-saga-navy mb-1.5"
                >
                  {fields?.EmailLabel ? (
                    <>
                      <Text
                        field={fields.EmailLabel}
                        tag="span"
                        className="text-sm font-semibold text-saga-navy"
                      />{' '}
                      <span className="text-destructive">*</span>
                    </>
                  ) : (
                    <>
                      {emailLabel || d.EmailLabel} <span className="text-destructive">*</span>
                    </>
                  )}
                </label>
              )}
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholderEmail || d.PlaceholderEmail}
                className="w-full rounded-md border border-input px-3 py-2.5 text-sm text-saga-navy placeholder:text-saga-navy/40 focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>
            {showSubmitButton && (
              <button
                type="submit"
                className="rounded-md border-2 border-saga-navy bg-background px-6 py-2.5 text-sm font-semibold text-saga-navy hover:bg-saga-navy hover:text-white transition-colors whitespace-nowrap"
              >
                {fields?.SubmitButtonText ? (
                  <Text
                    field={fields.SubmitButtonText}
                    tag="span"
                    className="text-sm font-semibold text-saga-navy"
                  />
                ) : (
                  (submitButtonText || d.SubmitButtonText)
                )}
              </button>
            )}
          </div>
          {showPrivacyDisclaimer && (
            <div className="mt-4 text-xs text-saga-navy/60 leading-relaxed">
              {fields?.PrivacyDisclaimer ? (
                <Text
                  field={fields.PrivacyDisclaimer}
                  tag="p"
                  className="mt-4 text-xs text-saga-navy/60 leading-relaxed"
                />
              ) : (
                <p className="mt-4 text-xs text-saga-navy/60 leading-relaxed">
                  {privacyDisclaimer || d.PrivacyDisclaimer}
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

/**
 * Default export for Sitecore component registration
 */
export const Default: React.FC<NewsletterProps> = (props) => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  return <NewsletterComponent {...props} isPageEditing={isPageEditing} />;
};
