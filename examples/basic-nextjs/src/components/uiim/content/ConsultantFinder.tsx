import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface ConsultantItemFields {
  id: string;
  consultantName: { jsonValue: Field<string> };
  specialty: { jsonValue: Field<string> };
  photo: { jsonValue: ImageField };
  ratingValue: { jsonValue: Field<string> };
  reviewSource: { jsonValue: Field<string> };
  practices: { jsonValue: Field<string> };
  treatments: { jsonValue: Field<string> };
  nextAppointment: { jsonValue: Field<string> };
  bookOnlineLink: { jsonValue: LinkField };
  callToBookLabel: { jsonValue: Field<string> };
  profileLink: { jsonValue: LinkField };
}

interface ConsultantFinderDatasource {
  searchPlaceholder: { jsonValue: Field<string> };
  resultsTitle: { jsonValue: Field<string> };
  locationLabel: { jsonValue: Field<string> };
  children: {
    results: ConsultantItemFields[];
  };
}

interface ConsultantFinderFields {
  data: {
    datasource: ConsultantFinderDatasource;
  };
}

type ConsultantFinderProps = ComponentProps & {
  fields: ConsultantFinderFields;
};

const ConsultantFinderDefaultComponent = (): JSX.Element => (
  <div className="component consultant-finder">
    <div className="component-content">
      <span className="is-empty-hint">ConsultantFinder</span>
    </div>
  </div>
);

const getInitials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return ((parts[0][0] || '') + (parts[parts.length - 1][0] || '')).toUpperCase();
};

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const Avatar = ({ photo, name }: { photo?: ImageField; name?: string }) => {
  const hasPhoto = !!photo?.value?.src;
  if (hasPhoto) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
        <ContentSdkImage
          field={photo}
          width={56}
          height={56}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold"
      style={{ backgroundColor: '#A6E5DE', color: 'var(--brand-primary, #0C2141)' }}
    >
      {getInitials(name)}
    </div>
  );
};

const RatingRow = ({
  ratingValue,
  reviewSource,
  isEditing,
}: {
  ratingValue?: Field<string>;
  reviewSource?: Field<string>;
  isEditing?: boolean;
}) => {
  const value = Number(ratingValue?.value ?? 0);
  const fullStars = Math.max(0, Math.min(5, Math.round(value)));
  const showRating = ratingValue?.value || isEditing;
  if (!showRating && !reviewSource?.value) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs" style={{ color: 'var(--brand-primary, #0C2141)' }}>
      <span className="flex items-center gap-0.5" style={{ color: '#A6E5DE' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} filled={i < fullStars} />
        ))}
      </span>
      {showRating && (
        <span className="font-semibold">
          <Text field={ratingValue} /> / 5
        </span>
      )}
      {(reviewSource?.value || isEditing) && (
        <span className="ml-1 flex items-center gap-1 text-[11px] opacity-75">
          Reviewed By
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-primary,#0C2141)] px-2 py-0.5 text-white">
            <Text field={reviewSource} />
          </span>
        </span>
      )}
    </div>
  );
};

const LabelValueRow = ({ label, value, isEditing }: { label: string; value?: Field<string>; isEditing?: boolean }) => {
  if (!value?.value && !isEditing) return null;
  return (
    <div className="mt-3 grid grid-cols-[88px_1fr] gap-3 text-xs" style={{ color: 'var(--brand-fg, #111111)' }}>
      <span className="font-semibold uppercase tracking-wider opacity-60">{label}</span>
      <span className="opacity-90"><Text field={value} /></span>
    </div>
  );
};

