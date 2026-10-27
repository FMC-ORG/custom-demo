#!/usr/bin/env node
/**
 * One-command verification of a deployed demo (backlog B5).
 *
 * Usage (from examples/basic-nextjs):
 *   node .agents/skills/sitecore-build-demo/scripts/verify-demo.mjs [url] [--client <name>]
 *        [--expect-indexing] [--max-pages <n>] [--skip-search] [--out <file>]
 *
 * Checks:
 *   1. deployed commit (X-Build-Sha) — reported, not asserted (use wait-for-deploy.mjs first)
 *   2. indexing policy (ADR 0012): noindex header + meta, AI crawlers blocked, search engines
 *      may crawl, no sitemaps — or the opposite with --expect-indexing
 *   3. page sweep: every same-origin page linked from Home (and /Articles) answers < 400.
 *      Server-rendered links only — search cards render client-side; the search
 *      protocols below open those in a browser.
 *   4. search protocols (sitecore-search scripts) when the site has /Articles; they skip
 *      facets/related checks that are not configured
 *
 * url defaults to showcaseUrl in docs/ai/demos/<client>/setup.json. The result is written to
 * docs/ai/demos/<client>/verify-result.json (gitignored) or .tmp-search-verify/verify-result.json.
 * Exit codes: 0 = all passed, 2 = failures, 1 = usage/setup error.
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const { checkIndexingPolicy, extractInternalLinks, parsePassed } = require('./lib/verify-demo.cjs');

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));

if (args.includes('--help')) {
  console.log(readFileSync(new URL(import.meta.url)).toString().split('*/')[0]);
  process.exit(0);
}

const client = opt('client');
let base = positional[0];
if (!base && client) {
  try {
    base = JSON.parse(readFileSync(join('docs/ai/demos', client, 'setup.json'), 'utf8')).showcaseUrl;
  } catch {
    // reported below
  }
}
if (!base) {
  console.error('No URL. Pass one, or --client <name> with showcaseUrl in setup.json.');
  process.exit(1);
}
base = base.replace(/\/$/, '');
const out =
  opt('out') ||
  (client ? join('docs/ai/demos', client, 'verify-result.json') : '.tmp-search-verify/verify-result.json');

const results = [];
const record = (group, name, pass, detail) => {
  results.push({ group, name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} [${group}] ${name} — ${detail}`);
};
const get = (path) =>
  fetch(`${base}${path}`, { redirect: 'follow', cache: 'no-store', signal: AbortSignal.timeout(60000) });

// 1 + 2: home page, deployed commit, indexing policy
let homeHtml = '';
let buildSha = null;
try {
  const home = await get('/');
  homeHtml = await home.text();
  buildSha = home.headers.get('x-build-sha');
  record('site', 'home', home.ok, `HTTP ${home.status}, X-Build-Sha ${buildSha ? buildSha.slice(0, 8) : '(missing)'}`);
  const robots = await get('/robots.txt');
  const robotsTxt = robots.ok ? await robots.text() : '';
  for (const c of checkIndexingPolicy({
    robotsHeader: home.headers.get('x-robots-tag'),
    html: homeHtml,
    robotsTxt,
    expectIndexing: args.includes('--expect-indexing'),
  }))
    record('indexing', c.name, c.pass, c.detail);
} catch (error) {
  record('site', 'home', false, `unreachable: ${error.message}`);
}

// 3: page sweep — Home links, plus /Articles links when it exists (demo navs often link
// off-site, so Home alone can be nearly empty)
const maxPages = Number(opt('max-pages') || 25);
let articlesHtml = '';
let hasArticles = false;
try {
  const articles = await get('/Articles');
  hasArticles = articles.ok;
  if (hasArticles) articlesHtml = await articles.text();
} catch {
  // treated as absent
}
const paths = [
  ...new Set([
    ...extractInternalLinks(homeHtml, base, maxPages),
    ...(hasArticles ? ['/Articles', ...extractInternalLinks(articlesHtml, base, maxPages)] : []),
  ]),
].slice(0, maxPages);
const broken = [];
for (const path of paths) {
  try {
    const res = await get(path);
    if (res.status >= 400) broken.push(`${path} -> ${res.status}`);
  } catch (error) {
    broken.push(`${path} -> ${error.name}`);
  }
}
record('sweep', 'linked-pages', paths.length > 0 && broken.length === 0, broken.length ? broken.join(', ') : `${paths.length} pages < 400`);

// 4: search protocols
if (args.includes('--skip-search')) {
  record('search', 'protocols', true, 'skipped (--skip-search)');
} else {
  if (!hasArticles) {
    record('search', 'protocols', true, 'skipped: no /Articles page');
  } else {
    for (const script of ['search-verify', 'collection-verify', 'typeahead-verify']) {
      const run = spawnSync(
        process.execPath,
        [`.agents/skills/sitecore-search/scripts/${script}.mjs`, base],
        { encoding: 'utf8', timeout: 600000 },
      );
      const output = `${run.stdout || ''}${run.stderr || ''}`;
      const counts = parsePassed(output);
      const failures = output.split('\n').filter((l) => l.startsWith('FAIL')).slice(0, 3);
      record(
        'search',
        script,
        run.status === 0,
        counts ? `${counts.passed}/${counts.total} passed${failures.length ? ` — ${failures.join(' | ')}` : ''}` : `exit ${run.status}: ${output.trim().split('\n').slice(-2).join(' ')}`,
      );
    }
  }
}

const failed = results.filter((r) => !r.pass);
const summary = {
  url: base,
  buildSha,
  checkedAt: new Date().toISOString(),
  passed: results.length - failed.length,
  total: results.length,
  ok: failed.length === 0,
  results,
};
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`\n${summary.passed}/${summary.total} passed. Result: ${out}`);
process.exit(failed.length ? 2 : 0);
