# Sitecore Create List Component  
  
## Use when  
- The component has a parent datasource item  
- The parent contains authorable child items  
- Rendering requires `ComponentQuery`  
- React must use GraphQL datasource shape  
  
## Inputs  
- siteCollection  
- siteName  
- category  
- parent template name + fields  
- child template name + fields  
- optional screenshot/design refs  
  
## Required process  
1. Read the request.  
2. If screenshots are provided, inspect them first.  
3. Infer whether the UI is repeated content.  
4. Normalize the request into `docs/ai/templates/sitecore-component-spec.template.yaml`.  
5. Ask for missing required values.  
6. Show:  
   - inferred layout  
   - inferred parent/child field model  
   - assumptions  
   - completed spec  
   - plan  
7. Then execute.  
  
## Rules  
- Every custom template must have `__Standard Values`  
- Parent standard values must set `__Masters` to child template  
- Folder template standard values must set `__Masters` to parent template  
- Parent must inherit `_HorizonDatasourceGrouping`  
- Rendering must be JSON Rendering  
- `Datasource Template` must be a full Sitecore path  
- `ComponentQuery` is mandatory  
- Child items must be read from `fields.data.datasource.children.results`  
- Field values in GraphQL must use `jsonValue`  
- Avoid collision-prone GraphQL field names:  
  `icon`, `id`, `name`, `path`, `url`, `template`, `parent`, `children`, `language`, `version`, `displayName`  
  
## Output  
- completed component spec  
- implementation plan  
- Sitecore items/MCP calls  
- files changed  
- verification checklist  