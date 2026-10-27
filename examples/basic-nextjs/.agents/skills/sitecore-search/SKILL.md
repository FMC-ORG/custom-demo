---
name: sitecore-search
description: "Enable, configure, and verify SitecoreAI Search on a site with the SearchResults, SearchCollection, and SearchTypeahead components. Use when setting up search for a demo, wiring a search index GUID and attribute mappings, or when search results, the typeahead, or a collection strip misbehave."
---

# Sitecore search

Search is a configuration act, not an engineering act. The components already exist; enabling search for a new vertical means pointing datasource items at an index.

## Load first
- `docs/ai/catalog/capabilities-registry.yaml` — the `search` capability: recipe, datasource fields, placement, graceful degradation
- `docs/ai/reference/agent-api-limitations.md` — section 6, the search endpoint contract (facets, More Like This, suggest, push sources, and their casing traps)
- `docs/adr/0006-search-three-component-rebuild.md` — why the components work the way they do
- `docs/adr/0011-search-push-source-facets-mlt-suggest.md` — push source, facets, related articles, suggest

## Recipe
1. Create the source in SitecoreAI → **Content → Search sources**. Prefer a **push source** for content you control (articles); a content source only works for supported field types and only refreshes on reindex.
   - Push source: define every field up front (String, Number, Boolean, Tags). Mark facet fields **Filterable**, and sort fields **Sortable**. Turn on Autocomplete (field Title) and Result preview so the typeahead gets both sections. Create a credential under Settings, then put `SITECORE_SEARCH_PUSH_API_KEY`, `SITECORE_SEARCH_PUSH_ENDPOINT` and `SITECORE_SEARCH_PUSH_SOURCE_ID` in `.env.local`.
   - Run `push-articles.mjs --dry-run`, then run it for real. Rerun it after content changes.
2. Fill one datasource item per component under the site's Data folder:
   - **Mappings use the lowercase document attribute names** (the source UI lowercases them on save): `title`, `articlecontent`, and so on.
   - **`Facets` uses the facet display name** (`ArticleTopic`, optionally `ArticleTopic:Topic`). A wrong name makes SearchResults fall back to no facets.
   - **SearchCollection with `RelatedToCurrentPage` ticked** shows related items seeded by the page item. Place it in a page-type partial design (Article Layout).
3. Place the component(s) in Page Builder and assign the datasource items. If `add_component_on_page` fails, see `agent-api-limitations.md` §4.

Search renders skeletons in editing and preview modes. Verify on the live or local site after publishing, and after pushing or reindexing.

## Scripts
Run from the app root. The browser protocols need Playwright Chromium (`npm run agents:browsers`); the probe and push scripts don't.

| Script | Purpose |
|---|---|
| `node .agents/skills/sitecore-search/scripts/search-probe.mjs <indexGuid> [keyphrase] [--facet N] [--filter N=a\|b] [--seed id] [--sort attr:desc] [--suggest]` | Query the search endpoint directly (bypasses React) to confirm content, attribute names, facets, More Like This and suggest |
| `node .agents/skills/sitecore-search/scripts/push-articles.mjs [--dry-run] [--site-url <origin>] [--delete ids]` | Sync published articles from Edge into the push source (lowercase fields, item ID as document id, empty stubs skipped) |
| `node .agents/skills/sitecore-search/scripts/search-verify.mjs [baseUrl]` | Browser protocol for SearchResults, including facets |
| `node .agents/skills/sitecore-search/scripts/collection-verify.mjs [baseUrl]` | Browser protocol for SearchCollection (Latest on Home, Related on an article) |
| `node .agents/skills/sitecore-search/scripts/typeahead-verify.mjs [baseUrl]` | Browser protocol for SearchTypeahead (suggestion terms and top results) |

Verification contracts assert that the expected document ranks first, not exact result counts — keyphrase matching is loose.
