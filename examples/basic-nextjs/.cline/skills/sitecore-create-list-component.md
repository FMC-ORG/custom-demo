# sitecore-create-list-component  
  
Use this skill for a Sitecore XM Cloud component that has a parent datasource item plus authorable child items and therefore requires a `ComponentQuery`.  
  
## Load these documents  
- `docs/ai/skills/sitecore-create-list-component.md`  
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`  
- `docs/ai/skills/shared/react-uiim-guidelines.md`  
- `docs/ai/templates/sitecore-component-spec.template.yaml`  
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`  
  
## Required behavior  
1. Read the user request.  
2. If screenshots are attached or image paths are provided, inspect them first.  
3. Determine whether the request is truly a list component:  
   - repeated authorable items  
   - a parent datasource item  
   - child items managed in Sitecore  
   - rendering requires `ComponentQuery`  
4. If the request is not actually a list component, switch to the correct workflow:  
   - simple datasource component  
   - context-only component  
5. Normalize the request into the shared component spec.  
6. Use these defaults unless the repo or user request says otherwise:  
   - `component.kind = list`  
   - `component.filePath = src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`  
   - `rendering.datasourceRequired = true`  
   - `rendering.useComponentQuery = true`  
   - `react.propsShape = graphql-datasource`  
   - `templates.parent.standardValues.addHorizonDatasourceGrouping = true`  
7. Ask concise follow-up questions if any required values are missing, especially:  
   - parent template name and fields  
   - child template name and fields  
   - site collection and site name  
   - category for the React component path  
   - whether cards/items should be child datasource items or just plain fields  
8. Before implementation, show:  
   - chosen classification  
   - inferred layout  
   - inferred parent field model  
   - inferred child field model  
   - assumptions  
   - completed spec  
   - plan  
9. Then implement.  
10. Return:  
   - completed spec  
   - Sitecore actions / MCP calls  
   - files changed  
   - verification checklist  
  
## Sitecore behavior rules  
- Prefer the **Sitecore marketer MCP** for creating or updating Sitecore items.  
- Use the **sitecore-documentation-docs MCP** if official Sitecore behavior is unclear.  
- A list component normally requires creating or updating:  
  - parent template  
  - parent `__Standard Values`  
  - child template  
  - child `__Standard Values`  
  - folder template  
  - folder template `__Standard Values`  
  - datasource folder  
  - rendering  
  - `ComponentQuery`  
  
## Required parent/child rules  
- Parent template must have `__Standard Values`.  
- Child template must have `__Standard Values`.  
- Parent `__Standard Values` must set `__Masters` to the child template.  
- Parent base templates should include `_HorizonDatasourceGrouping`.  
- Folder template `__Standard Values` must set `__Masters` to the parent template.  
  
## Rendering rules  
- The rendering should be a **JSON Rendering** unless the repo explicitly requires otherwise.  
- `Datasource Template` must be a full Sitecore path.  
- `Datasource Location` must point to the datasource folder template pattern.  
- `ComponentQuery` is required.  
- `Data source` remains empty unless explicitly requested.  
  
## ComponentQuery rules  
The query must:  
- declare:  
  - `$datasource: String!`  
  - `$language: String!`  
- fetch:  
  - `datasource: item(path: $datasource, language: $language)`  
- include the correct parent fragment  
- read child items through:  
  - `children { results { ... } }`  
- include child `id`  
- use `jsonValue` for authorable fields  
  
## React implementation rules  
- Create the React file under:  
  - `src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`  
- Use:  
  - Tailwind CSS  
  - shadcn/ui primitives from `@/components/ui/*`  
  - Sitecore JSS helpers from `@sitecore-jss/sitecore-jss-nextjs`  
- Use GraphQL datasource shape:  
  - `fields.data.datasource`  
  - `fields.data.datasource.children.results`  
- Read authorable values via:  
  - `.jsonValue`  
- Keep child cards/items editable using:  
  - `Text`  
  - `RichText`  
  - `Image`  
  - `Link`  
  
## Trigger hints  
Use this skill when the component:  
- has repeated authorable items  
- needs parent + child datasource structure  
- is a card grid, FAQ, accordion, tabs, slider, testimonial list, or similar  
- should be author-managed from datasource children  
  
## Verification checklist  
- [ ] Request correctly classified as list component  
- [ ] Shared spec filled before implementation  
- [ ] Parent template created  
- [ ] Child template created  
- [ ] Parent `__Standard Values` created  
- [ ] Child `__Standard Values` created  
- [ ] Parent `__Masters` points to child template  
- [ ] Parent inherits `_HorizonDatasourceGrouping`  
- [ ] Folder template created  
- [ ] Folder template `__Masters` points to parent template  
- [ ] Datasource folder created under `/Data`  
- [ ] Rendering created as JSON Rendering  
- [ ] `Datasource Template` uses full Sitecore path  
- [ ] `ComponentQuery` exists and matches the component  
- [ ] React file created under `src/components/uiim`  
- [ ] TSX reads `fields.data.datasource.children.results`  
- [ ] TSX uses `.jsonValue`  
- [ ] Tailwind used  
- [ ] shadcn/ui primitives used where appropriate  
- [ ] Component map updated  