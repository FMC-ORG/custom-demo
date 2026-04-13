# Sitecore Marketer MCP Reference  
  
## Core rule  
  
Treat templates, template sections, template fields, `__Standard Values`, folder templates, datasource folders, renderings, Headless Variants containers, and Variant Definition items as normal Sitecore items.  
  
Use the marketer MCP first for Sitecore item creation and updates unless:  
- a specific MCP action fails  
- permissions prevent the change  
- the repository/process explicitly requires serialization or source-controlled definitions  
  
Do **not** claim that marketer MCP cannot create templates or renderings by default.  
  
---  
  
## Tool inventory  
  
Use the exact tool names exposed by the current MCP server. Typical tools include:  
  
- `create_content_item`  
  - Create a Sitecore item when you know the parent item and template to use.  
- `update_fields_on_content_item`  
  - Update fields on an existing Sitecore item.  
- `get_content_item_by_path`  
  - Resolve item IDs by path and inspect item structure.  
- `get_content_item_by_id`  
  - Inspect the exact resulting item after create/update.  
- `delete_content`  
  - Delete incorrectly created items if safe and explicitly requested.  
- `list_components`  
  - Inspect existing renderings/components and naming conventions.  
- `list_available_insertoptions`  
  - Inspect available insert options for content items when supported.  
  
If your MCP server exposes slightly different names, use the server’s actual names.  
  
---  
  
## Standard Sitecore item template IDs  
  
These are common Sitecore standard item template IDs:  
  
- Template: `ab86861a-6030-46c5-b394-e8f99e8b87db`  
- Template section: `e269fbb5-3750-427a-9149-7aa950b49301`  
- Template field: `455a3e98-a627-4b40-8035-e683a0331ac7`  
- Template folder: `0437fee2-44c9-46a6-abe9-28858d9fee8c`  
- JSON Rendering: `04646a89-996f-4ee7-878a-ffdbf1f0ef0d`  

## Rendering Parameters base template IDs

Every Rendering Parameters template must inherit all four of these base templates:

| ID | Purpose |
|---|---|
| `4247aad4-ebde-4994-998f-e067a51b1fe4` | `IComponentVariant` — adds variant picker to Experience Editor |
| `5c74e985-e055-43ff-b28c-db6c6a6450a2` | `IStyling` — adds styles support |
| `44a022db-56d3-419a-b43b-e27e4d8e9c41` | `Grid Parameters` — adds grid field |
| `3db3eb10-f8d0-4cc9-be26-18ce7b139ec8` | `IRenderingId` — adds HTML ID field |

Set all four as `__Base template` on every Rendering Parameters template item.

## Datasource template base template IDs

Every datasource template (parent and child) must inherit these two base templates. This does **not** apply to folder templates.

| ID | Purpose |
|---|---|
| `{1930BBEB-7805-471A-A3BE-4858AC7CF696}` | Standard Template |
| `{44A022DB-56D3-419A-B43B-E27E4D8E9C41}` | Grid Parameters |

Set `__Base template` on every datasource template to:
```
{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}
```

Set this immediately after creating the datasource template item, before creating sections or fields.

## Headless Variant template IDs

Use these when creating Headless Variant containers and Variant Definition items:

| Item type | Template ID |
|---|---|
| HeadlessVariants container | `49c111d0-6867-4798-a724-1f103166e6e9` |
| Variant Definition item | `4d50cdae-c2d9-4de8-b080-8f992bfb1b55` |

Use these only when you truly need a standard Sitecore item template ID.  
  
---  
  
## `__Standard Values` creation  
  
When creating `__Standard Values` via MCP, use the **owning template item ID** as both:  
  
- `parentId`  
- `templateId`  
  
Pattern:  
  
- `name`: `__Standard Values`  
- `parentId`: `<owning-template-item-id>`  
- `templateId`: `<owning-template-item-id>`  
  
Do **not** use the Standard template ID `1930bbeb-7805-471a-a3be-4858ac7cf696` for a template’s `__Standard Values`.  
  
### Why  
  
A template’s `__Standard Values` item is:  
- a child of the template item  
- an item based on that same template  
  
### Example: ContentSplit  
  
If the ContentSplit template item ID is:  
  
`84d48849-7b62-44fd-b85e-5ac2f1e31892`  
  
then create `__Standard Values` with:  
  
