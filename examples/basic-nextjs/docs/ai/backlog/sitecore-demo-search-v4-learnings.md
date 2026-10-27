# What the Sitecore demo search run gives the framework

**Source:** the `sitecore-demo` branch, 2026-10-20 → 10-27. Commits from `3156446d` to `dd55673a`, the SitecoreAI environment marked `sitecore-demo`, and the showcase at https://sitecore-live-demo.vercel.app.

**Purpose:** decide what moves to `main`, how to move it, and what to change in the demo-builder process so the next demo doesn't repeat this run's detours.

The build-demo findings from the first part of the run (assembly anchoring, image typing, the header Search section, partial-design usage, preview screenshots) are **already on `main`** (`c272cec6`, PR #73). They're not repeated here.

---

## 1. Summary: the 8 actions that matter most

| # | Action | Why | Size |
|---|---|---|---|
| 1 | **Port search v4 and noindex-by-default to `main`** (§3), checking out paths rather than cherry-picking whole commits | Generic, tested and verified 30/30 on the showcase, but the commits mix in environment-specific manifest changes | M |
| 2 | **Stop serializing demo content as fixed resource items.** Narrow the `site-content` module and seed the article set with a script (§4.1). | Resource items can't be deleted in the CMS; this cost a deploy and a demo-only commit | M |
| 3 | **Make search set up per environment.** Source IDs are per environment, but they're serialized in datasource YAML (§4.2). | Every environment needs its own source, and copied IDs silently break search | M |
| 4 | **Turn "enable search" into a scripted, optional build-demo phase** that can search the *client's own* content (§5). | The strongest demo moment, but today it's a manual, multi-session effort | L |
| 5 | **Deployment-aware verification:** record the showcase URL, expose the deployed commit, add one `verify-demo` command (§4.3) | Finding the host, waiting for Vercel and stale assertions cost several rounds | S |
| 6 | **Check MCP placement before a build, with a manual fallback** (§4.4) | `add_component_on_page` and `get_component` were down after a deploy; Phase 6 depends on them | S |
| 7 | **Repository hygiene:** stop tracking generated files, normalise line endings (§4.5) | Running `npm run dev` dirties 5 tracked files, and Start Check's `clean-tree` then blocks | S |
| 8 | **Separate porting from recording:** keep the manifest out of code commits, and mark demo-only commits with a trailer (§4.6) | 3 of the 5 portable commits contain environment-specific manifest edits | S |

---

## 2. Inventory: what this run produced

| Area | What | Classification |
|---|---|---|
| Search UI | `SearchResults` facets (`Facets` field, sidebar and chips, OR filters, URL mirror, fallback when a facet name is wrong) | **Port as-is** |
| Search UI | `SearchCollection` related mode (`RelatedToCurrentPage` checkbox, seeded by item ID, current page excluded) | **Port as-is** |
| Search UI | `TypeaheadSearchBox` on `useSuggest` (Suggestions and Top results sections) | **Port as-is** |
| Search UI | `src/lib/search-ui/facets.ts` and its tests; new labels in `constants.ts` | **Port as-is** |
| Analytics | `useSearchEvents` only sends when a browser ID exists, and ignores `event()` rejections | **Port as-is** (a fix for every demo) |
| SEO | `src/lib/indexing.ts`, the `next.config.ts` header, page metadata, the robots route, `.env.remote.example` | **Port as-is**: every deployment is a demo |
| Scripts | `search-probe.mjs` options (`--facet`, `--filter`, `--seed`, `--sort`, `--suggest`) | **Port as-is** |
| Scripts | `search-verify`, `collection-verify` and `typeahead-verify` with checks that don't depend on a fixed article set | **Port as-is** (they assume a Topic facet and a Related instance exist; make those checks skip when absent) |
| Scripts | `push-articles.mjs` | **Port, then generalise** (§5): the template ID, path and field mapping are article-specific defaults |
| Docs | ADR 0011 (search v4), ADR 0012 (noindex) | **Port with edits**: remove `sitecore-demo` source IDs and present the facts as environment-independent |
| Docs | `agent-api-limitations.md` §6 (rewritten) and §4 (the outage), capabilities registry, `sitecore-search` skill | **Port as-is** |
| Sitecore templates | `Facets` (SearchResults), `RelatedToCurrentPage` (SearchCollection), `ArticleTopic` (Article Page Template) | **Port through serialization.** They exist only in the `sitecore-demo` database today (§3.3). |
| Sitecore content | `Data/Tags/Article Topics` (5 tags), the `Related Articles` datasource, the Article Layout placement, the Latest Articles placement on Home, the repointed datasources | **Port the structure**; IDs and values are per environment (§4.2) |
| Sitecore content | 15 new articles plus topics set on the 13 older ones | **Port as seed data**, not as resource items (§4.1) |
| Demo-only | `3156446d` (environment marker), `f740b672` (Sitecore client theme and variants), `defcce5f` (stop serializing articles) | **Never port** |
| Demo-only | Manifest commits `8a428fa0` and `c965f829`, plus the manifest parts of `388678d7`, `b3457e8c` and `dd55673a` | **Never port**: these are `sitecore-demo` environment IDs |

---

## 3. How to port (extraction plan)

### 3.1 Branch and file selection
Branch `feature/search-v4-and-noindex` from the latest `main`, then take **paths, not commits**:

```bash
git checkout dd55673a -- \
  examples/basic-nextjs/src/components/uiim/search/SearchResults.tsx \
  examples/basic-nextjs/src/components/uiim/search/SearchCollection.tsx \
  examples/basic-nextjs/src/lib/search-ui \
  examples/basic-nextjs/src/lib/indexing.ts \
  examples/basic-nextjs/src/app/api/robots/route.ts \
  "examples/basic-nextjs/src/app/[site]/[locale]/[[...path]]/page.tsx" \
  examples/basic-nextjs/next.config.ts \
  examples/basic-nextjs/.env.remote.example \
  examples/basic-nextjs/src/__tests__/components/search-results \
  examples/basic-nextjs/src/__tests__/components/search-collection \
  examples/basic-nextjs/src/__tests__/components/search-typeahead \
  examples/basic-nextjs/src/__tests__/lib \
  examples/basic-nextjs/.agents/skills/sitecore-search \
  examples/basic-nextjs/docs/adr/0011-search-push-source-facets-mlt-suggest.md \
  examples/basic-nextjs/docs/adr/0012-demo-sites-are-not-indexed.md \
  examples/basic-nextjs/docs/ai/reference/agent-api-limitations.md \
  examples/basic-nextjs/docs/ai/catalog/capabilities-registry.yaml
```

- `page.tsx`, `next.config.ts` and `agent-api-limitations.md` differ from `main` only by this run's changes. Diff them against `main` before committing anyway, in case `main` has moved on.
- `src/__tests__/lib/` holds only this run's 3 new test files: `search-facets`, `search-events` and `indexing`.
- On `main`, **delete** `authoring/items/content/items/site-content/main-website/Home/Articles/Example Article.yml`. This is the only article change `main` needs from `defcce5f`.
- Then run `npm run agents:sync`, `agents:check`, `jest` and `tsc`, and open the PR to `dmz` (`.github/DMZ-WORKFLOW.md`). ADR numbers 0011 and 0012 are still free on `main`.

### 3.2 Doc edits needed while porting
- **ADR 0011:** remove the `sitecore-demo` source ID and the "built on `sitecore-demo`" status. Keep the probe facts.
- **The `sitecore-search` skill and `push-articles.mjs`:** say that source IDs come from the environment (§4.2).
- **Verification scripts:** skip the facet checks when the page has no `facet-sidebar`, and the related checks when the article has no Related instance. Nothing else should be assumed about the content.
- **Typeahead (done during the port):** if `useSuggest` errors or returns nothing, the box falls back to the earlier `useSearch` title search, so environments still on a content source without Autocomplete or Result preview keep working.

### 3.3 Sitecore items on `main`
**Done (B2), by a different route than planned below:** creating the fields through MCP in `main`'s environment would assign new IDs, and `sitecore-demo`, which already has them, would end up with duplicate fields. The 9 items (3 fields, the topics folder and 5 tags) were therefore pulled with a scoped `ser pull` from `sitecore-demo`, in a temporary copy so no client content was touched, and committed with their original IDs.

The original plan was: the new template fields exist only in the `sitecore-demo` database. On a development environment *without* a marker (`main`'s environment):
1. Recreate the 3 fields through MCP, following the manifest recipe, or run a scoped `ser pull` of only `/sitecore/templates/Project/fmc-custom-demo/Components/Search` and `.../Page Types/Article Page Template` from an environment that has them.
2. Commit the resulting `.yml` files in `main-templates` and `project`. Every environment then gets the fields as resource items, which is right for *templates*.
3. Don't pull `site-content` from `sitecore-demo`: it contains client demo content.

---

## 4. Process findings and improvements

### 4.1 Demo content must not be deployed as fixed resource items
**What happened:**
- `site-content` serialized `/sitecore/content/main/main-website` with everything under it. With no `deployItems` setting, every module is deployed as items-as-resources (IAR).
- The empty Example Article could not be deleted: deleting an edited resource item only removes its database copy.
- Fixing it took a module rule, deleting 18 `.yml` files, an environment deployment and a demo-only commit (`defcce5f`).

**Improve:**
- **Narrow `site-content` on `main`** to the structure demos need: Home, `Data/*` folders, Presentation and Settings.
  - Leave out article pages and demo datasources (`Home/Articles/*`, `Data/*/<item>` content items).
  - Templates and renderings stay serialized: those *should* be fixed resource items.
- **Seed the article set with a script** instead (`seed-articles.mjs`):
  - It reads a committed JSON file, in the shape of `articles-batch2.json`, and creates the items through MCP.
  - It uploads images to *that environment's* Content Hub. Today the image XML in serialized articles points at one sandbox's DAM.
  - It reads every item back to check it, and is safe to re-run.
- This turns the article set into ordinary, deletable content in every environment.
- Write it up as an ADR, because it changes what "fresh environment" means (ADR 0008).

### 4.2 Search set-up is per environment, but its configuration is serialized
**What happened:**
- `SearchIndex` values (`79b6b3db…`, then `d09b2998…`) live in serialized datasource YAML and in `NavigationHeaderData`. A source ID only exists in the environment that created it.
- The push source itself is created in the UI, with no API, and needs a credential and three `.env.local` values.
- Its gotchas were each found by trial:
  - The UI lowercases field names, but facets use the display name.
  - There's no Datetime type.
  - Content sources don't list Droplist as a supported field type.

**Improve:**
- **A search setup checklist in `sitecore-start-demo`** (or a `sitecore-search` "setup" reference): the exact field table, the toggles (Filterable on facet fields, Autocomplete on Title with limit 5, Result preview with limit 3, semantic reranking, fuzzy search), the credential and the `.env.local` keys. This run's screenshots show each screen; a short version belongs in the skill.
- **One place for the source ID.** Either:
  - **(a)** a script `set-search-source.mjs <id>` that updates every search datasource and the header search fields through MCP and reads them back; this run did the same by hand for 5 items, or
  - **(b)** a fallback in the components: when `SearchIndex` is empty, use `NEXT_PUBLIC_SEARCH_SOURCE_ARTICLES`.

  (a) keeps everything authorable; (b) survives environment copies. **Recommend (a).** Keep `SearchIndex` empty in serialized datasources, so a fresh environment shows the "configure search" empty state rather than a 404 from another environment's source.
- **Sync after publish.** The push source doesn't follow publishing.
  - Short term: the build-demo summary lists "publish → `push-articles.mjs`" as a manual step.
  - Later: a publish webhook into an `/api/search/sync` route that pushes the changed items.

### 4.3 The deployment and verification loop
**What happened:**
- The showcase host wasn't recorded anywhere, so it had to be found through the Rendering Hosts item, which also exposed a Vercel bypass token in a tool result.
- Confirming a deployment meant polling for a behaviour change.
- The verification scripts hard-coded the 13-article set and failed when 15 were added.
- Headless Chromium counts as a bot for analytics, so the 400s looked like a broken analytics setup.

**Improve:**
- **Record the URLs:** `sitecore-start-demo` asks for the showcase URL and writes it to `setup.json`, plus `docs/ai/demos/<client>/handoff.md`, as `showcaseUrl` and `editingHostUrl`.
- **Expose the deployed commit:** an `X-Build-Sha` header (from `VERCEL_GIT_COMMIT_SHA`) in `next.config.ts`. Then `wait-for-deploy.mjs <sha>` can poll exactly, instead of guessing from behaviour.
- **One `verify-demo.mjs [url]` command:**
  - It runs the 3 search protocols plus `noindex` and robots.txt checks and a page-status sweep, and writes `verify-result.json`.
  - Its assertions stay independent of the content (they now read expected values from the page).
- **Document the headless-is-a-bot caveat** (done in the `sitecore-search` skill). Optionally, add a `--desktop-ua` mode that checks analytics end to end.

### 4.4 MCP resilience
**What happened:**
- After the environment deployment, `add_component_on_page` and `get_component` failed with `The field 'renderings' does not exist on the type 'Query'`. The placements were done by hand in Page Builder.
- An `update_fields_on_item` that included a field created seconds earlier wrote **nothing**, with no error; reading the item back caught it.

**Improve:**
- **Preflight check in Start Check:** a read-only `get_component` call on a known rendering. If it fails, warn that Phase 6 will become manual placement tasks *before* hours of building.
- **Fallback in Phase 6 (assembly):** when placement fails on a platform error, write `manual-placements.md` (page, placeholder, anchor, datasource, variant) and continue with the rest. Don't stop the build.
- **Record in the MCP reference:** write new fields in a separate update after the field is created, and always read back. Every write was checked in this run; the rule just needs to be explicit.

### 4.5 Repository hygiene
**What happened:**
- `npm run dev` and `tsc` change tracked files: `tsconfig.tsbuildinfo`, `next-env.d.ts`, and the `.sitecore/component-map*.ts` and `import-map*.ts` files (line endings or paths that only exist in dev mode).
- Every verification run needed a `git checkout --` to get a clean tree, which Start Check's `clean-tree` requires.
- Git warns on CRLF conversion for most edited files.

**Improve:**
- Stop tracking `tsconfig.tsbuildinfo`, and `next-env.d.ts` too if the team agrees.
- Add a `.gitattributes` (`* text=auto eol=lf`) so generated maps keep their line endings.
- The `.sitecore` maps are intentionally tracked: make the generators write LF so dev runs don't dirty them.

### 4.6 Commit discipline that makes porting mechanical
**What happened:**
- Portable code and `sitecore-demo` manifest edits went into the same commits, so porting has to pick paths.
- The manifest is 3,846 lines and mixes framework item IDs with environment-specific IDs and demo content.

**Improve:**
- **On demo branches:** keep manifest updates in their own commits, and mark demo-only commits with a `Port: no` trailer. A script can then list the portable commits (`git log --grep`, or trailers).
- **Split the manifest:**
  - The framework manifest (serialized items, the same in every environment) stays at `docs/ai/manifests/`.
  - Environment-specific records (search source IDs, seeded items, placements made in one environment) go to `docs/ai/demos/<client>/environment-manifest.yaml` (gitignored, next to the other demo records) or to a manifest per environment marker.
- The `sitecore-manifest` validate mode then checks only what applies to the connected environment.

### 4.7 What worked and should stay
- **The environment marker** stopped every write unless the connected environment was `sitecore-demo`, and it was checked before every batch of writes.
- **Interview-style planning with recommended answers**, one decision at a time, with **an ADR per decision** (0011, 0012). Several assumptions were corrected early: the facet name casing, the push-source field types, the bot-detection explanation.
- **Probe before building:** `search-probe` and throwaway push tests found the endpoint's real behaviour (lowercase fields, disjunctive counts, seed format). The 2-query facet design was dropped before any code was written.
- **Read back every write, and keep a journal for uploads.** The Content Hub resume matched up a lost upload response without creating a duplicate.
- **Back up before risky platform operations:** the JSON backup taken before the resource-item deploy.

---

## 5. Building search into the demo builder

Today search is enabled after the build, by hand, across several sessions. The run shows it can be one optional phase:

**Phase 6.5: capabilities (optional, chosen at the Phase 2 approval)**
1. **Content:**
   - Either seed the generic article set (`seed-articles.mjs`), or
   - **use the client's own content:** `content-extractor.mjs` already crawls pages, so it can extract the client's blog, news or resources listing (title, summary, date, image, URL, category) into the same JSON shape.
2. **Source:** the user creates the push source from the checklist (§4.2), and the script checks it with `search-probe.mjs` (the fields exist, Filterable is set on the topic field, suggest returns results).
3. **Sync:** a generalised `push-source-sync.mjs --mapping <file>` (this run's `push-articles.mjs`, with the template, path and field map as configuration). Images go in as client URLs or Content Hub URLs; categories become the facet.
4. **Wire up:** `set-search-source.mjs <id>`, then place `SearchResults` on `/Articles` (or a client-named page), Related articles in the article partial design, and Latest Articles on Home, using the §4.4 fallback for placements.
5. **Verify:** `verify-demo.mjs <showcaseUrl>`.

**The demo value:** a prospect searches *their own* articles, filters by *their* categories, and sees related content and suggestions, with semantic reranking. Pin and boost/bury rules (configured in the source UI, no code) give a "merchandising" moment on top.

---

## 6. Proposed backlog

| ID | Item | Depends on | Size | Status |
|---|---|---|---|---|
| B1 | Port search v4, the analytics guard, noindex and the docs to `main` (§3) | none | M | done (PR #75) |
| B2 | Serialize the template fields and the Article Topics tags (§3.3) | B1 | S | done: scoped `ser pull` from `sitecore-demo`, which keeps the IDs; no MCP creation, which would have duplicated them |
| B3 | ADR and change: narrow `site-content`, add `seed-articles.mjs` and the committed article JSON (§4.1) | none | M | open |
| B4 | `set-search-source.mjs`, empty `SearchIndex` in serialized datasources, and the search setup checklist (§4.2) | B1 | S | open |
| B5 | `X-Build-Sha` header, `wait-for-deploy.mjs`, `verify-demo.mjs`, showcase URL in Start Check (§4.3) | B1 | S | done (`feature/demo-process-b5-b7`) |
| B6 | Start Check MCP preflight and the Phase 6 manual-placement fallback (§4.4) | none | S | done (`feature/demo-process-b5-b7`) |
| B7 | `.gitattributes`, untrack `tsbuildinfo`, generators write LF (§4.5) | none | S | done (`feature/demo-process-b5-b7`) |
| B8 | Manifest split between framework and environment, and the `Port: no` trailer convention (§4.6) | none | M | open |
| B9 | `push-source-sync.mjs` with mapping configuration, extracting client articles, and Phase 6.5 in build-demo (§5) | B1, B4, B5 | L | open |
| B10 | Publish webhook into an incremental push sync | B9 | M | open |
