import React, { JSX } from 'react';
import Link from 'next/link';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

type SiteFooterProps = ComponentProps;

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

const Logo = () => (
  <Link
    href="/"
    className="text-xl font-bold tracking-tight"
    style={{ color: 'var(--brand-footer-fg, #ffffff)' }}
  >
    <span style={{ color: 'var(--brand-primary)' }}>Brand</span>Logo
  </Link>
);

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
              <Logo />
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
          <Logo />
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
   Howdens — dark navy 4-column footer with crown logo, copyright row,
   and a small social-icon row above the columns.
   ──────────────────────────────────────────── */
const HOWDENS_FOOTER_COLUMNS = [
  {
    title: 'Social media',
    links: ['Facebook', 'Instagram', 'YouTube', 'LinkedIn', 'TikTok'],
  },
  {
    title: 'Help',
    links: ['Contact us', 'Find a depot', 'Brochures', 'FAQs', 'Trade account'],
  },
  {
    title: 'About Howdens',
    links: ['Our story', 'Sustainability', 'Careers', 'News', 'Investor relations'],
  },
  {
    title: 'More from us',
    links: ['Howdens Live', 'Howdens Insider', 'Trade benefits', 'Kitchen Visualiser'],
  },
];

const HowdensCrown = () => (
  <svg
    width="36"
    height="28"
    viewBox="0 0 36 28"
    fill="none"
    aria-hidden="true"
    style={{ color: 'var(--brand-footer-fg)' }}
  >
    <path
      d="M3 22 L8 6 L13 16 L18 4 L23 16 L28 6 L33 22 Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const Howdens = (props: SiteFooterProps): JSX.Element => {
  const { params } = props;
  const { styles, RenderingIdentifier } = params;
  if (!params) return <SiteFooterDefaultComponent />;

  return (
    <div className={cn('component site-footer', styles)} id={RenderingIdentifier}>
      <footer
        className="w-full"
        style={{
          backgroundColor: 'var(--brand-footer-bg)',
          color: 'var(--brand-footer-fg)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="grid gap-10 md:grid-cols-4">
            {HOWDENS_FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3
                  className="mb-4 text-xs font-bold uppercase tracking-wider font-[var(--brand-heading-font,inherit)]"
                  style={{ color: 'var(--brand-footer-fg)' }}
                >
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm opacity-70 transition-opacity hover:opacity-100 font-[var(--brand-body-font,inherit)]"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="mt-12 flex flex-col items-center gap-4 border-t pt-8 md:flex-row md:justify-between"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-3">
              <HowdensCrown />
              <span className="text-sm font-semibold tracking-wide font-[var(--brand-heading-font,inherit)]">
                Howden Joinery Ltd
              </span>
            </div>
            <p className="text-xs opacity-60 font-[var(--brand-body-font,inherit)]">
              &copy; {new Date().getFullYear()} Howden Joinery Ltd. All rights reserved.
            </p>
          </div>
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
              <Logo />
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
