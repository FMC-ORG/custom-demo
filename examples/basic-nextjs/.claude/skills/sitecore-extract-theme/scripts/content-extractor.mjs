#!/usr/bin/env node

/**
 * content-extractor.mjs
 *
 * Renders a website with Playwright and extracts structured text content
 * section-by-section. Complements the site-scraper.mjs (which extracts styles).
 *
 * Usage:
 *   node scripts/content-extractor.mjs --url https://example.com --output ./docs/ai/demos/example
 *
 * Options:
 *   --url           URL to scrape (required)
 *   --output        Output directory (required)
 *   --timeout       Page load timeout in ms (default: 30000)
 *   --wait          Extra wait after load in ms (default: 3000)
 *   --help          Show this help
 *
 * Output:
 *   <output>/extracted-content.json — structured content per section
 *
 * Requirements:
 *   npx playwright install chromium (same as site-scraper setup)
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);
function getArg(name, fallback = null) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  if (args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
  return true;
}

if (args.includes('--help') || args.length === 0) {
  console.log(`
Usage: node scripts/content-extractor.mjs --url <URL> --output <DIR>

Options:
  --url           URL to extract content from (required)
  --output        Output directory (required)
  --timeout       Page load timeout in ms (default: 30000)
  --wait          Extra wait after load in ms (default: 3000)
  --help          Show this help
  `);
  process.exit(0);
}

const siteUrl = getArg('url');
const outputDir = getArg('output');
const timeout = parseInt(getArg('timeout', '30000'), 10);
const extraWait = parseInt(getArg('wait', '3000'), 10);

if (!siteUrl) { console.error('Error: --url is required'); process.exit(1); }
if (!outputDir) { console.error('Error: --output is required'); process.exit(1); }

mkdirSync(outputDir, { recursive: true });

console.log(`[content] Starting: ${siteUrl}`);
console.log(`[content] Output: ${outputDir}`);

const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
  const page = await context.newPage();

  await page.goto(siteUrl, { waitUntil: 'networkidle', timeout });
  await page.waitForTimeout(extraWait);

  // Dismiss popups/cookie banners (same logic as site-scraper)
  await page.evaluate(() => {
    const acceptPatterns = [
      /accept\s*(all)?/i, /agree/i, /allow\s*(all)?/i, /consent/i,
      /got\s*it/i, /ok(ay)?/i, /dismiss/i, /close/i, /reject\s*(all)?/i,
      /no\s*thanks/i, /×|✕|✖|╳/, /^x$/i,
    ];
    for (const el of document.querySelectorAll('button, a[role="button"], [role="button"]')) {
      const text = (el.textContent || el.ariaLabel || '').trim();
      if (text.length > 0 && text.length < 50) {
        for (const p of acceptPatterns) {
          if (p.test(text)) { try { el.click(); } catch {} break; }
        }
      }
    }
    for (const sel of ['#onetrust-accept-btn-handler', '.cc-btn.cc-allow', '.cc-dismiss']) {
      try { document.querySelector(sel)?.click(); } catch {}
    }
    for (const sel of ['[class*="cookie" i]', '[class*="consent" i]', '[class*="popup" i]', '[class*="overlay" i]', '[class*="modal" i]']) {
      try {
        for (const el of document.querySelectorAll(sel)) {
          const s = getComputedStyle(el);
          if (s.position === 'fixed' || s.position === 'sticky' || parseInt(s.zIndex) > 100) {
            el.style.display = 'none';
          }
        }
      } catch {}
    }
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
  });
  await page.waitForTimeout(500);

  // Scroll to trigger lazy loading
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  console.log('[content] Extracting page content...');

  const content = await page.evaluate(() => {
    // Helper: clean text
    const clean = (str) => str?.replace(/\s+/g, ' ').trim() || '';

    // Helper: extract link info
    const extractLink = (el) => {
      if (!el) return null;
      const a = el.tagName === 'A' ? el : el.querySelector('a');
      if (!a) return null;
      return {
        text: clean(a.textContent),
        href: a.href || '#',
        target: a.target || '',
      };
    };

    // Helper: extract image info
    const extractImage = (el) => {
      if (!el) return null;
      const img = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (!img) return null;
      return {
        src: img.src,
        alt: img.alt || '',
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
    };

    // Helper: get inner HTML cleaned of classes/IDs/styles
    const cleanHtml = (el) => {
      if (!el) return '';
      const clone = el.cloneNode(true);
      clone.querySelectorAll('*').forEach(child => {
        child.removeAttribute('class');
        child.removeAttribute('id');
        child.removeAttribute('style');
        child.removeAttribute('data-testid');
      });
      return clone.innerHTML.trim();
    };

    // ─── Extract sections ────────────────────────────────
    // Find all major sections: <section>, <header>, <footer>,
    // or direct children of <main> / <body> that are block-level
    const sectionCandidates = [
      ...document.querySelectorAll('header, section, footer, [role="banner"], [role="main"] > *, [role="contentinfo"]'),
      ...document.querySelectorAll('main > section, main > div, main > article'),
    ];

    // Deduplicate and filter to visible, substantial sections
    const seen = new Set();
    const sections = [];

    for (const el of sectionCandidates) {
      if (seen.has(el)) continue;
      seen.add(el);

      const rect = el.getBoundingClientRect();
      if (rect.height < 40) continue; // skip tiny elements
      if (rect.width < 200) continue;

      // Extract all content from this section
      const headings = [...el.querySelectorAll('h1, h2, h3, h4')].map(h => ({
        tag: h.tagName.toLowerCase(),
        text: clean(h.textContent),
      }));

      const paragraphs = [...el.querySelectorAll('p')].map(p => clean(p.textContent)).filter(t => t.length > 0);

      const links = [...el.querySelectorAll('a[href]')].map(a => ({
        text: clean(a.textContent),
        href: a.href,
        isButton: a.classList.toString().toLowerCase().includes('btn') ||
                  a.classList.toString().toLowerCase().includes('button') ||
                  a.classList.toString().toLowerCase().includes('cta'),
      })).filter(l => l.text.length > 0 && l.text.length < 100);

      const images = [...el.querySelectorAll('img')].map(img => ({
        src: img.src,
        alt: img.alt || '',
      })).filter(i => i.src && !i.src.includes('data:image/svg') && !i.src.includes('pixel'));

      // Detect repeated card-like structures
      const cards = [];
      const cardCandidates = el.querySelectorAll(
        '[class*="card" i], [class*="item" i], [class*="tile" i], article, li'
      );
      if (cardCandidates.length >= 2) {
        for (const card of cardCandidates) {
          const cardHeadings = [...card.querySelectorAll('h2, h3, h4, h5')].map(h => clean(h.textContent));
          const cardTexts = [...card.querySelectorAll('p')].map(p => clean(p.textContent)).filter(t => t.length > 0);
          const cardLinks = [...card.querySelectorAll('a[href]')].map(a => ({
            text: clean(a.textContent),
            href: a.href,
          })).filter(l => l.text.length > 0);
          const cardImages = [...card.querySelectorAll('img')].map(img => ({
            src: img.src, alt: img.alt,
          }));

          if (cardHeadings.length > 0 || cardTexts.length > 0) {
            cards.push({
              headings: cardHeadings,
              texts: cardTexts,
              links: cardLinks,
              images: cardImages,
            });
          }
        }
      }

      // Detect stats/numbers
      const statsPattern = /^\d[\d,.+%kKmMbB]*\+?$/;
      const potentialStats = [...el.querySelectorAll('*')].filter(e => {
        const text = clean(e.textContent);
        return statsPattern.test(text) && e.children.length === 0;
      }).map(e => ({
        value: clean(e.textContent),
        label: clean(e.parentElement?.textContent?.replace(e.textContent, '') || ''),
      }));

      const bg = getComputedStyle(el).backgroundColor;
      const isDark = (() => {
        const match = bg?.match(/rgb\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return false;
        const [r, g, b] = match.slice(1).map(Number);
        return (r + g + b) / 3 < 128;
      })();

      sections.push({
        tagName: el.tagName.toLowerCase(),
        position: Math.round(rect.top + window.scrollY),
        height: Math.round(rect.height),
        backgroundColor: bg,
        isDark,
        headings,
        paragraphs,
        links,
        images,
        cards: cards.length >= 2 ? cards : [],
        stats: potentialStats.length >= 2 ? potentialStats : [],
        hasForm: el.querySelector('form, input[type="email"], input[type="text"]') !== null,
      });
    }

    // Sort by vertical position
    sections.sort((a, b) => a.position - b.position);

    // Add sequential index
    sections.forEach((s, i) => { s.index = i + 1; });

    return {
      url: window.location.href,
      title: document.title,
      language: document.documentElement.lang || 'unknown',
      sections,
    };
  });

  writeFileSync(
    join(outputDir, 'extracted-content.json'),
    JSON.stringify(content, null, 2)
  );

  console.log(`[content] ✓ extracted-content.json (${content.sections.length} sections found)`);
  console.log('[content] Complete.');

} catch (err) {
  console.error(`[content] Error: ${err.message}`);
  process.exit(1);
} finally {
  await browser.close();
}
