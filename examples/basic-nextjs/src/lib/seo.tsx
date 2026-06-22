import type { Metadata } from 'next';
import type { RouteFields } from 'src/Layout';

/**
 * Centralized SEO configuration and helpers.
 *
 * Canonical/og:url are always built from a single stable production origin
 * (NEXT_PUBLIC_SITE_URL) so preview/alias hosts never emit divergent canonicals.
 *
 * BRAND values are Sage defaults wired as editable constants — verify before go-live.
 */

/** Single source of truth for the production origin (no trailing slash). */
export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'http://localhost:3000'
).replace(/\/+$/, '');

/** Brand identity — Sage defaults. Refine before go-live. */
export const BRAND = {
  name: 'Sage',
  legalName: 'The Sage Group plc',
  locale: 'en_US',
  twitterHandle: '@Sage',
  // Site-wide brand assets (relative paths resolved against SITE_ORIGIN).
  logoPath: '/sage-logo.png',
  defaultOgImagePath: '/og-default.png',
  sameAs: [
    'https://www.linkedin.com/company/sage-software',
    'https://twitter.com/Sage',
    'https://www.facebook.com/sage',
  ],
} as const;

/** Resolve a path or already-absolute URL to an absolute URL on the prod origin. */
export function absoluteUrl(pathOrUrl?: string | null): string {
  const value = pathOrUrl || '/';
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`;
}

/** Build the canonical URL for a content path (leading-slash content path, no site/locale). */
export function buildCanonical(pathSegment: string): string {
  return absoluteUrl(pathSegment || '/');
}

/** True when a Sitecore checkbox-style field is ticked (boolean true or "1"). */
function isChecked(field?: { value?: unknown }): boolean {
  const v = field?.value;
  return v === true || v === '1' || v === 1;
}

/**
 * og:image resolution chain:
 * ogImage → thumbnailImage → type-specific (ArticleImage / heroImage) → brand default.
 */
export function resolveOgImage(fields: RouteFields): string {
  const candidates = [
    fields.ogImage?.value?.src,
    fields.thumbnailImage?.value?.src,
    fields.ArticleImage?.value?.src,
    fields.heroImage?.value?.src,
  ];
  const found = candidates.find((src) => typeof src === 'string' && src.length > 0);
  return absoluteUrl(found || BRAND.defaultOgImagePath);
}

/**
 * Robots directive for Next metadata.
 * Reads SeoNoindex / SeoNofollow checkbox fields (added in Phase 2).
 * Safety net: ABM/landing pages under /lp default to noindex even before the
 * template fields exist, so personalized pages don't leak into search.
 */
export function resolveRobots(
  fields: RouteFields,
  opts: { contentPath: string }
): NonNullable<Metadata['robots']> {
  const pathNoIndexFallback = /(^|\/)lp(\/|$)/i.test(opts.contentPath);
  const noindex = isChecked(fields.SeoNoindex) || (fields.SeoNoindex === undefined && pathNoIndexFallback);
  const nofollow = isChecked(fields.SeoNofollow);
  return {
    index: !noindex,
    follow: !nofollow,
    googleBot: { index: !noindex, follow: !nofollow },
  };
}

/** True when the route is an Article page (drives og:type + Article JSON-LD). */
export function isArticle(fields: RouteFields): boolean {
  return Boolean(fields.ArticleContent?.value || fields.ArticleImage?.value?.src);
}

/* ----------------------------- JSON-LD builders ----------------------------- */

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: SITE_ORIGIN,
    logo: absoluteUrl(BRAND.logoPath),
    sameAs: BRAND.sameAs,
  };
}

export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND.name,
    url: SITE_ORIGIN,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_ORIGIN}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function articleJsonLd(fields: RouteFields, canonicalUrl: string) {
  const author = fields.ArticleAuthor?.fields;
  const authorName = author
    ? `${author.personFirstName?.value ?? ''} ${author.personLastName?.value ?? ''}`.trim()
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: fields.metadataTitle?.value || fields.Title?.value || undefined,
    description:
      fields.metadataDescription?.value || fields.ogDescription?.value || fields.pageSummary?.value || undefined,
    image: resolveOgImage(fields),
    datePublished: fields.ArticlePublicationDate?.value || undefined,
    mainEntityOfPage: canonicalUrl,
    ...(authorName ? { author: { '@type': 'Person', name: authorName } } : {}),
    publisher: {
      '@type': 'Organization',
      name: BRAND.name,
      logo: { '@type': 'ImageObject', url: absoluteUrl(BRAND.logoPath) },
    },
  };
}

/**
 * Renders one or more JSON-LD blocks. JSON-LD is trusted, structured JSON (not
 * user-authored markup), so serializing via dangerouslySetInnerHTML is the
 * standard, safe Next.js pattern here.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload),
      }}
    />
  );
}
