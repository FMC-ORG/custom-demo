/**
 * Represents the value object of a Sitecore image/media field.
 * Content Hub assets carry a `dam-content-type` property ("Video" | "Image")
 * that is the authoritative way to distinguish media types because DAM URLs
 * are opaque UUIDs with no file-extension.
 */
export interface MediaFieldValue {
  src?: string;
  'dam-content-type'?: string;
  [key: string]: unknown;
}

/**
 * Returns true when the field value represents a video asset.
 *
 * Detection order:
 * 1. `dam-content-type` — used for Content Hub assets where the URL has no extension.
 * 2. URL extension fallback — covers non-DAM video files (.mp4, .webm, .mov, .ogv).
 *
 * @param {MediaFieldValue | undefined} value - The `.value` object from a Sitecore image field
 * @returns {boolean} Whether the media asset is a video
 */
export function isVideoMedia(value: MediaFieldValue | undefined): boolean {
  if (!value) return false;
  const damType = value['dam-content-type'];
  if (damType) return damType.toLowerCase() === 'video';
  const path = (value.src ?? '').split('?')[0].toLowerCase();
  return ['.mp4', '.webm', '.mov', '.ogv'].some((ext) => path.endsWith(ext));
}
