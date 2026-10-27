# ADR 0012: Demo sites are not indexed by default

## Status

Accepted (2026-10-27). Built on `sitecore-demo`; port to `main` with the search work.

## Context

Every deployment of this repo is a demo, and demo builds copy a client's homepage text and images. The showcase at `sitecore-live-demo.vercel.app` was fully indexable:
- `robots.txt` allowed every bot and explicitly invited AI crawlers.
- There was no `X-Robots-Tag` header and no robots meta tag.
- The robots route from the starter sync **overrides** a blocking Sitecore robots.txt with a permissive one, so authoring robots in Sitecore cannot help.

An indexed demo competes with the client's real site as duplicate content, and AI crawlers can ingest the copied material.

## Decision

Indexing is **off by default**, switched in one place, `src/lib/indexing.ts`. It is turned on only with `SITE_ALLOW_INDEXING=true` (documented in `.env.remote.example`).

When indexing is off:
1. **`X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex` on every response**, via `headers()` in `next.config.ts`. It covers pages, images and API routes, and survives CDN caching.
2. **`<meta name="robots">` and `<meta name="googlebot">` set to `noindex, nofollow`** from `generateMetadata`.
3. **robots.txt** (`/api/robots`):
   - blocks the AI crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended, PerplexityBot and others), which honour robots.txt but not noindex
   - **lets search engines crawl**: a `Disallow: /` would hide the noindex, and externally linked URLs could still be listed without a snippet
   - advertises no sitemaps

## Consequences

- Each new demo is protected without anyone remembering a Vercel setting. The editing host is covered too.
- **A real launch needs `SITE_ALLOW_INDEXING=true`**, after which the starter's permissive robots.txt and sitemaps apply again. Because `next.config.ts` headers are computed at build time, changing the variable requires a redeploy.
- **Already-indexed URLs** drop out after recrawl. Use Google Search Console's Removals tool to speed this up.
- **Vercel Deployment Protection** (login or password) remains the option when a demo must not be publicly reachable at all.
