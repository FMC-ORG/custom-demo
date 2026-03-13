# Skill: Fix an empty Sitecore datasource picker  
  
## Checks  
1. Confirm the folder template exists under `/sitecore/templates/Project/<site-collection>/Folders/`  
2. Confirm the folder template has `__Standard Values`  
3. Confirm `__Standard Values.__Masters` includes the datasource template ID  
4. Confirm the folder instance exists under `/sitecore/content/<site-collection>/<site-name>/Data/`  
5. Confirm datasource items actually exist inside the folder instance  
6. Confirm the rendering `Datasource Template` is a full template path  
7. Confirm the rendering `Datasource Location` query matches the folder template name exactly  
8. If using shared content, confirm `$sharedSites` path is valid  
  
## Common fixes  
- Create the missing content folder under `/Data`  
- Add missing folder template insert options  
- Correct `Datasource Location`  
- Create datasource items inside the folder instance  