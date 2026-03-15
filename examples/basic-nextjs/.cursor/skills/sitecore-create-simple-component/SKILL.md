---  
name: sitecore-create-simple-component  
description: Use this skill when creating a Sitecore XM Cloud component backed by a single datasource item, with no authorable child datasource items and no ComponentQuery.  
---  
  
# Sitecore create simple component  
  
Use this skill for a Sitecore XM Cloud component that:  
- uses one datasource item  
- does not require authorable child datasource items  
- does not require `ComponentQuery`  
- renders top-level Sitecore fields such as `fields.Title`, `fields.Description`, `fields.Image`, or `fields.Link`  
  
Do **not** use this skill when the component needs:  
- repeated child items  
- authorable cards/list rows/FAQ entries/testimonials  
- nested datasource item structures  
- `ComponentQuery`  
  
For those cases, use a list/nested component workflow instead.  
  
---  
  
## Required inputs  
  
Collect or confirm:  
  
- component name  
- category / grouping  
- site collection  
- site name  
- rendering name  
- datasource template name  
- folder template name  
- React component file path  
- field list and field types  
- rendering type preference if repo differs from JSON Rendering  
- any screenshot/design reference  
- whether datasource is required  
- whether the repo expects direct MCP item creation or serialization  
  
If critical information is missing, ask concise follow-up questions before implementation.  
  
---  
  
## Required workflow  
  
1. Classify the request as a simple datasource component.  
2. Inspect any provided screenshot/design before implementation.  
3. Normalize the request into the repo’s component spec format if one exists.  
4. State assumptions explicitly.  
5. Before implementation, return:  
   - chosen workflow  
   - classification  
   - assumptions  
   - completed or partial spec  
   - plan  
6. Then implement.  
  
If the user asks for an approval gate, stop after the plan and wait.  
  
---  
  
## Sitecore rules  
  
### Use marketer MCP first  
  
Use marketer MCP first for Sitecore item work, including:  
- datasource templates  
- template sections  
- template fields  
- template `__Standard Values`  
- folder templates  
- folder template `__Standard Values`  
- datasource folders  
- renderings  
  
Do not claim marketer MCP cannot create templates or renderings by default.  
  
Only switch to manual / serialization / patch-ready output when:  
- a specific MCP action fails  
- permissions block the action  
- repo governance explicitly requires serialized definitions  
  
---  
  
### Create items in the right order  
  
Preferred order:  
1. resolve or create folder/container structure  
2. create datasource template  
3. create template section  
4. create template fields  
5. explicitly set template field metadata, especially `Type`  
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
  
For each datasource field:  
- create the field item under the correct template section  
- explicitly set the field item `Type`  
- verify the resulting field type after update  
  
Common field types:  
- `Single-Line Text`  
- `Rich Text`  
- `Image`  
- `General Link`  
  
If needed, also set:  
- `Source`  
- `Shared`  
- `Unversioned`  
  
Do not assume the type is correct by default.  
  
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
  
Do **not** use the Standard template ID `1930bbeb-7805-471a-a3be-4858ac7cf696` for a template’s `__Standard Values` item.  
  
---  
  
### Folder template rule  
  
When creating a datasource folder template:  
- create the folder template item  
- create its `__Standard Values` using the folder template’s own item ID as both:  
  - `parentId`  
  - `templateId`  
- set insert options / `__Masters` so authors can create the correct datasource items inside that folder  
  
Use exact field names returned by MCP inspection when updating insert options.  
  
---  
  
### Rendering rule  
  
Prefer **JSON Rendering** unless the repository clearly uses a different rendering convention.  
  
For the rendering item:  
- datasource should be required for simple datasource components unless repo convention says otherwise  
- `ComponentQuery` should be empty  
- verify datasource template  
- verify datasource location  
- verify component name  
- verify field editor button settings when used by repo convention  
  
Use exact field names returned by MCP item inspection when updating rendering fields.  
  
---  
  
### Verification rule  
  
Prefer MCP-based verification first.  
  
After create/update:  
- verify the template path  
- verify template fields  
- verify each field `Type`  
- verify template `__Standard Values`  
- verify template `__Standard Values` is based on the owning template  
- verify folder template `__Standard Values`  
- verify folder template `__Standard Values` is based on the owning folder template  
- verify folder insert options / `__Masters`  
- verify datasource folder path  
- verify rendering datasource template  
- verify rendering datasource location  
- verify rendering component name  
  
If any value cannot be reliably set or verified through MCP:  
- state that explicitly  
- mark it as requiring follow-up verification  
- do not report it as fully completed unless verified  
  
Content Editor verification is a fallback, not the default assumption.  
  
---  
  
## React rules  
  
- Create the component under `src/components/uiim/<category>/<component>.tsx` unless the repo uses a different structure.  
- Use Tailwind CSS.  
- Use shadcn/ui primitives when appropriate.  
- Preserve Sitecore editability with the repo’s active Sitecore SDK field helpers.  
- Use the repository’s Sitecore SDK conventions instead of hardcoding a package.  
  
### SDK rule  
  
Before choosing imports:  
1. inspect `package.json`  
2. inspect nearby existing components  
3. use the repo’s established SDK  
  
Common SDKs:  
- `@sitecore-content-sdk/nextjs`  
- `@sitecore-jss/sitecore-jss-nextjs`  
  
Do not mix SDK conventions unnecessarily.  
  
### Data model rule  
  
For this skill, prefer top-level datasource fields only, for example:  
- `fields.Title`  
- `fields.Description`  
- `fields.PrimaryLink`  
- `fields.BackgroundImage`  
  
Do not model repeated child items in this workflow.  
  
### Mapping rule  
  
Update the repository’s component map file when required, for example:  
- `.sitecore/component-map.ts`  
  
Follow repo naming conventions for the exported component key and component name.  
  
---  
  
## Output format  
  
Before implementation, return:  
  
1. chosen workflow  
2. classification  
3. assumptions  
4. completed or partial spec  
5. plan  
  
After implementation, return:  
  
1. Sitecore actions performed  
2. MCP calls or item operations performed  
3. files changed  
4. verification results  
5. any follow-up verification or serialization requirements  
  
---  
  
## Completion rule  
  
A task is only fully complete when:  
- the React component is implemented  
- the component map is updated when required  
- the needed Sitecore items were created/updated or clearly reported as blocked  
- the important Sitecore values were verified or explicitly flagged for follow-up  
  
Do not silently downgrade unverified Sitecore work to “manual setup required” without explaining why.  