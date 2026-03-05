# Sitecore Templates — Creation & Structure

## Location

`/sitecore/templates/Project/fmc-custom-demo/`

Templates must be organized into category subfolders. Never create templates loose under the project root.
Use Template Folder items (ID: `0437fee2-44c9-46a6-abe9-28858d9fee8c`) for the hierarchy.

```
/sitecore/templates/Project/fmc-custom-demo/
  ├── Components/            ← Component data templates
  │   ├── Banners/
  │   ├── Cards/
  │   ├── Navigation/
  │   └── Forms/
  ├── Folders/               ← Folder templates for datasource organization
  ├── Presentation/          ← Page-level and layout templates
  ├── Site/                  ← Site configuration templates
  └── Taxonomy/              ← Classification and tagging templates
```

## 4-Level Template Hierarchy (all levels required)

1. **Template** (ID: `ab86861a-6030-46c5-b394-e8f99e8b87db`) — PascalCase name
2. **Template Section** (ID: `e269fbb5-3750-427a-9149-7aa950b49301`) — usually "Data"
3. **Template Field** (ID: `455a3e98-a627-4b40-8035-e683a0331ac7`) — set `Type` field
4. **__Standard Values** (MANDATORY) — uses the template's own ID as templateId

```
ArticleCard (Template)
  ├── Data (Section)
  │   ├── Title (Field, Type: "Single-Line Text")
  │   ├── Image (Field, Type: "Image")
  │   ├── Link (Field, Type: "General Link")
  │   └── BadgeText (Field, Type: "Single-Line Text")
  └── __Standard Values
```

## Creation Workflow

```
1. get_content_item_by_path(path="/sitecore/templates/Project/fmc-custom-demo/Components/Cards")
2. create_content_item(name="Cards", templateId="0437fee2-...", parentId="<components-folder-id>")
3. create_content_item(name="ArticleCard", templateId="ab86861a-...", parentId="<cards-folder-id>")
4. create_content_item(name="Data", templateId="e269fbb5-...", parentId="<template-id>")
5. create_content_item(name="Title", templateId="455a3e98-...", parentId="<section-id>", fields={"Type": "Single-Line Text"})
6. create_content_item(name="__Standard Values", templateId="<articlecard-id>", parentId="<articlecard-id>")
```

## Common Field Types

`Single-Line Text`, `Multi-Line Text`, `Rich Text`, `Image`, `General Link`, `Checkbox`, `Date`, `DateTime`, `Number`, `Integer`, `Droplink`, `Multilist`

## IMPORTANT: Avoid GraphQL Field Name Collisions

These names collide with core GraphQL item fields and get silently renamed with `_{guid}`:

**Never use:** `icon`, `id`, `name`, `path`, `url`, `template`, `parent`, `children`, `language`, `version`, `displayName`

**Instead use:** descriptive, component-scoped names — `awardIcon`, `cardIcon`, `sectionTitle`, `promoImage`

If a field stops resolving in a GraphQL query despite being camelCase, check for a collision.
