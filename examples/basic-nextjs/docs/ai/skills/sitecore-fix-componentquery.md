  
---  
  
## `docs\ai\skills\sitecore-fix-componentquery.md`  
  
```md  
# Sitecore fix ComponentQuery  
  
## Use when  
- a list component rendering is failing because `ComponentQuery` is missing, invalid, or mismatched  
- the React component expects GraphQL datasource data but the rendering/query does not supply it  
- the query returns the wrong shape for the TSX component  
- a component was incorrectly built as list vs simple vs context-only  
- child items are not loading  
- fields are missing because `jsonValue` was omitted  
  
Examples:  
- rendering shows no datasource data  
- child cards do not render  
- TSX reads `fields.data.datasource.children.results` but data is undefined  
- GraphQL query does not match the parent/child template names  
- a simple component was incorrectly given a `ComponentQuery`  
  
## Do not use when  
Do **not** use this workflow if the real issue is primarily:  
- the datasource picker is empty or pointing to the wrong folder  
- templates/folder templates/insert options are missing  
  
In that case, use:  
- `docs/ai/skills/sitecore-fix-datasource-picker.md`  
  
## Load first  
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`  
- `docs/ai/skills/shared/react-uiim-guidelines.md`  
- `docs/ai/templates/sitecore-component-spec.template.yaml`  
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`  
  
## Required inputs  
Collect as many of these as possible:  
  
- rendering name or rendering path  
- component name  
- component TSX file path  
- current `ComponentQuery`  
- current datasource template path  
- template names for parent and child items  
- error symptoms or console errors  
- example returned data shape if available  
  
## Mandatory process  
1. Read the request and gather the current implementation.  
2. Inspect:  
   - rendering item settings  
   - current `ComponentQuery`  
   - React component under `src/components/uiim/...`  
   - component map registration if relevant  
3. Classify what the component **should** be:  
   - simple datasource  
   - list datasource  
   - context-only  
4. Compare the expected data shape with the actual query and TSX shape.  
5. Identify the root cause.  
6. If official behavior is unclear, use the `sitecore-documentation-docs` MCP.  
7. Normalize the fix into the shared spec as far as possible.  
8. Before making changes, show:  
   - chosen classification  
   - diagnosis  
   - root cause  
   - corrected query/data shape  
   - plan  
9. Then implement.  
  
## Common root causes  
### Wrong workflow chosen  
- component should have been **simple**, but a `ComponentQuery` was added  
- component should have been **context-only**, but a datasource query was added  
- component should have been **list**, but no `ComponentQuery` was created  
  
### Query structure problems  
- missing required variables:  
  - `$datasource: String!`  
  - `$language: String!`  
- query does not fetch:  
  - `datasource: item(path: $datasource, language: $language)`  
- wrong parent fragment:  
  - `... on <WrongTemplateName>`  
- wrong child fragment:  
  - `... on <WrongChildTemplateName>`  
- child items not read from:  
  - `children { results { ... } }`  
- missing child `id`  
- authorable fields missing `jsonValue`  
  
### React/query mismatch  
- TSX expects:  
  - `fields.data.datasource`  
  but the query or rendering does not provide that shape  
- TSX expects:  
  - `fields.Title`  
  but the component was switched to a GraphQL datasource model  
- TSX reads child items from the wrong path  
- TSX uses plain values instead of Sitecore JSS helpers on `jsonValue`  
  
### Schema/name problems  
- query field names do not match the actual schema  
- field names collide with problematic GraphQL identifiers  
- template fragment names do not match actual Sitecore template names  
  
## Repair rules  
### If the component should be simple  
- remove `ComponentQuery`  
- ensure rendering uses datasource template + location only  
- update TSX to use default JSS shape:  
  - `fields.Title`  
  - `fields.Description`  
  - `fields.CtaLink`  
  
### If the component should be context-only  
- remove `ComponentQuery`  
- disable datasource requirement if appropriate  
- update TSX to use:  
  - `useSitecoreContext()`  
  - `sitecoreContext.route?.fields`  
  
### If the component should be list  
- ensure the rendering is a JSON Rendering  
- ensure `ComponentQuery` exists  
- ensure it uses:  
  - `$datasource: String!`  
  - `$language: String!`  
- ensure it fetches:  
  - `datasource: item(path: $datasource, language: $language)`  
- ensure parent fields use `jsonValue`  
- ensure child items come from:  
  - `children.results`  
- ensure child fields use `jsonValue`  
- ensure TSX reads:  
  - `fields.data.datasource.children.results`  
  
## Preferred list query pattern  
```graphql  
query ComponentName($datasource: String!, $language: String!) {  
  datasource: item(path: $datasource, language: $language) {  
    ... on ParentTemplateName {  
      title {  
        jsonValue  
      }  
    }  
    children {  
      results {  
        ... on ChildTemplateName {  
          id  
          title {  
            jsonValue  
          }  
          image {  
            jsonValue  
          }  
          link {  
            jsonValue  
          }  
        }  
      }  
    }  
  }  
}  