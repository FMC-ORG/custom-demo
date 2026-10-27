# ADR 0011: Search v4 — push source, facets, More Like This, and suggest

## Status

Accepted (2026-10-27). First built and verified on a client demo branch, then ported to `main`. Extends [ADR 0006](0006-search-three-component-rebuild.md) and supersedes its "keyphrase + sort + limit/offset only" endpoint contract.

## Context

ADR 0006 built the three search components on a content source whose endpoint honored only keyphrase, sort and paging. Content SDK 2.4 (`@sitecore-content-sdk/search` 0.5.0) added facets and filters, More Like This (`seedItemId` / `seedItemUrl`) and `useSuggest` (autocomplete terms plus preview results). SitecoreAI Search also added **push sources** (25 Sept 2026): a source whose documents an application sends through the Ingestion Service API.

The articles content source had recurring problems: no URL attribute (hence the `ArticleUrl` field workaround), a schema fixed when the source is created, Droplist fields not listed as supported, author stored as an item ID, and changes only visible after publish plus a manual reindex.

## Decision

1. **Articles are indexed through a push source**, fed by `.agents/skills/sitecore-search/scripts/push-articles.mjs`.
   - The script reads published articles from Edge GraphQL and sends plain values: text with HTML stripped, image URL, ISO date, topic name, author name, site-relative URL.
   - The Sitecore item ID is the document `id`, so More Like This can seed from the route item ID.
   - Articles with no body text are skipped, so stubs never reach the index.
2. **Topic facet:**
   - Data: `ArticleTopic`, a Droplist on the Article Page Template whose source is `Data/Tags/Article Topics` (SXA Tag items). A Droplist stores the tag name as plain text.
   - `SearchResults` gets a `Facets` field: comma-separated facet names, each optionally `Name:Label`.
   - The UI is a sidebar on desktop and chips on mobile. Values within a facet are OR-ed, and selections are mirrored to the URL (`?ArticleTopic=AI|Engineering`).
3. **Related articles:** `SearchCollection` gets a `RelatedToCurrentPage` checkbox. When ticked, it runs a More Like This query seeded by the route item ID, excludes the current page, and hides itself when there's nothing to show. It's placed once in the Article Layout partial design.
4. **Typeahead on `useSuggest`.** The shared `TypeaheadSearchBox` shows two sections, "Suggestions" (terms that search the results page) and "Top results" (documents that open the article), with keyboard navigation across both. No new fields: `MaxSuggestions` can only trim what the source returns. When suggest errors or returns neither terms nor previews (sources without Autocomplete or Result preview, such as content sources created before push sources), the box falls back to the earlier `useSearch` title search, so older sources keep working.

## Endpoint facts (probed 2026-10-27 against an articles push source)

| Behaviour | Consequence |
|---|---|
| The source UI **lowercases field names on save**. Pushing `ArticleImage` fails with "not defined in config"; documents come back as `articleimage`. | The script lowercases field names. Datasource `*Mapping` fields use lowercase names. |
| **Facets use the display name** (`ArticleTopic`). The lowercase name gives HTTP 400. | The `Facets` field uses display casing. |
| An **unknown facet name fails the whole search** (400). | `SearchResults` retries without facets and logs a warning. |
| `eq` with an array is OR. Counts are **disjunctive**: a facet's own counts ignore its own filter, while other facets narrow. | One request is enough; the planned 2-query approach was dropped. |
| `seedItemId` only matches the **dashed lowercase GUID** (undashed returns `{}`, braces return 500). A seed is excluded from its own results. `seedItemUrl` needs an absolute `sc_url`. | `normalizeItemId()`. Current-page exclusion is kept as a safety net. |
| Push field types are String, Number, Boolean and Tags only (no Datetime). | Dates are sent as ISO strings, which sort correctly as text. |
| Suggest returns `querySuggestions` (Autocomplete, field Title, limit 5) and `previewResults` (Result preview, limit 3). | `useSuggest` maps directly onto the two sections. |

## Consequences

- **The index no longer follows publishing.** After content changes, rerun `push-articles.mjs`. Pushes are live immediately, with no reindex. A publish webhook is a possible follow-up.
- The Push API key is instance-wide and secret. It lives in `.env.local` as `SITECORE_SEARCH_PUSH_API_KEY`, never with a `NEXT_PUBLIC_` prefix.
- The `ArticleUrl` field is kept as the link attribute until `sc_url` (absolute URLs) is used.
- **Author facet:** `ArticleAuthor` is already Filterable. Adding it to `Facets` turns on an Author facet with no code change.
- **Per-environment setup:** the template fields (`Facets`, `RelatedToCurrentPage`, `ArticleTopic`) and the push source are created in each environment, and the source ID is set on the search datasources. See the `sitecore-search` skill. Demo content deployed as items-as-resources can't be deleted in the CMS; the follow-up is in `docs/ai/backlog/sitecore-demo-search-v4-learnings.md` §4.1.
- **Search analytics and bots.** The analytics plugin creates no browser ID for detected bots. That includes headless Chromium, which the verification scripts use. Before the guard in `useSearchEvents`, every search "viewed" event from a bot went out without a browser ID and got `POST /v1/events` 400 "Invalid UUID string". On 2026-10-27, a desktop Chrome user agent on the showcase got `browser/create` 201, the page-view event 201 and the search event 201, so real visitors are tracked. Search events are now only sent when `getClientId()` returns an ID.
- **Verification:**
  - Browser scripts: `search-verify` 12/12, `collection-verify` 9/9, `typeahead-verify` 9/9.
  - Unit tests: 345/345.
