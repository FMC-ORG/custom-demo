import type { LinkField } from '@sitecore-content-sdk/nextjs';

/**
 * Clones a LinkField and prepends the active locale to any relative/internal href.
 * External URLs (http/https, protocol-relative) are returned unchanged.
 *
 * @param {LinkField | undefined} field - The Sitecore link field to prefix
 * @param {string} locale - The active locale code (e.g. "en", "it")
 * @returns {LinkField | undefined} A new field with the locale-prefixed href, or the original if external/empty
 */
export function withLocale(field: LinkField | undefined, locale: string): LinkField | undefined {
  if (!field?.value?.href) return field;
  const href = field.value.href as string;
  if (href.startsWith('http') || href.startsWith('//')) return field;
  const prefixed = href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`;
  return { ...field, value: { ...field.value, href: prefixed } };
}
