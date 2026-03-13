# Sitecore Create Simple Component  
  
## Use when  
- The component uses one datasource item  
- No child datasource items are needed  
- No ComponentQuery is needed  
- React should use default JSS field shape  
  
## Inputs  
- siteCollection  
- siteName  
- category  
- component name  
- field list  
- optional screenshot/design refs  
  
## Required process  
1. Read the request.  
2. If screenshots are provided, inspect them first.  
3. Normalize the request into `docs/ai/templates/sitecore-component-spec.template.yaml`.  
4. Ask for missing required values.  
5. Show:  
   - inferred field model  
   - assumptions  
   - completed spec  
   - plan  
6. Then execute.  
  
## Rules  
- Every custom template must have `__Standard Values`  
- Create a folder template under `/sitecore/templates/Project/<siteCollection>/Folders/`  
- Create a content folder under `/sitecore/content/<siteCollection>/<siteName>/Data/`  
- Rendering must be JSON Rendering  
- `Datasource Template` must be a full Sitecore path  
- `ComponentQuery` must be empty  
- Avoid collision-prone GraphQL field names:  
  `icon`, `id`, `name`, `path`, `url`, `template`, `parent`, `children`, `language`, `version`, `displayName`  
  
## Output  
- completed component spec  
- implementation plan  
- Sitecore items/MCP calls  
- files changed  
- verification checklist  