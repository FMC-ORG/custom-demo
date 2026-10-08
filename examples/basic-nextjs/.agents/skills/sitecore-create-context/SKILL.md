---
name: sitecore-create-context
description: "Create a Sitecore XM Cloud component that reads from route/page fields (or a content resolver) instead of its own datasource. Use when building page heroes, navigation headers, footers, or other page-scoped content (\"context component\", \"page hero\", \"route fields\")."
---

# Sitecore create context-only component

A component that renders **route/page fields** (or data from a Rendering Contents Resolver) — no datasource item, no `ComponentQuery`. Page-scoped content such as page heroes, intros, route banners, article and landing sections.

**Use another skill when** the component should be reusable via datasource selection (`sitecore-create-simple`) or has authorable child items (`sitecore-create-list`). New page types with their own fields start with `sitecore-create-page-template`.

## Load first
- `.agents/skills/sitecore-standards/references/component-build.md` — the shared procedure (§1–§12 below)
- `docs/ai/reference/sitecore-rules.md`
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`
- `docs/ai/reference/sitecore-content-resolvers.md` — when the data comes from a resolver (e.g. navigation)

## Examples
- `references/examples/page-hero.request.md` → `references/examples/page-hero.spec.yaml`

## Inputs
Component name and category · route/page fields it reads (or confirmation that existing fields are used) · the page template, if known · screenshot or design if any · rendering parameter needs.

## Safe defaults
`component.kind = context-only` · `rendering.datasourceRequired = false` · datasource template, datasource location, data source, and `ComponentQuery` all empty · `react.propsShape = context-route` · create no datasource/child/folder templates and no datasource folder.

## Creation order

1. §1 before implementation; §3 lookups and the renderings/rendering-parameters category folders.
2. Route fields: if they exist, use them — do not duplicate. If not, **propose** the page-template changes and get confirmation first; new fields follow §4 field rules and the template keeps its `__Standard Values` (§5).
3. §8 Rendering Parameters template → §9 rendering with `Datasource Template`, `Datasource Location`, `Data source`, and `ComponentQuery` all **empty**, not requiring a datasource.
4. Resolver-backed components (e.g. navigation): set the rendering's `Rendering Contents Resolver`; the root item is chosen per instance at placement time. Still no datasource template or folder.
5. §10 Available Renderings → §11 React component and component map → verify → §12 report and finalise the manifest.

Context-only renderings cannot be placed with `add_component_on_page` (no datasource template) — note manual placement in Pages or a partial design in the report.

## React data shape
Read route fields from `page?.layout?.sitecore?.route?.fields` (the `page` prop from `ComponentProps`, or `useSitecore()`), with optional chaining; add the fields to `RouteFields` in `src/Layout.tsx` when they are new. Resolver-backed components read the resolved `fields` shape documented in the content-resolvers reference.

## Verification checklist (context-specific)
- [ ] No datasource template, folder template, datasource folder, or `ComponentQuery` created
- [ ] Rendering does not require a datasource; `Datasource Template`, `Datasource Location`, `ComponentQuery` empty
- [ ] Resolver set on the rendering, if used
- [ ] Page-template changes (if any) confirmed, typed, with `__Standard Values`
- [ ] TSX reads route fields via `page?.layout?.sitecore?.route?.fields`
- [ ] Shared checks: `.agents/skills/sitecore-standards/references/verification-checklist.md`
