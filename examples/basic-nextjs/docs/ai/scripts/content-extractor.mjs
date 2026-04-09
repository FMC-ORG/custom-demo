#!/usr/bin/env node

/**
 * content-extractor.mjs
 *
 * Renders a website with Playwright (headless Chromium), extracts structured
 * text content section-by-section for use in the demo builder pipeline.
 *
 * Shares Playwright infrastructure with site-scraper.mjs (navigation, popup
 * dismissal, lazy-load triggering). Focuses on DOM text extraction rather
 * than visual/CSS analysis.
 *
 * Usage:
 *   node docs/ai/scripts/content-extractor.mjs --url https://example.com --output ./docs/ai/demos/example
 *
 * Options:
 *   --url           URL to extract content from (required)
 *   --output        Output directory (required)
 *   --timeout       Page load timeout in ms (default: 30000)
 *   --wait          Extra wait after load in ms (default: 3000)
 *   --lang          Target language for translation hint in output (default: en)
 *   --help          Show this help
 *
 * Output files:
 *   <output>/extracted-content.json     Structured content per section
 *
 * Requirements:
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// ── Argument parsing ──────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name, fallback = null) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  if (args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return true;
}

if (args.includes('--help') || args.length === 0) {
  console.log(`
Usage: node docs/ai/scripts/content-extractor.mjs --url <URL> --output <DIR>

Options:
  --url           URL to extract content from (required)
  --output        Output directory (required)
  --timeout       Page load timeout in ms (default: 30000)
  --wait          Extra wait after load in ms (default: 3000)
  --lang          Target language hint (default: en)
  --help          Show this help
  `);
  process.exit(0);
}

const siteUrl = getArg('url');
const outputDir = getArg('output');
const timeout = parseInt(getArg('timeout', '30000'), 10);
const extraWait = parseInt(getArg('wait', '3000'), 10);
const targetLang = getArg('lang', 'en');

if (!siteUrl) { console.error('Error: --url is required'); process.exit(1); }
if (!outputDir) { console.error('Error: --output is required'); process.exit(1); }

mkdirSync(outputDir, { recursive: true });

console.log(`[extractor] Starting: ${siteUrl}`);
console.log(`[extractor] Output: ${outputDir}`);
console.log(`[extractor] Target language: ${targetLang}`);

// ── Main ─────────────────────────────────────────────────────
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

  // ── Dismiss popups and cookie banners ─────────────────────
  console.log('[extractor] Dismissing popups...');
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

  // ── Scroll full page to trigger lazy-loaded content ───────
  console.log('[extractor] Scrolling to trigger lazy content...');
  await page.evaluate(async () => {
    const scrollStep = 400;
    const delay = 200;
    const maxScroll = document.body.scrollHeight;
    for (let y = 0; y < maxScroll; y += scrollStep) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, delay));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);

  // ── Extract content section by section ────────────────────
  console.log('[extractor] Extracting content...');
  const extractedContent = await page.evaluate((sourceUrl) => {
    // ── Helper functions ──────────────────────────────────
    const getText = (el) => {
      if (!el) return '';
      return el.textContent?.trim().replace(/\s+/g, ' ') || '';
    };

    const getDirectText = (el) => {
      if (!el) return '';
      let text = '';
      for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent;
        }
      }
      return text.trim().replace(/\s+/g, ' ');
    };

    const isVisible = (el) => {
      if (!el) return false;
      const s = getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
    };

    const isInsideCookieOverlay = (el) => {
      let current = el;
      while (current) {
        if (current.matches && (
          current.matches('[class*="cookie" i], [class*="consent" i], [class*="gdpr" i], [class*="onetrust" i], [id*="cookie" i], [id*="consent" i]')
        )) return true;
        current = current.parentElement;
      }
      return false;
    };

    const getAbsoluteUrl = (href) => {
      if (!href || href.startsWith('javascript:') || href === '#') return href || '#';
      try {
        return new URL(href, sourceUrl).href;
      } catch {
        return href;
      }
    };

    // ── Identify page sections ────────────────────────────
    // Strategy: look for semantic landmarks and top-level structural elements
    const sectionCandidates = [];

    // Priority 1: semantic HTML elements directly under body/main
    const mainEl = document.querySelector('main') || document.body;
    const topLevelChildren = [...mainEl.children].filter(el => {
      const tag = el.tagName.toLowerCase();
      return ['section', 'article', 'header', 'footer', 'nav', 'div', 'aside'].includes(tag);
    });

    // Priority 2: if main has few direct children, they might be wrappers
    // In that case, look one level deeper
    let sections = [];
    if (topLevelChildren.length >= 3) {
      sections = topLevelChildren;
    } else {
      // Try going one level deeper into wrapper divs
      for (const child of topLevelChildren) {
        const innerChildren = [...child.children].filter(el => {
          const tag = el.tagName.toLowerCase();
          return ['section', 'article', 'div', 'header', 'footer', 'nav', 'aside'].includes(tag);
        });
        if (innerChildren.length >= 3) {
          sections = innerChildren;
          break;
        }
      }
      // Fallback: use top-level children as-is
      if (sections.length === 0) {
        sections = topLevelChildren;
      }
    }

    // Also capture header and footer if they're outside main
    const headerEl = document.querySelector('body > header, body > nav, body > div > header');
    const footerEl = document.querySelector('body > footer, body > div > footer');

    // Build ordered section list
    const allSections = [];
    if (headerEl && !sections.includes(headerEl)) {
      allSections.push(headerEl);
    }
    allSections.push(...sections);
    if (footerEl && !sections.includes(footerEl)) {
      allSections.push(footerEl);
    }

    // ── Extract content from each section ─────────────────
    const result = [];
    let position = 0;

    for (const section of allSections) {
      if (!isVisible(section)) continue;
      if (isInsideCookieOverlay(section)) continue;

      // Skip sections with very little content (spacers, decorative elements)
      const sectionText = getText(section);
      if (sectionText.length < 5 && section.querySelectorAll('img').length === 0) continue;

      position++;

      // ── Headings ──
      const headings = [...section.querySelectorAll('h1, h2, h3, h4, h5, h6')]
        .filter(h => isVisible(h) && getText(h).length > 0)
        .map(h => ({
          tag: h.tagName.toLowerCase(),
          text: getText(h),
        }));

      // ── Paragraph text ──
      const paragraphs = [...section.querySelectorAll('p, [class*="description" i], [class*="subtitle" i], [class*="lead" i]')]
        .filter(p => isVisible(p) && getText(p).length > 10)
        .map(p => getText(p))
        .filter((text, i, arr) => arr.indexOf(text) === i); // deduplicate

      // ── Links ──
      const links = [...section.querySelectorAll('a[href]')]
        .filter(a => {
          if (!isVisible(a)) return false;
          const text = getText(a);
          if (text.length === 0 || text.length > 100) return false;
          // Skip nav-style links with very short text that are likely menu items
          // but keep CTA buttons and content links
          const isButton = a.matches('[class*="btn" i], [class*="button" i], [class*="cta" i], [role="button"]');
          return text.length > 1 || isButton;
        })
        .map(a => ({
          text: getText(a),
          href: getAbsoluteUrl(a.getAttribute('href')),
          target: a.getAttribute('target') || '',
        }))
        .filter((link, i, arr) => arr.findIndex(l => l.text === link.text && l.href === link.href) === i); // deduplicate

      // ── Images ──
      const images = [...section.querySelectorAll('img[src], picture source[srcset], [style*="background-image"]')]
        .filter(el => isVisible(el) || el.tagName === 'SOURCE')
        .map(el => {
          if (el.tagName === 'SOURCE') {
            const srcset = el.getAttribute('srcset') || '';
            const firstSrc = srcset.split(',')[0]?.trim().split(' ')[0];
            return { src: getAbsoluteUrl(firstSrc), alt: '', type: 'srcset' };
          }
          if (el.tagName === 'IMG') {
            return {
              src: getAbsoluteUrl(el.getAttribute('src')),
              alt: el.getAttribute('alt') || '',
              type: 'img',
              width: el.naturalWidth || null,
              height: el.naturalHeight || null,
            };
          }
          // Background image
          const bg = getComputedStyle(el).backgroundImage;
          if (bg && bg !== 'none') {
            const match = bg.match(/url\(["']?(.*?)["']?\)/);
            if (match) return { src: getAbsoluteUrl(match[1]), alt: '', type: 'background' };
          }
          return null;
        })
        .filter(Boolean)
        .filter((img, i, arr) => arr.findIndex(x => x.src === img.src) === i); // deduplicate

      // ── Repeated items (cards, list items, grid children) ──
      // Look for repeated child structures with similar class names
      const listItems = [];
      const repeatingContainers = section.querySelectorAll(
        '[class*="grid" i], [class*="cards" i], [class*="list" i], ' +
        '[class*="items" i], [class*="row" i], [class*="container" i]'
      );

      for (const container of repeatingContainers) {
        const children = [...container.children].filter(c => isVisible(c));
        if (children.length < 2) continue;

        // Check if children have similar structure (same tag, similar classes)
        const firstTag = children[0].tagName;
        const similarChildren = children.filter(c => c.tagName === firstTag);
        if (similarChildren.length < 2) continue;

        // Extract each child as a list item
        for (const child of similarChildren) {
          const item = {};

          // Title: first heading or strong text
          const titleEl = child.querySelector('h1, h2, h3, h4, h5, h6, strong, [class*="title" i], [class*="name" i]');
          if (titleEl) item.title = getText(titleEl);

          // Description: first paragraph
          const descEl = child.querySelector('p, [class*="description" i], [class*="text" i], [class*="body" i]');
          if (descEl) item.description = getText(descEl);

          // Badge/label
          const badgeEl = child.querySelector('[class*="badge" i], [class*="label" i], [class*="tag" i], [class*="chip" i]');
          if (badgeEl) item.badge = getText(badgeEl);

          // Price
          const priceEl = child.querySelector('[class*="price" i], [class*="cost" i], [class*="amount" i]');
          if (priceEl) item.price = getText(priceEl);

          // Link
          const linkEl = child.querySelector('a[href]');
          if (linkEl) {
            item.link = {
              text: getText(linkEl),
              href: getAbsoluteUrl(linkEl.getAttribute('href')),
            };
          }

          // Image
          const imgEl = child.querySelector('img[src]');
          if (imgEl) {
            item.image = {
              src: getAbsoluteUrl(imgEl.getAttribute('src')),
              alt: imgEl.getAttribute('alt') || '',
            };
          }

          // Only add if it has meaningful content
          if (item.title || item.description) {
            listItems.push(item);
          }
        }

        // Only keep the first matching container's items (avoid double-counting)
        if (listItems.length > 0) break;
      }

      // ── Section background hint ──
      const sectionStyle = getComputedStyle(section);
      const bgColor = sectionStyle.backgroundColor;
      let backgroundHint = 'unknown';
      if (bgColor) {
        const rgb = bgColor.match(/\d+/g)?.map(Number) || [];
        if (rgb.length >= 3) {
          const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
          backgroundHint = brightness > 200 ? 'light' : brightness > 100 ? 'medium' : 'dark';
        }
      }

      // ── Section tag hint ──
      const tagName = section.tagName.toLowerCase();
      const classHint = section.className?.toString().substring(0, 100) || '';

      result.push({
        position,
        tagName,
        classHint,
        backgroundHint,
        headings,
        paragraphs,
        links,
        images,
        listItems: listItems.length > 0 ? listItems : undefined,
      });
    }

    return result;
  }, siteUrl);

  // ── Detect source language ────────────────────────────────
  const detectedLang = await page.evaluate(() => {
    return document.documentElement.lang || document.querySelector('meta[http-equiv="content-language"]')?.content || 'unknown';
  });

  // ── Build output ──────────────────────────────────────────
  const output = {
    url: siteUrl,
    extractedAt: new Date().toISOString(),
    detectedLanguage: detectedLang,
    targetLanguage: targetLang,
    translationNeeded: detectedLang !== 'unknown' && !detectedLang.startsWith(targetLang),
    totalSections: extractedContent.length,
    sections: extractedContent,
  };

  writeFileSync(
    join(outputDir, 'extracted-content.json'),
    JSON.stringify(output, null, 2)
  );
  console.log(`[extractor] ✓ extracted-content.json (${extractedContent.length} sections)`);
  console.log(`[extractor] Detected language: ${detectedLang}`);
  if (output.translationNeeded) {
    console.log(`[extractor] ⚠ Translation needed: ${detectedLang} → ${targetLang}`);
  }

  await context.close();
  console.log('[extractor] Complete.');

} catch (err) {
  console.error(`[extractor] Error: ${err.message}`);
  process.exit(1);
} finally {
  await browser.close();
}
