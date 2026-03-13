# Skill: Create a list-based Sitecore XM Cloud component  
  
## Use when  
- The component has a parent datasource item with child items  
- Example: ArticleCards, FAQ, MultiPromo, Tabs  
  
## Inputs  
- siteCollection  
- siteName  
- category  
- parent template name  
- child template name  
- parent field list  
- child field list  
- optional variants  
  
## Workflow  
1. Create or confirm category folder under `Components/<Category>/`  
2. Create the parent template  
3. Create the child template  
4. Add sections and fields to both templates  
5. Create `__Standard Values` for the parent template  
6. Set parent `__Standard Values.__Masters` to child template ID(s)  
7. Set parent default values  
8. Create `__Standard Values` for the child template  
9. Set child default values  
10. Add `_HorizonDatasourceGrouping` as a base template to the parent template  
11. Create the folder template under `/Folders/`  
12. Create folder template `__Standard Values`  
13. Set folder template `__Masters` to parent template ID  
14. Create the folder instance under `/sitecore/content/<site-collection>/<site-name>/Data/`  
15. Create the JSON Rendering  
16. Set:  
   - `componentName`  
   - `Datasource Template`  
   - `Datasource Location`  
   - `AddFieldEditorButton = 1`  
   - valid `ComponentQuery`  
17. Build the TSX component using GraphQL shape:  
   - `fields.data.datasource`  
   - `fields.data.datasource.children.results`  
18. Register in `.sitecore/component-map.ts`  
  
## Done checklist  
- [ ] Parent template created  
- [ ] Child template created  
- [ ] Both templates have `__Standard Values`  
- [ ] Parent `__Masters` points to child template  
- [ ] Parent inherits `_HorizonDatasourceGrouping`  
- [ ] Folder template created  
- [ ] Content folder created under `/Data`  
- [ ] Rendering has valid `ComponentQuery`  
- [ ] TSX uses GraphQL/jsonValue shape  
- [ ] Component registered  