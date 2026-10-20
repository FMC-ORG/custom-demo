'use strict';
const { readFileSync } = require('node:fs');
function getImageDimensions(filePath) {
  try {
    const buf = readFileSync(filePath);
    // JPEG
    if (buf[0] === 0xFF && buf[1] === 0xD8) {
      let offset = 2;
      while (offset < buf.length) {
        if (buf[offset] !== 0xFF) break;
        const marker = buf[offset + 1];
        const len = buf.readUInt16BE(offset + 2);
        // SOF markers: C0-C3, C5-C7, C9-CB, CD-CF
        if ((marker >= 0xC0 && marker <= 0xC3) || (marker >= 0xC5 && marker <= 0xC7) ||
            (marker >= 0xC9 && marker <= 0xCB) || (marker >= 0xCD && marker <= 0xCF)) {
          const height = buf.readUInt16BE(offset + 5);
          const width = buf.readUInt16BE(offset + 7);
          return { width, height };
        }
        offset += 2 + len;
      }
    }
    // PNG
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      return { width, height };
    }
    // GIF: logical screen size, little-endian
    if (buf.toString('ascii', 0, 4) === 'GIF8') {
      return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    }
    // WebP: lossy (VP8 ), lossless (VP8L) or extended (VP8X)
    if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      const chunk = buf.toString('ascii', 12, 16);
      if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      if (chunk === 'VP8L') {
        const bits = buf.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      if (chunk === 'VP8X') return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
    }
    // SVG — try to parse viewBox or width/height attributes
    if (buf[0] === 0x3C || buf.toString('utf8', 0, 5).includes('<?xml') || buf.toString('utf8', 0, 4) === '<svg') {
      const svgStr = buf.toString('utf8', 0, Math.min(buf.length, 2000));
      const vbMatch = svgStr.match(/viewBox=["'][\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)["']/);
      if (vbMatch) return { width: Math.round(parseFloat(vbMatch[1])), height: Math.round(parseFloat(vbMatch[2])) };
      const wMatch = svgStr.match(/width=["']([\d.]+)/);
      const hMatch = svgStr.match(/height=["']([\d.]+)/);
      if (wMatch && hMatch) return { width: Math.round(parseFloat(wMatch[1])), height: Math.round(parseFloat(hMatch[1])) };
    }
  } catch { /* ignore */ }
  return null;
}


module.exports = { getImageDimensions };
