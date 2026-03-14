---  
name: sitecore-fix-componentquery  
description: Diagnose and fix a missing, broken, or mismatched Sitecore ComponentQuery, including cases where the rendering data shape does not match the React component.  
---  
  
# Sitecore fix ComponentQuery  
  
## Read these files first  
- `docs/ai/skills/sitecore-fix-componentquery.md`  
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`  
- `docs/ai/skills/shared/react-uiim-guidelines.md`  
- `docs/ai/templates/sitecore-component-spec.template.yaml`  
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`  
  
## Use this skill when  
- a list component rendering is failing because `ComponentQuery` is missing, invalid, or mismatched  
- the React component expects GraphQL datasource data but the rendering does not supply it  
- the query returns the wrong shape for the TSX component  
- child items are not loading  
- fields are missing because `jsonValue` was omitted  
- a component was built with the wrong workflow  
  
## Do not use this skill when  
- the main problem is the datasource picker being empty or misconfigured  
- the main issue is folder templates, datasource location, or insert options  
  
Use instead:  
- `sitecore-fix-datasource-picker`  
  
## Required workflow  
1. Read the user request and gather the current implementation.  
2. Inspect:  
   - rendering item  
   - `ComponentQuery`  
   - datasource settings  
   - React TSX file under `src/components/uiim/...`  
   - component map registration if relevant  
3. Determine what the component should actually be:  
   - simple datasource  
   - list datasource  
   - context-only  
4. Compare the expected React data shape with the current query/rendering shape.  
5. Identify the root cause.  
6. If official Sitecore behavior is unclear, use the `sitecore-documentation-docs` MCP.  
7. Normalize the corrected setup into the shared spec as far as possible.  
8. Before implementation, show:  
   - chosen classification  
   - diagnosis  
   - root cause  
   - corrected query or corrected data shape  
   - plan  
9. Then implement.  
10. Return:  
   - diagnosis  
   - corrected or partial spec  
   - Sitecore actions / MCP calls  
   - files changed  
   - verification checklist  
  
## Common root causes  
- missing `ComponentQuery` on a list component  
- `ComponentQuery` incorrectly added to a simple component  
- `ComponentQuery` incorrectly added to a context-only component  
- wrong parent fragment name  
- wrong child fragment name  
- missing variables:  
  - `$datasource: String!`  
  - `$language: String!`  
- missing:  
  - `datasource: item(path: $datasource, language: $language)`  
- child items not loaded via:  
  - `children { results { ... } }`  
- child `id` missing  
- authorable fields missing `jsonValue`  
- TSX expecting:  
  - `fields.data.datasource`  
  but the query returns something else  
- TSX expecting top-level `fields.Title` even though the rendering is GraphQL datasource based  
  
## Repair rules  
### If the component should be simple  
- remove `ComponentQuery`  
- keep datasource template + datasource location only  
- update TSX to use top-level `fields.<FieldName>`  
  
### If the component should be context-only  
- remove `ComponentQuery`  
- remove datasource requirement if appropriate  
- update TSX to use:  
  - `useSitecoreContext()`  
  - `sitecoreContext.route?.fields`  
  
### If the component should be list  
- ensure the rendering is a JSON Rendering  
- ensure `ComponentQuery` exists  
- ensure it uses:  
  - `$datasource: String!`  
  - `$language: String!`  
- ensure it fetches:  
  - `datasource: item(path: $datasource, language: $language)`  
- ensure parent and child authorable fields use `jsonValue`  
- ensure child items are read via:  
  - `children.results`  
- ensure TSX reads:  
  - `fields.data.datasource.children.results`  
  
## Sitecore rules  
- Prefer the **Sitecore marketer MCP** for updating:  
  - rendering `ComponentQuery`  
  - rendering datasource settings if needed  
  - related template settings if a mismatch is exposed  
- Use the **sitecore-documentation-docs MCP** when official GraphQL or rendering behavior needs verification.  
  
## React rules  
- If TSX must change, keep it under:  
  - `src/components/uiim/...`  
- Use:  
  - Tailwind CSS  
  - shadcn/ui primitives from `@/components/ui/*`  
  - Sitecore JSS helpers from `@sitecore-jss/sitecore-jss-nextjs`  
  
### Expected shapes  
#### List component  
- parent: `fields.data.datasource`  
- child items: `fields.data.datasource.children.results`  
- authorable fields: `.jsonValue`  
  
#### Simple component  
- top-level field access only:  
  - `fields.<FieldName>`  
  
#### Context-only component  
- route access only:  
  - `useSitecoreContext()`  
  - `sitecoreContext.route?.fields`  
  
## Output order  
1. chosen skill/workflow  
2. diagnosis  
3. corrected or partial spec  
4. plan  
5. Sitecore actions / MCP actions  
6. files changed  
7. verification checklist  
  
## Verification checklist  
- [ ] Component classification confirmed  
- [ ] Root cause identified  
- [ ] Wrong `ComponentQuery` removed or corrected  
- [ ] Rendering remains JSON Rendering  
- [ ] Datasource settings remain valid  
- [ ] Corrected query uses required variables for list component  
- [ ] Corrected query fetches `datasource: item(path: $datasource, language: $language)`  
- [ ] Parent fragment name is correct  
- [ ] Child fragment name is correct  
- [ ] Child items are read via `children.results`  
- [ ] Authorable fields use `jsonValue`  
- [ ] React file updated under `src/components/uiim` if needed  
- [ ] TSX data shape matches the query  
- [ ] Tailwind/shadcn pattern preserved  