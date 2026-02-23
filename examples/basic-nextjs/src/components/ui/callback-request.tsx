'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Text, Link as SitecoreLink, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { Clock, ShieldCheck, Heart, Percent, Phone, type LucideIcon } from 'lucide-react';

/**
 * Callback Request - SitecoreAI-compatible form component.
 * Two-column layout: dark blue left (headline, description, icon benefits) + white form card on right.
 * Submit is faked for demo purposes.
 */

const ICON_MAP: Record<string, LucideIcon> = {
  Clock,
  ShieldCheck,
  Heart,
  Percent,
};

const FALLBACK_ICONS: LucideIcon[] = [Clock, ShieldCheck, Heart, Percent];

const STATIC = {
  HEADLINE: "Let's find the right cover",
  HEADLINE_ACCENT: 'for you',
  DESCRIPTION:
    "Our friendly UK-based advisors will call you at a time that suits you — no pressure, no jargon, just expert guidance tailored to your cruise plans and your home.",
  FORM_TITLE: 'Request a Free Callback',
  FORM_DESCRIPTION: "Fill in your details and we'll be in touch at a time that suits you.",
  FIRST_NAME_LABEL: 'First name',
  LAST_NAME_LABEL: 'Last name',
  PHONE_LABEL: 'Phone number',
  INTERESTED_IN_LABEL: "I'm interested in...",
  BEST_TIME_LABEL: 'Best time to call',
  PLACEHOLDER_FIRST: 'e.g. Margaret',
  PLACEHOLDER_LAST: 'e.g. Thompson',
  PLACEHOLDER_PHONE: 'e.g. 07700 900 123',
  INTERESTED_IN_OPTIONS: 'Please select...|Travel Insurance|Cruise Insurance|Home Insurance|Other',
  BEST_TIME_OPTIONS: 'Morning (9am - 12pm)|Afternoon (12pm - 5pm)|Evening (5pm - 8pm)',
  SUBMIT_BUTTON: 'Request My Free Callback',
  PRIVACY_PREFIX: 'By submitting you agree to our ',
  PRIVACY_LINK: 'Privacy Policy',
  PRIVACY_SUFFIX: '.',
  BENEFITS: [
    "We'll call at your preferred time",
    'No obligation – just expert advice',
    'Pre-existing conditions always considered',
    'Bundle discount applied automatically',
  ],
};

