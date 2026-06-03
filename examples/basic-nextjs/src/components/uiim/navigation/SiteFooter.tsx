import React, { JSX } from 'react';
import {
  ImageField,
  NextImage as ContentSdkImage,
} from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

type SiteFooterProps = ComponentProps & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: any;
};

function getBrandLogo(props: SiteFooterProps): ImageField | undefined {
  const fields = props.fields;
  // Path 1: ComponentQuery → fields.data.datasource
  const fromFields = fields?.data?.datasource?.brandLogo?.jsonValue;
  if (fromFields) return fromFields;
  // Path 2: rendering.fields.data.datasource
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rendering = props.rendering as any;
  const fromRendering = rendering?.fields?.data?.datasource?.brandLogo?.jsonValue;
  if (fromRendering) return fromRendering;
  // Path 3: Direct datasource field access
  const fromDirect = rendering?.fields?.BrandLogo;
  if (fromDirect?.value?.src) return fromDirect;
  return undefined;
}

const SiteFooterDefaultComponent = (): JSX.Element => (
  <div className="component site-footer">
    <div className="component-content">
      <span className="is-empty-hint">SiteFooter</span>
    </div>
  </div>
);

const LINK_COLUMNS = [
  {
    title: 'Products',
    links: ['Overview', 'Features', 'Pricing', 'Integrations'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Blog', 'Press'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Contact', 'Documentation', 'Status'],
  },
];

const Logo = ({ brandLogo }: { brandLogo?: ImageField }) => {
  const hasImage = brandLogo?.value?.src;
  return (
    <Link
      href="/"
      className="flex items-center text-xl font-bold tracking-tight"
      style={{ color: 'var(--brand-footer-fg, #ffffff)' }}
    >
      {hasImage ? (
        <ContentSdkImage
          field={brandLogo}
          width={160}
          height={40}
          className="h-8 w-auto object-contain brightness-0 invert sm:h-10"
        />
      ) : (
        <>
          <span style={{ color: 'var(--brand-primary)' }}>Brand</span>Logo
        </>
      )}
    </Link>
  );
};

const SocialIcons = () => (
  <div className="flex items-center gap-4">
    {['X', 'Li', 'Fb', 'Ig'].map((label) => (
      <a
        key={label}
        href="#"
        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-opacity hover:opacity-70"
        style={{
          backgroundColor: 'var(--brand-footer-fg, #ffffff)',
          color: 'var(--brand-footer-bg, #111111)',
          opacity: 0.2,
        }}
        aria-label={label}
      >
        {label}
      </a>
    ))}
  </div>
);

const Copyright = () => (
  <p
    className="text-sm opacity-50 font-[var(--brand-body-font,inherit)]"
    style={{ color: 'var(--brand-footer-fg, #ffffff)' }}
  >
    &copy; {new Date().getFullYear()} BrandName. All rights reserved.
  </p>
);

/* ────────────────────────────────────────────
   Default — multi-column layout
   ──────────────────────────────────────────── */
