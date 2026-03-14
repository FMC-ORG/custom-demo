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
  
## Do not use this skill when  
  
- the component needs repeated child items  
- authors must create nested cards/rows/FAQ items/testimonials  
- the rendering depends on `ComponentQuery`  
  
Use a list/nested component workflow instead.  
  
---  
  
## Inputs to collect  
  
Confirm or infer:  
  
- component name  
- category  
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
12. verify final state  
  
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
  
Do not assume the field type is correct by default.  
  
---  
  
### `__Standard Values` rule  
  
To create `__Standard Values`:  
- parent = owning template item  
- name = `__Standard Values`  
- template ID = owning template’s own ID  
  
This applies to both datasource templates and folder templates.  
  
Do not use a generic “Standard Values template ID” rule.  
  
---  
  
### Rendering rule  
  
Prefer **JSON Rendering** unless repo convention differs.  
  
For simple datasource components:  
- datasource should normally be required  
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
- folder template `__Standard Values`  
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