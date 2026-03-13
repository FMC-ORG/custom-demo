# Skill: Fix a bad Component GraphQL Query  
  
## Symptoms  
- Children do not render  
- Component gets incomplete data  
- Runtime error like `Cannot read properties of undefined (reading 'route')`  
  
## Checklist  
1. Confirm this component should actually use `ComponentQuery`  
2. Validate GraphQL syntax  
3. Confirm query name matches the parent template  
4. Confirm root alias is `datasource`  
5. Confirm variables are `$datasource` and `$language`  
6. Confirm parent fragment uses correct PascalCase template name  
7. Confirm child fragment uses correct PascalCase template name  
8. Confirm fields use camelCase  
9. Confirm editable fields use `{ jsonValue }`  
10. Confirm child results include `id`  
11. Confirm no collision-prone field names like `icon`, `name`, `path`  
12. Confirm React reads from `fields.data.datasource.children.results`  
  
## Common fixes  
- Add missing `children { results { ... } }`  
- Rename collision-prone fields  
- Remove `ComponentQuery` from simple components  
- Change TSX props shape to match the rendering setup  