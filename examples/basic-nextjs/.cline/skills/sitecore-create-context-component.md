# sitecore-create-context-component  
  
Use this skill for a Sitecore XM Cloud component that renders from page/route context instead of a datasource item.  
  
## Load these documents  
- `docs/ai/skills/sitecore-create-context-component.md`  
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`  
- `docs/ai/skills/shared/react-uiim-guidelines.md`  
- `docs/ai/templates/sitecore-component-spec.template.yaml`  
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`  
  
## Required behavior  
1. Read the user request.  
2. If screenshots are attached or image paths are provided, inspect them first.  
3. Determine whether the request is truly context-only:  
   - no datasource item  
   - content comes from route/page fields  
   - optional rendering params are allowed  
4. If the request is not actually context-only, switch to the correct workflow:  
   - simple datasource component  
   - list / parent-child datasource component  
5. Normalize the request into the shared component spec.  
6. Use these defaults unless the repo or user request says otherwise:  
   - `component.kind = context-only`  
   - `component.filePath = src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`  
   - `rendering.datasourceRequired = false`  
   - `rendering.useComponentQuery = false`  
   - `rendering.datasourceTemplatePath = ""`  
   - `rendering.datasourceLocationQuery = ""`  
   - `rendering.dataSource = ""`  
   - `rendering.componentQuery = ""`  
   - `react.propsShape = context-route`  
   - `templates.parent.create = false`  
   - `templates.child.create = false`  
   - `folderTemplate.create = false`  
   - `datasourceFolder.create = false`  
7. Ask concise follow-up questions if any required values are missing, especially:  
   - which route/page template owns the fields  
   - whether page template changes are in scope  
   - whether rendering params are needed  
   - whether the component should read existing route fields or new ones  
8. Before implementation, show:  
   - chosen classification  
   - inferred route/context field model  
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
- A true context-only component normally does **not** create:  
  - datasource templates  
  - child templates  
  - folder templates  
  - datasource folders  
  - `ComponentQuery`  
- The rendering should be a **JSON Rendering** unless the repo explicitly requires otherwise.  
- Leave these empty for true context-only components:  
  - `Datasource Template`  
  - `Datasource Location`  
  - `Data source`  
  - `ComponentQuery`  
  
## Route/page field rules  
- If the needed route fields already exist, use them.  
- If the route fields do not exist, propose the required page template changes first.  
- Ask for confirmation before creating or changing page templates unless the user explicitly requested that scope.  
- Any new Sitecore template changes must still include `__Standard Values`.  
  
## React implementation rules  
- Create the React file under:  
  - `src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`  
- Use:  
  - Tailwind CSS  
  - shadcn/ui primitives from `@/components/ui/*`  
  - Sitecore JSS helpers from `@sitecore-jss/sitecore-jss-nextjs`  
- Prefer route/context access via:  
  - `useSitecoreContext()`  
  - `sitecoreContext.route?.fields`  
- Keep authorable fields editable using:  
  - `Text`  
  - `RichText`  
  - `Image`  
  - `Link`  
- Do not implement datasource-based props for this skill unless the repo already uses a wrapper pattern for route fields.  
  
## Trigger hints  
Use this skill when the component:  
- should not have its own datasource item  
- should render route/page fields  
- may optionally use rendering params  
- is page-scoped content such as:  
  - page hero  
  - page intro  
  - route banner  
  - section header driven by page fields  
  
## Verification checklist  
- [ ] Request correctly classified as context-only  
- [ ] Shared spec filled before implementation  
- [ ] No datasource template created unless explicitly requested  
- [ ] No datasource folder created  
- [ ] No `ComponentQuery` used  
- [ ] Rendering created as JSON Rendering  
- [ ] Rendering does not require datasource  
- [ ] React file created under `src/components/uiim`  
- [ ] Tailwind used  
- [ ] shadcn/ui primitives used where appropriate  
- [ ] Sitecore JSS editable helpers used for authorable fields  
- [ ] Component map updated  
- [ ] If page template changed, `__Standard Values` created  