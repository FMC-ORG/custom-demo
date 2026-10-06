---
name: sitecore-create-list
description: "Create a Sitecore XM Cloud component with a parent datasource and authorable child items, requiring ComponentQuery. Use when building card grids, FAQ accordions, testimonial lists, tab sections, pricing tables, or any component with repeated child items."
---

# Sitecore create list component

A component with a **parent datasource item and authorable child items**, read through a `ComponentQuery` into the GraphQL datasource shape.

**Use another skill when** the component has a single datasource item and no children (`sitecore-create-simple`) or reads route/page fields (`sitecore-create-context`).

## Load first
- `.agents/skills/sitecore-standards/references/component-build.md` — the shared procedure (§1–§12 below)
- `docs/ai/reference/sitecore-rules.md`
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`

## Examples
- `references/examples/article-cards.request.md` → `references/examples/article-cards.spec.yaml`

## Inputs
Component name and category · parent template fields · child template fields · screenshot, design, or URL if any.

## Safe defaults
`component.kind = list` · `rendering.datasourceRequired = true` · `rendering.useComponentQuery = true` · `react.propsShape = graphql-datasource` · parent inherits `_HorizonDatasourceGrouping` · folder template `<Component Name> Folder` · datasource folder `<ComponentName>`.

Prefix parent fields with context (`SectionTitle`, not `Title`) — `Title`/`Description` can collide with inherited fields on list parents.

## Creation order

1. §1 before implementation; §3 lookups and category folders.
2. §4 **parent** template → §5 SV. §4 **child** template → §5 SV.
3. Parent SV: `__Masters` → **child template**; parent inherits `_HorizonDatasourceGrouping`.
4. §6 folder template + SV (`__Masters` → **parent template**) → datasource folder → `__Masters` on the folder item.
5. §7 one example parent item plus one or two child items inside it. Create children individually with `create_content_item` and read the parent back — `create_component_ds` may report success without creating children.
6. §8 Rendering Parameters template → §9 rendering with `Datasource Template` = parent template path and the **`ComponentQuery`** below.
7. §10 Available Renderings → §11 React component and component map → verify → §12 report and finalise the manifest.

Batch plan (proven over 8+ list components):
```
1  (new category only) the 3 category folders — wait for IDs
2  parent + child + folder templates
3  base templates on both datasource templates + both Data sections
4  all fields, parent + child (parallel)    5  all field Types (parallel)
6  all three __Standard Values
7  link SVs, defaults, __Masters (parent SV, folder SV), datasource folder, rendering params, rendering
8  folder-item __Masters, params base templates, rendering fields incl. ComponentQuery, example parent, variants container
9  example children + variant definitions (parallel)
10 Available Renderings append
```

## ComponentQuery

Always generic `field(name: "ExactFieldName")` accessors with camelCase aliases; never `... on TemplateName` fragments (they silently fail when several templates share a name). Always include child `id` and wrap fields in `{ jsonValue }`. Store it **single-line** (spaces, no `\n`).

```graphql
query ComponentName($datasource: String!, $language: String!) {
  datasource: item(path: $datasource, language: $language) {
    sectionTitle: field(name: "SectionTitle") { jsonValue }
    children {
      results {
        id
        cardTitle: field(name: "CardTitle") { jsonValue }
        cardImage: field(name: "CardImage") { jsonValue }
        cardLink: field(name: "CardLink") { jsonValue }
      }
    }
  }
}
```

## React data shape
`fields.data.datasource` for the parent and `fields.data.datasource.children.results` for children (default to `[]`), reading `.jsonValue`. Return the empty-state fallback when the datasource is missing.

## Verification checklist (list-specific)
- [ ] Parent and child templates with base templates `{1930BBEB-…}|{44A022DB-…}`; sections + fields with explicit `Type`
- [ ] Parent and child `__Standard Values` created and linked
- [ ] Parent SV `__Masters` → child template; parent inherits `_HorizonDatasourceGrouping`
- [ ] Folder template + SV, `__Masters` → parent template; datasource folder under `/Data` with `__Masters` on the item
- [ ] Example parent and child items exist (read back)
- [ ] Rendering: `Datasource Template` = parent path; `ComponentQuery` present, single-line, `field(name: …)` pattern, `children { results { id … } }`
- [ ] TSX reads `fields.data.datasource.children.results` with `.jsonValue`
- [ ] Shared checks: `.agents/skills/sitecore-standards/references/verification-checklist.md`
