# Common Issues & Troubleshooting

## MCP Tool Failures

**MCP tool returns 500 Internal Server Error:**
- `list_sites` often fails — use `search_site` or `get_content_item_by_path` instead
- Some tools are less reliable than others
- Don't give up on MCP entirely if one tool fails
- Always have a fallback approach (check .env.local, explore paths manually)

**MCP operation succeeds but results don't show:**
- Check if item was created in Master database (not published yet)
- Use Smart Publish to publish items to Web database
- Restart dev server if component-map related
- Clear browser cache if still not visible

## Item Naming Validation

**Error: "An item name must satisfy the pattern: ^[\w\*\$][\w\s\-\$]*(\(\d{1,}\)){0,1}$"**

**Cause:** Invalid characters in item name

**NOT allowed in item names:**
- Ampersand (&)
- Less than / Greater than (<, >)
- Forward/Backward slash (/, \)
- Question mark (?)
- Colon (:)
- Pipe (|)
- Asterisk (*) — except as first character
- Double quotes (")

**Allowed in item names:**
- Letters (a-z, A-Z)
- Numbers (0-9)
- Underscore (_)
- Hyphen (-)
- Space ( )
- Dollar sign ($)
- Parentheses with numbers: (1), (2), etc.

**Fix:** Replace invalid characters:
- ❌ "AI & Machine Learning" → ✅ "AI and Machine Learning"
- ❌ "Cloud/DevOps" → ✅ "Cloud DevOps"
- ❌ "Q&A Section" → ✅ "Questions and Answers"

**Note:** Field VALUES can contain these characters, just not item NAMES.

## Template Creation

**Fields not appearing in datasource picker:**
Ensure 4-level hierarchy: Template → Section → Fields → __Standard Values.

**New items created with empty fields:**
Template is missing `__Standard Values`, or it exists but has no default values. Create it and set defaults.

**"Add" button in Pages Content tab shows no templates:**
`__Standard Values` missing or `__Masters` field not set. For folders: set `__Masters` to allowed child template IDs. For parents: set `__Masters` to child template IDs.

## Rendering Configuration

**"No datasource template found":**
`Datasource Template` must be full path (`/sitecore/templates/Project/...`), not a GUID. Confirm template exists at that path.

**Component not in Pages editor toolbar:**
**#1 CAUSE:** Not added to Available Renderings → See [sitecore-available-renderings.md](sitecore-available-renderings.md)

If already added to Available Renderings, check:
1. Rendering GUID in Available Renderings is UPPERCASE with braces: `{ABC-123}`
2. Available Renderings item was published to Web database
3. `componentName` field is set and matches component-map key (kebab-case)
4. Component registered in `component-map.ts`
5. Rendering uses JSON Rendering template (ID: `04646a89-996f-4ee7-878a-ffdbf1f0ef0d`)
6. Dev server restarted after component-map changes

**Datasource picker is empty:**
Check `Datasource Location` query. Folder template name in query must match exactly. Folder instance must exist in Data folder with child items.

**Children data missing:**
`ComponentQuery` is empty or missing `children { results { ... } }`. Verify template names in `... on` fragments (PascalCase). All fields need `{ jsonValue }`. Field names must be camelCase.

**`fields.data.children.results` is empty:**
Children are INSIDE datasource: `fields.data.datasource.children.results`, NOT `fields.data.children.results`.

**Props shape mismatch (`fields.data.datasource` vs `fields.Title`):**
With ComponentQuery → `fields.data.datasource` + camelCase + `jsonValue`.
Without ComponentQuery → `fields.Title` + PascalCase + `.value`.
Fix: match component code to rendering config. Never mix both.

**"Cannot read properties of undefined (reading 'route')":**
Usually a malformed `ComponentQuery`. Check: matching braces, correct `... on` fragments, camelCase fields, no collision-prone names (`icon`, `name`, `path`). Test on page immediately after saving.

**Context-only component shows empty:**
Verify it reads from `page.layout.sitecore.route.fields`. Ensure page template has expected fields. Confirm `Datasource Template` and `Datasource Location` are both empty.

## Component Registration

**Fields not editable:**
Use Sitecore field components (`Text`, `Image`, `Link`). Access via `jsonValue`. Handle `isPageEditing`.

**Name mismatch errors:**
Verify full chain: file `component-name.tsx` → import `import * as componentname` → key `['component-name', {...}]` → rendering `componentName: "component-name"`

**TypeScript errors:**
Import only from `@sitecore-content-sdk/nextjs`. Never from `/config-cli`, `/tools`, `/client`. Extend `ComponentProps`. Use optional chaining `?.`.

**Children not in Pages Content tab:**
Add `_HorizonDatasourceGrouping` (`{D0F6BE14-2A2D-4C56-ACB5-80CAA573B8E2}`) to **parent** template (not child, not folder). Set Insert Options on parent's `__Standard Values`.

**Variant dropdown not showing:**
**Cause 1:** Rendering missing `Parameters Template` field
**Fix:** Set `Parameters Template` to Generic Rendering Parameters path (see [sitecore-rendering-parameters.md](sitecore-rendering-parameters.md))

**Cause 2:** Missing Variant Definition items at `<site>/Presentation/Headless Variants/<ComponentName>/`. Name must exactly match PascalCase export. `Default` Variant Definition is required.

**Component not appearing after registration:**
Restart Next.js dev server. Clear `.next` cache if needed.

## Publishing

All MCP items live in Master database only. Publish after changes.
Component-map changes require app restart/rebuild (code change, not publishing).
