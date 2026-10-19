# Sitecore upstream sync (October 2026) — interview decisions

Sync `examples/basic-nextjs` with `Sitecore/xmcloud-starter-js` `main` (`c0de3bcc`, 2026-10-09):
Content SDK 2.4, Next.js 16.3+, AI discoverability. Last shared commit: `d8de384a` (2026-07-20).

## Decisions

1. **Port only `basic-nextjs`, record the synced commit.** Sitecore's `basic-nextjs` changes are
   applied in a normal feature branch (PR to `dmz`). Changes to other starters and Sitecore's CI
   workflows are not taken. The synced Sitecore commit is recorded in the repo so the next sync
   diffs from it. Replaces the old runbook's "full merge" rule (its ADR 0001 was never committed).

2. **Latest within current major versions.** `@sitecore-content-sdk/nextjs` 2.4.1 (pulls react
   2.4, content 2.3, search 0.5), CLI 2.3.0, analytics-core/events 2.1.2, personalize 2.1.0
   (unchanged), Next.js 16.4.x, TypeScript `~5.8.3` (the exact 5.7.3 pin had no recorded reason).
   No major-version jumps in this sync.

3. **Adopt Sitecore's AI discoverability changes.** `page.tsx` uses the SDK's `getPageMetadata`
   (with Sitecore's field-name mapping); the `llms-txt` route serves Sitecore-authored LLMs.txt
   (Settings → Crawlers) with a default when empty; `RouteFields` extends `PageMetadataFields`.
   Our `Layout.tsx` additions (Person/Article fields) are kept. The four unused fields `MetaTitle`,
   `OpenGraphTitle`, `OpenGraphDescription`, `OpenGraphImage` are removed: nothing reads them, and
   page templates use the standard names (`metadataDescription`, `ogImage`, …).

4. **Search: upgrade only, features later.** `@sitecore-content-sdk/search` 0.3 → 0.5 (via react
   2.4) is additive for us: `useSearch`/`useInfiniteSearch` gain optional `locale`, `facet`,
   `seedItemId`, `seedItemUrl` and return `facets`; a new `useSuggest` hook exists. Our search
   components keep their behaviour in this sync. *Follow-up (separate task, `sitecore-search`
   skill):* query suggestions via `useSuggest` in `SearchTypeahead`, facets in `SearchResults`;
   both need Sitecore Search setup (facetable attributes, a suggestion source).

5. **Done when (before merging into `dmz`):** CI checks (TypeScript, unit tests, component
   validation, agent checks) plus local checks against Sitecore using `.env`: production
   `npm run build`; dev server renders Home and an Article page with UIIM components; page `<head>`
   tags (title, description, Open Graph) compared before/after; `/llms.txt`, `/sitemap.xml`,
   `/robots.txt` respond; the three search verification scripts pass. No separate Pages-editor
   check is required.

6. **Record, runbook, ADR.** `docs/ai/config/upstream-sync.yaml` records the Sitecore Starter
   repository, the synced commit, the date and key versions. `docs/adr/upstream-sync-runbook.md`
   is rewritten for the port approach (fetch without adding a remote, diff `basic-nextjs` from the
   recorded commit, ownership table, steps, decision 5 checks, update the record). New ADR 0010
   records the port decision, replacing the old "full merge" rule.

7. **Terminology.** "Sitecore Starter" names `Sitecore/xmcloud-starter-js`. Never call it
   "upstream": in this repository's clones the git remote `upstream` is the FMC-ORG framework
   repository.

## Open questions

None.

## Implementation status

Implemented on `feature/sitecore-starter-sync-2-4` (issue 018). Additional findings while syncing:

- Tailwind 4.3.3 (patch bump from the regenerated lock file) turns example class strings in docs into invalid CSS; `globals.css` now scans only `src/`.
- Tailwind's compiler registers Node module hooks that Jest 30.5 refuses; the brand-fonts test compiles in a child process.
- Next.js 16.4 `next dev` injects a managed block into `AGENTS.md`; disabled with `agentRules: false`.
- npm 12 rejects the `config` flags passed by `npm-run-all`; use npm 11 for `npm run dev/build` (also true for the Sitecore Starter).
- The local `.env` Edge context ID currently answers "No sitecore context", so the decision 5 runtime checks are pending.
