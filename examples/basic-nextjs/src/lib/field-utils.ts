/** Visibility only: SDK field values remain unchanged and editable. */
export const hasText = (value?: unknown): boolean =>
  typeof value === 'string' ? value.trim().length > 0 : !!value;

/** Empty formatting is not content; media-only authored HTML still is. SSR-safe. */
export const hasRichText = (value?: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const html = value
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  if (/<(?:img|video|audio|iframe|embed|object|svg|canvas|hr)\b/i.test(html)) return true;
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(
      /&(?:nbsp|ensp|emsp|thinsp|ZeroWidthSpace);|&#(?:x([a-f\d]+)|(\d+));/gi,
      (entity, hex: string | undefined, decimal: string | undefined) => {
        if (!hex && !decimal) return ' ';
        const code = parseInt(hex || decimal || '', hex ? 16 : 10);
        return code <= 0x10ffff ? String.fromCodePoint(code) : entity;
      },
    );
  return text.replace(/[\s\u200b-\u200d\ufeff]/g, '').length > 0;
};
