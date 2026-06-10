import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  Text as ContentSdkText,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

export interface SitecoreSilverAttendeeProfileFields {
  Name?: Field<string>;
  Pronouns?: Field<string>;
  Headline?: Field<string>;
  Role?: Field<string>;
  Company?: Field<string>;
  CompanyDescription?: Field<string>;
  Location?: Field<string>;
  AiQuote?: Field<string>;
  OriginalPhoto?: ImageField;
  EnhancedPhoto?: ImageField;
  LinkedIn?: LinkField;
  PhotoCode?: Field<string>;
}

export type SitecoreSilverAttendeeProfileProps = ComponentProps & {
  fields?: SitecoreSilverAttendeeProfileFields;
};

// ──────────────────────────────────────────────
// Fallback defaults — used when Sitecore route fields are empty
// (editing-mode visual + dev visual before content is authored)
// ──────────────────────────────────────────────
const SUMITH_DEFAULTS = {
  eyebrow: 'Silver Attendees · Copenhagen 2026',
  name: 'Sumith',
  pronouns: 'He / Him',
  headline: 'Building data-driven experiences with Sitecore',
  role: 'Solutions Architect',
  company: 'Sitecore',
  companyDescription: 'We build Web experiences',
  location: 'Copenhagen',
  aiQuote:
    'From unified platforms to orchestrated outcomes, our 25-year journey of innovation continues. Together, with SitecoreAI, we’ll shape the future of digital experiences.',
  linkedInUrl: 'https://www.linkedin.com/in/sitecore',
  photoCode: 'SILVERMPWGECJFXGR7',
  originalPhoto: 'https://storage.googleapis.com/copenhagesilver.firebasestorage.app/sitecore-silver%2Fsession_1781121766077_q3o3qylol%2Foriginal_1781121805587.jpg',
  enhancedPhoto: 'https://storage.googleapis.com/copenhagesilver.firebasestorage.app/sitecore-silver%2Fsession_1781121766077_q3o3qylol%2Fcomposited_1781121805587.jpg',
};

const textValue = (f?: Field<string>): string | undefined => f?.value;
const hasImage = (f?: ImageField): boolean => !!f?.value?.src;
const hasLink = (f?: LinkField): boolean => !!f?.value?.href;

// ──────────────────────────────────────────────
// Defaults helpers — render Sitecore field if present, else fall back to default
// ──────────────────────────────────────────────
const FieldOrDefault = ({
  field,
  fallback,
  isEditing,
  tag: Tag = 'span',
  className,
  style,
}: {
  field?: Field<string>;
  fallback: string;
  isEditing?: boolean;
  tag?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}) => {
  if (textValue(field) || isEditing) {
    return <ContentSdkText field={field} tag={Tag} className={className} style={style} />;
  }
  return React.createElement(Tag, { className, style }, fallback);
};

const AiBadge = () => (
  <div
    className="flex items-center justify-center h-14 w-14 rounded-full shrink-0 shadow-lg z-10"
    style={{
      background: 'linear-gradient(135deg, #4FD1E3 0%, #8a5cf6 100%)',
      boxShadow: '0 0 24px rgba(79, 209, 227, 0.45)',
    }}
    aria-hidden
  >
    <span className="text-white text-sm font-bold tracking-wider">AI</span>
  </div>
);

