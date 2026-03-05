# Sitecore XM Cloud — Project Context

## Before You Start

When assigned a new task, **ask these questions first** if not already clear:

1. **What is the objective?**
   - Building new components? Replicating an existing website? Adding features?
   - Are there reference materials (screenshots, URLs, design files)?

2. **Site discovery:**
   - Has the site structure been identified? If not, run [Site Discovery Workflow](rules/site-discovery.md)
   - What is the site collection and site name?

3. **Design system:**
   - Are there specific colors, fonts, or design tokens to use?
   - Should I create/update a design system file?

4. **Component architecture:**
   - Simple components, parent/child, or both?
   - How many components/variants are needed?

5. **Sample content:**
   - Should I create sample datasource content?
   - What type of content (realistic vs placeholder)?

6. **Scope boundaries:**
   - Should I also create sample pages? Update documentation?
   - Are there existing components to reference or reuse?

7. **Generic rendering parameters:**
   - Has the Generic Rendering Parameters template been created? If not, create it first (see [Rendering Parameters Rules](rules/sitecore-rendering-parameters.md))

**Once questions are answered, proceed with execution.**

---

## Project Overview

This is a Sitecore XM Cloud headless project using Content SDK and Next.js (App Router).
The Sitecore Marketer MCP connects AI agents to Sitecore via the Agent API.

**Project folder name:** `fmc-custom-demo` — used for all definition-item paths (templates, renderings, layouts).

**Site discovery required:** Site collection and site name vary by environment.
- Run [Site Discovery Workflow](rules/site-discovery.md) to find site structure
- Document findings in this file once discovered

---

## Repository Structure

```
<repo-root>/
  ├── .claude/
  │   ├── CLAUDE.md                      ← This file (project context)
  │   └── rules/                         ← Detailed rules and workflows
  ├── authoring/                         ← Sitecore serialization
  │   └── items/                         ← *.module.json + *.yml items
  ├── sitecore.json                      ← Root SCS config
  └── examples/
      └── basic-nextjs/                  ← Head application (Next.js)
          ├── src/components/            ← React component files
          ├── .sitecore/component-map.ts ← Component registrations
          ├── sitecore.config.ts         ← Runtime config
          └── sitecore.cli.config.ts     ← CLI config
```

---

## Key Sitecore Paths

**Definition items** (developer-owned, use `fmc-custom-demo`):
- Templates: `/sitecore/templates/Project/fmc-custom-demo/`
- Renderings: `/sitecore/layout/Renderings/Project/fmc-custom-demo/`

**Content items** (variable `<site-collection>/<site-name>` - use site discovery):
- Site root: `/sitecore/content/<site-collection>/<site-name>/`
- Data folder: `/sitecore/content/<site-collection>/<site-name>/Data/`
- Headless Variants: `/sitecore/content/<site-collection>/<site-name>/Presentation/Headless Variants/`

---

## Component Development Workflow

### High-Level Steps

1. **Discover site structure** (if not done) → [Site Discovery Workflow](rules/site-discovery.md)
2. **Create Sitecore templates** → [Template Rules](rules/sitecore-templates.md)
   - ⚠️ **CRITICAL:** Create `__Standard Values` for EVERY template → [Standard Values Rules](rules/sitecore-standard-values.md)
3. **Create rendering definition** → [Rendering Rules](rules/sitecore-renderings.md)
   - ⚠️ **Set Parameters Template** → Use Generic Rendering Parameters template → [Rendering Parameters Rules](rules/sitecore-rendering-parameters.md)
4. **Add to Available Renderings** → [Available Renderings Rules](rules/sitecore-available-renderings.md)
   - ⚠️ **REQUIRED:** Component won't appear in Pages toolbar without this step
5. **Create datasource folders** → [Datasource Rules](rules/sitecore-datasources.md)
6. **Write React component code** → [Component Code Rules](rules/component-code.md)
7. **Register in component-map.ts** → [Component Code Rules](rules/component-code.md)
8. **Create variants** (if needed) → [Variant Rules](rules/sitecore-variants.md)
9. **Create sample content** (optional)
10. **Publish & test** in Pages editor

### Critical Reminders

