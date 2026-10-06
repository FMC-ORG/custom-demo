---
name: sitecore-diagnose-rendering
description: "Diagnose and fix a misbehaving Sitecore XM Cloud rendering: datasource data not loading, child items missing, ComponentQuery or React data-shape mismatch, an empty or wrong datasource picker, authors unable to create datasource items, or broken insert options. Use when a component renders no or wrong data, or when the datasource picker or item creation does not work."
---

# Sitecore diagnose rendering

One workflow for rendering problems. Most failures come from a component being configured as the wrong **kind** (simple, list, context-only) or from one missing link in its chain: rendering → templates → folders → query → TSX.

## Load first
- `docs/ai/reference/sitecore-rules.md` — template IDs, MCP field names, ComponentQuery and datasource-location patterns
- `docs/ai/reference/sitecore-marketer-mcp-reference.md` — MCP field-name quirks and silent-write fields
- `.agents/skills/sitecore-standards/references/react-shadcn.md` — expected React data shape per kind
- `.agents/skills/sitecore-manifest/SKILL.md` — record the fix

## Inputs to collect
- rendering name or path, component name, TSX file path
- symptom (what the author or visitor sees), console errors, example returned data if available
- the manifest entry for the component, if any (cached item IDs)

## Workflow

1. **Inspect** via the marketer MCP: the rendering item (`ComponentQuery`, `Datasource Template`, `Datasource Location`, `Parameters Template`, `componentName`), its templates and `__Standard Values`, the folder template, the datasource folder, and — for list components — parent/child insert options. Read the TSX and its component-map entry.
2. **Classify what the component should be** — simple, list, or context-only — from its content model, not from how it is currently configured.
3. **Locate the root cause** with the symptom table below. A symptom can have causes in both the query and the datasource configuration; check both before concluding.
4. If official Sitecore behaviour is unclear, ask the `sitecore_docs` MCP.
5. **Before changing anything, show:** classification, diagnosis, root cause, corrected configuration (query, datasource settings, and/or TSX shape), and the plan. Stop here if the user asked for an approval gate.
6. **Repair** to the expected configuration for the kind (below), then verify every changed value by reading it back, and update the manifest.

## Symptom → likely causes

| Symptom | Check first |
|---|---|
| `fields` empty / datasource undefined | Wrong kind: list without `ComponentQuery`, or simple/context-only *with* one. TSX reads a shape the rendering does not provide. |
| Parent renders, children missing | Query does not read `children { results { ... } }`, child `id` missing, `... on Template` fragments (silently fail on name collisions), fields without `{ jsonValue }`. Children not actually created (`create_component_ds` known issue). |
| Some fields missing | Field alias/name mismatch between query (`field(name: "ExactName")`) and TSX; missing `jsonValue`. |
| Picker empty / opens in wrong place | `Datasource Location` empty or wrong folder template name; datasource folder missing or created with the wrong template. |
| Authors cannot create items | Insert options (`__Masters`) missing on the **datasource folder item itself** (not only on the folder template); folder template `__Standard Values` missing. |
| Cannot add children to a list parent | Parent `__Standard Values` `__Masters` ≠ child template; parent does not inherit `_HorizonDatasourceGrouping`. |
| Context component asks for a datasource | Rendering still has `Datasource Template`/`Datasource Location` or requires a datasource. |
| Component not in Pages component list | Rendering not registered in Available Renderings (append, never replace). |
| Variant / styles options missing | Rendering Parameters template missing one of the four base templates, or `Parameters Template` set to a path instead of a GUID. |

## Expected configuration by kind

**All kinds:** JSON Rendering · `componentName` PascalCase equal to the TSX filename · `Parameters Template` = GUID of the Rendering Parameters template (never cleared during repairs) · registered in Available Renderings.

### Simple
- Datasource template + `__Standard Values`; base templates `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}`.
- Folder template + `__Standard Values` with `__Masters` → datasource template.
- Datasource folder under `/sitecore/content/<siteCollection>/<siteName>/Data/` with `__Masters` set on the folder item itself.
- Rendering: `Datasource Template` = full path (never GUID), `Datasource Location` = query pattern, **empty `ComponentQuery`**.
- TSX reads top-level fields: `fields.Title`, `fields.HeroImage`, …

### List
- Everything in Simple, but for the **parent** template, plus a child template (same base templates) + `__Standard Values`.
- Parent `__Standard Values` `__Masters` → child template; parent inherits `_HorizonDatasourceGrouping`; folder template `__Masters` → parent template.
- Rendering has a valid `ComponentQuery` (pattern below) stored single-line.
- TSX reads `fields.data.datasource` and `fields.data.datasource.children.results`, using `.jsonValue`.

### Context-only
- Rendering does not require a datasource: `Datasource Template`, `Datasource Location`, `Data source`, and `ComponentQuery` all empty (unless a content resolver is intended — see `docs/ai/reference/sitecore-content-resolvers.md`).
- TSX reads route fields via `page?.layout?.sitecore?.route?.fields` (or `useSitecore()`).

### ComponentQuery pattern (list)

Always use generic `field(name: "...")` accessors — never `... on TemplateName` fragments, which silently fail when several templates share a name.

```graphql
query ComponentName($datasource: String!, $language: String!) {
  datasource: item(path: $datasource, language: $language) {
    title: field(name: "Title") { jsonValue }
    children {
      results {
        id
        cardTitle: field(name: "CardTitle") { jsonValue }
        cardImage: field(name: "CardImage") { jsonValue }
      }
    }
  }
}
```

### Datasource Location pattern

```txt
query:$site/*[@@name='Data']/*[@@templatename='<Folder Template Name>']|query:$sharedSites/*[@@name='Data']/*[@@templatename='<Folder Template Name>']
```

### `__Standard Values`
`name = "__Standard Values"`, `parentId` = owning template ID, `templateId` = owning template ID — never the Standard Template ID `1930bbeb-…`.

## Output

Before implementation: classification · diagnosis · root cause · corrected configuration · plan.

After implementation: Sitecore/MCP operations performed · files changed · verification results · anything left unverified (say so explicitly — do not downgrade to "manual setup required" without a reason) · manifest entry updated (affected fields, status, timestamped note).

## Verification checklist

- [ ] Intended kind confirmed and root cause stated
- [ ] Rendering is a JSON Rendering; `componentName`, `Parameters Template` (GUID) still set
- [ ] `ComponentQuery` present and valid for list; empty for simple and context-only
- [ ] `Datasource Template` (full path) and `Datasource Location` correct — or empty for context-only
- [ ] Templates and folder template have `__Standard Values` based on the owning template
- [ ] `__Masters` correct on folder template SV, datasource folder item, and (list) parent SV
- [ ] List parent inherits `_HorizonDatasourceGrouping`
- [ ] TSX data access matches the rendering's data shape; Sitecore fields use SDK helpers
- [ ] Authors can pick or create datasource items as intended
- [ ] Manifest updated
