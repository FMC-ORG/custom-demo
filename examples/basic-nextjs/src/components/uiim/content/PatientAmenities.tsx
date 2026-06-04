import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface PatientAmenityItemFields {
  id: string;
  label: { jsonValue: Field<string> };
  icon: { jsonValue: Field<string> };
}

interface PatientAmenitiesDatasource {
  title: { jsonValue: Field<string> };
  description: { jsonValue: Field<string> };
  image: { jsonValue: ImageField };
  children: {
    results: PatientAmenityItemFields[];
  };
}

interface PatientAmenitiesFields {
  data: {
    datasource: PatientAmenitiesDatasource;
  };
}

type PatientAmenitiesProps = ComponentProps & {
  fields: PatientAmenitiesFields;
};

const PatientAmenitiesDefaultComponent = (): JSX.Element => (
  <div className="component patient-amenities">
    <div className="component-content">
      <span className="is-empty-hint">PatientAmenities</span>
    </div>
  </div>
);

/* ────────────────────────────────────────────
   Icon registry — token → inline SVG. Falls back to a checkmark.
   Tokens used by authors: wifi, ac, phone, check, gym, pharmacy, bath, accessible, food
   ──────────────────────────────────────────── */
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const WifiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);
const PhoneIconSm = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const AccessibleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="4" r="2" />
    <path d="M19 13v-2a7 7 0 0 0-14 0v2" />
    <path d="M12 14v8" />
    <path d="M8 22h8" />
  </svg>
);
const BathIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 6 6 3" />
    <path d="M17 13H2v3a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4v-3H10.65z" />
    <path d="M6 13V4a2 2 0 1 1 4 0" />
  </svg>
);
const ACIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2v20" />
    <path d="m4 6 8 4 8-4" />
    <path d="m4 18 8-4 8 4" />
  </svg>
);
const PharmacyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
const GymIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6.5 6.5 17.5 17.5" />
    <path d="m3.5 9.5 11-11" />
    <path d="m9.5 20.5 11-11" />
    <path d="M2 15h2v6H2z" />
    <path d="M20 3h2v6h-2z" />
    <path d="M5 18h6" />
    <path d="M13 6h6" />
  </svg>
);

const ICON_MAP: Record<string, () => JSX.Element> = {
  check: CheckIcon,
  wifi: WifiIcon,
  phone: PhoneIconSm,
  accessible: AccessibleIcon,
  bath: BathIcon,
  ac: ACIcon,
  pharmacy: PharmacyIcon,
  gym: GymIcon,
};

const RenderIcon = ({ token }: { token?: string }) => {
  const key = (token || '').trim().toLowerCase();
  const Component = ICON_MAP[key] || CheckIcon;
  return <Component />;
};

/* ────────────────────────────────────────────
   Default — light neutral version: white bg, navy text, image left
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: PatientAmenitiesProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <PatientAmenitiesDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component patient-amenities', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-14 md:px-6">
          {(datasource.image?.jsonValue?.value?.src || isEditing) && (
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[var(--brand-card-radius,0.75rem)]">
              <ContentSdkImage
                field={datasource.image?.jsonValue}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="space-y-5">
            {(datasource.title?.jsonValue?.value || isEditing) && (
              <Text
                field={datasource.title?.jsonValue}
                tag="h2"
                className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl font-[var(--brand-heading-font,inherit)]"
                style={{ color: 'var(--brand-primary, #0C2141)' }}
              />
            )}
            {(datasource.description?.jsonValue?.value || isEditing) && (
              <ContentSdkRichText
                field={datasource.description?.jsonValue}
                className="text-base opacity-80 font-[var(--brand-body-font,inherit)]"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-sm" style={{ color: 'var(--brand-fg, #111111)' }}>
                  <span style={{ color: 'var(--brand-primary, #0C2141)' }}><RenderIcon token={item.icon?.jsonValue?.value} /></span>
                  {(item.label?.jsonValue?.value || isEditing) && <Text field={item.label?.jsonValue} tag="span" className="font-medium" />}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   HCA — dark navy section, mint-tinted icons, 2-col bullet grid right of the image.
   Matches the "Patient amenities" row on HCA hospital location pages.
   ──────────────────────────────────────────── */
export const HCA = ({ fields, params, page }: PatientAmenitiesProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <PatientAmenitiesDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component patient-amenities', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-primary, #0C2141)', color: '#ffffff' }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-14 md:px-6">
          {(datasource.image?.jsonValue?.value?.src || isEditing) && (
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[var(--brand-card-radius,0.75rem)]">
              <ContentSdkImage
                field={datasource.image?.jsonValue}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="space-y-5">
            {(datasource.title?.jsonValue?.value || isEditing) && (
              <Text
                field={datasource.title?.jsonValue}
                tag="h2"
                className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl text-white font-[var(--brand-heading-font,inherit)]"
              />
            )}
            {(datasource.description?.jsonValue?.value || isEditing) && (
              <ContentSdkRichText
                field={datasource.description?.jsonValue}
                className="text-base text-white/85 font-[var(--brand-body-font,inherit)]"
              />
            )}
            <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-base text-white">
                  <span style={{ color: '#A6E5DE' }}><RenderIcon token={item.icon?.jsonValue?.value} /></span>
                  {(item.label?.jsonValue?.value || isEditing) && <Text field={item.label?.jsonValue} tag="span" className="font-medium" />}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
