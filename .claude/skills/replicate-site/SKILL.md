---
name: replicate-site
description: Replicates an existing website as a fully working SitecoreAI custom demo.
  Use automatically when asked to replicate, clone, copy, rebuild, or recreate a website
  in Sitecore or SitecoreAI. Also triggers on phrases like "build a demo from",
  "make a demo of", or "create a Sitecore version of [website/URL]".
  The website URL or domain is passed as the argument.
allowed-tools: Bash, Read, Write, Edit, WebFetch, WebSearch
---

# Replicate Website as SitecoreAI Demo

You are working inside the `fmc-custom-demo` Sitecore XM Cloud project.
Your job is to replicate an existing website as a fully working custom demo,
reusing existing components where possible and only creating new ones when needed.

**Use Marketer MCP tools to take real actions. Never output manual API calls.**
**Follow ALL rules in `.claude/rules/` throughout this entire workflow.**

## Input

- **Website to replicate:** $ARGUMENTS
- **Screenshots folder:** `./screenshots/` — your visual source of truth when HTML is incomplete

---

## PHASE 0 — Pre-flight Checks

Before touching anything, run these checks sequentially:

### 0.1 Site discovery
Run the [Site Discovery Workflow](rules/site-discovery.md) to get:
- Site collection name
- Site name  
- Data folder path: `/sitecore/content/<collection>/<site>/Data/`
- Variants path: `/sitecore/content/<collection>/<site>/Presentation/Headless Variants/`

**Store these — every path in this workflow depends on them.**

### 0.2 Check Generic Rendering Parameters
Per [Rendering Parameters Rules](rules/sitecore-rendering-parameters.md), verify the
Generic Rendering Parameters template exists. If not, create it before proceeding.

### 0.3 Check existing components
Review `PROJECT-COMPONENTS.md` to identify which components are already built.
The following are available for reuse:

| Component | Variants | Use when |
|---|---|---|
| HeroBanner | Default, Centered, Compact | Any hero/banner section |
| ContentCards | Default, TwoColumn, Overlay, Minimal | Card grids (case studies, blog, portfolio) |
| FeatureCards | Default, FourColumn, TwoColumn, Centered | Icon-based feature/service grids |
| CtaBanner | Default (blue), Light (gray), Green | CTA conversion sections |
| ContentSplit | Default/ImageLeft, ImageRight | Two-column image+text sections |

**Always prefer reusing an existing component with a new datasource item 
over creating a new component.** Only create new components for layouts 
that genuinely cannot be achieved with a variant of an existing one.

---

## PHASE 1 — Analyse the Website

### 1.1 Fetch and review
Fetch `$ARGUMENTS`. Also read all images in `./screenshots/`.

If HTML is incomplete (JS-heavy site, few `<img>` tags) — that's expected.
Use screenshots as the primary visual reference.

Identify per section:
- Section name and purpose
- Headline, body copy, CTA text
- Which images are needed (background, icon, avatar, logo, etc.)
- Which **existing component** best matches this section
- Which **variant** of that component to use
- If no existing component fits, define a new one

### 1.2 Section Map
Output this before proceeding to Phase 2:

```
SECTION MAP — [site being replicated]
────────────────────────────────────────────────────────────────────
Section        | Component       | Variant      | New? | Images
────────────────────────────────────────────────────────────────────
hero           | HeroBanner      | Default      | No   | 1 (bg)
services       | FeatureCards    | FourColumn   | No   | 4 (icons)
case-studies   | ContentCards    | Overlay      | No   | 3 (cards)
about-split    | ContentSplit    | ImageRight   | No   | 1
cta            | CtaBanner       | Green        | No   | 0
testimonials   | [NewComponent]  | Default      | YES  | 3 (avatars)
────────────────────────────────────────────────────────────────────
New components needed: [list or "None"]
```

**Do not proceed to Phase 2 until this is confirmed.**

---

## PHASE 2 — Image Pipeline

Run once for the whole site (not per section):

### 2.1 Download all images
```bash
node scripts/fetch-images.js $ARGUMENTS ./screenshots
```

Read `/tmp/demo-images/image-map.json` — this gives you every image
grouped by section with its `localPath`.

### 2.2 Upload to Media Library via Marketer MCP
For each image, upload to a folder matching the demo site name:

