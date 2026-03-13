# Skill: Create a context-only Sitecore XM Cloud component  
  
## Use when  
- The component reads the current page's own fields  
- The component should not show a datasource picker  
- Example: Breadcrumbs, Article Header, Article Body  
  
## Inputs  
- siteCollection  
- siteName  
- category  
- componentName  
- expected page template fields  
  
## Workflow  
1. Confirm the page template contains the needed route fields  
2. Create the JSON Rendering  
3. Set `componentName`  
4. Leave these fields empty:  
   - `Datasource Template`  
   - `Datasource Location`  
   - `ComponentQuery`  
   - `Data source`  
5. Set `AddFieldEditorButton = 1`  
6. Build the TSX component to read from:  
   - `page.layout.sitecore.route.fields`  
   - `page.layout.sitecore.context.itemPath` if needed  
7. Register in `.sitecore/component-map.ts`  
  
## Done checklist  
- [ ] Rendering created  
- [ ] Datasource fields left empty  
- [ ] TSX reads from `page.layout.sitecore.route.fields`  
- [ ] Component registered  