- `name = "__Standard Values"`  
- `parentId = "84d48849-7b62-44fd-b85e-5ac2f1e31892"`  
- `templateId = "84d48849-7b62-44fd-b85e-5ac2f1e31892"`  
  
### Example: Promo Banner  
  
If the Promo Banner template item ID is:  
  
`ce483486-28de-4d03-ab7a-0234f31b9914`  
  
then create `__Standard Values` with:  
  
- `name = "__Standard Values"`  
- `parentId = "ce483486-28de-4d03-ab7a-0234f31b9914"`  
- `templateId = "ce483486-28de-4d03-ab7a-0234f31b9914"`  
  
The same rule applies to folder templates.  

### Link the template to its `__Standard Values`

After creating the `__Standard Values` item, you **must** set the `Standard values` field on the **template item itself** to the Item ID of the newly created `__Standard Values` item. Without this step, the template does not know which item holds its defaults.

**Steps:**
1. Create `__Standard Values` as described above
2. Record the Item ID of the created `__Standard Values` item (from the MCP response or via `get_content_item_by_path`)
3. Update the **template item** (not the `__Standard Values` item) using `update_fields_on_content_item`:
   - field name: `Standard values` (inspect via MCP first — may appear as `__Standard values`)
   - value: the Item ID (GUID) of the `__Standard Values` item

This applies to **all** templates that have `__Standard Values` — datasource templates, child templates, and folder templates.  

### `__Standard Values` default field values

After creating `__Standard Values`, set sensible default values for text fields to give authors an immediate starting point:
- Title / heading fields: use `$name` (Sitecore token that inserts the item name)
- Description / body fields: can be left empty or set to a brief placeholder
- Image and General Link fields: leave empty — they require media picker / link picker selection

This ensures new datasource items created from this template are immediately populated rather than blank.  
  
---  
  
## Recommended creation order  
  
When creating a simple datasource-backed component, prefer this order:  
  
1. Resolve or create the required folder/container structure. Use `get_content_item_by_path` to check each intermediate folder. If any does not exist (e.g. `projectTemplatesRoot/Components`, `Components/<Category>`, `renderingsRoot/<Category>`, `renderingParamsRoot/<Category>`, `projectFoldersRoot`), create it using template folder ID `0437fee2-44c9-46a6-abe9-28858d9fee8c`.  
2. Create the datasource template  
3. Set `__Base template` on datasource template to `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}` (Standard Template + Grid Parameters). This applies to all datasource templates, **not** folder templates.
4. Create the template section (for example `Data`)  
5. Create template fields  
6. Update template field metadata, including explicit `Type`  
7. Create datasource template `__Standard Values`  
8. Link the datasource template to its `__Standard Values` — set the `Standard values` field on the template item to the `__Standard Values` Item ID
9. Create the folder template  
10. Create folder template `__Standard Values`  
11. Link the folder template to its `__Standard Values` — same as step 8
12. Set folder template insert options / `__Masters`  
11. Create the datasource folder under the site's `/Data`  
12. Set insert options on the datasource folder item itself (not only on the folder template `__Standard Values`)
13. Create an example datasource item inside the folder
14. Create the Rendering Parameters template
15. Create the rendering item  
16. Update rendering fields via MCP using known field names: `componentName` (PascalCase), `Parameters Template` (GUID), `AddFieldEditorButton` (`1`), `Datasource Template` (full path — silent-write), `Datasource Location` (dynamic query — silent-write). Silent-write fields return empty `updatedFields` — this is normal, not a failure.
17. Register the rendering in Available Renderings — **read the current value** of the `Renderings [shared]` field on the **Page Content** item, then **concatenate** (not replace) the new rendering ID with a pipe separator. Path: at `/sitecore/content/<siteCollection>/<siteName>/Presentation/Available Renderings/Page Content`
18. Verify the final item state via MCP  
  
---  
  
## MCP usage patterns  
  
### Resolve parent items first  
  
Before creating a child item:  
- resolve the parent with `get_content_item_by_path`  
- record the parent ID  
- use the resolved ID for `create_content_item`  
  
Do not guess IDs.

### Lookup cache before resolution

Before resolving parent items with `get_content_item_by_path`, check the manifest's `lookups` section for a cached item ID.

Structural paths that should always be cached after first resolution:
- `dataRoot`
- `projectTemplatesRoot/Components`
- `projectFoldersRoot`
- `renderingParamsRoot`
- `headlessVariantsRoot`
- Available Renderings Page Content item

