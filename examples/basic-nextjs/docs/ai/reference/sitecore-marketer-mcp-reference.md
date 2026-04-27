# Sitecore Marketer MCP Reference

MCP tool-specific behaviors, field names, and known issues.
For Sitecore rules (base templates, Standard Values, Available Renderings, etc.), see `docs/ai/reference/sitecore-rules.md`.

---

## Core rule

Use the marketer MCP first for all Sitecore item operations unless:
- a specific MCP action fails
- permissions prevent the change
- the repository/process explicitly requires serialization

Do **not** claim that marketer MCP cannot create templates or renderings.

---

## Tool inventory

- `create_content_item` — Create item with parent + template
- `update_fields_on_content_item` — Update fields on existing item
- `get_content_item_by_path` — Resolve item IDs by path
- `get_content_item_by_id` — Inspect item after create/update
- `delete_content` — Delete items (only if safe and explicitly requested)
- `list_components` — Inspect existing renderings/components
- `list_available_insertoptions` — Inspect insert options (content items only)

Use the server's actual tool names if they differ.

---

## MCP Usage Patterns

### Resolve parent items first

Before creating a child item:
- resolve the parent with `get_content_item_by_path`
- use the resolved ID — do not guess IDs

### Lookup cache before resolution

Check the manifest `lookups` section before calling `get_content_item_by_path`. Structural paths that should be cached:
- `dataRoot`, `projectTemplatesRoot/Components`, `projectFoldersRoot`
- `renderingParamsRoot`, `headlessVariantsRoot`
- Available Renderings Page Content item
- Category subfolders (after first creation)

See `docs/ai/skills/sitecore-maintain-manifest.md` → "Lookup cache rules".

### Field update sensitivity

**Always inspect the item via MCP before updating fields.** Use `get_content_item_by_id` to read the item, then use the **exact field names** from the response. Do not guess from display names.

When an update does not stick:
1. Re-read the item via MCP
2. Inspect the actual field names returned
3. Retry using the exact returned names
4. If still unsuccessful, report as requiring follow-up verification

### Field naming — collision risk

Fields named `Title` or `Description` on custom templates may collide with inherited Standard Template fields. For safety, prefix with component context: `SectionTitle`, `CardTitle`, `ItemTitle` — especially for list component parent templates.

### Example datasource items

After creating a datasource folder, create one example content item inside it:
- parent = datasource folder item
- template = datasource template
- name = component name (e.g. `Hero`, `Article Cards`)

For list components, create one parent + one or two child items.

**Field values:**
- If screenshot/design provided: populate with matching content
- If URL provided: extract real content
- If no visual reference: use `__Standard Values` defaults or leave empty

---

## Known Tool Behavior

### `list_available_insertoptions`

Most reliable for content items in a site content tree. For template inspection under `/sitecore/templates/...`, prefer `get_content_item_by_path` or `get_content_item_by_id`.

### `create_component_ds` children reliability

**Severity:** Medium — causes empty list components

The `create_component_ds` tool accepts a `children` array, but children may not be created. The API reports success but the parent has no children.

**Workaround:** After creating any list component datasource:
1. Read the parent back with `get_content_item_by_id`
2. Check if children exist
3. If missing, create individually with `create_content_item`

**Alternative:** Skip `create_component_ds` entirely for list components. Create parent + each child individually with `create_content_item`.

---

## Output and Honesty Rules

- Distinguish between **created**, **updated**, **verified**, and **planned**
- Do not claim completion for unverified items
- Do not say MCP is unable to create templates/renderings unless you observed a specific failure
- Report silent-write fields as: *"Written via MCP; verify in Content Editor — updatedFields is empty by design."*

Good phrasing:
- "Created via marketer MCP and verified by item lookup"
- "Created via marketer MCP; field update needs follow-up verification"

---

## Verified Examples

### Promo Banner (simple component)

Derived from `siteCollection: new`, `siteName: fmc`:

- Datasource template: `/sitecore/templates/Project/new/Components/Banners/Promo Banner`
- Folder template: `/sitecore/templates/Project/new/Folders/Promo Banner Folder`
- Datasource folder: `/sitecore/content/new/fmc/Data/Promo Banners`
- Rendering Parameters: `/sitecore/templates/Project/new/Rendering Parameters/Banners/Promo Banner`
- Rendering: `/sitecore/layout/Renderings/Project/new/Banners/Promo Banner`

Known IDs:
- Template: `ce483486-28de-4d03-ab7a-0234f31b9914`
- SV: `41e0101a-...` (templateId = `ce483486-...`)
- Folder template: `34d06ac8-...`
- Datasource folder: `f684a188-...`
- Rendering: `b8a741b2-...`

### Video Testimonial

- Datasource template: `/sitecore/templates/Project/new/Components/Content/Video Testimonial`
- Folder template: `/sitecore/templates/Project/new/Folders/Video Testimonial Folder`
- Datasource folder: `/sitecore/content/new/fmc/Data/Video Testimonials`
- Rendering Parameters: `/sitecore/templates/Project/new/Rendering Parameters/Content/Video Testimonial`
- Rendering: `/sitecore/layout/Renderings/Project/new/Content/Video Testimonial`
