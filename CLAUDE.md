# Sitecore XM Cloud — Project Context

## Project

This is a Sitecore XM Cloud headless project using Content SDK and Next.js (App Router).
The Sitecore Marketer MCP connects AI agents to Sitecore via the Agent API.

**Project folder name:** `fmc-custom-demo` — used for all definition-item paths (templates, renderings, layouts).
**Site collection / site name:** variable per environment — use `get_content_item_by_path` or `search_site` to discover.

## Repository Structure

```
<repo-root>/
  ├── authoring/                         ← Sitecore serialization (../../authoring from head app)
  │   └── items/                         ← *.module.json + *.yml serialized items
  ├── sitecore.json                      ← Root SCS config
  └── examples/
      └── basic-nextjs/               ← Head application (Next.js)
          ├── src/components/            ← React component files
          ├── .sitecore/component-map.ts ← Component registrations
          ├── sitecore.config.ts         ← Runtime config
          └── sitecore.cli.config.ts     ← CLI config
```

## Key Sitecore Paths

Definition items (use `fmc-custom-demo`):
- Templates: `/sitecore/templates/Project/fmc-custom-demo/Components/`
- Folder templates: `/sitecore/templates/Project/fmc-custom-demo/Folders/`
- Renderings: `/sitecore/layout/Renderings/Project/fmc-custom-demo/`

Content items (variable `<site-collection>/<site-name>`):
- Site root: `/sitecore/content/<site-collection>/<site-name>/`
- Data: `/sitecore/content/<site-collection>/<site-name>/Data/`
- Headless Variants: `/sitecore/content/<site-collection>/<site-name>/Presentation/Headless Variants/`

## Quick Start: Component Development Workflow

1. **Create Templates** → under `/sitecore/templates/Project/fmc-custom-demo/Components/`
   - MANDATORY: Create `__Standard Values` for every template (see rules/sitecore-standard-values.md)
2. **Create Rendering** → under `/sitecore/layout/Renderings/Project/fmc-custom-demo/`
   - Set `componentName` (kebab-case), `Datasource Template` (full path), `Datasource Location` (query)
3. **Create Datasource Folder** → folder template + folder instance in Data/
4. **Create Datasource Items** → inside the folder instance
5. **Register Component** → `.sitecore/component-map.ts`
6. **Add Headless Variants** → if component has multiple visual presentations (see rules/sitecore-variants.md)
7. **Add to Page** → Pages editor

## Component Naming Chain (all must match)

```
File:           article-cards.tsx         (kebab-case)
Map import:     import * as articlecards from '...'
Map key:        ['article-cards', { ...articlecards }]
Rendering:      componentName: "article-cards"
```

## Props Shape Quick Reference

| Rendering has ComponentQuery? | Props shape | Access pattern |
|-------------------------------|-------------|----------------|
| Yes (list/parent-child) | `fields.data.datasource`, camelCase, `jsonValue` | `datasource.children.results` |
| No (simple) | `fields` top-level, PascalCase, `.value` | `fields.Title.value` |
| No datasource (context-only) | `page.layout.sitecore.route.fields` | Route fields from page |

## Common Template IDs

| Template | ID |
|----------|-----|
| Template | `ab86861a-6030-46c5-b394-e8f99e8b87db` |
| Template Section | `e269fbb5-3750-427a-9149-7aa950b49301` |
| Template Field | `455a3e98-a627-4b40-8035-e683a0331ac7` |
| JSON Rendering | `04646a89-996f-4ee7-878a-ffdbf1f0ef0d` |
| Template Folder | `0437fee2-44c9-46a6-abe9-28858d9fee8c` |
| _HorizonDatasourceGrouping | `D0F6BE14-2A2D-4C56-ACB5-80CAA573B8E2` |

## MCP Update Tools

- `update_content` — requires `itemId`, `siteName`, `fields`. Use for content items under a site.
- `update_fields_on_content_item` — requires `itemId`, `fields` only. Use for templates, renderings, items outside a site.
- For GraphQL query field, always use internal name `ComponentQuery` (not UI label "Component GraphQL Query").

## Key Rules Summary

- Templates need 4-level hierarchy: Template → Section → Fields → __Standard Values
- Always use JSON Rendering template for headless components
- `Datasource Template` requires full path, never a GUID
- Create folder templates AND data folder instances for every component with a datasource
- Never modify OOB Foundation/SXA templates — extend via inheritance
- Avoid GraphQL field name collisions: don't use `icon`, `name`, `path`, `url`, `template`, `parent`, `children`
- Serialize definition items to `../../authoring/items/` or they'll be lost on deployment
- Publish after MCP changes — items live in Master database until published

## Current Component Library

### Vargroup Design System Components
**Color Scheme**: Primary Blue (#0066FF), Green (#2EAA6C), Gray (#6B7280)

**Components (all registered in component-map.ts)**:
1. **HeroBanner** - Hero sections with background image, headline, subheadline, CTA buttons
   - Variants: Default (left), Centered, Compact
   - Location: `src/components/ui/hero-banner/HeroBanner.tsx`
   - Type: Simple component (no ComponentQuery)

2. **ContentCards** - Parent/child grid for case studies, blog posts
   - Variants: Default (3-col), TwoColumn, Overlay, Minimal (4-col)
   - Location: `src/components/ui/content-cards/ContentCards.tsx`
   - Type: Parent/child (requires ComponentQuery)
   - Parent: sectionTitle, sectionDescription
   - Child: title, image, description, link, badgeText

3. **FeatureCards** - Icon-based feature/service grid
   - Variants: Default (3-col), FourColumn, TwoColumn, Centered
   - Location: `src/components/ui/feature-cards/FeatureCards.tsx`
   - Type: Parent/child (requires ComponentQuery)
   - Parent: sectionTitle, sectionDescription
   - Child: featureIcon, featureTitle, featureDescription, featureLink

4. **CtaBanner** - Call-to-action sections
   - Variants: Default (blue), Light (gray), Green
   - Location: `src/components/ui/cta-banner/CtaBanner.tsx`
   - Type: Simple component (no ComponentQuery)

5. **ContentSplit** - Two-column image + text layout
   - Variants: Default/ImageLeft, ImageRight
   - Location: `src/components/ui/content-split/ContentSplit.tsx`
   - Type: Simple component (no ComponentQuery)

**Documentation**: See `VARGROUP-IMPLEMENTATION.md` and `SITECORE-SETUP-GUIDE.md` for full specifications.

## Reference Documentation

- Marketer MCP tools: https://doc.sitecore.com/sai/en/users/sitecoreai/marketer-mcp-tools-reference.html
- Content SDK: https://doc.sitecore.com/xmc/en/developers/content-sdk/
- Agent API: https://api-docs.sitecore.com/ai-capabilities/agent-api