export const Default = (props: SiteFooterProps): JSX.Element => {
  const { params } = props;
  const { styles, RenderingIdentifier } = params;
  const brandLogo = getBrandLogo(props);

  if (!params) return <SiteFooterDefaultComponent />;

  return (
    <div className={cn('component site-footer', styles)} id={RenderingIdentifier}>
      <footer
        className="w-full"
        style={{
          backgroundColor: 'var(--brand-footer-bg, #111111)',
          color: 'var(--brand-footer-fg, #ffffff)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <div className="grid gap-8 md:grid-cols-5">
            {/* Logo + description */}
            <div className="md:col-span-2 space-y-4">
              <Logo brandLogo={brandLogo} />
              <p
                className="max-w-xs text-sm opacity-60 font-[var(--brand-body-font,inherit)]"
              >
                Building the future of digital experiences. Trusted by teams worldwide.
              </p>
              <SocialIcons />
            </div>

            {/* Link columns */}
            {LINK_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3
                  className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-70 font-[var(--brand-heading-font,inherit)]"
                >
                  {col.title}
                </h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm opacity-60 transition-opacity hover:opacity-100 font-[var(--brand-body-font,inherit)]"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div
            className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <Copyright />
            <div className="flex gap-6 text-sm opacity-50">
              <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ────────────────────────────────────────────
   Minimal — single row
   ──────────────────────────────────────────── */
export const Minimal = (props: SiteFooterProps): JSX.Element => {
  const { params } = props;
  const { styles, RenderingIdentifier } = params;
  const brandLogo = getBrandLogo(props);

  if (!params) return <SiteFooterDefaultComponent />;

  return (
    <div className={cn('component site-footer', styles)} id={RenderingIdentifier}>
      <footer
        className="w-full"
        style={{
          backgroundColor: 'var(--brand-footer-bg, #111111)',
          color: 'var(--brand-footer-fg, #ffffff)',
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
          <Logo brandLogo={brandLogo} />
          <nav className="flex flex-wrap items-center gap-6 text-sm opacity-60">
            {['About', 'Products', 'Blog', 'Contact', 'Privacy'].map((link) => (
              <a
                key={link}
                href="#"
                className="transition-opacity hover:opacity-100 font-[var(--brand-body-font,inherit)]"
              >
                {link}
              </a>
            ))}
          </nav>
          <Copyright />
        </div>
      </footer>
    </div>
  );
};

/* ────────────────────────────────────────────
   MegaFooter — expanded with newsletter
   ──────────────────────────────────────────── */
export const MegaFooter = (props: SiteFooterProps): JSX.Element => {
  const { params } = props;
  const { styles, RenderingIdentifier } = params;
  const brandLogo = getBrandLogo(props);

  if (!params) return <SiteFooterDefaultComponent />;

  const extraColumns = [
    {
      title: 'Resources',
      links: ['Webinars', 'Case Studies', 'White Papers', 'API Docs'],
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
    },
  ];

  return (
    <div className={cn('component site-footer', styles)} id={RenderingIdentifier}>
      <footer
        className="w-full"
        style={{
          backgroundColor: 'var(--brand-footer-bg, #111111)',
          color: 'var(--brand-footer-fg, #ffffff)',
        }}
      >
        {/* Newsletter bar */}
        <div
          className="border-b"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
            <div>
              <h3 className="text-lg font-semibold font-[var(--brand-heading-font,inherit)]">
                Subscribe to our newsletter
              </h3>
              <p className="mt-1 text-sm opacity-60 font-[var(--brand-body-font,inherit)]">
                Get the latest updates delivered to your inbox.
              </p>
            </div>
            <div className="flex w-full max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-[var(--brand-button-radius,0.375rem)] border px-4 py-2 text-sm"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: 'var(--brand-footer-fg, #ffffff)',
                }}
              />
              <button
                type="button"
                className="shrink-0 rounded-[var(--brand-button-radius,0.375rem)] px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'var(--brand-primary-foreground)',
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 md:grid-cols-6">
            <div className="md:col-span-2 space-y-4">
              <Logo brandLogo={brandLogo} />
              <p className="max-w-xs text-sm opacity-60 font-[var(--brand-body-font,inherit)]">
                Building the future of digital experiences. Trusted by teams worldwide.
              </p>
              <SocialIcons />
            </div>

            {LINK_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-70 font-[var(--brand-heading-font,inherit)]">
                  {col.title}
                </h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm opacity-60 transition-opacity hover:opacity-100 font-[var(--brand-body-font,inherit)]">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {extraColumns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-70 font-[var(--brand-heading-font,inherit)]">
                  {col.title}
                </h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm opacity-60 transition-opacity hover:opacity-100 font-[var(--brand-body-font,inherit)]">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <Copyright />
            <div className="flex gap-6 text-sm opacity-50">
              <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ────────────────────────────────────────────
   HCA — deep navy footer with phone, pill quick-actions, 3 link columns,
   social icons, legal links, copyright
   ──────────────────────────────────────────── */
const HCA_QUICK_ACTIONS = [
  'App Download',
  'Get a second opinion',
  'Find a doctor',
  'Pay my bill',
];

const HCA_LINK_COLUMNS = [
  {
    title: 'About HCA',
    links: ['About HCA UK', 'News & press', 'Careers', 'Our locations'],
  },
  {
    title: 'Media',
    links: ['Press releases', 'Latest news', 'Insights', 'Patient stories'],
  },
  {
    title: 'Service lines',
    links: ["Women's health", 'Orthopaedics & spine', 'Maternity', 'Cardiac', 'Cancer care', 'Neurology'],
  },
];

export const HCA = (props: SiteFooterProps): JSX.Element => {
  const { styles, RenderingIdentifier } = props.params;
  if (!props.fields && !props.rendering) return <SiteFooterDefaultComponent />;
  const brandLogo = getBrandLogo(props);

  return (
    <div className={cn('component site-footer', styles)} id={RenderingIdentifier}>
      <footer
        className="w-full px-4 py-16 md:py-20"
        style={{
          backgroundColor: 'var(--brand-footer-bg, #0C2141)',
          color: 'var(--brand-footer-fg, #ffffff)',
          fontFamily: 'var(--brand-body-font, inherit)',
        }}
      >
        <div className="mx-auto max-w-7xl">
          {/* Top row: logo + phone, quick actions */}
          <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <Logo brandLogo={brandLogo} />
              <a
                href="tel:02070794344"
                className="hidden text-sm font-medium opacity-80 hover:opacity-100 transition-opacity md:inline-block"
              >
                020 7079 4344
              </a>
            </div>
            <div className="flex flex-wrap gap-3">
              {HCA_QUICK_ACTIONS.map((action) => (
                <a
                  key={action}
                  href="#"
                  className="inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-xs font-semibold transition-colors hover:bg-white/10"
                >
                  {action}
                </a>
              ))}
            </div>
          </div>

          {/* Middle: 3 link columns + CQC card */}
          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-4">
            {HCA_LINK_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3
                  className="mb-4 text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: 'var(--brand-heading-font, inherit)' }}
                >
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm opacity-80 transition-opacity hover:opacity-100"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* CQC review card */}
            <div className="rounded-lg border border-white/15 p-5 text-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">
                Verified reviews
              </p>
              <p className="mt-3 font-medium leading-tight">
                CQC rating: <span className="font-semibold">Outstanding</span>
              </p>
              <div className="mt-3 flex items-center gap-1 text-base">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} aria-hidden>{s}</span>
                ))}
              </div>
              <p className="mt-1 text-xs opacity-80">32,000+ patient reviews</p>
              <p className="mt-3 text-[10px] font-medium uppercase tracking-wider opacity-70">
                Verified by doctify
              </p>
            </div>
          </div>

          {/* Bottom row: social icons + legal links + copyright */}
          <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
            <SocialIcons />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs opacity-70">
              <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Modern slavery</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Accessibility</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Cookie settings</a>
            </div>
            <Copyright />
          </div>
        </div>
      </footer>
    </div>
  );
};
