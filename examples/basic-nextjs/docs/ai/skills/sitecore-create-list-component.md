# Sitecore create list component  
  
## Use when  
- the component has a **parent datasource item**  
- the parent contains **authorable Sitecore child items**  
- the rendering requires **`ComponentQuery`**  
- React should use the **GraphQL datasource shape**  
  
Examples:  
- ArticleCards  
- PromoCards  
- FAQ  
- Accordion  
- Tabs  
- TeamMembers  
- TestimonialList  
  
## Do not use when  
Do **not** use this workflow if:  
- the component only needs one datasource item  
- the component has no authorable child items  
- the rendering should not use `ComponentQuery`  
- the component should render from route/page context only  
  
In those cases, use:  
- `docs/ai/skills/sitecore-create-simple-component.md`  
- `docs/ai/skills/sitecore-create-context-component.md`  
  
## Load first  
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`  
- `docs/ai/skills/shared/react-uiim-guidelines.md`  
- `docs/ai/templates/sitecore-component-spec.template.yaml`  
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`  
  
## Examples  
- `docs/ai/examples/sitecore-create-list-component/article-cards.request.md`  
- `docs/ai/examples/sitecore-create-list-component/article-cards.spec.yaml`  
- `docs/ai/examples/sitecore-create-list-component/article-cards-from-screenshot.request.md`  
  
## Required inputs  
- `siteCollection`  
- `siteName`  
- `category`  
- parent template name  
- parent field list  
- child template name  
- child field list  
- optional screenshot paths or attached screenshots  
  
## Visual reference handling  
If the user attaches screenshots or provides image paths:  
  
1. Inspect the screenshot first.  
2. Summarize the visible structure:  
   - section heading  
   - repeated cards/items  
   - media  
   - badge/metadata  
   - CTA/link  
   - tabs/accordion triggers if present  
3. Infer whether the repeated content should be authorable child items.  
4. Populate:  
   - `design.references`  
   - `design.extractedLayout`  
   - `design.assumptions`  
   - `design.openQuestions`  
5. Do not invent hidden interactions unless explicitly requested.  
  
## Mandatory process  
1. Read the request.  
2. If screenshots are provided, inspect them first.  
3. Confirm the request is a **list / parent-child datasource** component.  
4. Normalize the task into `docs/ai/templates/sitecore-component-spec.template.yaml`.  
5. Infer safe defaults.  
6. Ask concise follow-up questions if required values are missing.  
7. Before implementation, show:  
   - chosen classification  
   - inferred layout  
   - inferred parent field model  
   - inferred child field model  
   - assumptions  
   - completed or partially completed spec  
   - plan  
8. Then implement.  
  
## Safe defaults  
If not explicitly specified:  
  
- `component.kind = list`  
- `component.namePascal = <parent template name>`  
- `component.nameKebab = kebab-case(component.namePascal)`  
- `component.filePath = src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`  
- `component.componentMapKey = component.nameKebab`  
- `component.componentMapImportAlias = lowercase-or-safe alias of component name`  
- `rendering.componentName = component.nameKebab`  
- `rendering.datasourceRequired = true`  
- `rendering.useComponentQuery = true`  
- `react.propsShape = graphql-datasource`  
- `templates.parent.standardValues.addHorizonDatasourceGrouping = true`  
- `folderTemplate.name = <Component Name> Folder`  
- `datasourceFolder.name = <Component Name>`  
  
## Sitecore implementation rules  
Use the **Sitecore marketer MCP** whenever Sitecore items must be created or updated.  
  
Create/update:  
  
1. parent template  
2. parent `Data` section  
3. parent field items  
4. parent `__Standard Values`  
5. child template  
6. child `Data` section  
7. child field items  
8. child `__Standard Values`  
9. folder template  
10. folder template `__Standard Values`  
11. datasource folder under:  
    - `/sitecore/content/<siteCollection>/<siteName>/Data/`  
12. rendering item  
13. rendering `ComponentQuery`  
  
## Required parent/child rules  
### Parent template  
- must have `__Standard Values`  
- must inherit `_HorizonDatasourceGrouping`  
- parent `__Standard Values` must set `__Masters` to the **child template**  
  
### Child template  
- must have `__Standard Values`  
  
### Folder template  
- must live under:  
  - `/sitecore/templates/Project/<siteCollection>/Folders/`  
- must have `__Standard Values`  
- folder template `__Standard Values` must set `__Masters` to the **parent template**  
  
## Rendering rules  
- rendering must be a **JSON Rendering**  
- `Datasource Template` must be a **full Sitecore path**, never a GUID  
- `Datasource Location` must point to the created folder template pattern  
- `ComponentQuery` is **mandatory**  
- `AddFieldEditorButton = 1`  
- `Data source` remains empty unless explicitly requested  
  
### Preferred datasource location pattern  
Use a query pattern like:  
  
```txt  
query:$site/*[@@name='Data']/*[@@templatename='<Folder Template Name>']|query:$sharedSites/*[@@name='Data']/*[@@templatename='<Folder Template Name>']  