export const Default = (props: SitecoreSilverAttendeeProfileProps): JSX.Element => {
  const page = props.page;
  const isEditing = page?.mode?.isEditing;
  const id = props.params?.RenderingIdentifier;
  const styles = props.params?.styles || '';

  // Profile pages put the attendee fields on the route item. Datasource fallback supported too.
  const routeFields = (page?.layout?.sitecore?.route?.fields ?? {}) as Partial<
    SitecoreSilverAttendeeProfileFields & { Title?: Field<string> }
  >;
  const fields: Partial<SitecoreSilverAttendeeProfileFields> = {
    ...props.fields,
    ...routeFields,
  };
  const nameField = fields.Name ?? routeFields.Title;
  const d = SUMITH_DEFAULTS;

  const originalSrc = fields.OriginalPhoto?.value?.src || d.originalPhoto;
  const enhancedSrc = fields.EnhancedPhoto?.value?.src || d.enhancedPhoto;
  const photoCode = textValue(fields.PhotoCode) || d.photoCode;
  const linkedInHref = fields.LinkedIn?.value?.href || d.linkedInUrl;

  return (
    <div
      className={cn('component sitecore-silver-attendee', styles)}
      id={id}
      // Scope brand overrides to teal accent for THIS section only
      style={
        {
          ['--brand-primary']: '#4FD1E3',
          ['--brand-accent']: '#4FD1E3',
        } as React.CSSProperties
      }
    >
      <section className="relative w-full px-4 py-16 md:py-24 overflow-hidden">
        {/* Faint radial glow behind the hero */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(79, 209, 227, 0.08), transparent 50%)',
          }}
        />

        <div className="relative mx-auto max-w-5xl">
          {/* Header: eyebrow / name + pronouns / headline */}
          <header className="text-center">
            <p
              className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase"
              style={{ color: '#4FD1E3' }}
            >
              {d.eyebrow}
            </p>

            <h1
              className="mt-6 text-4xl md:text-6xl font-bold"
              style={{ color: '#ffffff', fontFamily: 'var(--brand-heading-font)' }}
            >
              <FieldOrDefault
                field={nameField}
                fallback={d.name}
                isEditing={isEditing}
                tag="span"
              />
              {(textValue(fields.Pronouns) || isEditing || d.pronouns) && (
                <span
                  className="ml-4 text-2xl md:text-3xl font-light"
                  style={{ color: '#a3a3a3' }}
                >
                  <FieldOrDefault
                    field={fields.Pronouns}
                    fallback={d.pronouns}
                    isEditing={isEditing}
                    tag="span"
                  />
                </span>
              )}
            </h1>

            <p
              className="mt-3 text-sm md:text-base"
              style={{ color: '#4FD1E3' }}
            >
              <FieldOrDefault
                field={fields.Headline}
                fallback={d.headline}
                isEditing={isEditing}
                tag="span"
              />
            </p>
          </header>

          {/* Photo comparison */}
          <div className="relative mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
            {/* Original */}
            <figure
              className="relative overflow-hidden"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
              }}
            >
              <div
                className="absolute top-3 left-3 z-10 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase rounded"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: '#ffffff',
                }}
              >
                Original
              </div>
              {hasImage(fields.OriginalPhoto) ? (
                <ContentSdkImage
                  field={fields.OriginalPhoto}
                  className="w-full h-auto block aspect-[4/5] object-cover"
                  width={480}
                  height={600}
                />
              ) : (
                <img
                  src={originalSrc}
                  alt={`${textValue(nameField) || d.name} — original`}
                  className="w-full h-auto block aspect-[4/5] object-cover"
                  width={480}
                  height={600}
                />
              )}
            </figure>

            {/* AI badge — absolute center between the two */}
            <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
              <AiBadge />
            </div>
            <div className="flex md:hidden items-center justify-center -my-2">
              <AiBadge />
            </div>

            {/* Enhanced */}
            <figure
              className="relative overflow-hidden"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(79, 209, 227, 0.25)',
                borderRadius: '16px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.45), 0 0 24px rgba(79,209,227,0.12)',
              }}
            >
              <div
                className="absolute top-3 left-3 z-10 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase rounded"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: '#4FD1E3',
                }}
              >
                AI Enhanced
              </div>
              {hasImage(fields.EnhancedPhoto) ? (
                <ContentSdkImage
                  field={fields.EnhancedPhoto}
                  className="w-full h-auto block aspect-[4/5] object-cover"
                  width={480}
                  height={600}
                />
              ) : (
                <img
                  src={enhancedSrc}
                  alt={`${textValue(nameField) || d.name} — AI enhanced`}
                  className="w-full h-auto block aspect-[4/5] object-cover"
                  width={480}
                  height={600}
                />
              )}
            </figure>
          </div>

          {/* Photo code */}
          <p className="mt-8 text-center text-sm" style={{ color: '#ffffff' }}>
            Your Photo:{' '}
            <span
              className="font-mono text-base font-bold tracking-wider"
              style={{ color: '#eb001a' }}
            >
              {photoCode}
            </span>
          </p>

          {/* AI-generated insight card */}
          <div
            className="mt-10 relative mx-auto max-w-3xl p-8 md:p-10 text-center"
            style={{
              backgroundColor: '#0c0c0c',
              border: '1px solid rgba(79, 209, 227, 0.18)',
              borderRadius: '16px',
              boxShadow:
                'inset 0 0 0 1px rgba(255,255,255,0.02), 0 16px 40px rgba(0,0,0,0.45)',
            }}
          >
            <span
              className="inline-block px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full"
              style={{
                background: 'linear-gradient(135deg, #4FD1E3 0%, #8a5cf6 100%)',
                color: '#0a0a0a',
              }}
            >
              AI-generated insight
            </span>
            <blockquote
              className="mt-6 text-lg md:text-xl italic font-light leading-relaxed"
              style={{ color: '#d4d4d8' }}
            >
              &ldquo;
              <FieldOrDefault
                field={fields.AiQuote}
                fallback={d.aiQuote}
                isEditing={isEditing}
                tag="span"
              />
              &rdquo;
            </blockquote>
          </div>

          {/* Two cards: At the celebration | Sitecore */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* At the celebration */}
            <div
              className="p-7 md:p-8"
              style={{
                backgroundColor: '#0c0c0c',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
              }}
            >
              <h2
                className="text-xs font-semibold tracking-[0.15em] uppercase"
                style={{ color: '#a3a3a3' }}
              >
                At the celebration
              </h2>
              <p className="mt-3 text-lg font-bold" style={{ color: '#ffffff' }}>
                <FieldOrDefault
                  field={fields.Role}
                  fallback={d.role}
                  isEditing={isEditing}
                  tag="span"
                />
              </p>
              <p className="mt-1 text-sm font-medium" style={{ color: '#4FD1E3' }}>
                <FieldOrDefault
                  field={fields.Location}
                  fallback={d.location}
                  isEditing={isEditing}
                  tag="span"
                />
              </p>
            </div>

            {/* Company */}
            <div
              className="p-7 md:p-8 flex flex-col"
              style={{
                backgroundColor: '#0c0c0c',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
              }}
            >
              <h2 className="text-lg font-bold" style={{ color: '#ffffff' }}>
                <FieldOrDefault
                  field={fields.Company}
                  fallback={d.company}
                  isEditing={isEditing}
                  tag="span"
                />
              </h2>
              <p className="mt-2 text-sm flex-1" style={{ color: '#a3a3a3' }}>
                <FieldOrDefault
                  field={fields.CompanyDescription}
                  fallback={d.companyDescription}
                  isEditing={isEditing}
                  tag="span"
                />
              </p>
              {fields.LinkedIn && (hasLink(fields.LinkedIn) || isEditing) ? (
                <ContentSdkLink
                  field={fields.LinkedIn}
                  className="mt-5 self-start inline-flex items-center justify-center px-6 py-2.5 text-xs font-bold tracking-[0.15em] uppercase transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0a0a0a',
                    borderRadius: '9999px',
                  }}
                />
              ) : (
                <a
                  href={linkedInHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 self-start inline-flex items-center justify-center px-6 py-2.5 text-xs font-bold tracking-[0.15em] uppercase transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0a0a0a',
                    borderRadius: '9999px',
                  }}
                >
                  View LinkedIn profile
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
