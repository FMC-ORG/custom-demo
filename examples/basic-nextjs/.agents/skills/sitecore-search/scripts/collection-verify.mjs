// Browser-level verification of the SearchCollection component (ticket #47)
// on the Home page: heading renders, MaxItems cards appear, and titles are in
// publication-date-descending order (the sort contract proven end-to-end
// against the live endpoint).
//
// Usage (from examples/basic-nextjs, dev server running):
//   node .agents/skills/sitecore-search/scripts/collection-verify.mjs [baseUrl]
//
// Screenshot lands in .tmp-search-verify/. Selectors are scoped to
// section.search-collection so other components on the page cannot
// contaminate the run (console errors are reported but attributed).

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const baseUrl = process.argv[2] ?? 'http://localhost:3000';
const outDir = '.tmp-search-verify';
mkdirSync(outDir, { recursive: true });

const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name} — ${detail}`);
};

const browser = await chromium.launch();
const page = await browser.newPage();
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

await page.goto(`${baseUrl}/`, { waitUntil: 'load' });
await page.waitForTimeout(3000); // hydration + client-side search fetch

const component = page.locator('section.search-collection');
const heading = component.locator('h2');
const cards = component.locator('h3');

const componentPresent = (await component.count()) === 1;
record('component-present', componentPresent, `section.search-collection count: ${await component.count()}`);

if (componentPresent) {
  const headingText = (await heading.textContent())?.trim() ?? '';
  record('heading', headingText === 'Latest Articles', `heading: "${headingText}"`);

  const titles = (await cards.allTextContents()).map((t) => t.trim());
  record('card-count', titles.length === 3, `cards: ${titles.length} (MaxItems 3)`);

  // Corpus-independent: the strip sorts by publication date desc, so the rendered
  // card dates must be non-increasing (whatever the newest three currently are).
  const dates = (await component.locator('p.text-sm').allTextContents()).map((d) => d.trim());
  const times = dates.map((d) => Date.parse(d));
  const orderCorrect =
    titles.length === 3 &&
    times.every((t) => !Number.isNaN(t)) &&
    times.every((t, i) => i === 0 || times[i - 1] >= t);
  record('date-desc-order', orderCorrect, `titles: [${titles.join(' | ')}], dates: [${dates.join(' | ')}]`);
  record('dates-rendered', dates.length === 3, `dates: [${dates.join(' | ')}]`);

  // Links come from the articleurl attribute; each must be a site-relative article path.
  const hrefs = await component.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
  record(
    'result-links-work',
    hrefs.length === 3 && hrefs.every((h) => /^\/Articles\/[A-Za-z0-9-]+$/.test(h)),
    `links: [${hrefs.join(' | ')}]`
  );
}

if (componentPresent) {
  await component.screenshot({ path: `${outDir}/collection-home.png` });
} else {
  await page.screenshot({ path: `${outDir}/collection-home.png`, fullPage: false });
}

// --- Related articles (search v4): RelatedToCurrentPage on the Article Layout instance ---
const relatedPath = '/Articles/One-To-One-Personalization-At-Scale';
await page.goto(`${baseUrl}${relatedPath}`, { waitUntil: 'load' });
await page.waitForTimeout(3000);
const related = page.locator('section.search-collection');
// Related articles are optional (SearchCollection with RelatedToCurrentPage in the
// article partial design). Skip, don't fail, when the article page has no strip.
if ((await related.count()) === 0) {
  record('related', true, 'skipped: no SearchCollection on the article page (Related articles not placed)');
} else {
  const relatedHeading = (await related.locator('h2').textContent().catch(() => ''))?.trim() ?? '';
  const relatedTitles = (await related.locator('h3').allTextContents()).map((t) => t.trim());
  record(
    'related-present',
    relatedHeading === 'Related articles' && relatedTitles.length === 3,
    `heading: "${relatedHeading}", cards: [${relatedTitles.join(' | ')}]`
  );
  record(
    'related-excludes-current',
    !relatedTitles.some((t) => /One-to-One Personalization/i.test(t)),
    `current page "One-to-One Personalization at Scale" ${relatedTitles.some((t) => /One-to-One/i.test(t)) ? 'PRESENT' : 'absent'}`
  );
}
if (await related.count()) await related.screenshot({ path: `${outDir}/collection-related.png` });

const ownErrors = consoleErrors.filter((e) => !e.includes('SearchExperience_'));
record(
  'no-console-errors',
  consoleErrors.length === 0,
  consoleErrors.length === 0
    ? 'clean'
    : `${consoleErrors.length} total, ${ownErrors.length} not attributable to V2 dictionary keys: ${ownErrors.slice(0, 2).join(' || ') || '(none)'}`
);

await browser.close();

const passed = results.filter((r) => r.pass).length;
console.log(`\n${passed}/${results.length} passed. Screenshot in ${outDir}/`);
process.exit(passed === results.length ? 0 : 1);
