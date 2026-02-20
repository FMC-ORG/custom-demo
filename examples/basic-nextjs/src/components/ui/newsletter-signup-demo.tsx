'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { ComponentProps } from '@/lib/component-props';

/**
 * Newsletter Signup Demo - Static programmatic form for demo purposes.
 * All content is hardcoded; submit is faked. No Sitecore datasource required.
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

interface NewsletterSignupDemoParams {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  styles?: string;
  RenderingIdentifier?: string;
}

interface NewsletterSignupDemoProps extends ComponentProps {
  params: NewsletterSignupDemoParams;
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

export const Default: React.FC<NewsletterSignupDemoProps> = (props) => {
  const { params } = props;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const firstNameInvalid = submitted && !NAME_REGEX.test(firstName.trim());
  const lastNameInvalid = submitted && !NAME_REGEX.test(lastName.trim());
  const emailInvalid = submitted && !EMAIL_REGEX.test(email.trim());
  const isValid = NAME_REGEX.test(firstName.trim()) && NAME_REGEX.test(lastName.trim()) && EMAIL_REGEX.test(email.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (isValid) {
      setSubmittedSuccess(true);
      // Fake submit - no backend action
    }
  };

  const styles = params?.styles as string | undefined;
  const id = params?.RenderingIdentifier as string | undefined;

  if (submittedSuccess) {
    return (
      <section
        className={`py-12 md:py-16 bg-saga-light-blue ${styles ?? ''}`.trim()}
        id={id}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="bg-background rounded-xl p-6 md:p-8 shadow-sm border border-border/50 text-center">
            <h3 className="text-xl font-bold text-saga-navy">Thank you for subscribing!</h3>
            <p className="mt-2 text-sm text-saga-navy/70">This is a demo. No data was submitted.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`py-12 md:py-16 bg-saga-light-blue ${styles ?? ''}`.trim()}
      id={id}
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-1 h-8 bg-saga-teal rounded-full mt-1 flex-shrink-0" />
          <h2 className="text-2xl md:text-3xl font-bold text-saga-navy text-balance">
            {STATIC.TITLE}
          </h2>
        </div>
        <p className="text-sm text-saga-navy/70 mb-8 ml-4 leading-relaxed">
          {STATIC.DESCRIPTION}
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-background rounded-xl p-6 md:p-8 shadow-sm border border-border/50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="newsletter-demo-first"
                className="block text-sm font-semibold text-saga-navy mb-1.5"
              >
                {STATIC.FIRST_NAME_LABEL} <span className="text-destructive">*</span>
              </label>
              <input
                id="newsletter-demo-first"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={STATIC.PLACEHOLDER_FIRST}
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
                  {STATIC.VALIDATION_FIRST}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="newsletter-demo-last"
                className="block text-sm font-semibold text-saga-navy mb-1.5"
              >
                {STATIC.LAST_NAME_LABEL} <span className="text-destructive">*</span>
              </label>
              <input
                id="newsletter-demo-last"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={STATIC.PLACEHOLDER_LAST}
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
                  {STATIC.VALIDATION_LAST}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label
                htmlFor="newsletter-demo-email"
                className="block text-sm font-semibold text-saga-navy mb-1.5"
              >
                {STATIC.EMAIL_LABEL} <span className="text-destructive">*</span>
              </label>
              <input
                id="newsletter-demo-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={STATIC.PLACEHOLDER_EMAIL}
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
                  {STATIC.VALIDATION_EMAIL}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="rounded-md border-2 border-saga-navy bg-background px-6 py-2.5 text-sm font-semibold text-saga-navy hover:bg-saga-navy hover:text-white transition-colors whitespace-nowrap"
            >
              {STATIC.SUBMIT_BUTTON}
            </button>
          </div>

          <p className="mt-4 text-xs text-saga-navy/60 leading-relaxed">
            {STATIC.DISCLAIMER}
          </p>
        </form>

        <p className="mt-4 text-xs text-saga-navy/60 ml-4">
          {STATIC.PRIVACY_PREFIX}
          <Link
            href="/privacy"
            className="text-saga-navy underline hover:opacity-80"
          >
            {STATIC.PRIVACY_LINK}
          </Link>
          {STATIC.PRIVACY_SUFFIX}
        </p>
      </div>
    </section>
  );
};
