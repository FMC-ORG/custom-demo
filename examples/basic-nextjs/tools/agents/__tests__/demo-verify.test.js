'use strict';
// sitecore-build-demo: deploy-aware verification helpers (backlog B5).
const {
  shaMatches,
  checkIndexingPolicy,
  extractInternalLinks,
  parsePassed,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/verify-demo.cjs');

test('a deploy matches on full or short SHA, never on "local" or a missing header', () => {
  const full = 'dd55673a1b2c3d4e5f60718293a4b5c6d7e8f901';
  expect(shaMatches(full, 'dd55673a')).toBe(true);
  expect(shaMatches('dd55673a', full)).toBe(true);
  expect(shaMatches(full.toUpperCase(), full)).toBe(true);
  expect(shaMatches(full, 'b3457e8c')).toBe(false);
  expect(shaMatches('local', full)).toBe(false);
  expect(shaMatches('', full)).toBe(false);
  expect(shaMatches(full, 'dd5')).toBe(false); // too short to be meaningful
});

const demoRobots = [
  'User-agent: GPTBot',
  'Disallow: /',
  '',
  'User-agent: ClaudeBot',
  'Disallow: /',
  '',
  'User-agent: CCBot',
  'Disallow: /',
  '',
  'User-agent: Google-Extended',
  'Disallow: /',
  '',
  'User-agent: *',
  'Allow: /',
  '',
].join('\n');
const noindexHtml = '<head><meta name="robots" content="noindex, nofollow"/></head>';

test('the demo indexing policy passes for a noindex site that blocks AI crawlers only', () => {
  const checks = checkIndexingPolicy({
    robotsHeader: 'noindex, nofollow, noarchive',
    html: noindexHtml,
    robotsTxt: demoRobots,
  });
  expect(checks.filter((c) => !c.pass)).toEqual([]);
});

test('the policy flags an indexable site, a blanket Disallow, and advertised sitemaps', () => {
  const checks = checkIndexingPolicy({
    robotsHeader: null,
    html: '<head></head>',
    robotsTxt: 'User-agent: *\nDisallow: /\n\nSitemap: https://x/sitemap.xml\n',
  });
  const failed = checks.filter((c) => !c.pass).map((c) => c.name);
  expect(failed).toEqual([
    'robots-header',
    'meta-robots',
    'robots-ai-crawlers-blocked',
    'robots-search-engines-may-crawl',
    'robots-no-sitemaps',
  ]);
});

test('--expect-indexing inverts the header and meta checks', () => {
  const checks = checkIndexingPolicy({ robotsHeader: '', html: '<head></head>', robotsTxt: '', expectIndexing: true });
  expect(checks.every((c) => c.pass)).toBe(true);
});

test('the sweep collects same-origin pages once, skipping assets, APIs and other hosts', () => {
  const html = `
    <a href="/">Home</a><a href="/Articles">A</a><a href="/Articles/">A again</a>
    <a href="https://demo.example/About?x=1">About</a><a href="https://other.example/x">ext</a>
    <a href="/api/robots">api</a><a href="/sitemap.xml">sm</a><a href="#top">top</a>
    <a href="/_next/static/a.js">js</a><a href="/Articles/One">one</a>`;
  expect(extractInternalLinks(html, 'https://demo.example')).toEqual([
    '/',
    '/Articles',
    '/About',
    '/Articles/One',
  ]);
  expect(extractInternalLinks(html, 'https://demo.example', 2)).toEqual(['/', '/Articles']);
});

test('protocol output is summarized from the last "N/M passed" line', () => {
  expect(parsePassed('PASS a\nFAIL b\n\n11/12 passed. Screenshots in x/')).toEqual({ passed: 11, total: 12 });
  expect(parsePassed('crashed')).toBeNull();
});
