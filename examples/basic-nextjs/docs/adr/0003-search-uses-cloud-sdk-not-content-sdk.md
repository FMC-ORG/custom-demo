# ADR 0003: Search components use Sitecore Cloud SDK, not Content SDK Search API

## Status

Accepted

## Context

The project needs search functionality — a preview search bar with typeahead suggestions and a full search results page with facets, sorting, and pagination. The project already uses `@sitecore-content-sdk/nextjs` for all Sitecore integration.

Two SDK options exist for search:

1. **Content SDK Search API** (`@sitecore-content-sdk/search`) — a lightweight `SearchService` class that queries SitecoreAI search indexes. Supports sort, paginate, limit, and keyphrase search. No built-in facets, personalization, recommendations, or Q&A. Part of the existing Content SDK ecosystem.

2. **Sitecore Cloud SDK** (`@sitecore-cloudsdk/search`) — a full search experience SDK wrapping the Sitecore Search REST APIs. Supports search widgets, preview search, facets, personalization, recommendations, Q&A, and event tracking. Introduces a new SDK family (`core` + `events` + `search`) requiring global initialization.

## Decision

Search components use the **Sitecore Cloud SDK** (`@sitecore-cloudsdk/search`) for all search functionality. The SDK is initialized globally via a dedicated `CloudSDKInit` component added to the app layout, conditional on `SITECORE_EDGE_CONTEXT_ID` being available.

Two simple datasource components are built:
- **PreviewSearch** — typeahead suggestions using `rfkid_6` widget
- **SearchResults** — full results page using `rfkid_7` widget with dynamic facets

Both degrade gracefully when Sitecore Search is not configured.

## Alternatives considered

1. **Content SDK Search API** (`@sitecore-content-sdk/search`) — stays in the existing SDK ecosystem, simpler integration, but lacks facets, personalization, Q&A, event tracking, and widget infrastructure. Would require building all of that from scratch. Rejected because the demo builder needs to showcase Sitecore Search's full capabilities to prospects, not a minimal search box.

2. **Sitecore Search REST APIs directly** — maximum flexibility, no SDK dependency, but requires handling authentication, request formatting, response parsing, and event tracking manually. Significantly more development effort for the same result. Rejected because the Cloud SDK already wraps these APIs.

3. **Sitecore Search JS SDK for React** (`@sitecore/search-react`) — pre-built React components, fastest to integrate, but a third SDK family with its own patterns that don't align with the project's Tailwind/shadcn component architecture. Rejected because the project needs custom-styled components that match the UIIM design system.

## Consequences

- The project now has **two SDK families**: `@sitecore-content-sdk/nextjs` for content rendering and `@sitecore-cloudsdk/*` for search (and potentially personalization, events in the future).
- A global `CloudSDKInit` component must be present in the layout for search to function. This is a cross-cutting concern, not a component-level one.
- The Cloud SDK adds `@sitecore-cloudsdk/core`, `@sitecore-cloudsdk/events`, and `@sitecore-cloudsdk/search` to the dependency tree and bundle.
- Future Cloud SDK capabilities (personalization, event tracking, recommendations) can be added incrementally by chaining `.addPersonalize()` etc. onto the existing initialization — no additional setup required.
- Search components require a configured Sitecore Search domain with indexed content and published widgets to return results. Without this, they render a graceful fallback state.
