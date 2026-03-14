  
---  
  
## `docs\ai\skills\sitecore-fix-datasource-picker.md`  
  
```md  
# Sitecore fix datasource picker  
  
## Use when  
- the datasource picker is empty  
- the datasource picker does not show the expected items/folders  
- the rendering cannot select datasource items correctly  
- the component was created but authors cannot pick or create datasource content  
- datasource location or insert options are misconfigured  
  
Examples:  
- rendering shows no datasource options  
- the `Data` folder exists but nothing appears in the picker  
- authors cannot create datasource items from the picker  
- picker opens to the wrong location  
- list component parent items cannot be inserted  
- context-only component incorrectly asks for a datasource  
  
## Do not use when  
Do **not** use this workflow if the main issue is:  
- `ComponentQuery` is invalid  
- the React component expects the wrong data shape  
- the query returns no child items  
  
In that case, use:  
- `docs/ai/skills/sitecore-fix-componentquery.md`  
  
## Load first  
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`  
- `docs/ai/templates/sitecore-component-spec.template.yaml`  
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`  
  
## Required inputs  
Collect as many of these as possible:  
  
- rendering name or rendering path  
- component name  
- component type:  
  - simple  
  - list  
  - context-only  
- current `Datasource Template`  
- current `Datasource Location`  
- datasource folder path  
- folder template name/path  
- datasource template name/path  
- parent template / child template info for list components  
- symptom description  
  
## Mandatory process  
1. Read the request and inspect the current Sitecore setup.  
2. Determine what the component **should** be:  
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
   - parent and child template insert options for list components  
4. Identify the root cause.  
5. Normalize the corrected configuration into the shared spec as far as possible.  
6. Before making changes, show:  
   - chosen classification  
   - diagnosis  
   - root cause  
   - corrected datasource settings  
   - plan  
7. Then implement.  
  
## Common root causes  
### Rendering item problems  
- `Datasource Template` is empty  
- `Datasource Template` is set to a GUID instead of a full path  
- `Datasource Template` points to the wrong template  
- `Datasource Location` is empty or incorrect  
- rendering points to the wrong folder template name in the query  
- rendering incorrectly requires a datasource for a context-only component  
  
### Folder template problems  
- folder template does not exist  
- folder template `__Standard Values` does not exist  
- folder template `__Masters` is not set  
- folder template `__Masters` points to the wrong template  
  
### Datasource content problems  
- datasource folder under `/sitecore/content/<siteCollection>/<siteName>/Data/` does not exist  
- datasource folder exists in the wrong location  
- datasource folder was created with the wrong template or name  
  
### Template problems  
- datasource template has no `__Standard Values`  
- list parent template has no `__Standard Values`  
- list child template has no `__Standard Values`  
- list parent `__Standard Values` does not set `__Masters` to child template  
- list parent is missing `_HorizonDatasourceGrouping`  
  
## Correction rules  
### If the component should be simple  
Ensure all of the following exist and are linked correctly:  
  
- datasource template  
- datasource template `__Standard Values`  
- folder template  
- folder template `__Standard Values`  
- folder template `__Masters` -> datasource template  
- datasource folder under:  
  - `/sitecore/content/<siteCollection>/<siteName>/Data/`  
- rendering with:  
  - valid `Datasource Template` full path  
  - valid `Datasource Location`  
  - empty `ComponentQuery`  
  
### If the component should be list  
Ensure all of the following exist and are linked correctly:  
  
- parent template + `__Standard Values`  
- child template + `__Standard Values`  
- parent `__Standard Values` -> `__Masters` = child template  
- parent inherits `_HorizonDatasourceGrouping`  
- folder template + `__Standard Values`  
- folder template `__Masters` -> parent template  
- datasource folder under:  
  - `/sitecore/content/<siteCollection>/<siteName>/Data/`  
- rendering with:  
  - valid parent `Datasource Template` full path  
  - valid `Datasource Location`  
  - valid `ComponentQuery`  
  
### If the component should be context-only  
Ensure:  
- rendering does **not** require datasource  
- `Datasource Template` is empty  
- `Datasource Location` is empty  
- `Data source` is empty  
- no datasource folder/template is required unless explicitly requested  
  
## Preferred datasource location pattern  
For datasource-based components, use a query like:  
  
```txt  
query:$site/*[@@name='Data']/*[@@templatename='<Folder Template Name>']|query:$sharedSites/*[@@name='Data']/*[@@templatename='<Folder Template Name>']  