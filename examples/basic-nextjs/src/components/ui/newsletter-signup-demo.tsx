'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Text, Link as SitecoreLink, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Newsletter Signup Demo - SitecoreAI-compatible form component.
 * Accepts datasource fields; falls back to static content when none configured.
 * Submit is faked for demo purposes.
 */

const STATIC = {
  TITLE: 'Sign up to our free Saga Magazine newsletter',
  DESCRIPTION:
    'Get inspiring real-life stories, expert health advice, finance news and our hugely popular puzzles delivered direct to your inbox. Plus news and offers from Saga Magazine and our carefully chosen partners.',
  FIRST_NAME_LABEL: 'First name',
  LAST_NAME_LABEL: 'Last name',
  EMAIL_LABEL: 'Email Address',
  PLACEHOLDER_FIRST: 'First name',
  PLACEHOLDER_LAST: 'Last name',
  PLACEHOLDER_EMAIL: 'Email Address',
  VALIDATION_FIRST: 'Please enter a valid first name',
  VALIDATION_LAST: 'Please enter a valid surname',
  VALIDATION_EMAIL: 'Please enter a valid email address',
  SUBMIT_BUTTON: 'Subscribe',
  DISCLAIMER:
    'By providing your details you will receive emails with related content and offers from Saga. You can unsubscribe at any time.',
  PRIVACY_PREFIX: 'For information about how we use your personal information, please view our ',
  PRIVACY_LINK: 'Privacy Policy',
  PRIVACY_SUFFIX: '.',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s'-]{2,}$/;

interface NewsletterSignupDemoFields {
  Title?: { value?: string };
  Description?: { value?: string };
  FirstNameLabel?: { value?: string };
  LastNameLabel?: { value?: string };
  EmailLabel?: { value?: string };
  PlaceholderFirst?: { value?: string };
  PlaceholderLast?: { value?: string };
  PlaceholderEmail?: { value?: string };
  ValidationFirst?: { value?: string };
  ValidationLast?: { value?: string };
  ValidationEmail?: { value?: string };
  SubmitButtonText?: { value?: string };
  Disclaimer?: { value?: string };
  PrivacyPrefix?: { value?: string };
  PrivacyLinkText?: { value?: string };
  PrivacySuffix?: { value?: string };
  PrivacyLink?: { value?: { href?: string; text?: string } };
}

interface NewsletterSignupDemoProps extends ComponentProps {
  fields?: NewsletterSignupDemoFields;
  isPageEditing?: boolean;
}

const ValidationIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const NewsletterSignupDemoComponent: React.FC<NewsletterSignupDemoProps> = (props) => {
  const { params, fields, isPageEditing } = props;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const firstNameInvalid = submitted && !NAME_REGEX.test(firstName.trim());
  const lastNameInvalid = submitted && !NAME_REGEX.test(lastName.trim());
  const emailInvalid = submitted && !EMAIL_REGEX.test(email.trim());
  const isValid =
    NAME_REGEX.test(firstName.trim()) &&
    NAME_REGEX.test(lastName.trim()) &&
    EMAIL_REGEX.test(email.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (isValid) {
      setSubmittedSuccess(true);
      // Fake submit - no backend action
    }
  };

  const title = fields?.Title?.value ?? STATIC.TITLE;
  const description = fields?.Description?.value ?? STATIC.DESCRIPTION;
  const firstNameLabel = fields?.FirstNameLabel?.value ?? STATIC.FIRST_NAME_LABEL;
  const lastNameLabel = fields?.LastNameLabel?.value ?? STATIC.LAST_NAME_LABEL;
  const emailLabel = fields?.EmailLabel?.value ?? STATIC.EMAIL_LABEL;
  const placeholderFirst = fields?.PlaceholderFirst?.value ?? STATIC.PLACEHOLDER_FIRST;
  const placeholderLast = fields?.PlaceholderLast?.value ?? STATIC.PLACEHOLDER_LAST;
  const placeholderEmail = fields?.PlaceholderEmail?.value ?? STATIC.PLACEHOLDER_EMAIL;
  const validationFirst = fields?.ValidationFirst?.value ?? STATIC.VALIDATION_FIRST;
  const validationLast = fields?.ValidationLast?.value ?? STATIC.VALIDATION_LAST;
  const validationEmail = fields?.ValidationEmail?.value ?? STATIC.VALIDATION_EMAIL;
  const submitButtonText = fields?.SubmitButtonText?.value ?? STATIC.SUBMIT_BUTTON;
  const disclaimer = fields?.Disclaimer?.value ?? STATIC.DISCLAIMER;
  const privacyPrefix = fields?.PrivacyPrefix?.value ?? STATIC.PRIVACY_PREFIX;
  const privacyLinkText = fields?.PrivacyLinkText?.value ?? fields?.PrivacyLink?.value?.text ?? STATIC.PRIVACY_LINK;
  const privacySuffix = fields?.PrivacySuffix?.value ?? STATIC.PRIVACY_SUFFIX;
  const privacyLinkHref = fields?.PrivacyLink?.value?.href ?? '/privacy';

  const hasContent =
    title ||
    description ||
    firstNameLabel ||
    lastNameLabel ||
    emailLabel ||
    submitButtonText ||
    disclaimer;

  const styles = params?.styles ?? '';
  const id = params?.RenderingIdentifier ?? undefined;

  if (!hasContent && !isPageEditing) {
    return (
      <section className={`py-12 md:py-16 bg-saga-light-blue ${styles}`.trim()} id={id}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">Newsletter Signup Demo: No datasource configured</p>
        </div>
      </section>
    );
  }

  if (submittedSuccess) {
    return (
      <section className={`py-12 md:py-16 bg-saga-light-blue ${styles}`.trim()} id={id}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="bg-background rounded-xl p-6 md:p-8 shadow-sm border border-border/50 text-center">
            <h3 className="text-xl font-bold text-saga-navy">Thank you for subscribing!</h3>
            <p className="mt-2 text-sm text-saga-navy/70">This is a demo. No data was submitted.</p>
          </div>
        </div>
      </section>
    );
  }

  const showTitle = title || isPageEditing;
  const showDescription = description || isPageEditing;
  const showFirstNameLabel = firstNameLabel || isPageEditing;
  const showLastNameLabel = lastNameLabel || isPageEditing;
  const showEmailLabel = emailLabel || isPageEditing;
  const showSubmitButton = submitButtonText || isPageEditing;
  const showDisclaimer = disclaimer || isPageEditing;
  const showPrivacy = privacyPrefix || privacyLinkText || privacySuffix || isPageEditing;

  return (
    <section className={`py-12 md:py-16 bg-saga-light-blue ${styles}`.trim()} id={id}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-1 h-8 bg-saga-teal rounded-full mt-1 flex-shrink-0" />
          {showTitle &&
            (fields?.Title && isPageEditing ? (
              <Text
                field={fields.Title}
                tag="h2"
                className="text-2xl md:text-3xl font-bold text-saga-navy text-balance"
              />
            ) : (
              <h2 className="text-2xl md:text-3xl font-bold text-saga-navy text-balance">
                {title}
              </h2>
            ))}
        </div>
        {(showDescription || description) &&
          (fields?.Description && isPageEditing ? (
            <Text
              field={fields.Description}
              tag="p"
              className="text-sm text-saga-navy/70 mb-8 ml-4 leading-relaxed"
            />
          ) : (
            <p className="text-sm text-saga-navy/70 mb-8 ml-4 leading-relaxed">{description}</p>
          ))}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-background rounded-xl p-6 md:p-8 shadow-sm border border-border/50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              {showFirstNameLabel && (
                <label
                  htmlFor="newsletter-demo-first"
                  className="block text-sm font-semibold text-saga-navy mb-1.5"
                >
                  {fields?.FirstNameLabel && isPageEditing ? (
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
                      {firstNameLabel} <span className="text-destructive">*</span>
                    </>
                  )}
                </label>
              )}
              <input
                id="newsletter-demo-first"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={placeholderFirst}
                className={`w-full rounded-md border px-3 py-2.5 text-sm text-saga-navy placeholder:text-saga-navy/40 focus:outline-none focus:ring-2 focus:ring-ring bg-background ${
                  firstNameInvalid ? 'border-destructive' : 'border-input'
                }`}
                aria-invalid={firstNameInvalid}
                aria-describedby={firstNameInvalid ? 'newsletter-demo-first-error' : undefined}
              />
              {firstNameInvalid && (
                <p
                  id="newsletter-demo-first-error"
                  className="mt-1.5 flex items-center gap-1.5 text-sm text-destructive"
                >
                  <ValidationIcon className="h-4 w-4 shrink-0" />
                  {validationFirst}
                </p>
              )}
            </div>
            <div>
              {showLastNameLabel && (
                <label
                  htmlFor="newsletter-demo-last"
                  className="block text-sm font-semibold text-saga-navy mb-1.5"
                >
                  {fields?.LastNameLabel && isPageEditing ? (
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
                      {lastNameLabel} <span className="text-destructive">*</span>
                    </>
                  )}
                </label>
              )}
              <input
                id="newsletter-demo-last"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={placeholderLast}
                className={`w-full rounded-md border px-3 py-2.5 text-sm text-saga-navy placeholder:text-saga-navy/40 focus:outline-none focus:ring-2 focus:ring-ring bg-background ${
                  lastNameInvalid ? 'border-destructive' : 'border-input'
                }`}
                aria-invalid={lastNameInvalid}
                aria-describedby={lastNameInvalid ? 'newsletter-demo-last-error' : undefined}
              />
              {lastNameInvalid && (
                <p
                  id="newsletter-demo-last-error"
                  className="mt-1.5 flex items-center gap-1.5 text-sm text-destructive"
                >
                  <ValidationIcon className="h-4 w-4 shrink-0" />
                  {validationLast}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              {showEmailLabel && (
                <label
                  htmlFor="newsletter-demo-email"
                  className="block text-sm font-semibold text-saga-navy mb-1.5"
                >
                  {fields?.EmailLabel && isPageEditing ? (
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
                      {emailLabel} <span className="text-destructive">*</span>
                    </>
                  )}
                </label>
              )}
              <input
                id="newsletter-demo-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholderEmail}
                className={`w-full rounded-md border px-3 py-2.5 text-sm text-saga-navy placeholder:text-saga-navy/40 focus:outline-none focus:ring-2 focus:ring-ring bg-background ${
                  emailInvalid ? 'border-destructive' : 'border-input'
                }`}
                aria-invalid={emailInvalid}
                aria-describedby={emailInvalid ? 'newsletter-demo-email-error' : undefined}
              />
              {emailInvalid && (
                <p
                  id="newsletter-demo-email-error"
                  className="mt-1.5 flex items-center gap-1.5 text-sm text-destructive"
                >
                  <ValidationIcon className="h-4 w-4 shrink-0" />
                  {validationEmail}
                </p>
              )}
            </div>
            {showSubmitButton && (
              <button
                type="submit"
                className="rounded-md border-2 border-saga-navy bg-background px-6 py-2.5 text-sm font-semibold text-saga-navy hover:bg-saga-navy hover:text-white transition-colors whitespace-nowrap"
              >
                {fields?.SubmitButtonText && isPageEditing ? (
                  <Text
                    field={fields.SubmitButtonText}
                    tag="span"
                    className="text-sm font-semibold text-saga-navy"
                  />
                ) : (
                  submitButtonText
                )}
              </button>
            )}
          </div>

          {showDisclaimer && (
            <p className="mt-4 text-xs text-saga-navy/60 leading-relaxed">
              {fields?.Disclaimer && isPageEditing ? (
                <Text
                  field={fields.Disclaimer}
                  tag="span"
                  className="text-xs text-saga-navy/60 leading-relaxed"
                />
              ) : (
                disclaimer
              )}
            </p>
          )}
        </form>

        {showPrivacy && (
          <p className="mt-4 text-xs text-saga-navy/60 ml-4">
            {fields?.PrivacyPrefix && isPageEditing ? (
              <Text
                field={fields.PrivacyPrefix}
                tag="span"
                className="text-xs text-saga-navy/60"
              />
            ) : (
              privacyPrefix
            )}
            {fields?.PrivacyLink && isPageEditing ? (
              <SitecoreLink
                field={fields.PrivacyLink}
                className="text-saga-navy underline hover:opacity-80"
              >
                {privacyLinkText}
              </SitecoreLink>
            ) : (
              <Link href={privacyLinkHref} className="text-saga-navy underline hover:opacity-80">
                {privacyLinkText}
              </Link>
            )}
            {fields?.PrivacySuffix && isPageEditing ? (
              <Text
                field={fields.PrivacySuffix}
                tag="span"
                className="text-xs text-saga-navy/60"
              />
            ) : (
              privacySuffix
            )}
          </p>
        )}
      </div>
    </section>
  );
};

export const Default: React.FC<NewsletterSignupDemoProps> = (props) => {
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing ?? false;
  return <NewsletterSignupDemoComponent {...props} isPageEditing={isPageEditing} />;
};
