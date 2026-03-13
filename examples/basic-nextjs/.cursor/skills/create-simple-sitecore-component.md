# Skill: Create a simple Sitecore XM Cloud component  
  
## Use when  
- The component uses one datasource item  
- It has no Sitecore child datasource items  
- Example: Hero, Promo, Banner  
  
## Inputs  
- siteCollection  
- siteName  
- category  
- componentName  
- datasource template name  
- field list  
- optional variants  
  
## Workflow  
1. Create or confirm category folder under `/sitecore/templates/Project/<site-collection>/Components/<Category>/`  
2. Create the datasource template  
3. Create a `Data` section  
4. Create template fields  
5. Create `__Standard Values`  
6. Set default field values on `__Standard Values`  
7. Create the folder template under `/sitecore/templates/Project/<site-collection>/Folders/`  
8. Create `__Standard Values` for the folder template and set `__Masters` to the datasource template ID  
9. Create the folder instance under `/sitecore/content/<site-collection>/<site-name>/Data/`  
10. Create the JSON Rendering under `/sitecore/layout/Renderings/Project/<site-collection>/<Category>/`  
11. Set:  
   - `componentName`  
   - `Datasource Template`  
   - `Datasource Location`  
   - `AddFieldEditorButton = 1`  
12. Leave `ComponentQuery` empty  
13. Build the TSX component using default JSS shape (`fields.Title`, `fields.Description`, etc.)  
14. Register in `.sitecore/component-map.ts`  
15. Restart dev server if component map changed  
  
## Done checklist  
- [ ] Template created  
- [ ] Fields created  
- [ ] `__Standard Values` created  
- [ ] Folder template created  
- [ ] Folder template insert options set  
- [ ] Content folder under `/Data` created  
- [ ] Rendering created as JSON Rendering  
- [ ] `ComponentQuery` left empty  
- [ ] TSX uses default JSS props shape  
- [ ] Component registered  