If found in `lookups` with a non-empty `itemId`, use it directly — skip the MCP call.
If not found, resolve via MCP and add to `lookups`.

Category subfolders (e.g. `Components/Banners`, `Rendering Parameters/Content`) should also be cached after first creation.

See `docs/ai/skills/sitecore-maintain-manifest.md` → "Lookup cache rules" for full details.  
  
---  
  
### Create templates, sections, and fields  
  
#### Datasource template  
  
Create the datasource template item under the correct project/components path.  
  
#### Template section  
  
Create a section item (commonly `Data`) under the datasource template using the standard **Template section** template.  
  
#### Template fields

Create each field item under the section using the standard **Template field** template.

> **Field naming — collision risk:** Fields named `Title` or `Description` on custom templates may collide with inherited Standard Template fields of the same name. This can cause unexpected behavior in GraphQL queries. For safety, consider prefixing with the component context: `SectionTitle`, `CardTitle`, `ItemTitle`, etc. — especially for list component parent templates where the Standard Template's `Title` field is also present.
  
After creation, explicitly set field metadata with `update_fields_on_content_item`.  
  
At minimum, set:  
- `Type`  
  
Common values:  
- `Single-Line Text`  
- `Rich Text`  
- `Image`  
- `General Link`  
  
If needed, also set:  
- `Source`  
- `Shared`  
- `Unversioned`  
  
Do **not** assume the field type is correct by default.  
  
---  
  
### Create folder templates and insert options  
  
Create the folder template under the correct project/folders path.  
  
Then create the folder template’s `__Standard Values` item using the folder template’s own ID as both:  
- `parentId`  
- `templateId`  
  
Set insert options / `__Masters` so authors can create datasource items of the correct datasource template inside the folder.  
  
When updating insert options, use the exact field names returned by MCP inspection. Do not guess display-name/internal-name casing.  
  
---  
  
### Create datasource folders  
  
Create the datasource folder under the site data path, for example:  
  
`/sitecore/content/<siteCollection>/<siteName>/Data/...`  
  
Use the project’s folder template when one exists.  
  
---  
  

### Create an example datasource item

After creating the datasource folder, create one example content item inside it.

This gives authors an immediate starting point — they can duplicate it or edit it rather than creating from scratch in an empty picker.

**How to create:**
- parent = the datasource folder item (resolve with `get_content_item_by_path`)
- template = the datasource template
- name = the component name (e.g. `Hero`, `Promo Banner`, `Article Cards`)

For **list components**, the example item is the parent datasource item. Create one or two child items inside it using the child template so the component renders immediately.

**Field values:**
- **If the user provided a screenshot or design reference:** populate the example item fields with content that matches the design — extract text, headings, descriptions, image URLs, and link targets from the visual reference. The goal is for the component to render identically to the design from day one.
- **If the user provided a URL in the prompt:** use it to extract real content for the example item fields.
- **If no visual reference was provided:** use `__Standard Values` defaults where set. If no defaults exist, leave fields empty — do not invent placeholder copy.

**Verify** the created item with `get_content_item_by_id` or `get_content_item_by_path`.

---

### Create a Rendering Parameters template

Every rendering requires a Rendering Parameters template. Create it before creating the rendering item.

**Path:** `renderingParamsRoot` + `/<Category>/<ComponentName>`

For example: `/sitecore/templates/Project/new/Rendering Parameters/Banners/Hero`

**Steps:**
1. Resolve the `renderingParamsRoot` parent with `get_content_item_by_path`
2. Create a Category subfolder if it does not already exist (use the Template folder template ID `0437fee2-44c9-46a6-abe9-28858d9fee8c`)
3. Create the Rendering Parameters template item:
   - `name` = component name (e.g. `Hero`)
   - `templateId` = `ab86861a-6030-46c5-b394-e8f99e8b87db` (standard Template)
   - `parentId` = category folder item ID
4. Set the `__Base template` field on the new template item to all four required base templates (pipe-separated GUIDs):
   ```
   {4247AAD4-EBDE-4994-998F-E067A51B1FE4}|{5C74E985-E055-43FF-B28C-DB6C6A6450A2}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}|{3DB3EB10-F8D0-4CC9-BE26-18CE7B139EC8}
   ```
5. Verify with `get_content_item_by_path` that the template exists and base templates are set

Do **not** skip this step for any component type — simple, list, or context-only renderings all require a Rendering Parameters template.

