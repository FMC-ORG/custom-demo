# Sitecore create simple component  
  
Use this skill when creating a Sitecore XM Cloud component backed by a **single datasource item**.  
  
## Use this skill when  
  
- the component uses one datasource item  
- there are no authorable child datasource items  
- there is no `ComponentQuery`  
- the React component reads top-level fields such as:  
  - `fields.Title`  
  - `fields.Description`  
  - `fields.PrimaryLink`  
  - `fields.Image`  
  
## Do not use this skill when  
  
- the component needs repeated child items  
- authors must create nested cards/rows/FAQ items/testimonials  
- the rendering depends on `ComponentQuery`  
- the component requires authorable collections of child datasource items  
  
Use a list/nested component workflow instead.  
  
---  
  
## Inputs to collect  
  
Confirm or infer:  
  
- component name  
- category/grouping  
- site collection  
- site name  
- rendering name  
- datasource template name  
- folder template name  
- React file path  
- field names and field types  
- screenshot/design reference if provided  
- whether datasource is required  
- whether repo process expects direct MCP item creation or serialization  
  
If required information is missing, ask concise follow-up questions first.  
  
---  
  
## Required workflow  
  
1. Classify the request as a simple datasource component.  
2. Inspect screenshots/design references before implementation.  
3. Normalize into the repo’s component spec if one exists.  
4. State assumptions clearly.  
5. Before implementation, return:  
   - chosen workflow  
   - classification  
   - assumptions  
   - completed or partial spec  
   - plan  
6. Then implement.  
  
If the user wants approval first, stop after the plan.  
  
---  
  
## Sitecore implementation rules  
  
### Marketer MCP first  
  
Use marketer MCP first for Sitecore item operations, including:  
- datasource templates  
- template sections  
- template fields  
- template `__Standard Values`  
- folder templates  
- folder template `__Standard Values`  
- datasource folders  
- renderings  
  
Do not claim marketer MCP cannot create templates or renderings by default.  
  
Only fall back to manual/serialization/patch-ready output when:  
- a specific MCP action fails  
- permissions block the change  
- repo governance requires serialized definitions  
  
---  
  
### Creation order  
  
Preferred order:  
  
1. resolve or create the folder/container structure  
2. create datasource template  
3. create template section  
4. create template fields  
5. explicitly set each field item `Type`  
6. create template `__Standard Values`  
7. create folder template  
8. create folder template `__Standard Values`  
9. set folder insert options / `__Masters`  
10. create datasource folder under `/sitecore/content/<siteCollection>/<siteName>/Data`  
11. create rendering item  
12. update rendering fields  
13. verify final state  
  
---  
  
### Parent resolution  
  
Before creating child items:  
- resolve parents with `get_content_item_by_path`  
- use resolved item IDs  
- do not guess IDs  
  
---  
  
### Template field rule  
  
When creating template fields:  
- create the field item under the correct section  
- explicitly set the field item `Type`  
- verify the final `Type`  
  
Common field types:  
- `Single-Line Text`  
- `Rich Text`  
- `Image`  
- `General Link`  
  
If needed, also set:  
- `Source`  
- `Shared`  
- `Unversioned`  
  
Do not assume the field type is correct by default.  
  
---  
  
### `__Standard Values` rule  
  
To create `__Standard Values` for a template via MCP:  
  
- `name = "__Standard Values"`  
- `parentId = owning template item ID`  
- `templateId = owning template item ID`  
  
This applies to:  
- datasource templates  
- folder templates  
  
Example:  
- if the Promo Banner template item ID is `ce483486-28de-4d03-ab7a-0234f31b9914`  
- then create `__Standard Values` with:  
  - `name = "__Standard Values"`  
  - `parentId = "ce483486-28de-4d03-ab7a-0234f31b9914"`  
  - `templateId = "ce483486-28de-4d03-ab7a-0234f31b9914"`  
  
Do **not** use the Standard template ID `1930bbeb-7805-471a-a3be-4858ac7cf696` for a template’s `__Standard Values`.  
  
---  
  
### Folder template rule  
  
When creating a datasource folder template:  
- create the folder template item  
- create its `__Standard Values` using the folder template’s own item ID as both:  
  - `parentId`  
  - `templateId`  
- set insert options / `__Masters` so authors can create the correct datasource items inside the folder  
  
Use exact field names returned by MCP inspection when updating insert options.  
  
---  
  
### Rendering rule  
  
Prefer **JSON Rendering** unless repo convention differs.  
  
For simple datasource components:  
- datasource should normally be required unless repo convention says otherwise  
- `ComponentQuery` should remain empty  
  
Verify rendering values such as:  
- datasource template  
- datasource location  
- component name  
- field editor button setting if used by repo convention  
  
Use exact field names returned by MCP inspection when updating the item.  
  
---  
  
### Verification rule  
  
Prefer MCP-based verification first.  
  
Verify, when relevant:  
- template path  
- section existence  
- field existence  
- field `Type`  
- template `__Standard Values`  
- template `__Standard Values` is based on the owning template  
- folder template `__Standard Values`  
- folder template `__Standard Values` is based on the owning folder template  
- folder insert options / `__Masters`  
- datasource folder path  
- rendering datasource template  
- rendering datasource location  
- rendering component name  
  
If something cannot be reliably set or verified through MCP:  
- state that explicitly  
- mark it as follow-up verification required  
- do not report it as fully complete unless verified  
  
Use Content Editor verification only as a fallback.  
  
---  
  
## React implementation rules  
  
- Create the component under `src/components/uiim/<category>/<component>.tsx` unless repo structure differs.  
- Use Tailwind CSS.  
- Use shadcn/ui primitives where appropriate.  
- Preserve Sitecore editability with the repository’s active Sitecore SDK.  
  
### SDK rule  
  
Do not hardcode a single package.  
  
Before choosing imports:  
1. inspect `package.json`  
2. inspect nearby existing components  
3. follow the repo’s established SDK convention  
  
Common SDKs:  
- `@sitecore-content-sdk/nextjs`  
- `@sitecore-jss/sitecore-jss-nextjs`  
  
Do not mix SDK conventions unnecessarily.  
  
### Data model rule  
  
This workflow is for top-level datasource fields only.  
  
Good examples:  
- `fields.Title`  
- `fields.Description`  
- `fields.Image`  
- `fields.Link`  
  
Not appropriate for this workflow:  
- repeated authorable child items  
- nested item collections  
  
### Mapping rule  
  
Update the component map file when required by the repo, for example:  
- `.sitecore/component-map.ts`  
  
Follow existing naming conventions for the component key and rendering name.  
  
---  
  
## Output format  
  
Before implementation:  
1. chosen workflow  
2. classification  
3. assumptions  
4. completed or partial spec  
5. plan  
  
After implementation:  
1. Sitecore actions performed  
2. MCP/item operations performed  
3. files changed  
4. verification results  
5. follow-up verification or serialization requirements  
  
---  
  
## Completion rule  
  
A task is only fully complete when:  
- the React component is implemented  
- the component map is updated when required  
- the needed Sitecore items were created/updated or clearly reported as blocked  
- the important Sitecore values were verified or explicitly flagged for follow-up  
  
Do not silently downgrade unverified Sitecore work to “manual setup required” without explaining why.  