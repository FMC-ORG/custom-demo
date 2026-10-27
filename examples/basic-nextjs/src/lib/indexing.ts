/**
 * Search-engine and AI-crawler indexing policy.
 *
 * Every deployment of this repo is a demo, and demos copy a client's homepage text and
 * images — indexed, they compete with the client's real site as duplicate content. So
 * indexing is OFF by default and must be switched on explicitly per deployment with
 * SITE_ALLOW_INDEXING=true (see docs/adr/0012-demo-sites-are-not-indexed.md).
 *
 * When indexing is off:
 * - every response carries `X-Robots-Tag: <NOINDEX_DIRECTIVES>` (next.config.ts headers)
 * - pages render `<meta name="robots" content="noindex, nofollow">` (generateMetadata)
 * - robots.txt blocks AI crawlers (they honor robots.txt, not noindex) but lets search
 *   engines crawl so they can SEE the noindex — a `Disallow: /` would hide it, and
 *   externally linked URLs could still be listed. No sitemaps are advertised.
 */

export const INDEXING_ENV_VAR = 'SITE_ALLOW_INDEXING';

export const NOINDEX_DIRECTIVES = 'noindex, nofollow, noarchive, nosnippet, noimageindex';

/** AI training / answer-engine crawlers that respect robots.txt. */
export const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'cohere-ai',
  'FacebookBot',
  'Meta-ExternalAgent',
  'Bytespider',
] as const;

export const isIndexingAllowed = (
  env: Record<string, string | undefined> = process.env
): boolean => env[INDEXING_ENV_VAR]?.trim().toLowerCase() === 'true';

/** robots.txt served while indexing is off. */
export const noIndexRobotsTxt = (baseUrl: string): string =>
  [
    `# Robots.txt for ${baseUrl}`,
    '# Demo site: not for indexing. Pages also send X-Robots-Tag and meta robots noindex.',
    `# Enable indexing for a real launch with ${INDEXING_ENV_VAR}=true.`,
    '',
    '# AI crawlers: no access (they honor robots.txt, not noindex)',
    ...AI_CRAWLERS.flatMap((agent) => [`User-agent: ${agent}`, 'Disallow: /', '']),
    '# Search engines may crawl so they can read the noindex directives',
    'User-agent: *',
    'Allow: /',
    '',
  ].join('\n');
