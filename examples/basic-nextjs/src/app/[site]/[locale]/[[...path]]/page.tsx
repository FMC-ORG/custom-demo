import { isDesignLibraryPreviewData } from "@sitecore-content-sdk/nextjs/editing";
import { notFound } from "next/navigation";
import { draftMode, headers } from "next/headers";
import { SiteInfo } from "@sitecore-content-sdk/nextjs";
import sites from ".sitecore/sites.json";
import { routing } from "src/i18n/routing";
import scConfig from "sitecore.config";
import client from "src/lib/sitecore-client";
import Layout, { RouteFields } from "src/Layout";
import components from ".sitecore/component-map";
import Providers from "src/Providers";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import {
  BRAND,
  buildCanonical,
  resolveOgImage,
  resolveRobots,
  isArticle,
  articleJsonLd,
  JsonLd,
} from "src/lib/seo";

type PageProps = {
  params: Promise<{
    site: string;
    locale: string;
    path?: string[];
    [key: string]: string | string[] | undefined;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params }: PageProps) {
  const { site, locale, path } = await params;
  const draft = await draftMode();

  // Set site and locale to be available in src/i18n/request.ts for fetching the dictionary
  setRequestLocale(`${site}_${locale}`);

  // Fetch the page data from Sitecore
  let page;
  if (draft.isEnabled) {
    // Read editing/preview params from the SDK-managed header
    // (`x-sitecore-editing-params`), which the editing render route handler
    // populates reliably (including `variantIds`). Reading from `searchParams`
    // can omit `variantIds`, causing `getPreview` to crash on `.split()`.
    const editingParams = client.getPreviewData(await headers());
    if (isDesignLibraryPreviewData(editingParams)) {
      page = await client.getDesignLibraryData(editingParams);
    } else {
      page = await client.getPreview(editingParams);
    }
  } else {
    page = await client.getPage(path ?? [], { site, locale });
  }

  // If the page is not found, return a 404
  if (!page) {
    notFound();
  }

  // Fetch the component data from Sitecore (Likely will be deprecated)
  const componentProps = await client.getComponentData(
    page.layout,
    {},
    components,
  );

  // Article pages emit BlogPosting JSON-LD (Organization + WebSite are site-wide in the root layout).
  const routeFields = (page.layout.sitecore.route?.fields ?? {}) as RouteFields;
  const canonicalUrl = buildCanonical(path?.length ? `/${path.join("/")}` : "");

  return (
    <NextIntlClientProvider>
      {isArticle(routeFields) && (
        <JsonLd data={articleJsonLd(routeFields, canonicalUrl)} />
      )}
      <Providers page={page} componentProps={componentProps}>
        <Layout page={page} />
      </Providers>
    </NextIntlClientProvider>
  );
}

// This function gets called at build and export time to determine
// pages for SSG ("paths", as tokenized array).
export const generateStaticParams = async () => {
  if (process.env.NODE_ENV !== "development" && scConfig.generateStaticPaths) {
    // Filter sites to only include the sites this starter is designed to serve.
    // This prevents cross-site build errors when multiple starters share the same XM Cloud instance.
    const defaultSite = scConfig.defaultSite;
    const allowedSites = defaultSite
      ? sites
          .filter((site: SiteInfo) => site.name === defaultSite)
          .map((site: SiteInfo) => site.name)
      : sites.map((site: SiteInfo) => site.name);
    return await client.getAppRouterStaticParams(
      allowedSites,
      routing.locales.slice(),
    );
  }
  return [];
};

// Metadata fields for the page.
export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { path, site, locale } = await params;

  // Content path only (no site/locale segments). Canonical/og:url always resolve
  // against the fixed production origin via buildCanonical — never the request host.
  const pathSegment = path?.length ? `/${path.join("/")}` : "";
  const canonicalUrl = buildCanonical(pathSegment);

  // Same call as for rendering the page — cached by React for the request.
  const page = await client.getPage(path ?? [], { site, locale });
  const route = page?.layout.sitecore.route;
  const fields = (route?.fields ?? {}) as RouteFields;

  // Title: author SEO title → page Title → route name. Brand suffix is applied
  // by the root layout's title.template ("%s | Sage").
  const title =
    fields.metadataTitle?.value?.toString() ||
    fields.Title?.value?.toString() ||
    route?.displayName ||
    route?.name ||
    BRAND.name;

  const description =
    fields.metadataDescription?.value?.toString() ||
    fields.ogDescription?.value?.toString() ||
    fields.pageSummary?.value?.toString() ||
    "Sitecore Next.js Basic Example";

  const keywordsString = fields.metadataKeywords?.value?.toString() || "";
  const keywords = keywordsString
    ? keywordsString.split(",").map((k: string) => k.trim()).filter(Boolean)
    : [];

  const ogTitle = fields.ogTitle?.value?.toString() || title;
  const ogImage = resolveOgImage(fields);
  const ogType: "article" | "website" = isArticle(fields) ? "article" : "website";

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    robots: resolveRobots(fields, { contentPath: pathSegment }),
    openGraph: {
      title: ogTitle,
      description,
      url: canonicalUrl,
      siteName: BRAND.name,
      locale: BRAND.locale,
      type: ogType,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      site: BRAND.twitterHandle,
      title: ogTitle,
      description,
      images: [ogImage],
    },
  };
};
