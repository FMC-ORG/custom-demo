const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

/**
 * Reduce an HTML string (rich-text index attributes like ArticleContent) to
 * plain text suitable for a card snippet. Regex-based so it is SSR-safe.
 */
export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Format an ISO date string from a search document for card display.
 * Returns an empty string for missing or unparseable values.
 */
export const formatDate = (isoDate: string | undefined, locale = 'en'): string => {
  if (!isoDate) return '';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
};
