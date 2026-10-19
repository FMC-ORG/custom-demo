---
name: sitecore-search
description: "Enable, configure, and verify SitecoreAI Search on a site with the SearchResults, SearchCollection, and SearchTypeahead components. Use when setting up search for a demo, wiring a search index GUID and attribute mappings, or when search results, the typeahead, or a collection strip misbehave."
---

# Sitecore search

Search is a configuration act, not an engineering act. The components already exist; enabling search for a new vertical means pointing datasource items at an index.

## Load first
- `docs/ai/catalog/capabilities-registry.yaml` — the `search` capability: recipe, datasource fields, placement, graceful degradation
- `docs/ai/reference/agent-api-limitations.md` — section 6, the search endpoint contract (keyphrase + sort + limit/offset only; filters are silently ignored)
- `docs/adr/0006-search-three-component-rebuild.md` — why the components work the way they do

## Recipe
1. Create or identify a search index in SitecoreAI → Search → Configuration Manager and copy its GUID.
2. Create one datasource item per component under the site's Data folder, filling the index GUID and attribute mappings (attribute names are the index's document fields).
3. Place the component(s) in Page Builder and assign the datasource items.

Search renders skeletons in editing/preview modes; verify on the live (or local) site after publishing and re-running the index.

## Scripts
Run from the app root. All need Playwright Chromium (`npm run agents:browsers`) except the probe.

| Script | Purpose |
|---|---|
| `node .agents/skills/sitecore-search/scripts/search-probe.mjs <indexGuid> [keyphrase]` | Query the search endpoint directly (bypasses React) to confirm index content and attribute names |
| `node .agents/skills/sitecore-search/scripts/search-verify.mjs [baseUrl]` | Browser protocol for SearchResults |
| `node .agents/skills/sitecore-search/scripts/collection-verify.mjs [baseUrl]` | Browser protocol for SearchCollection |
| `node .agents/skills/sitecore-search/scripts/typeahead-verify.mjs [baseUrl]` | Browser protocol for SearchTypeahead |

Verification contracts assert that the expected document ranks first, not exact result counts — keyphrase matching is loose.
