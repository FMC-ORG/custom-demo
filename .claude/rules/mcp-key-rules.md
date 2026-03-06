# MCP Key Rules & Content Tree

## Site Discovery Workflow

**IMPORTANT**: Before starting work, determine the site structure:

1. **Check environment variables first:**
   ```bash
   cat examples/basic-nextjs/.env.local | grep SITE_NAME
   ```

2. **Try MCP search** (may fail with 500 - this is normal):
   ```
   mcp__marketer__search_site(site_name="<name>", search_query="home")
   ```

3. **Explore content tree** if search fails:
   ```
   mcp__marketer__get_content_item_by_path(itemPath="/sitecore/content")
   ```
   Navigate down to find: `/sitecore/content/<collection>/<site>/`

4. **Verify key paths exist:**
   - Site root: `/sitecore/content/<collection>/<site>/`
   - Data folder: `/sitecore/content/<collection>/<site>/Data/`
   - Variants folder: `/sitecore/content/<collection>/<site>/Presentation/Headless Variants/`

## Content Tree Paths

### Pages (via `create_page`)
`/sitecore/content/<site-collection>/<site-name>/Home/...`

### Datasources (via `create_content_item` / `create_component_datasource`)
- Site Data folder: `/sitecore/content/<site-collection>/<site-name>/Data/<component-type>/`
- Route-level: `/sitecore/content/<site-collection>/<site-name>/Home/<page-name>/Data/`
- Global shared: `/sitecore/content/<site-collection>/<site-name>/Data/`

### Assets (via `upload_asset`)
- Site-specific: `/sitecore/media library/Project/<site-collection>/<site-name>/`
- Shared: `/sitecore/media library/Project/<site-collection>/shared/`

### Definition Items (Developer-Owned, Serialized)
- Templates: `/sitecore/templates/Project/fmc-custom-demo/`
- Renderings: `/sitecore/layout/Renderings/Project/fmc-custom-demo/`
- Placeholder Settings: `/sitecore/layout/Placeholder Settings/Project/fmc-custom-demo/`
- Layouts: `/sitecore/layout/Layouts/Project/fmc-custom-demo/`
- Branches: `/sitecore/templates/Branches/Project/fmc-custom-demo/`
- Modules: `/sitecore/system/settings/Project/fmc-custom-demo/`

### SXA Site Structure
- Home: `<site>/Home/`
- Data: `<site>/Data/`
- Media: `<site>/Media/`
- Dictionary: `<site>/Dictionary/`
- Presentation: `<site>/Presentation/`
- Settings: `<site>/Settings/`

## Key Rules (Priority Order)

### 🚨 CRITICAL - Do These First, Always

1. **MANDATORY __Standard Values** — every template, every time. See sitecore-standard-values.md. Without it: insert options broken, items blank, "Add" button empty.

2. **Validate item names** — Pattern: `^[\w\*\$][\w\s\-\$]*(\(\d{1,}\)){0,1}$`. NOT allowed: `&`, `<`, `>`, `/`, `\`, `?`, `:`, `|`, `*`, `"`. Replace "&" with "and" in item names.

3. **4-level template hierarchy** — Template → Section → Fields → __Standard Values. All levels required.

4. **Master database** — MCP creates in Master. Publish to go live (Smart Publish recommended).

5. **_HorizonDatasourceGrouping** for list components — on parent template only. Required for Content tab editing.

6. **Variant system template IDs** — Verify before creating variants:
   - Headless variant (containers): `{49C111D0-6867-4798-A724-1F103166E6E9}`
   - Variant Definition (variants): `{4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55}`
   - Do NOT use Template Folder - won't function
   - See sitecore-variants.md for verification workflow

7. **Parameters Template = GUID format** — not path string:
   - ✅ `"{E211F6A3-...}"`
   - ❌ `"/sitecore/templates/.../Generic Rendering Parameters"`
   - Path format causes add_component_on_page failures
   - Get GUID when creating template, use consistently

8. **Run TypeScript build** — after component-map.ts registration:
   - `cd examples/basic-nextjs && npm run build`
   - Fix errors before marking component complete
   - Common: generic vs specific props, missing JSS Field types
   - Build failure = non-functional component

### ⚠️ HIGH PRIORITY - Easy to Forget

9. **Add rendering to Available Renderings** — After creating rendering, MUST add GUID to `/Presentation/Available Renderings/Page Content` or component won't appear in Pages toolbar. See sitecore-available-renderings.md.

10. **Set Parameters Template on every rendering** — Use Generic Rendering Parameters GUID. Without it: component works but variant selection disabled. See sitecore-rendering-parameters.md.

11. **Datasource Template = full path** — starts with `/sitecore/templates/...`, never a GUID.

12. **Validate ComponentQuery** — syntax errors cause cryptic `reading 'route'` runtime errors. Check: PascalCase templates, camelCase fields, all fields have `{ jsonValue }`, include `id` in children.

13. **ComponentQuery = single-line string** — NO escaped newlines (`\n`), NO line breaks. Must be continuous string with spaces only.

14. **Create folder templates AND data folders** — both required or datasource picker is empty.

15. **kebab-case component names** — `componentName`, map key, and filename must all match.

16. **Always JSON Rendering** — ID `04646a89-996f-4ee7-878a-ffdbf1f0ef0d`. Never Controller/View Rendering.

### ✅ BEST PRACTICES - Do When Possible

17. **Run parallel operations** when safe — multiple independent fields, variants, or children can be created in one message. Sequential for dependencies (parent → children).

18. **Verify parent path** before creating — use `get_content_item_by_path`.

19. **Respect insert options** — use `list_available_insertoptions`.

20. **Datasource Location = query syntax** — exact `@@templatename`, pipe `|` separator.

21. **Avoid duplicates** — search before creating (`search_site`, `search_assets`, `search_component_datasources`).

22. **Assets in Media Library** — never under `/sitecore/content/`.

23. **Restart after registration** — component-map changes need dev server restart.

24. **Optional chaining** — always `?.` for nested field access.

25. **List components need ComponentQuery** — with `children { results { ... } }`.

26. **Simple components: no ComponentQuery** — use default PascalCase/`.value` shape.

27. **Context-only: all datasource fields empty** — read from `page.layout.sitecore.route.fields`.

28. **Never modify OOB templates** — extend via inheritance.

29. **Avoid GraphQL collisions** — don't use `icon`, `name`, `path`, `url`, `template`, `parent`, `children`.

30. **Serialize definition items** — to `../../authoring/items/` or they'll be lost on deployment.

## MCP Performance: Parallel vs Sequential

**Run operations in parallel** (single message, multiple tool calls):
- ✅ Multiple independent fields in same section
- ✅ Multiple variant definitions
- ✅ Multiple child items (if parent already exists)
- ✅ Information gathering (multiple reads)

**Run sequentially** (separate messages):
- ❌ Parent → Children (need parent ID first)
- ❌ Template → __Standard Values (need template ID)
- ❌ Operations with dependencies

## Workflow

- Publish after MCP changes (Smart Publish or Incremental)
- Check workflow assignments on templates before expecting items to be live
- Component-map changes = app restart (code change, not publish)
- TypeScript build check = mandatory before marking component complete