```
Tool: upload_asset
  localPath:  /tmp/demo-images/[section]/[filename]
  name:       [descriptive name — no special chars per item naming rules]
  folder:     Custom Demo/[slugified-site-name]/[section]
  tags:       ["custom-demo", "[site-name]", "[section]"]
```

⚠️ **Item naming rules apply:** No `&`, `<`, `>`, `/`, `\`, `?`, `:`, `|`, `*`, `"`  
See [Troubleshooting](rules/troubleshooting.md#item-naming-validation)

Upload images for **all sections in parallel** — they are independent.
Per [MCP Performance Rules](rules/mcp-performance.md), batch independent operations.

### 2.3 Media Registry
After all uploads, maintain this in memory:

```
MEDIA REGISTRY
──────────────────────────────────────────────────────────────
Section        | Field name      | mediaId   | Sitecore path
──────────────────────────────────────────────────────────────
hero           | backgroundImage | abc-123   | /Custom Demo/...
services       | featureIcon1    | def-456   | /Custom Demo/...
...
──────────────────────────────────────────────────────────────
```

---

## PHASE 3 — New Components (only if Section Map has NEW = YES)

Skip this phase entirely if all sections map to existing components.

For each new component needed, follow the **full Component Development Workflow**
from `CLAUDE.md` in order:

### 3.1 Create template
Follow [Template Rules](rules/sitecore-templates.md).
Path: `/sitecore/templates/Project/fmc-custom-demo/Components/[Category]/[ComponentName]`

Field naming convention from `CLAUDE.md`:
- Simple components (no ComponentQuery): **PascalCase** field names
- Parent/child components (with ComponentQuery): **camelCase** field names

### 3.2 Create __Standard Values
⚠️ **MANDATORY** — See [Standard Values Rules](rules/sitecore-standard-values.md)
Without this: insert options broken, items blank, "Add" button empty.

### 3.3 Create rendering definition
Follow [Rendering Rules](rules/sitecore-renderings.md).
Path: `/sitecore/layout/Renderings/Project/fmc-custom-demo/[ComponentName]`

⚠️ **Set Parameters Template** to Generic Rendering Parameters.
See [Rendering Parameters Rules](rules/sitecore-rendering-parameters.md).

### 3.4 Add to Available Renderings
⚠️ **REQUIRED** — Component won't appear in Pages toolbar without this.
See [Available Renderings Rules](rules/sitecore-available-renderings.md).

### 3.5 Create datasource folder
See [Datasource Rules](rules/sitecore-datasources.md).
Path: `/sitecore/content/<collection>/<site>/Data/[ComponentName]/`

### 3.6 Write React component code
File: `examples/basic-nextjs/src/components/ui/[component-name]/[ComponentName].tsx`

**Naming chain must match exactly** (from `CLAUDE.md`):
```
File:        [component-name].tsx          (kebab-case)
Map import:  import * as ComponentName from '...'
Map key:     ['ComponentName', { ...ComponentName }]
Rendering:   componentName: "ComponentName"
```

For simple components (no ComponentQuery) — use design system colors from `PROJECT-COMPONENTS.md`:
```tsx
import React from 'react';
import { Text, Image as JssImage, Link as JssLink, RichText, Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

interface Fields {
  Headline: Field<string>;
  Image: ImageField;
}

type ComponentProps = {
  params: { [key: string]: string };
  fields: Fields;
};

const DefaultComponent = (props: ComponentProps): React.JSX.Element => (
  <div className={`component [component-name] ${props.params.styles ?? ''}`}>
    <span className="is-empty-hint">Assign a datasource to edit content.</span>
  </div>
);

export const Default = (props: ComponentProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();
  if (!props.fields) return <DefaultComponent {...props} />;
  return (
    <div className={`component [component-name] ${styles}`} id={id ?? undefined}>
      {/* Match original site layout. Use Tailwind + CSS vars from globals.css */}
      {/* Colors: --vargroup-blue, --vargroup-green, --vargroup-gray, etc. */}
    </div>
  );
};
```

### 3.7 Register in component-map.ts
File: `examples/basic-nextjs/.sitecore/component-map.ts`
Add import and map entry per [Component Code Rules](rules/component-code.md).
**Restart dev server after this change.**

### 3.8 Create variants (if needed)
See [Variant Rules](rules/sitecore-variants.md).

---

## PHASE 4 — Datasource Content Creation

For **every** section (both existing and new components), create datasource items
with content matching the replicated site.

### 4.1 Create datasource items
Use `create_component_datasource` for items with children, `create_content_item` for simple ones.

```
Tool: create_content_item
  name:       [site-name]-[section-name]   ← no special chars
  templateId: [template ID from Phase 3 or existing component template]
  parentId:   [Data folder ID for this component]
  fields:
    Headline:  "[extracted text from site]"
    BodyText:  "[extracted body copy]"
    CtaLink:   "[extracted CTA — use Sitecore link format per field-formats.md]"
    Image:     "[mediaId from Phase 2 Media Registry]"
```

⚠️ **Image field format:** See [Field Formats Rules](rules/sitecore-field-formats.md)
⚠️ **Link field format:** See [Field Formats Rules](rules/sitecore-field-formats.md)

For **existing components**, match the exact field names from `PROJECT-COMPONENTS.md`:
- HeroBanner: `backgroundImage`, `headline`, `subheadline`, `ctaLink`, `secondaryCtaLink`
- FeatureCards parent: `sectionTitle`, `sectionDescription`
- FeatureCard child: `featureIcon`, `featureTitle`, `featureDescription`, `featureLink`
- ContentCards parent: `sectionTitle`, `sectionDescription`
- ContentCard child: `title`, `image`, `description`, `link`, `badgeText`
- CtaBanner: `headline`, `subheadline`, `ctaLink`
- ContentSplit: `image`, `headline`, `bodyText`, `ctaLink`

### 4.2 Parallelisation
Per [MCP Performance Rules](rules/mcp-performance.md):
- Create all **sibling** datasource items in parallel (same parent, same template)
- Create parent **before** children (sequential — need parent ID first)

### 4.3 Publish
After all datasource items are created:
```
Tool: publish_item (for each datasource item)
```
Items live in Master database until published — they won't show in Pages until this step.

---

## PHASE 5 — Page Assembly

### 5.1 Create pages
```
Tool: create_page
  name:     [page name]
  site:     [site name from Phase 0]
  template: [page template]
```

### 5.2 Add components to each page
In top-to-bottom order per the Section Map:

```
Tool: add_component_on_page
  page:        [page path]
  component:   [ComponentName — must match rendering componentName exactly]
  placeholder: [placeholder key]
  datasource:  [full Sitecore path to datasource item from Phase 4]
```

If using a non-Default variant, set the variant parameter per [Variant Rules](rules/sitecore-variants.md).

### 5.3 Page map output
```
HOME PAGE — /sitecore/content/<collection>/<site>/Home
  ├── HeroBanner      variant:Default    ds:/Data/Heroes/[name]
  ├── FeatureCards    variant:FourColumn ds:/Data/Feature Cards/[name]
  ├── ContentCards    variant:Overlay    ds:/Data/Content Cards/[name]
  ├── ContentSplit    variant:ImageRight ds:/Data/Content Split/[name]
  └── CtaBanner       variant:Green      ds:/Data/CTA Banners/[name]
```

---

## PHASE 6 — Verification & Documentation

### 6.1 Verify pages
```
Tool: get_page_preview_url
```
Call for each page and report the preview URLs.

### 6.2 Update PROJECT-COMPONENTS.md
If any **new** components were created in Phase 3, append them to `PROJECT-COMPONENTS.md`
following the existing format.

### 6.3 Final summary
```
DEMO BUILD SUMMARY — [site replicated]
──────────────────────────────────────────────────────
Site collection / name:  [collection] / [site]
Pages created:           [n]
Existing components used:[list with variants]
New components created:  [list or "None"]
Datasource items:        [n] created, [n] published
Images uploaded:         [n] uploaded, [n] failed
Preview URLs:            [list]
──────────────────────────────────────────────────────
Issues to fix manually:
  - [any gaps, failed uploads, missing content]
```

---

## Standing Rules

- **Always run site discovery first** — never hardcode site paths.
- **Reuse before creating** — check existing components before building new ones.
- **Follow naming chain exactly** — file, map key, rendering componentName must all match.
- **__Standard Values on every template** — no exceptions.
- **Add every new rendering to Available Renderings** — or it won't show in Pages.
- **Publish after MCP changes** — Master database only until published.
- **Parallel = same parent, no dependencies. Sequential = parent before child.**
- **Stop and report on double MCP failure** — don't silently skip.
- **Item names:** no `&`, `<`, `>`, `/`, `\`, `?`, `:`, `|`, `*`, `"` characters.
- **When in doubt:** consult the relevant rule file in `.claude/rules/`.