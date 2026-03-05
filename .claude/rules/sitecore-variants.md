# Component Variants — Code + Sitecore Setup

Variants are alternative visual presentations sharing the same datasource.
Two-step process: (1) named exports in code, (2) Headless Variant Definitions in Sitecore.

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

## Step 2: Register Once in Component Map

The spread `{ ...componentName }` includes all named exports automatically:

```typescript
import * as herobanner from 'src/components/ui/hero-banner';
export const componentMap = new Map([
  ['hero-banner', { ...herobanner, componentType: 'client' }],
]);
```

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

```
1. get_content_item_by_path(path="<site>/Presentation/Headless Variants")

2. create_content_item(
     name="HeroBanner",
     templateId="<variants-container-template-id>",
     parentId="<headless-variants-folder-id>"
   )

3. create_content_item(
     name="Default",
     templateId="<variant-definition-template-id>",
     parentId="<herobanner-variants-id>"
   )

4. create_content_item(
     name="Compact",
     templateId="<variant-definition-template-id>",
     parentId="<herobanner-variants-id>"
   )
```

IMPORTANT: Variant Definition name must **exactly match** the named export. `Compact` not `compact`.

## How Authors Use Variants

1. Add component to page in Pages editor
2. Select component on canvas
3. Right-hand pane → **Design** tab → **Variant** dropdown
4. Select variant (e.g., "Compact")

## When to Use Variants vs Separate Components

- **Variants:** same datasource, different layout (Hero full-width vs compact)
- **Separate components:** different datasource structure (ArticleCards vs Promo)

## Troubleshooting

**Variant dropdown not showing:** Missing Variant Definition items or missing container.
**Always renders Default:** Variant Definition name doesn't match code export — check casing.
**New variant not available:** Restart Next.js dev server after adding exports.
