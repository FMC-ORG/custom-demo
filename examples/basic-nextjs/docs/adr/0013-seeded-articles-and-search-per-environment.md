# ADR 0013: Articles are seeded, and search is connected per environment

## Status

Accepted (2026-10-27). Backlog B3 and B4 in `docs/ai/backlog/sitecore-demo-search-v4-learnings.md`. Builds on [ADR 0011](0011-search-push-source-facets-mlt-suggest.md); amends what a fresh environment contains ([ADR 0008](0008-fresh-build-contract-for-demo-framework.md)).

## Context

The search features (ADR 0011) depend on two things that **differ per environment**:
1. An article set with topics, images and URLs.
2. A search source, plus datasources and placements pointing at it.

Both were set up by hand in the Sitecore demo run, across several sessions.

How the repo handled them made this worse:
- **Articles as resource items.** The `site-content` module serializes all of `/sitecore/content/main/main-website`. With no `deployItems` setting, every environment gets the 13 articles as items-as-resources: they can be edited but not deleted. An empty Example Article could only be removed with a module rule, a redeploy and a demo-only commit.
- **Images tied to one Content Hub.** Article images are DAM XML from one Content Hub sandbox (a public URL plus a `dam-id` that's valid only there).
- **Source IDs that only exist in one environment.** Serialized search datasources carry `SearchIndex` values, so a fresh environment searches a source it doesn't have (HTTP 404). The push source can only be created in the UI, and its ID lived only in `.env.local`.
- **Placements done by hand.** Related articles in the Article Layout partial design, and Latest Articles on Home, were manual Page Builder tasks.

## Decision

### Articles are seeded, not serialized (B3)
1. **Only the article set leaves serialization.**
   - `site-content` gets the rule `{ "path": "/Home/Articles", "scope": "SingleItem" }`, so the Articles page stays serialized.
   - The 13 article `.yml` files and the orphaned `Articles/Data` local datasources are removed.
   - Everything else (Home, `Data/*`, Presentation, Settings, Dictionary, People) stays serialized.
2. **The article set is committed as data:** `articles.json` with the 28 articles (title, body, key takeaways, read time, date, author, topic) is the single source.
   - Authors are referenced by their serialized People items, which have the same IDs everywhere.
   - `ArticleUrl` is derived from the item name.
3. **Seeding goes through the agent and the marketer MCP**, as a journaled hand-off helper in the pattern of build-demo population. Every write is read back.
   - **Item IDs differ per environment.** That's accepted: search documents are pushed per environment with that environment's IDs.
4. **Re-runs are idempotent and fill only gaps.**
   - An existing article (matched by item name) keeps every value it has; only empty fields get the seed value. Typically that's `ArticleTopic`, and `ArticleImage` on older articles.
   - `--overwrite` resets fields to the seed values when explicitly asked.
5. **Images:**
   - **With Content Hub credentials:** each image is downloaded from its deterministic seeded source and uploaded to *that environment's* Content Hub (resumable `upload-to-content-hub.mjs`).
   - **Without credentials:** the stored public-URL XML is written, and the result flags those images as "shared sandbox".
6. **When it runs:**
   - **On request:** a separate procedure in the `sitecore-search` skill.
   - **In a demo build:** build-demo **Phase 6.5 (capabilities)**, when "search" is chosen at the Phase 2 approval.
   - **Start Check:** reports read-only how many articles exist and how many lack a topic or image. Start Check never writes to Sitecore.

### Search is connected per environment (B4)
7. **The source ID is environment configuration:** `searchSources.articles` in `docs/ai/config/project.yaml`, next to `environmentMarker`, committed on the branch that owns the environment.
   - It isn't secret: browsers send it with every search request.
   - Scripts read it and fall back to `SITECORE_SEARCH_PUSH_SOURCE_ID`. The push key and endpoint stay only in `.env.local`.
8. **"Connect search to source `<id>`"** is an agent procedure (MCP).
   - **Finds the targets by template, not a fixed list:** items under `Data/` based on `SearchResults`, `SearchCollection` or `SearchTypeahead`, plus `NavigationHeaderData` items with search fields. Client navigation created by a build is covered too.
   - **Writes:** `SearchIndex`, the push-source mappings (`title`, `articlecontent`, `articleimage`, `articlepublicationdate`, `articleurl`), `SortBy=articlepublicationdate`, and `Facets=ArticleTopic` on `SearchResults`. Every write is read back.
9. **…and completes what's missing.** After reading the page, it creates the `Related Articles` datasource (`RelatedToCurrentPage` ticked) and places:
   - Related articles after `ArticleBody` in the Article Layout partial design
   - Latest Articles on Home (position from the build plan, or after the hero; can be switched off)
   - it also checks that `SearchResults` is on `/Articles`

   Existing instances are never duplicated. If placement fails, the B6 fallback (`manualPlacements`) applies.
10. **Serialized `SearchIndex` values are emptied**, so a fresh environment shows the "search not configured" state instead of a 404 against another environment's source.

### The flow (Phase 6.5 or the separate procedure), with a single publish
1. **Start Check (read-only):** article coverage; whether `searchSources.articles` answers (probe).
2. **The SE** creates the push source from the setup checklist (fields, Filterable, Autocomplete on Title, Result preview), once per environment, and records the ID in `project.yaml`.
3. Seed the articles.
4. Connect search and complete the placements.
5. **The SE publishes, once.**
6. `push-articles.mjs`, then `wait-for-deploy.mjs` and `verify-demo.mjs`.

## Consequences

- **Fresh environments:** they get the Articles page but no articles until seeding runs. When the serialization change is first deployed, an environment loses its articles that nobody edited; edited ones remain as normal database items, and seeding fills their gaps. **The code and serialization PRs must therefore ship together**, followed by a seed run on `main`'s environment.
- **Deletable articles:** they're ordinary database items in every environment, so the Example Article problem can't recur.
- **No shared Content Hub dependency:** environments with credentials no longer depend on one sandbox. Those without are listed explicitly.
- **Per-environment IDs:** article IDs differ per environment. Anything keyed by article ID (search documents, More Like This seeds) is environment-local by design. `sitecore-demo` keeps its current IDs, because its articles are already database items.
- **Search is a phase, not a project:** setting up search becomes Phase 6.5 plus one UI step, creating the push source, until SitecoreAI exposes an API for it.
- **Agent API outages:** seeding and connection depend on the marketer MCP. Writes are journaled, and placements fall back to `manualPlacements`.
