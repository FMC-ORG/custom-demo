# sitecore-create-simple-component  
  
Use this skill for a Sitecore XM Cloud component that uses a single datasource item and does not require child datasource items or `ComponentQuery`.  
  
## Load these documents  
- `docs/ai/skills/sitecore-create-simple-component.md`  
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`  
- `docs/ai/skills/shared/react-uiim-guidelines.md`  
- `docs/ai/templates/sitecore-component-spec.template.yaml`  
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`  
  
## Required behavior  
1. Read the user request.  
2. If screenshots are attached or image paths are provided, inspect them first.  
3. Determine whether the request is truly a simple datasource component:  
   - one datasource item  
   - no authorable child datasource items  
   - no `ComponentQuery`  
4. If the request is not actually simple, switch to the correct workflow:  
   - list / parent-child datasource component  
   - context-only component  
5. Normalize the request into the shared component spec.  
6. Use these defaults unless the repo or user request says otherwise:  
   - `component.kind = simple`  
   - `component.filePath = src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`  
   - `rendering.datasourceRequired = true`  
   - `rendering.useComponentQuery = false`  
   - `rendering.componentQuery = ""`  
   - `react.propsShape = default-jss`  
7. Ask concise follow-up questions if any required values are missing, especially:  
   - component name  
   - field list  
   - site collection and site name  
   - category for React file placement  
8. Before implementation, show:  
   - chosen classification  
   - inferred field model  
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
- A simple datasource component normally requires creating or updating:  
  - datasource template  
  - `__Standard Values`  
  - folder template  
  - folder template `__Standard Values`  
  - datasource folder  
  - rendering  
- Do **not** use `ComponentQuery` for true simple components.  
  
## Template rules  
- Every custom template must have `__Standard Values`.  
- `Datasource Template` must use a full Sitecore path.  
- Avoid collision-prone field names when modeling templates.  
- Prefer descriptive field names such as:  
  - `Title`  
  - `Description`  
  - `EyebrowText`  
  - `HeroImage`  
  - `PrimaryLink`  
  - `BackgroundImage`  
  
## Rendering rules  
- The rendering should be a **JSON Rendering** unless the repo explicitly requires otherwise.  
- `Datasource Template` must be a full Sitecore path.  
- `Datasource Location` must point to the datasource folder template pattern.  
- `ComponentQuery` must be empty.  
- `Data source` remains empty unless explicitly requested.  
  
## React implementation rules  
- Create the React file under:  
  - `src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`  
- Use:  
  - Tailwind CSS  
  - shadcn/ui primitives from `@/components/ui/*`  
  - Sitecore JSS helpers from `@sitecore-jss/sitecore-jss-nextjs`  
- Use the default JSS field shape:  
  - `fields.Title`  
  - `fields.Description`  
  - `fields.CtaLink`  
  - `fields.HeroImage`  
- Keep authorable fields editable using:  
  - `Text`  
  - `RichText`  
  - `Image`  
  - `Link`  
  
## Trigger hints  
Use this skill when the component:  
- uses a single datasource item  
- is a hero, promo, CTA, content block, image/text block, quote block, or similar  
- should be reusable by selecting a datasource item  
- does not have repeated child datasource content  
  
## Verification checklist  
- [ ] Request correctly classified as simple component  
- [ ] Shared spec filled before implementation  
- [ ] Datasource template created  
- [ ] `__Standard Values` created  
- [ ] Folder template created  
- [ ] Folder template `__Masters` points to datasource template  
- [ ] Datasource folder created under `/Data`  
- [ ] Rendering created as JSON Rendering  
- [ ] `Datasource Template` uses full Sitecore path  
- [ ] `Datasource Location` is valid  
- [ ] `ComponentQuery` is empty  
- [ ] React file created under `src/components/uiim`  
- [ ] TSX uses top-level `fields.<FieldName>`  
- [ ] Tailwind used  
- [ ] shadcn/ui primitives used where appropriate  
- [ ] Component map updated  