- **Always create __Standard Values** → Without it: insert options broken, items blank, "Add" button empty
- **Add rendering to Available Renderings** → Component won't appear in Pages toolbar without this
- **Set Parameters Template on every rendering** → Without it: variant selection disabled (components work but can't switch variants)
- **Validate item names** → No `&`, `<`, `>`, `/`, `\`, `?`, `:`, `|`, `*`, `"` characters
- **ComponentQuery = single-line string** → NO escaped newlines (`\n`)
- **Publish after MCP changes** → Items live in Master database until published
- **Restart dev server** → After component-map.ts changes

**For complete rules, see:** [MCP Key Rules](rules/mcp-key-rules.md)

---

## Component Naming Chain

All parts must match exactly:

```
File:           article-cards.tsx         (kebab-case)
Map import:     import * as articlecards from '...'
Map key:        ['article-cards', { ...articlecards }]
Rendering:      componentName: "article-cards"
```

Mismatch = component won't appear in Pages toolbar.

---

## Props Shape Quick Reference

| Rendering has ComponentQuery? | Props shape | Access pattern | Field naming |
|-------------------------------|-------------|----------------|--------------|
| **Yes** (list/parent-child) | `fields.data.datasource` | `datasource.children.results` | camelCase, `{ jsonValue }` |
| **No** (simple) | `fields` top-level | `fields.Title.value` | PascalCase, `.value` |
| **No datasource** (context) | `page.layout.sitecore.route.fields` | Route fields from page | N/A |

**See:** [Component Code Rules](rules/component-code.md) for detailed examples.

---

## Common Template IDs

| Template | ID |
|----------|-----|
| Template | `ab86861a-6030-46c5-b394-e8f99e8b87db` |
| Template Section | `e269fbb5-3750-427a-9149-7aa950b49301` |
| Template Field | `455a3e98-a627-4b40-8035-e683a0331ac7` |
| JSON Rendering | `04646a89-996f-4ee7-878a-ffdbf1f0ef0d` |
| Template Folder | `0437fee2-44c9-46a6-abe9-28858d9fee8c` |
| _HorizonDatasourceGrouping | `D0F6BE14-2A2D-4C56-ACB5-80CAA573B8E2` |

---

## MCP Tools Quick Reference

**Updating fields:**
- `update_content(itemId, siteName, fields)` → For content items under a site
- `update_fields_on_content_item(itemId, fields)` → For templates, renderings, items outside site

**Common operations:**
- `get_content_item_by_path(itemPath)` → Read item by path (most reliable)
- `search_site(site_name, search_query)` → Search pages (may fail)
- `create_content_item(name, templateId, parentId, fields)` → Create item
- `create_component_datasource(siteName, componentId, dataFields)` → Create datasource with children

**GraphQL field:**
- Internal field name: `ComponentQuery` (not UI label "Component GraphQL Query")
- Must be single-line string with NO escaped newlines

**See:** [MCP Key Rules](rules/mcp-key-rules.md) for performance tips (parallel vs sequential).

---

## Performance Tips

**Run in parallel** (same message):
- Multiple independent fields in same section
- Multiple variant definitions
- Multiple child items (if parent exists)
- Multiple independent reads

**Run sequentially** (separate messages):
- Parent → Children (need parent ID first)
- Template → __Standard Values (need template ID)
- Operations with dependencies

**See:** [MCP Performance Rules](rules/mcp-performance.md) for details.

---

## Troubleshooting Quick Links

| Issue | See |
|-------|-----|
| MCP tool returns 500 error | [Troubleshooting](rules/troubleshooting.md#mcp-tool-failures) |
| Item name validation error | [Troubleshooting](rules/troubleshooting.md#item-naming-validation) |
| "Add" button empty in Pages | [Troubleshooting](rules/troubleshooting.md#template-creation) |
| "Cannot read 'route'" error | [Troubleshooting](rules/troubleshooting.md#rendering-configuration) |
| Datasource picker empty | [Troubleshooting](rules/troubleshooting.md#rendering-configuration) |
| Component not in toolbar | [Troubleshooting](rules/troubleshooting.md#component-registration) |
| Variants not showing | [Troubleshooting](rules/troubleshooting.md#component-registration) |

---

## Current Project Components

**Document project-specific components here as you build them:**

Example format:
```markdown
### Component Name
- **Purpose:** Brief description
- **Type:** Simple / Parent-child / Context-only
- **Variants:** List variants
- **Location:** src/components/...
- **Fields:** List key fields
- **Sample content:** Location of sample datasource items
```

---

## Project-Specific Notes

**Add project-specific information here:**

- Design system details (colors, fonts, spacing)
- Business requirements or constraints
- Existing components to reference
- Integration points or dependencies
- Testing considerations

**Example - Site Discovery Results:**
```
Site path: /sitecore/content/<collection>/<site>/
Site collection: <collection>
Site name: <site>
Data folder: /sitecore/content/<collection>/<site>/Data/
Variants: /sitecore/content/<collection>/<site>/Presentation/Headless Variants/
```

---

## Reference Documentation

- **Marketer MCP tools:** https://doc.sitecore.com/sai/en/users/sitecoreai/marketer-mcp-tools-reference.html
- **Content SDK:** https://doc.sitecore.com/xmc/en/developers/content-sdk/
- **Agent API:** https://api-docs.sitecore.com/ai-capabilities/agent-api

---

## Rules Directory

All detailed rules live in `.claude/rules/`:

| Rule File | Purpose |
|-----------|---------|
| [site-discovery.md](rules/site-discovery.md) | Find site structure (4-step workflow) |
| [mcp-key-rules.md](rules/mcp-key-rules.md) | Critical MCP operation rules (priority-ordered) |
| [mcp-performance.md](rules/mcp-performance.md) | Parallel vs sequential operations |
| [sitecore-templates.md](rules/sitecore-templates.md) | Template creation (4-level hierarchy) |
| [sitecore-standard-values.md](rules/sitecore-standard-values.md) | __Standard Values setup (MANDATORY) |
| [sitecore-renderings.md](rules/sitecore-renderings.md) | Rendering config & ComponentQuery |
| [sitecore-rendering-parameters.md](rules/sitecore-rendering-parameters.md) | Rendering parameters & variant selection setup |
| [sitecore-available-renderings.md](rules/sitecore-available-renderings.md) | Making components visible in Pages toolbar |
| [sitecore-datasources.md](rules/sitecore-datasources.md) | Datasource folders & organization |
| [sitecore-variants.md](rules/sitecore-variants.md) | Variant system (code + Sitecore) |
| [sitecore-field-formats.md](rules/sitecore-field-formats.md) | Field value formats (links, images, etc.) |
| [component-code.md](rules/component-code.md) | Component code conventions |
| [troubleshooting.md](rules/troubleshooting.md) | Common issues & solutions |

**When in doubt, consult the relevant rule file above.**
