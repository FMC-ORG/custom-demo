'use strict';
// Sitecore showcase build (2026-10-20): the content extractor saved every image as `.jpg` because
// sitecore.com serves images from URLs without an extension; SVG, WebP and PNG files got the wrong
// type and SVGs had no dimensions. Images are typed by content, and SVG is rasterised to PNG.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const sharp = require('sharp');
const {
  imageType,
  normalizeImage,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/image-files.cjs');
const {
  getImageDimensions,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/image-dimensions.cjs');

const SVG = Buffer.from(
  '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect width="120" height="40" fill="#e00"/></svg>',
);
const raster = (format) =>
  sharp({ create: { width: 30, height: 20, channels: 3, background: '#0a0' } })
    [format]()
    .toBuffer();
const dims = async (buffer, ext) => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'img-')), `x.${ext}`);
  fs.writeFileSync(file, buffer);
  try {
    return getImageDimensions(file);
  } finally {
    fs.rmSync(path.dirname(file), { recursive: true, force: true });
  }
};

test('image type comes from the bytes, with the Content-Type header as a fallback', async () => {
  expect(imageType(await raster('jpeg'))).toBe('jpg');
  expect(imageType(await raster('png'))).toBe('png');
  expect(imageType(await raster('webp'))).toBe('webp');
  expect(imageType(await raster('gif'))).toBe('gif');
  expect(imageType(SVG)).toBe('svg');
  // A server that labels a PNG as JPEG does not decide the type.
  expect(imageType(await raster('png'), 'image/jpeg')).toBe('png');
  expect(imageType(Buffer.from('unknown bytes'), 'image/webp; charset=binary')).toBe('webp');
  expect(imageType(Buffer.from('unknown bytes'), 'text/html')).toBeNull();
});

test('SVG is rasterised to PNG with readable dimensions; raster formats keep their bytes', async () => {
  const svg = await normalizeImage(SVG, 'image/svg+xml');
  expect(svg).toMatchObject({ ext: 'png', convertedFrom: 'svg' });
  const size = await dims(svg.buffer, 'png');
  expect(size.width / size.height).toBeCloseTo(3, 1);

  const webp = await raster('webp');
  const kept = await normalizeImage(webp, 'image/webp');
  expect(kept).toMatchObject({ ext: 'webp' });
  expect(kept.buffer.equals(webp)).toBe(true);
});

test('without a rasteriser the SVG is kept and flagged instead of failing', async () => {
  const result = await normalizeImage(SVG, 'image/svg+xml', {
    loadSharp: async () => {
      throw new Error('sharp unavailable');
    },
  });
  expect(result).toMatchObject({ ext: 'svg', conversionNeeded: true });
});

test('dimensions are read for WebP and GIF as well', async () => {
  expect(await dims(await raster('webp'), 'webp')).toEqual({ width: 30, height: 20 });
  expect(await dims(await raster('gif'), 'gif')).toEqual({ width: 30, height: 20 });
});
