# Component Variants — Code + Sitecore Setup

Variants are alternative visual presentations sharing the same datasource.
Two-step process: (1) named exports in code, (2) Headless Variant Definitions in Sitecore.

---

## Template IDs Reference

### Required Template IDs

You need two specific template IDs for the variant system:

**1. Headless variant (container folders)**
- Template ID: `{49C111D0-6867-4798-A724-1F103166E6E9}`
- Path: `/sitecore/templates/Foundation/Experience Accelerator/Variants/Headless variant`
- Purpose: Container folder for component variants
- One per component (HeroBanner, FeatureCards, etc.)

**2. Variant Definition (variant items)**
- Template ID: `{4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55}`
- Path: `/sitecore/templates/Foundation/Experience Accelerator/Variants/Variant Definition`
- Purpose: Individual variant definitions (Default, Compact, etc.)
- Multiple per container, matching React exports

### Verification

**Before creating variants, verify these IDs exist:**

```
get_content_item_by_path(
  itemPath="/sitecore/templates/Foundation/Experience Accelerator/Variants"
)
```

Check response for both template names. IDs should match above.

**Common mistake:** Using Template Folder template (`{0437fee2-44c9-46a6-abe9-28858d9fee8c}`)
- This is NOT correct for variants
- Will create items but variants won't function
- Must use the two IDs above

---

## Step 1: Code — Named Exports

All variants in one file. `Default` MUST be the first export.

```typescript
// src/components/ui/hero-banner.tsx
'use client';
import type React from 'react';
import { Text, Image, Link } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

interface HeroBannerProps extends ComponentProps {
  params: { [key: string]: any };
  fields: HeroBannerFields;
}

export const Default: React.FC<HeroBannerProps> = (props) => {
  const { fields } = props;
  return (
    <section className="hero-banner hero-banner--full">
      <Image field={fields.BackgroundImage} />
      <Text field={fields.Title} />
      <Text field={fields.Description} />
      <Link field={fields.CtaLink} />
    </section>
  );
};

export const Compact: React.FC<HeroBannerProps> = (props) => {
  const { fields } = props;
  return (
    <section className="hero-banner hero-banner--compact">
      <Text field={fields.Title} />
      <Link field={fields.CtaLink} />
    </section>
  );
};
```

### Naming Rules

- PascalCase export names: `Default`, `Compact`, `WithImage`, `FullWidth`
- `Default` is mandatory, must be first export
- All variants share the same props interface and datasource
- All variants in the same file

---

## Step 2: Register Once in Component Map

The spread `{ ...componentName }` includes all named exports automatically:

```typescript
import * as herobanner from 'src/components/ui/hero-banner';
export const componentMap = new Map([
  ['hero-banner', { ...herobanner, componentType: 'client' }],
]);
```

---

## Step 3: Sitecore — Headless Variant Definitions

Location: `/sitecore/content/<site-collection>/<site-name>/Presentation/Headless Variants/`

Structure:
```
Headless Variants/
  └── HeroBanner (Variants container)
      ├── Default (Variant Definition)
      └── Compact (Variant Definition)
```

### MCP Workflow

**Use correct template IDs from Template IDs Reference section above.**

```
1. get_content_item_by_path(path="<site>/Presentation/Headless Variants")

2. create_content_item(
     name="HeroBanner",
     templateId="49C111D0-6867-4798-A724-1F103166E6E9",  # Headless variant
     parentId="<headless-variants-folder-id>"
   )

3. create_content_item(
     name="Default",
     templateId="4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55",  # Variant Definition
     parentId="<herobanner-variants-id>"
   )

4. create_content_item(
     name="Compact",
     templateId="4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55",  # Variant Definition
     parentId="<herobanner-variants-id>"
   )
```

**Template ID verification:**
- If MCP returns error "template doesn't exist", verify IDs in your environment
- Template paths may differ across Sitecore versions
- IDs are generally stable but confirm before batch operations

IMPORTANT: Variant Definition name must **exactly match** the named export. `Compact` not `compact`.

---

## How Authors Use Variants

1. Add component to page in Pages editor
2. Select component on canvas
3. Right-hand pane → **Design** tab → **Variant** dropdown
4. Select variant (e.g., "Compact")

---

## When to Use Variants vs Separate Components

- **Variants:** same datasource, different layout (Hero full-width vs compact)
- **Separate components:** different datasource structure (ArticleCards vs Promo)

---

## Troubleshooting

**Variant dropdown not showing:** Missing Variant Definition items or missing container.
**Always renders Default:** Variant Definition name doesn't match code export — check casing.
**New variant not available:** Restart Next.js dev server after adding exports.
**Items created but variants don't work:** Wrong template IDs used. Delete and recreate with correct IDs from Template IDs Reference section.
