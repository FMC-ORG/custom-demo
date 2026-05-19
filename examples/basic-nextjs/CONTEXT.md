# Domain Glossary

## Page Types

- **Article Page Template** — A Sitecore route template that inherits from the base page template and adds article-specific fields (content, image, author, publication date, key takeaways, read time). Components placed on article pages read from these route fields (context components), not from datasources. Contrast with regular pages where components use datasource items.

- **Base Page Template** — The existing Sitecore route template that all page types inherit from. Carries standard fields: Title, metadata (metadataTitle, metadataDescription, metadataKeywords), Open Graph (ogTitle, ogDescription, ogImage), pageSummary, thumbnailImage, BackgroundColor, and placeholder settings.

## Content Models

- **Context Component** — A rendering that reads from route/page fields rather than a datasource item. Cannot be reused across pages via datasource selection. Tightly coupled to the page template that defines its fields. Examples: ArticleHero, ArticleBody.

- **Datasource Component** — A rendering backed by a datasource item (simple or list). Reusable across any page by selecting a datasource. Examples: HeroBanner, CTABanner, FeatureCardsGrid.

- **Person** — A shared data template representing an individual (author, expert, team member). Fields: first name, last name, job title, profile image, bio, LinkedIn link. Referenced by article pages via a Droptree field. Reusable across articles, testimonials, team pages.

## Presentation

- **Partial Design** — An XM Cloud mechanism for pre-placing components on pages. The Article Layout partial design places ArticleHero and ArticleBody in `headless-main`, so new article pages start with those components already wired up. Preferred over setting presentation directly on `__Standard Values`.

- **Variant** — A named export in a component's TSX file that provides an alternate visual layout for the same data. Matched to a Variant Definition item in Sitecore. Example: ArticleHero has Default, Minimal, and SplitImage variants.

## Content Tree

- **Articles Parent Page** — A regular page at `/Home/Articles/` with insert options allowing Article child pages. Provides clean URL structure: `/articles/my-first-article`. Does not require a special template.

## Search

- **SearchExperience** — An OOTB component copied from the SitecoreAI starter kit that provides a full search results experience. Uses Content SDK search hooks (`useSearch`, `useInfiniteSearch`) from `@sitecore-content-sdk/nextjs/search`. Configured via a JSON content item containing the search index ID and field mappings, with visual configuration in Page Builder via the Search Configuration Manager. Two variants: Default (pagination) and LoadMore (infinite scroll).

- **Search Configuration Manager** — A SitecoreAI Marketplace app that provides a visual UI tab in Page Builder for selecting a search source and mapping content fields (title, description, images, tags) to UI output in the SearchExperience component.

- **Search Source** — An indexed content source in SitecoreAI that the SearchExperience component queries. Created and configured by the SE in the SitecoreAI UI as part of demo setup.

## Catalogs

- **Component Registry** (`component-registry.yaml`) — Machine-readable index of datasource-based homepage components used by the Site Analyzer in the demo builder pipeline.

- **Page Template Registry** (`page-template-registry.yaml`) — Machine-readable index of page types (Article, and future types like Event, Case Study). Separate from the component registry because page types define data models, not droppable homepage sections.

- **Capabilities Registry** (`capabilities-registry.yaml`) — Machine-readable index of cross-cutting platform features (search, personalization, analytics) that SEs enable manually. Separate from the component registry (visual homepage sections) and page template registry (page types).
