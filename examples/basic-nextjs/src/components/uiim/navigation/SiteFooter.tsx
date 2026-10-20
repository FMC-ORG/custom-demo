import React, { JSX } from "react";
import {
  Field,
  ImageField,
  LinkField,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  Text,
} from "@sitecore-content-sdk/nextjs";
import { hasText } from "@/lib/field-utils";
import { HeinekenSocialIcon } from "@/lib/heineken-ui";
import Link from "next/link";
import { ComponentProps } from "lib/component-props";
import { cn } from "@/lib/utils";

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
  const fromRendering =
    rendering?.fields?.data?.datasource?.brandLogo?.jsonValue;
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
    title: "Products",
    links: ["Overview", "Features", "Pricing", "Integrations"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Press"],
  },
  {
    title: "Support",
    links: ["Help Center", "Contact", "Documentation", "Status"],
  },
];

const Logo = ({ brandLogo }: { brandLogo?: ImageField }) => {
  const hasImage = brandLogo?.value?.src;
  return (
    <Link
      href="/"
      className="flex items-center text-xl font-bold tracking-tight"
      style={{ color: "var(--brand-footer-fg, #ffffff)" }}
    >
      {hasImage ? (
        <ContentSdkImage
          field={brandLogo}
          className="h-8 w-auto object-contain brightness-0 invert sm:h-10"
        />
      ) : (
        <>
          <span style={{ color: "var(--brand-primary)" }}>Brand</span>Logo
        </>
      )}
    </Link>
  );
};

