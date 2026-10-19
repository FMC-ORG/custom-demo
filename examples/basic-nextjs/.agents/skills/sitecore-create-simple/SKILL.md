---
name: sitecore-create-simple
description: "Create a Sitecore XM Cloud component backed by a single datasource item, with no child items and no ComponentQuery. Use when building heroes, promos, CTAs, content blocks, image blocks, or any component with one datasource item (\"create component\", \"simple component\", \"hero\", \"promo\", \"banner\", \"CTA\")."
---

# Sitecore create simple component

A component backed by **one datasource item**: reusable across pages by selecting a datasource, no repeated child items, no `ComponentQuery`.

**Use another skill when** the component has authorable child items or needs `ComponentQuery` (`sitecore-create-list`), or reads route/page fields instead of a datasource (`sitecore-create-context`).

## Load first
- `.agents/skills/sitecore-standards/references/component-build.md` — the shared procedure (§1–§12 below)
- `docs/ai/reference/sitecore-rules.md`
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`

## Examples
- `references/examples/hero.request.md` → `references/examples/hero.spec.yaml`
- `references/examples/promo-banner.spec.yaml`, `references/examples/video-testimonial.spec.yaml`

## Inputs
Component name and category · field names and types · screenshot, design, or URL if any. Everything else follows the safe defaults.

## Safe defaults
`component.kind = simple` · `rendering.datasourceRequired = true` · `rendering.useComponentQuery = false` · `react.propsShape = default-jss` · folder template `<Component Name> Folder` · datasource folder `<ComponentName>s`.

## Creation order

1. §1 before implementation; §3 lookups and category folders.
2. §4 datasource template (base templates, `Data` section, typed fields) → §5 its `__Standard Values`.
3. §6 folder template + SV (`__Masters` → **datasource template**) → datasource folder → `__Masters` on the folder item.
4. §7 one example datasource item, named after the component.
5. §8 Rendering Parameters template → §9 rendering with `Datasource Template` = datasource template path and **empty `ComponentQuery`**.
6. §10 Available Renderings → §11 React component and component map → verify → §12 report and finalise the manifest.

Batch plan (proven over 10+ components):
```
1  (new category only) the 3 category folders — wait for IDs
2  datasource template + folder template
3  base templates + Data section
4  all fields (parallel)          5  all field Types (parallel)
6  both __Standard Values
7  link SVs, defaults, __Masters, datasource folder, rendering params, rendering
8  folder-item __Masters, params base templates, rendering fields, example item, variants container
9  variant definitions (parallel)
10 Available Renderings append
```

## React data shape
Top-level fields: `fields.Title`, `fields.Description`, `fields.HeroImage`, `fields.PrimaryLink`. Do not model repeated items here.

## Verification checklist (simple-specific)
- [ ] Datasource template with base templates `{1930BBEB-…}|{44A022DB-…}`; section + fields with explicit `Type`
- [ ] Template `__Standard Values` created and linked
- [ ] Folder template + SV, `__Masters` → datasource template; datasource folder under `/Data` with `__Masters` on the item
- [ ] Example datasource item in the folder
- [ ] Rendering: `Datasource Template` full path, valid `Datasource Location`, **empty `ComponentQuery`**
- [ ] TSX reads top-level `fields.<FieldName>`
- [ ] Shared checks: `.agents/skills/sitecore-standards/references/verification-checklist.md`
