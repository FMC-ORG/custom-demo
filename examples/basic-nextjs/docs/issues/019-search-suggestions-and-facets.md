# Issue 019: Search — query suggestions and facets (Content SDK search 0.5)

**Label:** `needs-triage`
**Origin:** [Issue 018](018-sitecore-starter-sync-content-sdk-2-4.md), decision 4 of the [sync interview](../ai/backlog/upstream-sync-2026-10.md).

## Problem Statement

The October 2026 sync moved `@sitecore-content-sdk/search` from 0.3 to 0.5 without changing search behaviour. Version 0.5 adds capabilities our search demos do not use yet: a `useSuggest` hook (query suggestions), facet requests and results on `useSearch`/`useInfiniteSearch`, plus optional `locale`, `seedItemId` and `seedItemUrl` parameters.

## Possible scope

- `SearchTypeahead`: show query suggestions from `useSuggest` above document matches. Needs a suggestion source configured in Sitecore Search.
- `SearchResults`: facet filters (e.g. content type, topic). Needs facetable attributes in the index source.
- Locale-aware search for multilingual demos.

Use the `sitecore-search` skill; extend the capabilities registry and verification scripts. Triage before implementation.
