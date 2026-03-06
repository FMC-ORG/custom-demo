#!/usr/bin/env node
/**
 * fetch-images.js
 * 
 * Downloads images from a website for use in SitecoreAI demo replication.
 * 
 * Strategy:
 *   1. Try plain fetch to extract <img> src and CSS background-image URLs
 *   2. If fetch returns incomplete HTML (no <img> tags found), fall back to
 *      scanning the local screenshots/ folder for manually captured images
 *   3. Download each image to demo/tmp/demo-images/[section]/
 *   4. Output image-map.json mapping { section, localPath, sourceUrl, alt }
 * 
 * Usage:
 *   node scripts/fetch-images.js <domain> [screenshotsFolder]
 * 
 * Examples:
 *   node scripts/fetch-images.js https://example.com
 *   node scripts/fetch-images.js https://example.com ./screenshots
 * 
 * Output:
 *   demo/tmp/demo-images/image-map.json
 *   demo/tmp/demo-images/[section]/[filename].[ext]
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// ─── Config ──────────────────────────────────────────────────────────────────

const domain = process.argv[2];
const screenshotsFolder = process.argv[3] || './screenshots';
const outputDir = path.join(process.cwd(), 'demo', 'tmp', 'demo-images');
const imageMapPath = path.join(outputDir, 'image-map.json');

const MIN_IMAGES_FROM_FETCH = 3; // If fetch returns fewer than this, use fallback
const DOWNLOAD_TIMEOUT_MS = 10000;
const MAX_IMAGES_PER_SECTION = 10;

// Image extensions to consider
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'];

// Skip tiny icons/tracking pixels
const MIN_IMAGE_SIZE_BYTES = 2000;

if (!domain) {
  console.error('Usage: node scripts/fetch-images.js <domain> [screenshotsFolder]');
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SitecoreDemo/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: DOWNLOAD_TIMEOUT_MS,
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).href;
        return fetchUrl(redirectUrl).then(resolve).catch(reject);
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const file = fs.createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SitecoreDemo/1.0)' },
      timeout: DOWNLOAD_TIMEOUT_MS,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        const redirectUrl = new URL(res.headers.location, url).href;
        return downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        file.close();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }

      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(destPath);
        if (stats.size < MIN_IMAGE_SIZE_BYTES) {
          fs.unlinkSync(destPath);
          return reject(new Error(`Image too small (${stats.size} bytes), likely an icon`));
        }
        resolve(destPath);
      });
    });

    req.on('error', (err) => { file.close(); fs.unlinkSync(destPath); reject(err); });
    req.on('timeout', () => { req.destroy(); file.close(); reject(new Error('Download timed out')); });
  });
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getExtension(url) {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase().split('?')[0];
    return IMAGE_EXTENSIONS.includes(ext) ? ext : '.jpg';
  } catch {
    return '.jpg';
  }
}

function inferSection(url, alt, nearbyText) {
  const combined = `${url} ${alt} ${nearbyText}`.toLowerCase();
  if (combined.match(/hero|banner|header|above.fold|splash/)) return 'hero';
  if (combined.match(/logo|brand/)) return 'branding';
  if (combined.match(/team|person|staff|author|avatar|portrait/)) return 'team';
  if (combined.match(/testimon|review|quote|client/)) return 'testimonials';
  if (combined.match(/product|item|shop|catalog/)) return 'products';
  if (combined.match(/feature|benefit|why|how/)) return 'features';
  if (combined.match(/partner|customer|trust|sponsor/)) return 'partners';
  if (combined.match(/blog|post|article|news/)) return 'blog';
  if (combined.match(/icon|illustration|graphic/)) return 'icons';
  if (combined.match(/bg|background/)) return 'backgrounds';
  if (combined.match(/footer/)) return 'footer';
  return 'general';
}

// ─── Step 1: Extract image URLs from HTML ────────────────────────────────────

async function extractImagesFromHtml(domain) {
  console.log(`\n🌐 Fetching HTML from ${domain}...`);
  
  const images = [];

  try {
    const { body, status } = await fetchUrl(domain);
    
    if (status !== 200) {
      console.warn(`  ⚠️  Got HTTP ${status}, HTML may be incomplete`);
    }

    // Extract <img> tags
    const imgRegex = /<img[^>]+>/gi;
    const srcRegex = /src=["']([^"']+)["']/i;
    const altRegex = /alt=["']([^"']*)["']/i;
    const loadingRegex = /loading=["']lazy["']/i;

    let match;
    while ((match = imgRegex.exec(body)) !== null) {
      const tag = match[0];
      const srcMatch = srcRegex.exec(tag);
      const altMatch = altRegex.exec(tag);

      if (!srcMatch) continue;

      let src = srcMatch[1];
      const alt = altMatch ? altMatch[1] : '';

      // Skip data URIs, tiny tracking pixels, and SVG sprites
      if (src.startsWith('data:')) continue;
      if (src.includes('1x1') || src.includes('pixel') || src.includes('blank')) continue;

      // Make absolute URL
      try {
        src = new URL(src, domain).href;
      } catch {
        continue;
      }

      // Skip non-image URLs
      const ext = path.extname(new URL(src).pathname).toLowerCase();
      if (ext && !IMAGE_EXTENSIONS.includes(ext)) continue;

      images.push({ sourceUrl: src, alt, section: inferSection(src, alt, '') });
    }

    // Extract CSS background-image URLs
    const bgRegex = /background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/gi;
    while ((match = bgRegex.exec(body)) !== null) {
      let src = match[1];
      if (src.startsWith('data:')) continue;
      try {
        src = new URL(src, domain).href;
        images.push({ sourceUrl: src, alt: 'background', section: 'backgrounds' });
      } catch {
        continue;
      }
    }

    // Extract Open Graph / meta images (usually the hero/featured image)
    const ogRegex = /<meta[^>]+(?:property=["']og:image["']|name=["']twitter:image["'])[^>]+content=["']([^"']+)["']/gi;
    while ((match = ogRegex.exec(body)) !== null) {
      try {
        const src = new URL(match[1], domain).href;
        images.push({ sourceUrl: src, alt: 'og-image', section: 'hero' });
      } catch {
        continue;
      }
    }

    console.log(`  ✅ Found ${images.length} image URLs in HTML`);
    return images;

  } catch (err) {
    console.warn(`  ⚠️  Fetch failed: ${err.message}`);
    return [];
  }
}

// ─── Step 2: Fallback — scan screenshots folder ───────────────────────────────

function extractImagesFromScreenshots(screenshotsFolder) {
  console.log(`\n📁 Scanning screenshots folder: ${screenshotsFolder}`);

  if (!fs.existsSync(screenshotsFolder)) {
    console.warn(`  ⚠️  Screenshots folder not found: ${screenshotsFolder}`);
    return [];
  }

  const images = [];

  function scanDir(dir, depth = 0) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && depth < 2) {
        scanDir(fullPath, depth + 1);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          // Infer section from folder name or filename
          const folderName = path.basename(dir);
          const section = inferSection(entry.name, '', folderName);
          images.push({
            sourceUrl: null,
            localPath: fullPath,
            alt: path.basename(entry.name, ext).replace(/[-_]/g, ' '),
            section,
            fromScreenshots: true,
          });
        }
      }
    }
  }

  scanDir(screenshotsFolder);
  console.log(`  ✅ Found ${images.length} images in screenshots folder`);
  return images;
}

// ─── Step 3: Download images ──────────────────────────────────────────────────

async function downloadImages(images) {
  console.log(`\n⬇️  Downloading ${images.length} images...`);
  
  const results = [];
  const sectionCounts = {};

  // Deduplicate by URL
  const seen = new Set();
  const unique = images.filter(img => {
    if (!img.sourceUrl) return true; // Screenshots are always unique
    if (seen.has(img.sourceUrl)) return false;
    seen.add(img.sourceUrl);
    return true;
  });

  for (const img of unique) {
    const section = img.section || 'general';
    sectionCounts[section] = (sectionCounts[section] || 0) + 1;

    // Respect per-section limit
    if (sectionCounts[section] > MAX_IMAGES_PER_SECTION) continue;

    // Screenshots are already local — just copy to output dir
    if (img.fromScreenshots) {
      const ext = path.extname(img.localPath);
      const filename = `${slugify(img.alt) || `image-${sectionCounts[section]}`}${ext}`;
      const destPath = path.join(outputDir, section, filename);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(img.localPath, destPath);
      results.push({ ...img, localPath: destPath, status: 'copied' });
      console.log(`  📋 Copied: ${section}/${filename}`);
      continue;
    }

    // Download remote image
    const ext = getExtension(img.sourceUrl);
    const filename = `${slugify(img.alt) || `image-${sectionCounts[section]}`}${ext}`;
    const destPath = path.join(outputDir, section, filename);

    try {
      await downloadFile(img.sourceUrl, destPath);
      results.push({ ...img, localPath: destPath, status: 'downloaded' });
      console.log(`  ✅ Downloaded: ${section}/${filename}`);
    } catch (err) {
      console.warn(`  ⚠️  Skipped ${img.sourceUrl}: ${err.message}`);
      results.push({ ...img, localPath: null, status: 'failed', error: err.message });
    }
  }

  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 SitecoreAI Demo — Image Fetch Script');
  console.log(`   Domain:      ${domain}`);
  console.log(`   Screenshots: ${screenshotsFolder}`);
  console.log(`   Output:      ${outputDir}`);

  fs.mkdirSync(outputDir, { recursive: true });

  // Step 1: Try fetching from live site
  let images = await extractImagesFromHtml(domain);

  // Step 2: If fetch returned too few images, supplement with screenshots
  if (images.length < MIN_IMAGES_FROM_FETCH) {
    console.log(`\n⚠️  Not enough images from fetch (${images.length}), using screenshots fallback`);
    const screenshotImages = extractImagesFromScreenshots(screenshotsFolder);
    images = [...images, ...screenshotImages];
  } else {
    // Always supplement with any screenshots that exist
    if (fs.existsSync(screenshotsFolder)) {
      const screenshotImages = extractImagesFromScreenshots(screenshotsFolder);
      if (screenshotImages.length > 0) {
        console.log(`\n➕ Supplementing with ${screenshotImages.length} screenshots`);
        images = [...images, ...screenshotImages];
      }
    }
  }

  if (images.length === 0) {
    console.error('\n❌ No images found. Add screenshots to ./screenshots/ and try again.');
    process.exit(1);
  }

  // Step 3: Download everything
  const results = await downloadImages(images);

  // Step 4: Write image map
  const successful = results.filter(r => r.localPath && r.status !== 'failed');
  const failed = results.filter(r => r.status === 'failed');

  const imageMap = {
    domain,
    generatedAt: new Date().toISOString(),
    totalImages: successful.length,
    failedImages: failed.length,
    sections: {},
  };

  for (const img of successful) {
    const section = img.section || 'general';
    if (!imageMap.sections[section]) imageMap.sections[section] = [];
    imageMap.sections[section].push({
      localPath: img.localPath,
      sourceUrl: img.sourceUrl || null,
      alt: img.alt || '',
      fromScreenshots: img.fromScreenshots || false,
    });
  }

  fs.writeFileSync(imageMapPath, JSON.stringify(imageMap, null, 2));

  console.log('\n✅ Done!');
  console.log(`   Images downloaded: ${successful.length}`);
  console.log(`   Images failed:     ${failed.length}`);
  console.log(`   Image map:         ${imageMapPath}`);
  console.log('\n📦 Sections found:');
  for (const [section, imgs] of Object.entries(imageMap.sections)) {
    console.log(`   ${section}: ${imgs.length} image(s)`);
  }

  // Output the map path for Claude Code to read
  console.log(`\nIMAGE_MAP_PATH=${imageMapPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});