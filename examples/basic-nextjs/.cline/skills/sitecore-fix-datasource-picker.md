# sitecore-fix-datasource-picker  
  
Use this skill when Sitecore authors cannot pick or create datasource items correctly because datasource template, datasource location, folder templates, or insert options are misconfigured.  
  
## Load these documents  
- `docs/ai/skills/sitecore-fix-datasource-picker.md`  
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`  
- `docs/ai/templates/sitecore-component-spec.template.yaml`  
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`  
  
## Required behavior  
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
  
## Common root causes to check  
### Rendering issues  
- `Datasource Template` is empty  
- `Datasource Template` uses a GUID instead of a full path  
- `Datasource Template` points to the wrong template  
- `Datasource Location` is empty or incorrect  
- rendering points to the wrong folder template name  
- rendering incorrectly requires a datasource for a context-only component  
  
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
- no datasource folder/template is required unless explicitly requested  
  
## Sitecore behavior rules  
- Prefer the **Sitecore marketer MCP** for updating:  
  - rendering datasource settings  
  - template `__Standard Values`  
  - folder template `__Standard Values`  
  - datasource folders  
  - parent/child insert options  
- Use the **sitecore-documentation-docs MCP** when official datasource authoring behavior needs verification.  
  
## Trigger hints  
Use this skill when:  
- the datasource picker is empty  
- authors cannot create datasource items  
- the picker opens to the wrong location  
- datasource folders exist but do not appear  
- a context-only component incorrectly asks for datasource selection  
  
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