---

### Create renderings  
  
Prefer **JSON Rendering** unless the repository uses another convention.  
  
For the rendering item, create or verify fields such as:  
- datasource template  
- datasource location  
- `Parameters Template [shared]` — set to the **Item ID (GUID)** of the Rendering Parameters template. **Never use a path.** Resolve the ID via MCP after creating the Rendering Parameters template.
- `Component Name [shared]` — must be **PascalCase** and **exactly match** the TSX filename without extension (e.g. `EurobankHeader` for `EurobankHeader.tsx`). Do not use kebab-case.
- add field editor button  
  
Do **not** leave `Parameters Template [shared]` empty. Every rendering requires it.  

### Register in Available Renderings

After creating the rendering, register it in the site's **Available Renderings** so it appears in the Experience Editor / Pages editor.

**Always add the rendering to the Page Content Available Renderings item:**
- Path: `/sitecore/content/<siteCollection>/<siteName>/Presentation/Available Renderings/Page Content`

**⚠️ CRITICAL: The `Renderings` field is both silent-write AND silent-read.** MCP cannot read the current value. If you write a value without knowing the current contents, you will **replace** all existing renderings and break the page editor.

**Steps:**
1. Resolve the Page Content Available Renderings item via `get_content_item_by_path` (cache the `itemId` in lookups)
2. **Ask the user for the current `Renderings` field value** — MCP cannot read it. The user must copy it from Content Editor.
3. **Concatenate** the new rendering's Item ID to the existing value with a pipe separator. **Do NOT replace the existing value** — overwriting it removes all other components from the page editor.
4. Update the `Renderings` field with the concatenated value

**Example:** If the current value is `{A8DB4692-0731-4067-A224-79EFFF24C639}` and the new rendering ID is `{B1234567-ABCD-1234-EFGH-123456789ABC}`, the updated value must be:
```
{A8DB4692-0731-4067-A224-79EFFF24C639}|{B1234567-ABCD-1234-EFGH-123456789ABC}
```
Never set it to just `{B1234567-ABCD-1234-EFGH-123456789ABC}` — that would remove the existing rendering.

**If you cannot get the current value from the user**, track the last-known value in the manifest. But always warn the user that another session or manual edit may have changed it.

Do **not** skip this step. Without it, authors cannot add the component to pages.

Use the exact field names returned by item inspection for updates.  
  
---  
  
## Verification rules  
  
Prefer **MCP-based verification first**.  
  
After any create/update, verify the resulting item with:  
- `get_content_item_by_id`  
- or `get_content_item_by_path`  
  
### Verify template work  
  
- template exists at the expected path  
- datasource template `Base template` includes `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}` (does not apply to folder templates)
- section exists  
- fields exist  
- each field `Type` is correct  
- `__Standard Values` exists under the template  
- `__Standard Values` is based on the owning template, not the Standard template  
- template `Standard values` field is set to the `__Standard Values` Item ID
  
### Verify folder template work  
  
- folder template exists  
- folder template `__Standard Values` exists  
- folder template `__Standard Values` is based on the owning folder template  
- insert options / `__Masters` point to the correct datasource template  
  
### Verify datasource folder work  
  
- datasource folder exists at the correct content path  
- datasource folder uses the intended folder template  
- insert options are set on the datasource folder item itself (not only on the folder template)  
  
### Verify rendering work  
  
- rendering exists at the expected path  
- datasource template is correct  
- datasource location is correct  
- `Parameters Template [shared]` is set to the Item ID (GUID), not a path, and points to the correct Rendering Parameters template
- `Component Name [shared]` is PascalCase matching the TSX filename exactly
- add field editor button is set as intended  
- rendering is registered in Available Renderings (Page Content)  
  
If a value cannot be reliably set or verified through MCP:  
- state that explicitly  
- mark it as requiring follow-up verification  
- do not report it as completed unless confirmed  
  
Content Editor verification is a fallback, not the default claim.  
  
---  
  
## Known tool behavior  
  
### `list_available_insertoptions`  
  
`list_available_insertoptions` may be most reliable for content items within a site content tree.  
  
For template-model inspection under `/sitecore/templates/...`, prefer:  
- `get_content_item_by_path`  
- `get_content_item_by_id`  
- direct inspection of `__Standard Values` / insert options fields  
  
Do not depend on `list_available_insertoptions` as the primary way to inspect template items.  
  
### Field update sensitivity  
  
