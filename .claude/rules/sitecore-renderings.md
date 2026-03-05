# Sitecore Renderings — Configuration & GraphQL

## Location

`/sitecore/layout/Renderings/Project/fmc-custom-demo/`
Template: JSON Rendering (ID: `04646a89-996f-4ee7-878a-ffdbf1f0ef0d`)

Mirror the template `Components/` subfolder structure. One rendering per component.

## Critical Fields (all required)

### 1. `componentName` — kebab-case, must match component-map key

```
File:       component-name.tsx
Map key:    ['component-name', { ...componentname }]
Rendering:  componentName: "component-name"
```

- ✅ `"component-name"` ❌ `"ComponentName"` ❌ `"componentname"`

### 2. `Datasource Template` — full path, never a GUID

Format: `/sitecore/templates/Project/fmc-custom-demo/Components/<Category>/<TemplateName>`

- ✅ `/sitecore/templates/Project/fmc-custom-demo/Components/<Category>/<ComponentName>`
- ❌ `{e0bd6abd-...}` — GUID not accepted
- ❌ Empty (unless context-only component)

### 3. `Datasource Location` — Sitecore query syntax

```
query:$site/*[@@name='Data']/*[@@templatename='Hero Folder']|query:$sharedSites/*[@@name='Data']/*[@@templatename='Hero Folder']
```

- `$site` = current site root, `$sharedSites` = shared root, `|` = OR separator

### 4. `Data source` — Leave EMPTY

### 5. `AddFieldEditorButton` — Set to `"1"`

### 6. `ComponentQuery` — REQUIRED for parent/child list components

UI label is "Component GraphQL Query" but MCP field name is `ComponentQuery`.

**When to use:** Only for parent/child (list) components needing `children.results`.
**Leave empty:** For simple single-datasource components (Hero, Promo, Banner).

#### Query Structure

**IMPORTANT:** ComponentQuery must be a **single-line string** with NO escaped newlines (`\n`).

❌ **WRONG** - Do NOT use escaped newlines:
```
"query ParentComponent(...) {\n  datasource: item(...) {\n    ...\n  }\n}"
```

✅ **CORRECT** - Single line with spaces:
```
"query ParentComponent($datasource: String!, $language: String!) { datasource: item(path: $datasource, language: $language) { ... on ParentComponent { sectionTitle { jsonValue } } children { results { ... on ChildComponent { id fieldName { jsonValue } imageField { jsonValue } linkField { jsonValue } } } } } }"
```

**Example (formatted for readability, but store as single line):**
```graphql
query ParentComponent($datasource: String!, $language: String!) {
  datasource: item(path: $datasource, language: $language) {
    ... on ParentComponent {
      sectionTitle { jsonValue }
      sectionDescription { jsonValue }
    }
    children {
      results {
        ... on ChildComponent {
          id
          fieldName { jsonValue }
          imageField { jsonValue }
          linkField { jsonValue }
        }
      }
    }
  }
}
```

**When passing to MCP:** Remove all line breaks and extra whitespace, keep only single spaces between tokens.

#### Query Rules

- Template names in `... on` use PascalCase matching Sitecore template name
- Field names use camelCase (`badgeText` not `BadgeText`)
- Always include `id` in children results (React keys)
- Always wrap fields with `{ jsonValue }`
- Alias must be `datasource:` for root `item()` call
- No collision-prone field names (`icon`, `name`, `path`, etc.)

#### ⚠️ CRITICAL: Validation Checklist (verify BEFORE saving)

**Invalid ComponentQuery = Runtime error "Cannot read properties of undefined (reading 'route')"**

This error is cryptic and hard to debug. Validate upfront:

- [ ] **Single-line format**: NO escaped newlines (`\n`), NO line breaks — single continuous string with spaces
- [ ] **Query name** matches parent template name
- [ ] **Variables** declared: `$datasource: String!`, `$language: String!`
- [ ] **Root alias** correct: `datasource: item(path: $datasource, language: $language)`
- [ ] **Template names** in `... on` fragments use PascalCase, match Sitecore exactly
- [ ] **Field names** use camelCase (NOT PascalCase)
- [ ] **All fields** wrapped with `{ jsonValue }`
- [ ] **`id` field** included in children results (required for React keys)
- [ ] **Braces balanced**: count `{` and `}`, `(` and `)` — must match
- [ ] **No trailing commas** after last field in each section
- [ ] **No reserved field names**: avoid `icon`, `name`, `path`, `url`, `template`, `parent`, `children`
- [ ] **Syntax complete**: no missing closing braces or fragments

**Test immediately after saving:**
Add component to page in Pages editor → if "Cannot read 'route'" error appears → query is invalid, review checklist above.

## Context-Only Components (No Datasource)

For components reading page context (breadcrumbs, article headers, body content):

- `Datasource Template`: empty
- `Datasource Location`: empty
- `ComponentQuery`: empty
- `Data source`: empty
- Component reads from `page.layout.sitecore.route.fields`

## Creation Workflow

```
1. create_content_item(name="ComponentName", templateId="04646a89-...", parentId="<folder-id>")
2. update_content(itemId="<id>", siteName="<site-name>", fields={
     "componentName": "component-name",
     "Datasource Template": "/sitecore/templates/Project/fmc-custom-demo/Components/<Category>/<ComponentName>",
     "Datasource Location": "query:$site/*[@@name='Data']/*[@@templatename='<Component> Folder']|...",
     "AddFieldEditorButton": "1",
     "ComponentQuery": "query ComponentName(...) { ... }"
   })
```

---

## ⚠️ NEXT STEP: Add to Available Renderings

After creating the rendering definition, you MUST add it to Available Renderings or it won't appear in the Pages editor toolbar.

**Location:** `/sitecore/content/<site-collection>/<site-name>/Presentation/Available Renderings/Page Content`

**Field:** `Renderings` - Append rendering GUID with pipe separator

**Format:** `<existing-guids>|{NEW-RENDERING-GUID}` (UPPERCASE with braces)

**See:** [Available Renderings Rules](sitecore-available-renderings.md) for complete workflow.

**Quick steps:**
1. Get rendering GUID from creation response
2. Get current Available Renderings `Renderings` field value
3. Append new GUID: `<current>|{NEW-GUID}`
4. Update Available Renderings item
5. Publish to Web database

**This is the #1 reason components don't show in Pages toolbar - don't skip this step!**
