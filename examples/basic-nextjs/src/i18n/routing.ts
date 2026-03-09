import { defineRouting } from 'next-intl/routing';
import sitecoreConfig from 'sitecore.config';

/**
 * Supported locales, driven by NEXT_PUBLIC_SUPPORTED_LANGUAGES (comma-separated).
 * Falls back to the single default language when the variable is not set.
 * Example: NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,en-CA
 */
const SUPPORTED_LOCALES = (
  process.env.NEXT_PUBLIC_SUPPORTED_LANGUAGES?.split(',').map((l) => l.trim()) ??
  [sitecoreConfig.defaultLanguage]
) as [string, ...string[]];

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: SUPPORTED_LOCALES,

  // Used when no locale matches
  defaultLocale: sitecoreConfig.defaultLanguage,

  // No prefix is added for the default locale ("as-needed").
  // For other configuration options, refer to the next-intl documentation:
  // https://next-intl.dev/docs/routing/configuration
  localePrefix: 'as-needed',
});