`update_fields_on_content_item` can be sensitive to exact field names, casing, or the item template involved.  

**Critical: always inspect the item via MCP before updating fields.** Use `get_content_item_by_id` or `get_content_item_by_path` to read the item first, then use the **exact field names** returned by MCP. Do not guess field names from display names — they often differ.

When an update does not stick:  
1. re-read the item via MCP  
2. inspect the actual field names returned  
3. retry using the exact returned names  
4. if still unsuccessful, report the field as requiring follow-up verification  

### Known MCP field names

> **⚠️ THREE fields require the double underscore `__` prefix. Without it, MCP returns 400:**
> - `__Base template` (not "Base template")
> - `__Masters` (not "Masters" or "Insert Options")
> - `__Standard values` (not "Standard values")
>
> This is the #1 cause of MCP update failures. Always use the `__` prefix.

The display names shown in Content Editor often differ from the actual MCP field names. Using the wrong name causes 400 errors. Here are known mappings:

#### JSON Rendering fields

| Display name (Content Editor) | MCP field name | Notes |
|---|---|---|
| Component Name [shared] | `componentName` | No brackets, camelCase |
| Parameters Template [shared] | `Parameters Template` | No `[shared]` suffix |
| Add Field Editor Button | `AddFieldEditorButton` | |
| Component Query | `ComponentQuery` | |
| Datasource Template | `Datasource Template` | Silent-write — write succeeds but field not returned by MCP reads |
| Datasource Location | `Datasource Location` | Silent-write — write succeeds but field not returned by MCP reads |

#### Template fields

| Display name (Content Editor) | MCP field name | Notes |
|---|---|---|
| Base template | `__Base template` | **Double underscore prefix required** — `Base template` without `__` will return 400 |
| Insert Options / Masters | `__Masters` | Double underscore prefix; silent-write |
| Standard values [shared] | `__Standard values` | **Double underscore prefix required** — `Standard values` without `__` will return 400; silent-write |

**Rule:** When setting base templates on any template item, always use `__Base template` (with double underscore). The display name "Base template" (without prefix) will fail.

**Rule:** When in doubt about any field name, always `get_content_item_by_id` first and use the exact field names from the response.

### Silent-write fields (write succeeds, `updatedFields` returns empty)

These fields are written successfully by MCP but are **not reflected** in `updatedFields` or `fields` on subsequent reads. An empty `updatedFields` response is **not a failure** for these fields:

| Field | Item type | How to verify |
|---|---|---|
| `__Masters` | Folder template `__Standard Values`, datasource folder instance | Content Editor |
| `__Standard values` | Template items (linking to `__Standard Values` item) | Content Editor |
| `Renderings` | Available Renderings Page Content item | Content Editor — **also silent-read (cannot be read via MCP)** |
| `Datasource Template` | JSON Rendering | Content Editor |
| `Datasource Location` | JSON Rendering | Content Editor |

**Do not** flag these as "requires manual setup" unless a hard error (400/500) was returned. Report them as: *"Written via MCP; verify in Content Editor — updatedFields is empty by design for this field."*

### `create_component_ds` children reliability

**Date discovered:** 2026-04-11
**Severity:** Medium — causes empty list components

The `create_component_ds` tool accepts a `children` array parameter for creating parent+child datasource items in one call. However, children may not always be created successfully — the API reports success but the parent item has no children.

**Workaround:** After creating any list component datasource with `create_component_ds`:
1. Read the parent item back with `get_content_item_by_id`
2. Check if children exist
3. If missing, create children individually with `create_content_item` under the parent

**Alternative approach:** Skip `create_component_ds` for list components entirely. Instead:
1. Create the parent with `create_content_item` using the parent template and datasource folder as parent
2. Create each child with `create_content_item` using the child template and the new parent as parent
3. Update fields on each item with `update_content`

This is more MCP calls but more reliable.

---

### Standard Datasource Location query pattern

For simple and list components, use this dynamic query pattern so the datasource picker resolves relative to the current site:

```
query:$site/*[@@name='Data']/*[@@templatename='<FolderTemplateName>']|query:$sharedSites/*[@@name='Data']/*[@@templatename='<FolderTemplateName>']
```

Replace `<FolderTemplateName>` with the exact Sitecore item name of the folder template (e.g. `BenefitsBlockFolder`, `Promo Banner Folder`).  
  
---  
  
## Output and honesty rules  
  