const ConsultantCard = ({ item, isEditing, accent = 'navy' }: { item: ConsultantItemFields; isEditing?: boolean; accent?: 'navy' | 'plain' }) => (
  <article
    className="flex flex-col rounded-2xl bg-white p-6"
    style={{ border: '1px solid var(--brand-border, #E2E0D7)' }}
  >
    <header className="flex items-center gap-4">
      <Avatar photo={item.photo?.jsonValue} name={item.consultantName?.jsonValue?.value} />
      <div className="min-w-0">
        {(item.consultantName?.jsonValue?.value || isEditing) && (
          <Text
            field={item.consultantName?.jsonValue}
            tag="h3"
            className="truncate text-base font-bold leading-tight"
            style={{ color: 'var(--brand-primary, #0C2141)' }}
          />
        )}
        {(item.specialty?.jsonValue?.value || isEditing) && (
          <Text
            field={item.specialty?.jsonValue}
            tag="p"
            className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70"
            style={{ color: 'var(--brand-primary, #0C2141)' }}
          />
        )}
      </div>
    </header>

    <RatingRow
      ratingValue={item.ratingValue?.jsonValue}
      reviewSource={item.reviewSource?.jsonValue}
      isEditing={isEditing}
    />

    <LabelValueRow label="Practices" value={item.practices?.jsonValue} isEditing={isEditing} />
    <LabelValueRow label="Treatments" value={item.treatments?.jsonValue} isEditing={isEditing} />

    {(item.nextAppointment?.jsonValue?.value || isEditing) && (
      <div
        className="mt-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium"
        style={{ backgroundColor: '#E5F6F2', color: 'var(--brand-primary, #0C2141)' }}
      >
        <ClockIcon />
        <Text field={item.nextAppointment?.jsonValue} />
      </div>
    )}

    <p className="mt-3 text-[10px] uppercase tracking-wider opacity-50" style={{ color: 'var(--brand-fg, #111111)' }}>
      Last checked: a few minutes ago
    </p>

    <div className="mt-5 space-y-2">
      {(item.bookOnlineLink?.jsonValue?.value?.href || isEditing) && (
        <ContentSdkLink
          field={item.bookOnlineLink?.jsonValue}
          className={cn(
            'flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200',
            accent === 'navy'
              ? 'border border-[var(--brand-primary,#0C2141)] bg-[var(--brand-primary,#0C2141)] text-white hover:bg-white hover:text-[var(--brand-primary,#0C2141)]'
              : 'bg-[var(--brand-primary,#0C2141)] text-white hover:opacity-90'
          )}
        />
      )}
      {(item.callToBookLabel?.jsonValue?.value || isEditing) && (
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--brand-primary,#0C2141)] bg-transparent px-4 py-2.5 text-sm font-semibold transition-colors duration-200 hover:bg-[var(--brand-primary,#0C2141)] hover:text-white"
          style={{ color: 'var(--brand-primary, #0C2141)' }}
        >
          <PhoneIcon />
          <Text field={item.callToBookLabel?.jsonValue} tag="span" />
        </button>
      )}
    </div>

    {(item.profileLink?.jsonValue?.value?.href || isEditing) && (
      <ContentSdkLink
        field={item.profileLink?.jsonValue}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline-offset-2 hover:underline"
        style={{ color: 'var(--brand-primary, #0C2141)' }}
      />
    )}
  </article>
);

/* ────────────────────────────────────────────
   Default — clean neutral 3-column grid for the design library.
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: ConsultantFinderProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ConsultantFinderDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component consultant-finder', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl md:px-6">
          <div className="mb-8">
            {(datasource.resultsTitle?.jsonValue?.value || isEditing) && (
              <Text
                field={datasource.resultsTitle?.jsonValue}
                tag="h2"
                className="text-2xl font-bold tracking-tight md:text-3xl"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            {(datasource.locationLabel?.jsonValue?.value || isEditing) && (
              <p className="mt-1 text-sm opacity-70" style={{ color: 'var(--brand-fg, #111111)' }}>
                <Text field={datasource.locationLabel?.jsonValue} />
              </p>
            )}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ConsultantCard key={item.id} item={item} isEditing={isEditing} accent="plain" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   HCA — replicates HCA UK's consultant finder results page.
   Decorative search bar + Filter/Sort/Reset chrome, big results title with
   location pill on the right, 3-up grid of richly-detailed consultant cards.
   ──────────────────────────────────────────── */
export const HCA = ({ fields, params, page }: ConsultantFinderProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <ConsultantFinderDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component consultant-finder', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-10 md:py-14"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl md:px-6">
          {/* Decorative search bar */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <div
              className="flex flex-1 items-center gap-3 rounded-full bg-white px-5 py-3"
              style={{ border: '1px solid var(--brand-border, #E2E0D7)', minWidth: '260px' }}
            >
              <span style={{ color: 'var(--brand-primary, #0C2141)' }}>
                <SearchIcon />
              </span>
              {(datasource.searchPlaceholder?.jsonValue?.value || isEditing) && (
                <Text
                  field={datasource.searchPlaceholder?.jsonValue}
                  tag="span"
                  className="flex-1 truncate text-sm font-medium"
                  style={{ color: 'var(--brand-primary, #0C2141)' }}
                />
              )}
              <span aria-hidden className="text-base opacity-50" style={{ color: 'var(--brand-primary, #0C2141)' }}>×</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary,#0C2141)] px-5 py-3 text-sm font-semibold text-white"
              >
                Filter By
              </span>
              <span
                className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary,#0C2141)] px-5 py-3 text-sm font-semibold text-white"
              >
                Sort by
              </span>
              <span
                className="ml-1 text-sm font-medium underline-offset-2"
                style={{ color: 'var(--brand-primary, #0C2141)' }}
              >
                Reset all
              </span>
            </div>
          </div>

          {/* Header row */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            {(datasource.resultsTitle?.jsonValue?.value || isEditing) && (
              <Text
                field={datasource.resultsTitle?.jsonValue}
                tag="h1"
                className="text-2xl font-bold leading-tight md:text-3xl lg:text-4xl"
                style={{ color: 'var(--brand-primary, #0C2141)' }}
              />
            )}
            {(datasource.locationLabel?.jsonValue?.value || isEditing) && (
              <div
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold"
                style={{ border: '1px solid var(--brand-border, #E2E0D7)', color: 'var(--brand-primary, #0C2141)' }}
              >
                <PinIcon />
                <Text field={datasource.locationLabel?.jsonValue} />
                <span aria-hidden className="opacity-50">▾</span>
              </div>
            )}
          </div>

          {/* Cards grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ConsultantCard key={item.id} item={item} isEditing={isEditing} accent="navy" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