const NAME_REGEX = /^[a-zA-Z\s'-]{2,}$/;
const PHONE_REGEX = /^[\d\s\-+()]{10,}$/;

interface CallbackRequestBenefitItem {
  id: string;
  benefitText?: { jsonValue?: Field<string> };
  benefitIconName?: { jsonValue?: Field<string> };
}

interface CallbackRequestFields {
  data?: {
    datasource?: {
      headline?: { jsonValue?: Field<string> };
      headlineAccent?: { jsonValue?: Field<string> };
      description?: { jsonValue?: Field<string> };
      formTitle?: { jsonValue?: Field<string> };
      formDescription?: { jsonValue?: Field<string> };
      firstNameLabel?: { jsonValue?: Field<string> };
      lastNameLabel?: { jsonValue?: Field<string> };
      phoneLabel?: { jsonValue?: Field<string> };
      interestedInLabel?: { jsonValue?: Field<string> };
      bestTimeLabel?: { jsonValue?: Field<string> };
      placeholderFirst?: { jsonValue?: Field<string> };
      placeholderLast?: { jsonValue?: Field<string> };
      placeholderPhone?: { jsonValue?: Field<string> };
      interestedInOptions?: { jsonValue?: Field<string> };
      bestTimeOptions?: { jsonValue?: Field<string> };
      submitButtonText?: { jsonValue?: Field<string> };
      privacyPrefix?: { jsonValue?: Field<string> };
      privacyLinkText?: { jsonValue?: Field<string> };
      privacySuffix?: { jsonValue?: Field<string> };
      privacyLink?: { jsonValue?: LinkField };
      children?: {
        results?: CallbackRequestBenefitItem[];
      };
    };
  };
}

interface CallbackRequestParams {
  [key: string]: any; // eslint-disable-line
}

interface CallbackRequestProps extends ComponentProps {
  params: CallbackRequestParams;
  fields: CallbackRequestFields;
  isPageEditing?: boolean;
}

const CallbackRequestComponent: React.FC<CallbackRequestProps> = (props) => {
  const { params, fields, isPageEditing } = props;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [interestedIn, setInterestedIn] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const datasource = fields?.data?.datasource;
  const benefits = datasource?.children?.results || [];

  const firstNameInvalid = submitted && !NAME_REGEX.test(firstName.trim());
  const lastNameInvalid = submitted && !NAME_REGEX.test(lastName.trim());
  const phoneInvalid = submitted && !PHONE_REGEX.test(phone.replace(/\s/g, ''));

  const isValid =
    NAME_REGEX.test(firstName.trim()) &&
    NAME_REGEX.test(lastName.trim()) &&
    PHONE_REGEX.test(phone.replace(/\s/g, ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (isValid) {
      setSubmittedSuccess(true);
    }
  };

  const headline = datasource?.headline?.jsonValue?.value ?? STATIC.HEADLINE;
  const headlineAccent = datasource?.headlineAccent?.jsonValue?.value ?? STATIC.HEADLINE_ACCENT;
  const description = datasource?.description?.jsonValue?.value ?? STATIC.DESCRIPTION;
  const formTitle = datasource?.formTitle?.jsonValue?.value ?? STATIC.FORM_TITLE;
  const formDescription =
    datasource?.formDescription?.jsonValue?.value ?? STATIC.FORM_DESCRIPTION;
  const firstNameLabel =
    datasource?.firstNameLabel?.jsonValue?.value ?? STATIC.FIRST_NAME_LABEL;
  const lastNameLabel =
    datasource?.lastNameLabel?.jsonValue?.value ?? STATIC.LAST_NAME_LABEL;
  const phoneLabel = datasource?.phoneLabel?.jsonValue?.value ?? STATIC.PHONE_LABEL;
  const interestedInLabel =
    datasource?.interestedInLabel?.jsonValue?.value ?? STATIC.INTERESTED_IN_LABEL;
  const bestTimeLabel =
    datasource?.bestTimeLabel?.jsonValue?.value ?? STATIC.BEST_TIME_LABEL;
  const placeholderFirst =
    datasource?.placeholderFirst?.jsonValue?.value ?? STATIC.PLACEHOLDER_FIRST;
  const placeholderLast =
    datasource?.placeholderLast?.jsonValue?.value ?? STATIC.PLACEHOLDER_LAST;
  const placeholderPhone =
    datasource?.placeholderPhone?.jsonValue?.value ?? STATIC.PLACEHOLDER_PHONE;
  const interestedInOptionsRaw =
    datasource?.interestedInOptions?.jsonValue?.value ?? STATIC.INTERESTED_IN_OPTIONS;
  const bestTimeOptionsRaw =
    datasource?.bestTimeOptions?.jsonValue?.value ?? STATIC.BEST_TIME_OPTIONS;
  const submitButtonText =
    datasource?.submitButtonText?.jsonValue?.value ?? STATIC.SUBMIT_BUTTON;
  const privacyPrefix =
    datasource?.privacyPrefix?.jsonValue?.value ?? STATIC.PRIVACY_PREFIX;
  const privacyLinkValue = datasource?.privacyLink?.jsonValue?.value;
  const privacyLinkText =
    datasource?.privacyLinkText?.jsonValue?.value ??
    privacyLinkValue?.text ??
    STATIC.PRIVACY_LINK;
  const privacySuffix =
    datasource?.privacySuffix?.jsonValue?.value ?? STATIC.PRIVACY_SUFFIX;
  const privacyLinkHref = privacyLinkValue?.href ?? '/privacy';

  const interestedInOptions = interestedInOptionsRaw.split('|').filter(Boolean);
  const bestTimeOptions = bestTimeOptionsRaw.split('|').filter(Boolean);

  const styles = params?.styles ?? '';
  const id = params?.RenderingIdentifier ?? undefined;

  if (!datasource && !isPageEditing) {
    return (
      <section
        className={`py-12 md:py-16 bg-saga-navy ${styles}`.trim()}
        id={id}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-white/70">Callback Request: No datasource configured</p>
        </div>
      </section>
    );
  }

  if (submittedSuccess) {
    return (
      <section
        className={`py-12 md:py-16 bg-saga-navy ${styles}`.trim()}
        id={id}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-background rounded-xl p-6 md:p-8 shadow-sm border border-border/50 text-center max-w-md mx-auto">
            <h3 className="text-xl font-bold text-saga-navy">
              Thank you for your request!
            </h3>
            <p className="mt-2 text-sm text-saga-navy/70">
              This is a demo. No data was submitted.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`py-12 md:py-16 bg-saga-navy ${styles}`.trim()}
      id={id}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left column: headline, description, benefits */}
          <div className="text-white">
            {(headline || headlineAccent || isPageEditing) && (
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-balance">
                {datasource?.headline?.jsonValue && isPageEditing ? (
                  <>
                    <Text
                      field={datasource.headline.jsonValue}
                      tag="span"
                      className="font-bold text-white"
                    />
                    {datasource?.headlineAccent?.jsonValue && (
                      <>
                        {' '}
                        <Text
                          field={datasource.headlineAccent.jsonValue}
                          tag="span"
                          className="font-bold text-saga-gold"
                        />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {headline}{' '}
                    <span className="text-saga-gold">{headlineAccent}</span>
                  </>
                )}
              </h2>
            )}
            {(description || isPageEditing) && (
              <p className="mt-4 text-base text-white/90 leading-relaxed">
                {datasource?.description?.jsonValue && isPageEditing ? (
                  <Text
                    field={datasource.description.jsonValue}
                    tag="span"
                    className="text-base text-white/90 leading-relaxed"
                  />
                ) : (
                  description
                )}
              </p>
            )}
            <ul className="mt-6 space-y-3">
              {benefits.length > 0
                ? benefits.map((benefit, index) => {
                    const iconName =
                      benefit.benefitIconName?.jsonValue?.value;
                    const IconComponent =
                      iconName && ICON_MAP[iconName]
                        ? ICON_MAP[iconName]
                        : FALLBACK_ICONS[index % FALLBACK_ICONS.length];
                    const text =
                      benefit.benefitText?.jsonValue?.value ??
                      STATIC.BENEFITS[index] ??
                      '';

                    return (
                      <li
                        key={benefit.id}
                        className="flex items-start gap-3"
                      >
                        <span className="mt-1 w-6 h-6 rounded-full bg-saga-gold flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-3 w-3 text-saga-navy" />
                        </span>
                        {benefit.benefitText?.jsonValue && isPageEditing ? (
                          <Text
                            field={benefit.benefitText.jsonValue}
                            tag="span"
                            className="text-sm md:text-base text-white/90"
                          />
                        ) : (
                          <span className="text-sm md:text-base text-white/90">
                            {text}
                          </span>
                        )}
                      </li>
                    );
                  })
                : isPageEditing ? (
                  <li className="text-white/70 text-sm">
                    No benefits configured. Add CallbackRequestBenefit items as
                    children.
                  </li>
                ) : (
                  STATIC.BENEFITS.map((b, i) => {
                    const FallbackIcon =
                      FALLBACK_ICONS[i % FALLBACK_ICONS.length];
                    return (
                      <li
                        key={i}
                        className="flex items-start gap-3"
                      >
                        <span className="mt-1 w-6 h-6 rounded-full bg-saga-gold flex items-center justify-center flex-shrink-0">
                          <FallbackIcon className="h-3 w-3 text-saga-navy" />
                        </span>
                        <span className="text-sm md:text-base text-white/90">
                          {b}
                        </span>
                      </li>
                    );
                  })
                )}
            </ul>
          </div>

          {/* Right column: form card */}
          <div className="bg-background rounded-xl p-6 md:p-8 shadow-lg border border-border/50">
            {(formTitle || isPageEditing) && (
              <h3 className="text-xl font-bold text-saga-navy">
                {datasource?.formTitle?.jsonValue && isPageEditing ? (
                  <Text
                    field={datasource.formTitle.jsonValue}
                    tag="span"
                    className="text-xl font-bold text-saga-navy"
                  />
                ) : (
                  formTitle
                )}
              </h3>
            )}
            {(formDescription || isPageEditing) && (
              <p className="mt-2 text-sm text-saga-navy/70">
                {datasource?.formDescription?.jsonValue && isPageEditing ? (
                  <Text
                    field={datasource.formDescription.jsonValue}
                    tag="span"
                    className="text-sm text-saga-navy/70"
                  />
                ) : (
                  formDescription
                )}
              </p>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="callback-first"
                    className="block text-xs font-semibold text-saga-navy/80 uppercase tracking-wide mb-1.5"
                  >
                    {firstNameLabel}
                  </label>
                  <input
                    id="callback-first"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={placeholderFirst}
                    className={`w-full rounded-md border px-3 py-2.5 text-sm text-saga-navy placeholder:text-saga-navy/40 focus:outline-none focus:ring-2 focus:ring-ring bg-background ${
                      firstNameInvalid ? 'border-destructive' : 'border-input'
                    }`}
                    aria-invalid={firstNameInvalid}
                  />
                  {firstNameInvalid && (
                    <p className="mt-1 text-xs text-destructive">
                      Please enter a valid first name
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="callback-last"
                    className="block text-xs font-semibold text-saga-navy/80 uppercase tracking-wide mb-1.5"
                  >
                    {lastNameLabel}
                  </label>
                  <input
                    id="callback-last"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={placeholderLast}
                    className={`w-full rounded-md border px-3 py-2.5 text-sm text-saga-navy placeholder:text-saga-navy/40 focus:outline-none focus:ring-2 focus:ring-ring bg-background ${
                      lastNameInvalid ? 'border-destructive' : 'border-input'
                    }`}
                    aria-invalid={lastNameInvalid}
                  />
                  {lastNameInvalid && (
                    <p className="mt-1 text-xs text-destructive">
                      Please enter a valid last name
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="callback-phone"
                  className="block text-xs font-semibold text-saga-navy/80 uppercase tracking-wide mb-1.5"
                >
                  {phoneLabel}
                </label>
                <input
                  id="callback-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={placeholderPhone}
                  className={`w-full rounded-md border px-3 py-2.5 text-sm text-saga-navy placeholder:text-saga-navy/40 focus:outline-none focus:ring-2 focus:ring-ring bg-background ${
                    phoneInvalid ? 'border-destructive' : 'border-input'
                  }`}
                  aria-invalid={phoneInvalid}
                />
                {phoneInvalid && (
                  <p className="mt-1 text-xs text-destructive">
                    Please enter a valid phone number
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="callback-interested"
                  className="block text-xs font-semibold text-saga-navy/80 uppercase tracking-wide mb-1.5"
                >
                  {interestedInLabel}
                </label>
                <select
                  id="callback-interested"
                  value={interestedIn}
                  onChange={(e) => setInterestedIn(e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2.5 text-sm text-saga-navy bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {interestedInOptions.map((opt, i) => (
                    <option
                      key={i}
                      value={opt}
                    >
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="callback-time"
                  className="block text-xs font-semibold text-saga-navy/80 uppercase tracking-wide mb-1.5"
                >
                  {bestTimeLabel}
                </label>
                <select
                  id="callback-time"
                  value={bestTime}
                  onChange={(e) => setBestTime(e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2.5 text-sm text-saga-navy bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {bestTimeOptions.map((opt, i) => (
                    <option
                      key={i}
                      value={opt}
                    >
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-4 rounded-md bg-[#E85D04] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#d14f03] transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="h-4 w-4" />
                {datasource?.submitButtonText?.jsonValue && isPageEditing ? (
                  <Text
                    field={datasource.submitButtonText.jsonValue}
                    tag="span"
                    className="font-semibold text-white"
                  />
                ) : (
                  submitButtonText
                )}
              </button>
            </form>

            <p className="mt-4 text-xs text-saga-navy/60">
              {privacyPrefix}
              {datasource?.privacyLink?.jsonValue && isPageEditing ? (
                <SitecoreLink
                  field={datasource.privacyLink.jsonValue}
                  className="text-saga-navy underline hover:opacity-80"
                >
                  {privacyLinkText}
                </SitecoreLink>
              ) : (
                <Link
                  href={privacyLinkHref}
                  className="text-saga-navy underline hover:opacity-80"
                >
                  {privacyLinkText}
                </Link>
              )}
              {privacySuffix}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Default: React.FC<CallbackRequestProps> = (props) => {
  const { page } = useSitecore();
  const isPageEditing = props.isPageEditing ?? page?.mode?.isEditing ?? false;
  return (
    <CallbackRequestComponent {...props} isPageEditing={isPageEditing} />
  );
};
