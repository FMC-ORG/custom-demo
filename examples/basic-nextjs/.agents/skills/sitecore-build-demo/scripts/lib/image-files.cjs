'use strict';
/**
 * Type downloaded images by their content and make them usable downstream.
 *
 * Many sites serve images from URLs without a file extension (image CDNs, Next.js image routes),
 * so the extension of the URL is not evidence of the format. The bytes are; the Content-Type
 * header is the fallback. SVG is rasterised to PNG: Content Hub image fields and next/image need a
 * raster with real dimensions, and SVG from a remote host is blocked by next/image by default.
 */
const HEADER_TYPES = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/pjpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

function sniff(buf) {
  if (!buf || buf.length < 4) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf.toString('ascii', 0, 4) === 'GIF8') return 'gif';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP')
    return 'webp';
  if (buf.toString('ascii', 4, 12) === 'ftypavif') return 'avif';
  const head = buf.toString('utf8', 0, Math.min(buf.length, 1024)).trimStart();
  if (head.startsWith('<') && /<svg[\s>]/i.test(head)) return 'svg';
  return null;
}

/** File extension for the image (`jpg`, `png`, `gif`, `webp`, `avif`, `svg`), or null. */
function imageType(buffer, contentType = '') {
  return (
    sniff(buffer) || HEADER_TYPES[String(contentType).split(';')[0].trim().toLowerCase()] || null
  );
}

const defaultLoadSharp = async () => require('sharp');

/**
 * @returns {Promise<{ buffer: Buffer, ext: string|null, convertedFrom?: 'svg', conversionNeeded?: true }>}
 */
async function normalizeImage(buffer, contentType, { loadSharp = defaultLoadSharp } = {}) {
  const ext = imageType(buffer, contentType);
  if (ext !== 'svg') return { buffer, ext };
  try {
    const sharp = await loadSharp();
    // 2x density keeps logos and icons crisp at their rendered size.
    const png = await sharp(buffer, { density: 144 }).png().toBuffer();
    return { buffer: png, ext: 'png', convertedFrom: 'svg' };
  } catch {
    return { buffer, ext: 'svg', conversionNeeded: true };
  }
}

module.exports = { imageType, normalizeImage };