When reporting work:  
- distinguish clearly between **created**, **updated**, **verified**, and **planned**  
- do not claim completion for a field/item you did not verify  
- do not say marketer MCP is inherently unable to create templates/renderings unless you observed a specific failure  
- if the repo requires serialization instead of direct Sitecore item creation, say that explicitly as a process choice  
  
Good phrasing:  
- “Created via marketer MCP and verified by item lookup”  
- “Created via marketer MCP; field update needs follow-up verification”  
- “Repo convention appears to require serialization for this definition”  
  
Avoid:  
- “Marketer MCP cannot create templates/renderings”  
  
---  
  
## Project-specific values  
  
Project values are loaded from `docs/ai/config/project.yaml` at the start of every task.  
  
See rule `00-project-config-bootstrap` for the full read/create workflow.  
  
### Path derivation rules  
  
Read `siteCollection`, `siteName`, `renderingsRoot`, and `projectTemplatesRoot` from the config file.  
  
Then derive:  
  
| Variable | Derivation |  
|---|---|  
| `dataRoot` | `/sitecore/content/<siteCollection>/<siteName>/Data` |  
| `projectFoldersRoot` | `projectTemplatesRoot` + `/Folders` |
| `headlessVariantsRoot` | `/sitecore/content/<siteCollection>/<siteName>/Presentation/Headless Variants` |
| `renderingParamsRoot` | `projectTemplatesRoot` + `/Rendering Parameters` |  
  
If `renderingsRoot` or `projectTemplatesRoot` are absent from the config file, use these defaults:  
  
| Variable | Default |  
|---|---|  
| `renderingsRoot` | `/sitecore/layout/Renderings/Project/<siteCollection>` |  
| `projectTemplatesRoot` | `/sitecore/templates/Project/<siteCollection>` |  
  
Then construct item paths using:  
  
| Item type | Pattern |  
|---|---|  
| Datasource template | `projectTemplatesRoot` + `/Components/<Category>/<TemplateName>` |  
| Child template | `projectTemplatesRoot` + `/Components/<Category>/<ChildTemplateName>` |  
| Folder template | `projectFoldersRoot` + `/<FolderTemplateName>` |  
| Datasource folder | `dataRoot` + `/<ComponentNamePlural>` |  
| Rendering | `renderingsRoot` + `/<Category>/<RenderingName>` |
| Rendering Parameters template | `renderingParamsRoot` + `/<Category>/<ComponentName>` |
| Headless Variants container | `headlessVariantsRoot` + `/<ComponentName>` |
| Variant Definition item | `headlessVariantsRoot` + `/<ComponentName>/<VariantName>` |  
  
`<Category>` must match the component spec `category` field (PascalCase, e.g. `Banners`, `Cards`, `Content`, `Page`).  
  
### Verified example: Promo Banner  
  
A fully created and verified simple datasource component for reference.  
Derived from `siteCollection: new`, `siteName: fmc`.  
  
- Datasource template: `/sitecore/templates/Project/new/Components/Banners/Promo Banner`  
- Folder template: `/sitecore/templates/Project/new/Folders/Promo Banner Folder`  
- Datasource folder: `/sitecore/content/new/fmc/Data/Promo Banners`  
- Rendering Parameters template: `/sitecore/templates/Project/new/Rendering Parameters/Banners/Promo Banner`  
- Rendering: `/sitecore/layout/Renderings/Project/new/Banners/Promo Banner`  
  
Known item IDs (use for cross-reference only):  
- Promo Banner template: `ce483486-28de-4d03-ab7a-0234f31b9914`  
- Promo Banner `__Standard Values`: `41e0101a-...` (templateId = `ce483486-...`)  
- Promo Banner Folder template: `34d06ac8-...`  
- Promo Banner datasource folder: `f684a188-...`  
- Promo Banner JSON Rendering: `b8a741b2-...`  
  
### Verified example: Video Testimonial  
  
- Datasource template: `/sitecore/templates/Project/new/Components/Content/Video Testimonial`  
- Folder template: `/sitecore/templates/Project/new/Folders/Video Testimonial Folder`  
- Datasource folder: `/sitecore/content/new/fmc/Data/Video Testimonials`  
- Rendering Parameters template: `/sitecore/templates/Project/new/Rendering Parameters/Content/Video Testimonial`  
- Rendering: `/sitecore/layout/Renderings/Project/new/Content/Video Testimonial`  