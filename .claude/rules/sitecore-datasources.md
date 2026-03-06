# Datasource Folder Organization & Content Tab

## Three-Step Setup

### 1. Create Folder Template

- Location: `/sitecore/templates/Project/fmc-custom-demo/Folders/`
- Name: `<Component> Folder` (e.g., "Hero Folder", "Article Cards Folder")
- Create `__Standard Values` with `__Masters` set to allowed datasource template IDs

### 2. Create Folder Instance

- Location: `/sitecore/content/<site-collection>/<site-name>/Data/`
- Use your folder template
- Name: plural or descriptive (e.g., "Heroes", "ArticleCards")

### 3. Create Datasource Items

- Location: inside the folder instance
- Use your component template
- These become selectable in the datasource picker

## Example Structure

```
/sitecore/content/<site-collection>/<site-name>/Data/
  └── ContentItems (Content Items Folder template)
      ├── Content Items Default (ParentComponent template)
      │   ├── Child Item 1 (ChildComponent template)
      │   ├── Child Item 2 (ChildComponent template)
      │   └── Child Item 3 (ChildComponent template)
      └── Homepage Content (ParentComponent template)
```

IMPORTANT: Without both the folder template AND the folder instance in Data/, the datasource picker will be empty.

## Children in XM Cloud Pages Content Tab

For list components (parent + child datasources), make child items manageable in the Pages Content tab.

### Requirements

1. **Add `_HorizonDatasourceGrouping` as base template** to the **parent** datasource template (NOT child, NOT folder)
   - Path: `/sitecore/templates/Foundation/Experience Accelerator/Horizon/_HorizonDatasourceGrouping`
   - ID: `{D0F6BE14-2A2D-4C56-ACB5-80CAA573B8E2}`

2. **Set Insert Options** on parent template's `__Standard Values` to allow the child template

### MCP Workflow

```
1. get_content_item_by_path(path="/sitecore/templates/Project/fmc-custom-demo/Components/<Category>/<ParentComponentName>")

2. update_content(
     itemId="<parent-template-id>",
     siteName="<site-name>",
     fields={
       "__Base template": "<existing-base-ids>|{D0F6BE14-2A2D-4C56-ACB5-80CAA573B8E2}"
     }
   )

3. Set __Masters on parent's __Standard Values to include child template ID
```

### When to Use

- List components with parent/child items (cards, FAQs, tabs, accordions)
- When authors need to add/sort/delete children in Pages

### When NOT to Use

- Simple components with no children (Hero, Banner)
- Components sourcing children from queries or external data

## SEO Metadata Extension

Never modify OOB `_Seo Metadata` (ID: `{9B5B9E0E-1CEF-4D54-8C47-27F241CE075B}`).
Extend via inheritance:

1. Create `_Seo Metadata Extended` under `/sitecore/templates/Project/fmc-custom-demo/Presentation/`
2. Set `__Base template` to include `_Seo Metadata`
3. Add project-specific fields (MetaTitle, CanonicalUrl, OpenGraph*, Twitter*, Robots)
4. Add as base template to your Page templates
