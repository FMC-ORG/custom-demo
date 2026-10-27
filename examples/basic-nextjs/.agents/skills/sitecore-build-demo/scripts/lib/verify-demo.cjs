'use strict';
/**
 * Pure helpers for wait-for-deploy.mjs and verify-demo.mjs (backlog B5,
 * docs/ai/backlog/sitecore-demo-search-v4-learnings.md §4.3). No network, no fs.
 */

/** True when the deployed X-Build-Sha header names the expected commit (full or short SHA). */
function shaMatches(header, expected) {
  const deployed = String(header || '').trim().toLowerCase();
  const wanted = String(expected || '').trim().toLowerCase();
  if (!deployed || !wanted || deployed === 'local') return false;
  if (wanted.length < 7 || deployed.length < 7) return false;
  return deployed.startsWith(wanted) || wanted.startsWith(deployed);
}

const AI_CRAWLERS_TO_CHECK = ['GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended'];

/** Lines of the robots.txt group for one user agent (case-insensitive), or null. */
function robotsGroup(robotsTxt, agent) {
  const lines = String(robotsTxt || '').split(/\r?\n/).map((l) => l.trim());
  const start = lines.findIndex((l) => l.toLowerCase() === `user-agent: ${agent.toLowerCase()}`);
  if (start < 0) return null;
  const group = [];
  for (const line of lines.slice(start + 1)) {
    if (!line || /^user-agent:/i.test(line)) break;
    group.push(line);
  }
  return group;
}

function metaRobots(html) {
  const match = String(html || '').match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i);
  return match ? match[1] : '';
}

/**
 * Check the deployed site against the indexing policy (ADR 0012).
 * expectIndexing=false (default): noindex header + meta, AI crawlers disallowed,
 * search engines allowed to crawl, no sitemaps advertised.
 */
function checkIndexingPolicy({ robotsHeader, html, robotsTxt, expectIndexing = false }) {
  const checks = [];
  const add = (name, pass, detail) => checks.push({ name, pass, detail });
  const header = String(robotsHeader || '');
  const meta = metaRobots(html);
  if (expectIndexing) {
    add('robots-header', !/noindex/i.test(header), `X-Robots-Tag: "${header || '(none)'}"`);
    add('meta-robots', !/noindex/i.test(meta), `meta robots: "${meta || '(none)'}"`);
    return checks;
  }
  add('robots-header', /noindex/i.test(header), `X-Robots-Tag: "${header || '(none)'}"`);
  add('meta-robots', /noindex/i.test(meta), `meta robots: "${meta || '(none)'}"`);
  const blocked = AI_CRAWLERS_TO_CHECK.filter((agent) =>
    (robotsGroup(robotsTxt, agent) || []).some((l) => /^disallow:\s*\/\s*$/i.test(l)),
  );
  add(
    'robots-ai-crawlers-blocked',
    blocked.length === AI_CRAWLERS_TO_CHECK.length,
    `blocked: [${blocked.join(', ')}] of [${AI_CRAWLERS_TO_CHECK.join(', ')}]`,
  );
  const star = robotsGroup(robotsTxt, '*') || [];
  add(
    'robots-search-engines-may-crawl',
    !star.some((l) => /^disallow:\s*\/\s*$/i.test(l)),
    `User-agent: * -> [${star.join(' ; ')}] (a Disallow: / would hide the noindex)`,
  );
  add(
    'robots-no-sitemaps',
    !/^sitemap:/im.test(String(robotsTxt || '')),
    'no Sitemap: lines advertised',
  );
  return checks;
}

const SKIP_LINK = /^\/(api|_next)\/|\.(xml|txt|json|png|jpe?g|gif|svg|webp|ico|pdf|zip|css|js)$/i;

/** Same-origin page paths linked from an HTML document, deduped, in document order. */
function extractInternalLinks(html, origin, limit = 25) {
  const seen = new Set();
  const paths = [];
  const re = /<a\s[^>]*href=["']([^"'#]+)["']/gi;
  let match;
  while ((match = re.exec(String(html || ''))) && paths.length < limit) {
    let url;
    try {
      url = new URL(match[1].replace(/&amp;/g, '&'), origin);
    } catch {
      continue;
    }
    if (url.origin !== new URL(origin).origin) continue;
    const p = url.pathname.replace(/\/$/, '') || '/';
    if (SKIP_LINK.test(p) || seen.has(p)) continue;
    seen.add(p);
    paths.push(p);
  }
  return paths;
}

/** "12/12 passed" -> { passed: 12, total: 12 } (last occurrence), or null. */
function parsePassed(output) {
  const all = [...String(output || '').matchAll(/(\d+)\/(\d+) passed/g)];
  if (!all.length) return null;
  const last = all[all.length - 1];
  return { passed: Number(last[1]), total: Number(last[2]) };
}

module.exports = {
  shaMatches,
  robotsGroup,
  metaRobots,
  checkIndexingPolicy,
  extractInternalLinks,
  parsePassed,
  AI_CRAWLERS_TO_CHECK,
};
