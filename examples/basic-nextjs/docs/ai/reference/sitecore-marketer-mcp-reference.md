# Sitecore Marketer MCP Reference  
  
## Core rule  
  
Treat templates, template sections, template fields, `__Standard Values`, folder templates, datasource folders, and renderings as normal Sitecore items.  
  
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
  
---  
  
## Recommended creation order  
  
When creating a simple datasource-backed component, prefer this order:  
  
1. Resolve or create the required folder/container structure  
2. Create the datasource template  
3. Create the template section (for example `Data`)  
4. Create template fields  
5. Update template field metadata, including explicit `Type`  
6. Create datasource template `__Standard Values`  
7. Create the folder template  
8. Create folder template `__Standard Values`  
9. Set folder template insert options / `__Masters`  
10. Create the datasource folder under the site’s `/Data`  
11. Create the rendering item  
12. Update rendering fields such as datasource template, datasource location, component name, and field editor settings  
13. Verify the final item state via MCP  
  
---  
  
## MCP usage patterns  
  
### Resolve parent items first  
  
Before creating a child item:  
- resolve the parent with `get_content_item_by_path`  
- record the parent ID  
- use the resolved ID for `create_content_item`  
  
Do not guess IDs.  
  
---  
  
### Create templates, sections, and fields  
  
#### Datasource template  
  
Create the datasource template item under the correct project/components path.  
  
#### Template section  
  
Create a section item (commonly `Data`) under the datasource template using the standard **Template section** template.  
  
#### Template fields  
  
Create each field item under the section using the standard **Template field** template.  
  
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
  
### Create renderings  
  
Prefer **JSON Rendering** unless the repository uses another convention.  
  
For the rendering item, create or verify fields such as:  
- datasource template  
- datasource location  
- component name  
- add field editor button  
  
Use the exact field names returned by item inspection for updates.  
  
---  
  
## Verification rules  
  
Prefer **MCP-based verification first**.  
  
After any create/update, verify the resulting item with:  
- `get_content_item_by_id`  
- or `get_content_item_by_path`  
  
### Verify template work  
  
- template exists at the expected path  
- section exists  
- fields exist  
- each field `Type` is correct  
- `__Standard Values` exists under the template  
- `__Standard Values` is based on the owning template, not the Standard template  
  
### Verify folder template work  
  
- folder template exists  
- folder template `__Standard Values` exists  
- folder template `__Standard Values` is based on the owning folder template  
- insert options / `__Masters` point to the correct datasource template  
  
### Verify datasource folder work  
  
- datasource folder exists at the correct content path  
- datasource folder uses the intended folder template  
  
### Verify rendering work  
  
- rendering exists at the expected path  
- datasource template is correct  
- datasource location is correct  
- component name is correct  
- add field editor button is set as intended  
  
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
  
When an update does not stick:  
1. re-read the item via MCP  
2. inspect the actual field names returned  
3. retry using the exact returned names  
4. if still unsuccessful, report the field as requiring follow-up verification  
  
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
  
Fill and maintain these per repository:  
  
- `siteCollection`: `<replace>`  
- `siteName`: `<replace>`  
- `dataRoot`: `/sitecore/content/<siteCollection>/<siteName>/Data`  
- `renderingsRoot`: `<replace>`  
- `projectTemplatesRoot`: `<replace>`  
- `projectFoldersRoot`: `<replace>`  
  
### Example: basic-nextjs  
  
- `siteCollection`: `new`  
- `siteName`: `fmc`  
- `dataRoot`: `/sitecore/content/new/fmc/Data`  
- `renderingsRoot`: `/sitecore/layout/Renderings/Project/new/Banners`  
  
Replace the example with the actual repository values if this repo differs.  