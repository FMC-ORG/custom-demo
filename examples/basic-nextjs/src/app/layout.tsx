import './globals.css';
import type { Metadata } from 'next';
import {
  SITE_ORIGIN,
  BRAND,
  JsonLd,
  organizationJsonLd,
  webSiteJsonLd,
} from 'src/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: BRAND.name, template: `%s | ${BRAND.name}` },
  openGraph: { siteName: BRAND.name, locale: BRAND.locale, type: 'website' },
  twitter: { card: 'summary_large_image', site: BRAND.twitterHandle },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://edge-platform.sitecorecloud.io" />
        {/* Sage brand fonts — Poppins (headings), Inter (body) — substitutes for proprietary Sage Headline/Sage Text */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@600;700;900&display=swap"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {/* Site-wide structured data */}
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
        {children}
      </body>
    </html>
  );
}