import React, { JSX } from 'react';
import { ImageField, NextImage as ContentSdkImage } from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';
import { Facebook, Instagram, Linkedin, Mail, Twitter, Youtube } from 'lucide-react';

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
  <p className="text-sm opacity-50 font-body" style={{ color: 'var(--brand-footer-fg, #ffffff)' }}>
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
              <p className="max-w-xs text-sm opacity-60 font-body">
                Building the future of digital experiences. Trusted by teams worldwide.
              </p>
              <SocialIcons />
            </div>

            {/* Link columns */}
            {LINK_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-70 font-heading">
                  {col.title}
                </h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm opacity-60 transition-opacity hover:opacity-100 font-body"
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
              <a href="#" className="hover:opacity-100 transition-opacity">
                Privacy Policy
              </a>
              <a href="#" className="hover:opacity-100 transition-opacity">
                Terms of Service
              </a>
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
              <a key={link} href="#" className="transition-opacity hover:opacity-100 font-body">
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
        <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
            <div>
              <h3 className="text-lg font-semibold font-heading">Subscribe to our newsletter</h3>
              <p className="mt-1 text-sm opacity-60 font-body">
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
              <p className="max-w-xs text-sm opacity-60 font-body">
                Building the future of digital experiences. Trusted by teams worldwide.
              </p>
              <SocialIcons />
            </div>

            {LINK_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-70 font-heading">
                  {col.title}
                </h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm opacity-60 transition-opacity hover:opacity-100 font-body"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {extraColumns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-70 font-heading">
                  {col.title}
                </h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm opacity-60 transition-opacity hover:opacity-100 font-body"
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
            className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <Copyright />
            <div className="flex gap-6 text-sm opacity-50">
              <a href="#" className="hover:opacity-100 transition-opacity">
                Privacy Policy
              </a>
              <a href="#" className="hover:opacity-100 transition-opacity">
                Terms of Service
              </a>
              <a href="#" className="hover:opacity-100 transition-opacity">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ────────────────────────────────────────────
   Sitecore variant — indigo footer: five link columns, white logo + social
   row between hairlines, right-aligned legal links and copyright.
   SiteFooterData only has BrandLogo, so (as in the template's other variants)
   the link columns below are static and not authorable.
   ──────────────────────────────────────────── */
const SITECORE_FOOTER_COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: 'Platform',
    links: [
      ['Platform overview', 'https://www.sitecore.com/platform'],
      ['AI Search', 'https://www.sitecore.com/platform/ai-search'],
      ['AI and agents', 'https://www.sitecore.com/platform/ai-and-agents'],
      ['Content Management System', 'https://www.sitecore.com/platform/content-management-system'],
      ['Digital Asset Management', 'https://www.sitecore.com/platform/digital-asset-management'],
      ['Content operations', 'https://www.sitecore.com/platform/content-operations'],
      ['Audience and insights', 'https://www.sitecore.com/platform/audience-and-insights'],
      ['Conversion optimization', 'https://www.sitecore.com/platform/conversion-optimization'],
      ['Commerce', 'https://www.sitecore.com/platform/commerce'],
    ],
  },
  {
    title: 'Solutions',
    links: [
      ['Product strategy', 'https://www.sitecore.com/platform/product-strategy'],
      ['Modernize your DX', 'https://www.sitecore.com/solutions/modernize-your-dx'],
      ['Manage global content', 'https://www.sitecore.com/solutions/manage-global-content'],
      ['Deliver limitless commerce', 'https://www.sitecore.com/solutions/deliver-limitless-commerce'],
      ['Optimize with data', 'https://www.sitecore.com/solutions/optimize-with-data'],
      ['All Customer Stories', 'https://www.sitecore.com/solutions/customers'],
      ['All Analyst Reports', 'https://www.sitecore.com/solutions/analyst-reports'],
    ],
  },
  {
    title: 'Resources',
    links: [
      ['Thought leadership', 'https://www.sitecore.com/solutions/topics'],
      ['Use case library', 'https://www.sitecore.com/platform/use-cases'],
      ['Resource Hub', 'https://www.sitecore.com/resources'],
      ['Insights', 'https://www.sitecore.com/resources/insights'],
      ['Events & Webinars', 'https://www.sitecore.com/resources/events-webinars'],
      ['Trust Center', 'https://trust.sitecore.com/'],
      ['Support', 'https://www.sitecore.com/resources/support'],
    ],
  },
  {
    title: 'Services',
    links: [
      ['Managed Cloud', 'https://www.sitecore.com/platform/managed-cloud'],
      ['Sitecore Services', 'https://www.sitecore.com/services'],
      ['Sitecore360', 'https://www.sitecore.com/services/sitecore360'],
      ['Sitecore Learning', 'https://www.sitecore.com/learning'],
      ['AI Innovation Lab', 'https://www.sitecore.com/services/ai-innovation-lab'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About Us', 'https://www.sitecore.com/company/about-us'],
      ['Contact us', 'https://www.sitecore.com/company/contact-us'],
      ['Newsroom', 'https://www.sitecore.com/company/newsroom'],
      ['Careers', 'https://www.sitecore.com/company/careers'],
    ],
  },
];

const SITECORE_SOCIAL = [
  { label: 'Email', Icon: Mail },
  { label: 'LinkedIn', Icon: Linkedin },
  { label: 'X', Icon: Twitter },
  { label: 'Facebook', Icon: Facebook },
  { label: 'Instagram', Icon: Instagram },
  { label: 'YouTube', Icon: Youtube },
];

export const Sitecore = (props: SiteFooterProps): JSX.Element => {
  const { params } = props;
  if (!params) return <SiteFooterDefaultComponent />;
  const { styles, RenderingIdentifier } = params;
  const brandLogo = getBrandLogo(props);

  return (
    <div className={cn('component site-footer', styles)} id={RenderingIdentifier}>
      <footer
        className="w-full px-4 pb-10 pt-12 md:px-12"
        style={{ backgroundColor: 'var(--brand-footer-bg)', color: 'var(--brand-footer-fg)' }}
      >
        <div className="mx-auto max-w-[1360px]">
          <div className="grid gap-10 px-2 sm:grid-cols-2 md:px-10 lg:grid-cols-[1.3fr_1.2fr_1fr_0.95fr_0.6fr]">
            {SITECORE_FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="mb-5 font-heading text-[22px] font-normal">{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="font-body text-[15px] opacity-90 transition-opacity hover:opacity-100 hover:underline">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-14 flex flex-col items-start justify-between gap-6 border-y border-white/20 px-2 py-6 sm:flex-row sm:items-center md:px-10">
            {brandLogo?.value?.src ? (
              <Link href="/" aria-label="Home">
                <ContentSdkImage field={brandLogo} className="h-[46px] w-auto object-contain" />
              </Link>
            ) : (
              <Logo brandLogo={brandLogo} />
            )}
            <div className="flex items-center gap-6">
              {SITECORE_SOCIAL.map(({ label, Icon }) => (
                <span key={label} aria-label={label} role="img" className="opacity-95">
                  <Icon className="h-8 w-8" strokeWidth={1.6} aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-col items-end gap-3 px-2 font-body text-[14px] md:px-0">
            <div className="flex flex-wrap justify-end gap-x-4 gap-y-2 opacity-90">
              <span>Cookie settings</span>
              <a href="https://www.sitecore.com/legal" className="hover:underline">Legal Hub</a>
              <a href="https://www.sitecore.com/legal/privacy-policy" className="hover:underline">Privacy</a>
              <span>Your privacy choices</span>
              <a href="mailto:webmaster@sitecore.net" className="hover:underline">webmaster@sitecore.net</a>
            </div>
            <p className="opacity-90">© Copyright 2026, Sitecore A/S or a Sitecore affiliated company. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
