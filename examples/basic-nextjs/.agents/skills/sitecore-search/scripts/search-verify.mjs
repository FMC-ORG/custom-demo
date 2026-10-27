// Browser-level verification of the SearchResults component (ticket #46) on a
// rendered page — the four-point protocol from spec #45.
//
// Usage (from examples/basic-nextjs, dev server running):
//   node .agents/skills/sitecore-search/scripts/search-verify.mjs [baseUrl]
//
// Screenshots land in .tmp-search-verify/.
// All selectors are scoped to section.search-results so a lingering V2
// instance on the same page cannot contaminate the run.

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

const component = page.locator('section.search-results');
const totalLine = component.locator('p[aria-live="polite"]');
const cards = component.locator('h3');
const searchInput = component.locator('[role="search"] input');

const readState = async () => {
  await page.waitForTimeout(2500); // debounce + fetch
  const total = (await totalLine.textContent())?.trim() ?? '';
  const titles = (await cards.allTextContents()).map((t) => t.trim());
  return { total, titles };
};

// --- Browse state (empty query) ---
await page.goto(`${baseUrl}/Articles`, { waitUntil: 'domcontentloaded' });
await component.waitFor({ timeout: 15000 });
const browse = await readState();
await page.screenshot({ path: `${outDir}/1-browse.png`, fullPage: true });
record(
  'browse-state',
  parseInt(browse.total) >= 13 && browse.titles.length >= 3,
  `"${browse.total}", ${browse.titles.length} cards`
);

// --- Point 1: probe query filters WHILE TYPING to exactly the canary article ---
await searchInput.pressSequentially('canary', { delay: 60 });
const probe = await readState();
await page.screenshot({ path: `${outDir}/2-probe-canary.png`, fullPage: true });
record(
  'probe-query-typing',
  probe.total.startsWith('1 ') &&
    probe.titles.length === 1 &&
    /Canary Releases/.test(probe.titles[0] ?? ''),
  `"${probe.total}", cards: [${probe.titles.join(' | ')}]`
);

// --- URL mirror: ?q= reflected without navigation ---
const urlAfterTyping = new URL(page.url());
record(
  'url-mirror',
  urlAfterTyping.searchParams.get('q') === 'canary',
  `url query: "${urlAfterTyping.search}"`
);

// --- Point 3: gibberish shows empty state, not error ---
await searchInput.fill('');
await searchInput.pressSequentially('xyzzyqwerty', { delay: 30 });
const gibberish = await readState();
const errorVisible = await component
  .getByRole('alert')
  .first()
  .isVisible()
  .catch(() => false);
await page.screenshot({ path: `${outDir}/3-gibberish.png`, fullPage: true });
record(
  'gibberish-empty-state',
  gibberish.total.startsWith('0 ') && gibberish.titles.length === 0 && !errorVisible,
  `"${gibberish.total}", errorState: ${errorVisible}`
);

// --- Deep link hydration: /Articles?q=canary restores the search ---
await page.goto(`${baseUrl}/Articles?q=canary`, { waitUntil: 'domcontentloaded' });
await component.waitFor({ timeout: 15000 });
const deepLink = await readState();
const inputValue = await searchInput.inputValue();
await page.screenshot({ path: `${outDir}/4-deeplink.png`, fullPage: true });
record(
  'deep-link-hydration',
  inputValue === 'canary' && deepLink.total.startsWith('1 '),
  `input: "${inputValue}", "${deepLink.total}"`
);

// --- Point 4: result links (live since #49 — ArticleUrl attribute + LinkMapping) ---
// At this point the deep-link state (?q=canary) shows exactly the canary card.
const linkHref =
  (await component.locator('a').first().getAttribute('href').catch(() => null)) ?? '(none)';
record(
  'result-links-work',
  linkHref === '/Articles/Canary-Releases-Explained',
  `first card link: ${linkHref}`
);

// --- Facets (search v4): Facets=ArticleTopic on the datasource, desktop sidebar ---
const sidebar = component.locator('[data-testid="facet-sidebar"]');
const facetBox = (value) => sidebar.getByRole('checkbox', { name: new RegExp(`^${value}\\b`) });
const facetCount = (value) =>
  facetBox(value).evaluate((el) => el.closest('label')?.querySelector('span:last-child')?.textContent?.trim());

await page.goto(`${baseUrl}/Articles`, { waitUntil: 'domcontentloaded' });
await component.waitFor({ timeout: 15000 });
await readState();
const facetValues = (await sidebar.locator('label').allTextContents()).map((t) => t.trim());
record(
  'facets-rendered',
  (await sidebar.getByText('Topic', { exact: true }).count()) === 1 && facetValues.length >= 5,
  `values: [${facetValues.join(' | ')}]`
);

await facetBox('AI').check();
const oneFacet = await readState();
const urlFacet = new URL(page.url()).searchParams.get('ArticleTopic');
record(
  'facet-filter',
  oneFacet.total.startsWith('2 ') && urlFacet === 'AI',
  `"${oneFacet.total}", ?ArticleTopic=${urlFacet}, cards: [${oneFacet.titles.join(' | ')}]`
);

await facetBox('Personalization').check();
const twoFacets = await readState();
const engineeringCount = await facetCount('Engineering');
await page.screenshot({ path: `${outDir}/5-facets.png`, fullPage: true });
record(
  'facet-or-and-disjunctive-counts',
  twoFacets.total.startsWith('5 ') && engineeringCount === '4',
  `"${twoFacets.total}" (AI OR Personalization), Engineering count still ${engineeringCount}`
);

await page.goto(`${baseUrl}/Articles?ArticleTopic=Engineering`, { waitUntil: 'domcontentloaded' });
await component.waitFor({ timeout: 15000 });
const facetDeepLink = await readState();
record(
  'facet-deep-link',
  (await facetBox('Engineering').isChecked()) && facetDeepLink.total.startsWith('4 '),
  `"${facetDeepLink.total}", Engineering checked: ${await facetBox('Engineering').isChecked()}`
);

await sidebar.getByRole('button', { name: 'Clear all' }).click();
const cleared = await readState();
record(
  'facet-clear-all',
  parseInt(cleared.total) >= 13 && !new URL(page.url()).searchParams.has('ArticleTopic'),
  `"${cleared.total}", url: "${new URL(page.url()).search}"`
);

// --- Console errors across the whole run ---
record(
  'no-console-errors',
  consoleErrors.length === 0,
  consoleErrors.length ? consoleErrors.slice(0, 3).join(' || ') : 'clean'
);

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(
  `\n${results.length - failed.length}/${results.length} passed. Screenshots in ${outDir}/`
);
process.exit(failed.length ? 1 : 0);
