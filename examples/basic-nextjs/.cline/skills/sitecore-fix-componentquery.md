# sitecore-fix-componentquery  
  
Use this skill when a Sitecore rendering has a missing, broken, or mismatched `ComponentQuery`, or when the React component's expected data shape does not match the rendering query.  
  
## Load these documents  
- `docs/ai/skills/sitecore-fix-componentquery.md`  
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`  
- `docs/ai/skills/shared/react-uiim-guidelines.md`  
- `docs/ai/templates/sitecore-component-spec.template.yaml`  
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`  
  
## Required behavior  
1. Read the user request and gather current implementation details.  
2. Inspect the current:  
   - rendering item  
   - `ComponentQuery`  
   - datasource settings  
   - React TSX file under `src/components/uiim/...`  
   - component map registration if relevant  
3. Determine what the component should actually be:  
   - simple datasource  
   - list datasource  
   - context-only  
4. Compare the expected React data shape with the current rendering/query shape.  
5. Identify the root cause.  
6. If official Sitecore behavior is unclear, use the `sitecore-documentation-docs` MCP.  
7. Normalize the corrected setup into the shared spec as far as possible.  
8. Before implementation, show:  
   - chosen classification  
   - diagnosis  
   - root cause  
   - corrected data shape or corrected query  
   - plan  
9. Then implement.  
10. Return:  
   - diagnosis  
   - corrected or partial spec  
   - Sitecore actions / MCP calls  
   - files changed  
   - verification checklist  
  
## Common root causes to check  
- Missing `ComponentQuery` on a list component  
- `ComponentQuery` added to a simple component that should not have one  
- `ComponentQuery` added to a context-only component that should use route fields  
- Wrong parent fragment name  
- Wrong child fragment name  
- Missing variables:  
  - `$datasource: String!`  
  - `$language: String!`  
- Missing:  
  - `datasource: item(path: $datasource, language: $language)`  
- Child items not loaded via:  
  - `children { results { ... } }`  
- Child `id` missing  
- Authorable fields missing `jsonValue`  
- TSX expecting:  
  - `fields.data.datasource`  
  but query returns something else  
- TSX expecting top-level `fields.Title` even though query shape is GraphQL datasource based  
  
## Repair behavior rules  
### If the component should be simple  
- remove `ComponentQuery`  
- keep datasource template and datasource location only  
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
- ensure parent and child fields use `jsonValue`  
- ensure child items are read through:  
  - `children.results`  
- ensure TSX reads:  
  - `fields.data.datasource.children.results`  
  
## Sitecore behavior rules  
- Prefer the **Sitecore marketer MCP** for updating:  
  - rendering `ComponentQuery`  
  - rendering datasource settings if needed  
  - related template settings if the issue exposes a template mismatch  
- Use the **sitecore-documentation-docs MCP** when official GraphQL/rendering behavior needs verification.  
  
## React implementation rules  
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
  
## Trigger hints  
Use this skill when:  
- child items are not rendering  
- datasource data is undefined  
- GraphQL fields are missing  
- the rendering seems misconfigured vs the component TSX  
- you need to remove or correct a `ComponentQuery`  
  
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