---  
name: sitecore-create-context-component  
description: Create a Sitecore XM Cloud context-only component that renders from route/page fields instead of a datasource item. Use for page heroes, page intros, route banners, and similar page-scoped content.  
---  
  
# Sitecore create context-only component  
  
## Read these files first  
- `docs/ai/skills/sitecore-create-context-component.md`  
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`  
- `docs/ai/skills/shared/react-uiim-guidelines.md`  
- `docs/ai/templates/sitecore-component-spec.template.yaml`  
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`  
  
## Use this skill when  
- the component should **not** have its own datasource item  
- content should come from **route/page fields**  
- optional rendering params may be used  
- the component is page-scoped rather than reusable datasource content  
  
Examples:  
- PageHero  
- PageIntro  
- RouteBanner  
- PageHeader  
  
## Do not use this skill when  
- the component needs a datasource item  
- the component needs authorable child items  
- the rendering needs `ComponentQuery`  
  
Use instead:  
- `sitecore-create-simple-component`  
- `sitecore-create-list-component`  
  
## Required workflow  
1. Read the user request.  
2. If screenshots are attached or image paths are provided, inspect them first.  
3. Determine whether the component is truly context-only:  
   - no datasource item  
   - content comes from route/page fields  
   - optional rendering params are allowed  
4. If not, switch to the correct workflow:  
   - simple datasource component  
   - list / parent-child datasource component  
5. Normalize the request into the shared component spec.  
6. Use these defaults unless repo conventions or the user request say otherwise:  
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
7. Ask concise follow-up questions when needed, especially:  
   - which route/page template owns the fields  
   - whether route fields already exist  
   - whether page template changes are in scope  
   - whether rendering params are needed  
8. Before implementation, show:  
   - chosen classification  
   - inferred route/context field model  
   - assumptions  
   - completed or partial spec  
   - plan  
9. Then implement.  
10. Return:  
   - completed spec  
   - Sitecore actions / MCP calls  
   - files changed  
   - verification checklist  
  
## Sitecore rules  
- Prefer the **Sitecore marketer MCP** for Sitecore item creation or updates.  
- Use the **sitecore-documentation-docs MCP** if official behavior is unclear.  
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
- If required route fields already exist, use them.  
- If they do not exist, propose the page template changes first.  
- Ask for confirmation before changing page templates unless the user explicitly requested that scope.  
- Any new or updated Sitecore template must include `__Standard Values`.  
  
## React rules  
- Create the React file under:  
  - `src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`  
- Use:  
  - Tailwind CSS  
  - shadcn/ui primitives from `@/components/ui/*`  
  - Sitecore JSS helpers from `@sitecore-jss/sitecore-jss-nextjs`  
- Read route data via:  
  - `useSitecoreContext()`  
  - `sitecoreContext.route?.fields`  
- Keep authorable fields editable using:  
  - `Text`  
  - `RichText`  
  - `Image`  
  - `Link`  
- Do not model datasource-based props for this skill unless the repo already has a route-field wrapper pattern.  
  
## Output order  
1. chosen skill/workflow  
2. completed or partial spec  
3. plan  
4. Sitecore actions / MCP actions  
5. files changed  
6. verification checklist  
  
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