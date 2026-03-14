---  
name: sitecore-fix-datasource-picker  
description: Diagnose and fix Sitecore datasource picker issues caused by incorrect datasource template, datasource location, folder template, datasource folder, or insert option configuration.  
---  
  
# Sitecore fix datasource picker  
  
## Read these files first  
- `docs/ai/skills/sitecore-fix-datasource-picker.md`  
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`  
- `docs/ai/templates/sitecore-component-spec.template.yaml`  
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`  
  
## Use this skill when  
- the datasource picker is empty  
- the datasource picker shows the wrong items or folders  
- authors cannot create datasource items from the picker  
- the picker opens to the wrong location  
- datasource location or insert options are misconfigured  
- a context-only component incorrectly asks for a datasource  
  
## Do not use this skill when  
- the main issue is an invalid or mismatched `ComponentQuery`  
- the React component expects the wrong data shape  
- child items are not loading because the query is wrong  
  
Use instead:  
- `sitecore-fix-componentquery`  
  
## Required workflow  
1. Read the user request and inspect the current Sitecore setup.  
2. Determine what the component should actually be:  
   - simple datasource  
   - list datasource  
   - context-only  
3. Inspect the current Sitecore items using the **Sitecore marketer MCP**:  
   - rendering item  
   - datasource template  
   - folder template  
   - template `__Standard Values`  
   - folder template `__Standard Values`  
   - datasource folder under `/Data`  
   - parent/child insert options for list components  
4. Identify the root cause.  
5. Normalize the corrected configuration into the shared spec as far as possible.  
6. Before implementation, show:  
   - chosen classification  
   - diagnosis  
   - root cause  
   - corrected datasource settings  
   - plan  
7. Then implement.  
8. Return:  
   - diagnosis  
   - corrected or partial spec  
   - Sitecore actions / MCP calls  
   - files changed  
   - verification checklist  
  
## Common root causes  
### Rendering issues  
- `Datasource Template` is empty  
- `Datasource Template` uses a GUID instead of a full path  
- `Datasource Template` points to the wrong template  
- `Datasource Location` is empty or incorrect  
- the rendering points to the wrong folder template name  
- the rendering incorrectly requires a datasource for a context-only component  
  
### Folder template issues  
- folder template does not exist  
- folder template `__Standard Values` does not exist  
- folder template `__Masters` is not set  
- folder template `__Masters` points to the wrong template  
  
### Datasource folder issues  
- datasource folder under `/sitecore/content/<siteCollection>/<siteName>/Data/` does not exist  
- datasource folder exists in the wrong location  
- datasource folder uses the wrong template or wrong naming  
  
### Template issues  
- datasource template has no `__Standard Values`  
- list parent template has no `__Standard Values`  
- list child template has no `__Standard Values`  
- list parent `__Standard Values` does not set `__Masters` to the child template  
- list parent is missing `_HorizonDatasourceGrouping`  
  
## Correction rules  
### If the component should be simple  
Ensure:  
- datasource template exists  
- datasource template has `__Standard Values`  
- folder template exists  
- folder template has `__Standard Values`  
- folder template `__Masters` points to datasource template  
- datasource folder exists under `/Data`  
- rendering uses:  
  - valid full-path `Datasource Template`  
  - valid `Datasource Location`  
  - empty `ComponentQuery`  
  
### If the component should be list  
Ensure:  
- parent template exists with `__Standard Values`  
- child template exists with `__Standard Values`  
- parent `__Standard Values` sets `__Masters` to child template  
- parent inherits `_HorizonDatasourceGrouping`  
- folder template exists with `__Standard Values`  
- folder template `__Masters` points to parent template  
- datasource folder exists under `/Data`  
- rendering uses:  
  - valid full-path `Datasource Template`  
  - valid `Datasource Location`  
  - valid `ComponentQuery`  
  
### If the component should be context-only  
Ensure:  
- rendering does not require datasource  
- `Datasource Template` is empty  
- `Datasource Location` is empty  
- `Data source` is empty  
- no datasource folder or datasource template is required unless explicitly requested  
  
## Sitecore rules  
- Prefer the **Sitecore marketer MCP** for updating:  
  - rendering datasource settings  
  - template `__Standard Values`  
  - folder template `__Standard Values`  
  - datasource folders  
  - parent/child insert options  
- Use the **sitecore-documentation-docs MCP** when official datasource authoring behavior needs verification.  
  
## Output order  
1. chosen skill/workflow  
2. diagnosis  
3. corrected or partial spec  
4. plan  
5. Sitecore actions / MCP actions  
6. files changed  
7. verification checklist  
  
## Verification checklist  
- [ ] Component classification confirmed  
- [ ] Root cause identified  
- [ ] Datasource template exists if required  
- [ ] Datasource template has `__Standard Values`  
- [ ] Folder template exists if required  
- [ ] Folder template has `__Standard Values`  
- [ ] Folder template `__Masters` points to the correct template  
- [ ] Datasource folder exists under `/Data`  
- [ ] Rendering is a JSON Rendering  
- [ ] Rendering `Datasource Template` uses a full Sitecore path  
- [ ] Rendering `Datasource Location` points to the expected folder template  
- [ ] Simple component has empty `ComponentQuery`  
- [ ] List component has valid parent/child insert setup  
- [ ] List parent `__Masters` points to child template  
- [ ] List parent inherits `_HorizonDatasourceGrouping`  
- [ ] Context-only rendering does not require datasource  
- [ ] Author can pick or create datasource items as intended  