const SocialIcons = () => (
  <div className="flex items-center gap-4">
    {["X", "Li", "Fb", "Ig"].map((label) => (
      <a
        key={label}
        href="#"
        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-opacity hover:opacity-70"
        style={{
          backgroundColor: "var(--brand-footer-fg, #ffffff)",
          color: "var(--brand-footer-bg, #111111)",
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
    className="text-sm opacity-50 font-body"
    style={{ color: "var(--brand-footer-fg, #ffffff)" }}
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
    <div
      className={cn("component site-footer", styles)}
      id={RenderingIdentifier}
    >
      <footer
        className="w-full"
        style={{
          backgroundColor: "var(--brand-footer-bg, #111111)",
          color: "var(--brand-footer-fg, #ffffff)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <div className="grid gap-8 md:grid-cols-5">
            {/* Logo + description */}
            <div className="md:col-span-2 space-y-4">
              <Logo brandLogo={brandLogo} />
              <p className="max-w-xs text-sm opacity-60 font-body">
                Building the future of digital experiences. Trusted by teams
                worldwide.
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
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
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
    <div
      className={cn("component site-footer", styles)}
      id={RenderingIdentifier}
    >
      <footer
        className="w-full"
        style={{
          backgroundColor: "var(--brand-footer-bg, #111111)",
          color: "var(--brand-footer-fg, #ffffff)",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
          <Logo brandLogo={brandLogo} />
          <nav className="flex flex-wrap items-center gap-6 text-sm opacity-60">
            {["About", "Products", "Blog", "Contact", "Privacy"].map((link) => (
              <a
                key={link}
                href="#"
                className="transition-opacity hover:opacity-100 font-body"
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
      title: "Resources",
      links: ["Webinars", "Case Studies", "White Papers", "API Docs"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
    },
  ];

  return (
    <div
      className={cn("component site-footer", styles)}
      id={RenderingIdentifier}
    >
      <footer
        className="w-full"
        style={{
          backgroundColor: "var(--brand-footer-bg, #111111)",
          color: "var(--brand-footer-fg, #ffffff)",
        }}
      >
        {/* Newsletter bar */}
        <div
          className="border-b"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
            <div>
              <h3 className="text-lg font-semibold font-heading">
                Subscribe to our newsletter
              </h3>
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
                  backgroundColor: "transparent",
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "var(--brand-footer-fg, #ffffff)",
                }}
              />
              <button
                type="button"
                className="shrink-0 rounded-[var(--brand-button-radius,0.375rem)] px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "var(--brand-primary-foreground)",
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
                Building the future of digital experiences. Trusted by teams
                worldwide.
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
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
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

interface HeinekenFooterItem {
  id: string;
  group: { jsonValue: Field<string> };
  linkLabel: { jsonValue: Field<string> };
  linkUrl: { jsonValue: LinkField };
}
interface HeinekenFooterDatasource {
  navigationHeading: { jsonValue: Field<string> };
  subscribeHeading: { jsonValue: Field<string> };
  subscribeLink: { jsonValue: LinkField };
  socialHeading: { jsonValue: Field<string> };
  copyrightText: { jsonValue: Field<string> };
  children: { results: HeinekenFooterItem[] };
}

/* Heineken footer — all client copy and destinations are editable datasource fields. */
export const HeinekenFooter = (props: SiteFooterProps): JSX.Element => {
  const { params, page } = props;
  const ds = props.fields?.data?.datasource as
    HeinekenFooterDatasource | undefined;
  if (!ds) return <SiteFooterDefaultComponent />;
  const editing = page?.mode?.isEditing;
  const logo = getBrandLogo(props);
  const items = ds.children?.results ?? [];
  const group = (name: string) =>
    items.filter((i) => i.group?.jsonValue?.value === name);
  const footerLink = (item: HeinekenFooterItem) => (
    <ContentSdkLink
      key={item.id}
      field={item.linkUrl?.jsonValue}
      className="font-body text-sm font-semibold hover:underline focus-visible:outline-2"
    >
      <Text field={item.linkLabel?.jsonValue} />
    </ContentSdkLink>
  );
  return (
    <div
      className={cn("component heineken-footer relative", params.styles)}
      id={params.RenderingIdentifier}
    >
      <footer
        className="px-6 py-14"
        style={{
          background: "var(--brand-footer-bg)",
          color: "var(--brand-footer-fg)",
        }}
      >
        <div className="mx-auto max-w-[1504px]">
          <div className="grid gap-10 md:grid-cols-[1.3fr_2.3fr_1fr_1fr]">
            <div>
              {(logo?.value?.src || editing) && (
                <ContentSdkImage
                  field={logo}
                  unoptimized
                  className="h-auto w-[181px] object-contain"
                />
              )}
            </div>
            <div>
              {(hasText(ds.navigationHeading?.jsonValue?.value) || editing) && (
                <Text
                  field={ds.navigationHeading?.jsonValue}
                  tag="h2"
                  className="mb-8 font-body text-base font-semibold"
                />
              )}
              <nav
                className="grid max-w-[300px] grid-cols-2 gap-x-6 gap-y-3"
                aria-label="Footer navigation"
              >
                {group("navigation").map(footerLink)}
              </nav>
            </div>
            <div>
              {(hasText(ds.subscribeHeading?.jsonValue?.value) || editing) && (
                <Text
                  field={ds.subscribeHeading?.jsonValue}
                  tag="h2"
                  className="mb-8 font-body text-base font-semibold"
                />
              )}
              {(ds.subscribeLink?.jsonValue?.value?.href || editing) && (
                <ContentSdkLink
                  field={ds.subscribeLink?.jsonValue}
                  className="inline-flex rounded px-6 py-2 font-body text-base font-semibold after:ml-3 after:content-['›']"
                  style={{
                    background:
                      "color-mix(in srgb, var(--brand-footer-fg) 18%, transparent)",
                  }}
                />
              )}
            </div>
            <div>
              {(hasText(ds.socialHeading?.jsonValue?.value) || editing) && (
                <Text
                  field={ds.socialHeading?.jsonValue}
                  tag="h2"
                  className="mb-8 font-body text-base font-semibold"
                />
              )}
              <div className="flex gap-6">
                {group("social").map((item) => (
                  <ContentSdkLink
                    key={item.id}
                    field={item.linkUrl?.jsonValue}
                    className="opacity-60 hover:opacity-100 focus-visible:outline-2"
                  >
                    <span className={editing ? undefined : "sr-only"}>
                      <Text field={item.linkLabel?.jsonValue} />
                    </span>
                    <HeinekenSocialIcon
                      href={item.linkUrl?.jsonValue?.value?.href}
                    />
                  </ContentSdkLink>
                ))}
              </div>
            </div>
          </div>
          <div
            className="mt-12 flex flex-col justify-between gap-6 border-t pt-10 lg:flex-row lg:items-center"
            style={{
              borderColor:
                "color-mix(in srgb, var(--brand-footer-fg) 50%, transparent)",
            }}
          >
            <nav
              className="flex flex-wrap gap-x-6 gap-y-3"
              aria-label="Legal navigation"
            >
              {group("legal").map(footerLink)}
              {group("consent").map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={!editing}
                  className="font-body text-sm font-semibold opacity-60"
                  title="Consent manager integration pending"
                >
                  <Text field={item.linkLabel?.jsonValue} />
                </button>
              ))}
            </nav>
            {(hasText(ds.copyrightText?.jsonValue?.value) || editing) && (
              <Text
                field={ds.copyrightText?.jsonValue}
                tag="p"
                className="shrink-0 font-body text-sm font-semibold"
              />
            )}
          </div>
        </div>
        <ContentSdkLink
          field={{ value: { href: "#page-top" } }}
          aria-label="Back to top"
          className="absolute bottom-28 right-6 flex h-14 w-14 items-center justify-center"
          style={{
            background: "var(--brand-footer-fg)",
            color: "var(--brand-footer-bg)",
          }}
        >
          <svg
            aria-hidden="true"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M12 22V2M3 11l9-9 9 9" />
          </svg>
        </ContentSdkLink>
      </footer>
    </div>
  );
};
