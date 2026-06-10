'use client';

import React, { JSX, useState } from 'react';
import {
  Field,
  LinkField,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface EventRegistrationFormFields {
  Title: Field<string>;
  Subtitle: Field<string>;
  Consent1Text: Field<string>;
  Consent2Text: Field<string>;
  SubmitLabel: Field<string>;
  PrivacyPolicyLink: LinkField;
  SuccessMessage: Field<string>;
}

type EventRegistrationFormProps = ComponentProps & { fields: EventRegistrationFormFields };

const Empty = (): JSX.Element => (
  <div className="component event-registration-form">
    <span className="is-empty-hint">EventRegistrationForm</span>
  </div>
);

const inputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--brand-border)',
  color: 'var(--brand-fg)',
  borderRadius: '8px',
  padding: '12px 14px',
  fontSize: '14px',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  color: 'var(--brand-muted-foreground)',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  marginBottom: '8px',
  display: 'block',
};

export const Default = ({ fields, params, page }: EventRegistrationFormProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const [submitted, setSubmitted] = useState(false);
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);

  if (!fields) return <Empty />;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    console.log('[EventRegistrationForm] Demo submit:', { ...payload, consent1, consent2 });
    setSubmitted(true);
  };

  return (
    <div className={cn('component event-registration-form', styles)} id={RenderingIdentifier}>
      <section id="register" className="w-full px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="text-3xl md:text-4xl font-bold tracking-wide"
                style={{ color: 'var(--brand-fg)', fontFamily: 'var(--brand-heading-font)' }}
              />
            )}
            {(fields.Subtitle?.value || isEditing) && (
              <Text
                field={fields.Subtitle}
                tag="p"
                className="mt-3 text-sm"
                style={{ color: 'var(--brand-muted-foreground)' }}
              />
            )}
          </div>

          {submitted ? (
            <div
              className="mt-10 rounded-2xl p-8 text-center"
              style={{
                backgroundColor: 'var(--brand-muted)',
                border: '1px solid var(--brand-primary)',
              }}
            >
              <ContentSdkRichText
                field={fields.SuccessMessage}
                className="[&_p]:m-0 [&_strong]:text-[color:var(--brand-primary)]"
                style={{ color: 'var(--brand-fg)' }}
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label style={labelStyle} htmlFor="firstName">First name</label>
                <input id="firstName" name="firstName" type="text" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle} htmlFor="lastName">Last name</label>
                <input id="lastName" name="lastName" type="text" required style={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label style={labelStyle} htmlFor="email">Business e-mail</label>
                <input id="email" name="email" type="email" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle} htmlFor="company">Company</label>
                <input id="company" name="company" type="text" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle} htmlFor="phone">Phone number</label>
                <input id="phone" name="phone" type="tel" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle} htmlFor="jobRole">Job role</label>
                <input id="jobRole" name="jobRole" type="text" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle} htmlFor="region">Region</label>
                <input id="region" name="region" type="text" style={inputStyle} />
              </div>

              <div className="md:col-span-2 mt-2 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consent1}
                    onChange={(e) => setConsent1(e.target.checked)}
                    className="mt-1 flex-shrink-0"
                    style={{ accentColor: 'var(--brand-primary)' }}
                  />
                  <ContentSdkRichText
                    field={fields.Consent1Text}
                    className="text-xs leading-relaxed [&_p]:m-0 [&_a]:text-[color:var(--brand-primary)] [&_a]:underline"
                    style={{ color: 'var(--brand-muted-foreground)' }}
                  />
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent2}
                    onChange={(e) => setConsent2(e.target.checked)}
                    className="mt-1 flex-shrink-0"
                    style={{ accentColor: 'var(--brand-primary)' }}
                  />
                  <ContentSdkRichText
                    field={fields.Consent2Text}
                    className="text-xs leading-relaxed [&_p]:m-0 [&_a]:text-[color:var(--brand-primary)] [&_a]:underline"
                    style={{ color: 'var(--brand-muted-foreground)' }}
                  />
                </label>
              </div>

              <div className="md:col-span-2 mt-4 text-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-12 py-3 text-sm font-bold tracking-[0.3em] uppercase transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--brand-primary)',
                    color: 'var(--brand-primary-foreground)',
                    borderRadius: 'var(--brand-button-radius)',
                  }}
                >
                  {fields.SubmitLabel?.value || 'Register'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
