---
paths:
  - "examples/basic-nextjs/src/components/**/*.tsx"
  - "headapps/basic-nextjs/.sitecore/component-map.ts"
---
# Component Code & Registration

## Component File Conventions

- Path: `src/components/<category>/<component-name>.tsx`
- Filename: kebab-case (`article-cards.tsx`, `hero.tsx`)
- Must export `Default` as first named export
- Extend `ComponentProps` from `@/lib/component-props`
- Import ONLY from `@sitecore-content-sdk/nextjs` (never `/config-cli`, `/tools`, `/client`)
- Use `'use client'` directive for interactive components
- Always use optional chaining `?.` for nested field access

## Registration in Component Map

File: `.sitecore/component-map.ts`

```typescript
import * as componentname from 'src/components/ui/component-name';
import * as anothercomponent from 'src/components/ui/another-component';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['component-name', { ...componentname, componentType: 'client' }],
  ['another-component', { ...anothercomponent }],
]);
```

The map key MUST match the rendering's `componentName` field exactly (kebab-case).
Restart Next.js dev server after changes to component-map.ts.

## Props Shape: With ComponentQuery (list / parent-child)

```typescript
interface ChildComponentItem {
  id: string;
  fieldName?: { jsonValue?: Field<string> };
  imageField?: { jsonValue?: ImageField };
  linkField?: { jsonValue?: LinkField };
  // ... other child fields
}

interface ParentComponentFields {
  data?: {
    datasource?: {
      sectionTitle?: { jsonValue?: Field<string> };
      sectionDescription?: { jsonValue?: Field<string> };
      children?: { results?: ChildComponentItem[] };
    };
  };
}
```

Usage: `fields?.data?.datasource?.children?.results`
Children are INSIDE datasource, not a sibling.

## Props Shape: Without ComponentQuery (simple)

```typescript
interface HeroFields {
  Title?: { value?: string };
  Description?: { value?: string };
  BackgroundImage?: { value?: { src?: string; alt?: string } };
  CtaLink?: { value?: { href?: string; text?: string } };
}
```

Usage: `fields.Title`, `fields.Description` with `.value`
Field names are PascalCase matching Sitecore template field names.

## Props Shape: Context-Only (no datasource)

```typescript
export const Default: React.FC<Props> = (props) => {
  const routeFields = props.page?.layout?.sitecore?.route?.fields;
  const title = routeFields?.Title;
  return <Text field={title} />;
};
```

No `fields` from datasource. Read from `page.layout.sitecore.route.fields`.

## NEVER Mix Props Shapes

- Rendering HAS ComponentQuery → use `fields.data.datasource`, camelCase, `jsonValue`
- Rendering has NO ComponentQuery → use `fields.Title`, PascalCase, `.value`
- No datasource at all → use `page.layout.sitecore.route.fields`

---

## TypeScript Build Validation

### Mandatory Build Check

**Before marking component complete:**

```bash
cd examples/basic-nextjs
npm run build
```

**Build must pass with zero errors.**

### Common Build Errors

#### Error 1: Generic ComponentProps in Exports

**Problem:** Export functions use generic `ComponentProps` which doesn't include component-specific fields.

**Error message:**
```
Property 'fields' does not exist on type 'ComponentProps'
```

**Fix:** Use component-specific props interface:

```typescript
// ❌ WRONG
export const Default = (props: ComponentProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  if (!props.fields?.data?.datasource) {  // Error here
    return <DefaultComponent {...props} />;
  }
  return <ComponentDefault {...props} isPageEditing={isEditing} />;
};

// ✅ CORRECT
export const Default = (props: ComponentNameProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  if (!props.fields?.data?.datasource) {
    return <DefaultComponent {...props} />;
  }
  return <ComponentDefault {...props} isPageEditing={isEditing} />;
};
```

**Apply to ALL export functions** (Default, Variant1, Variant2, etc.)

#### Error 2: Missing JSS Field Types

**Problem:** Interface uses `any` type instead of proper JSS Field types.

**Error message:**
```
Unexpected any. Specify a different type
```

**Fix:** Import and use proper types:

```typescript
// Add to imports
import { Text, Image as JssImage, Link as JssLink, useSitecore, Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

// Update interface
interface ComponentItem {
  id: string;
  title?: { jsonValue?: Field<string> };       // not 'any'
  image?: { jsonValue?: ImageField };          // not 'any'
  link?: { jsonValue?: LinkField };            // not 'any'
  description?: { jsonValue?: Field<string> };
}
```

**Required types:**
- Text fields: `Field<string>`
- Image fields: `ImageField`
- Link fields: `LinkField`
- Rich text fields: `Field<string>`

#### Error 3: Import from Wrong Submodule

**Problem:** Importing from server-only submodules in client components.

**Error message:**
```
Module not found: Can't resolve '@sitecore-content-sdk/nextjs/config'
```

**Fix:** Only use main package in components:

```typescript
// ✅ CORRECT - client component imports
import { Text, RichText, Image, Link, Field, ImageField, LinkField, useSitecore } from '@sitecore-content-sdk/nextjs';

// ❌ WRONG - server-only imports
import { defineConfig } from '@sitecore-content-sdk/nextjs/config';
import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
```

See CLAUDE.md "Content SDK Import Guidelines" for complete rules.

### Build Workflow

**Recommended workflow:**

1. Create component file
2. Register in component-map.ts
3. **Run `npm run build`**
4. Fix any errors
5. Re-run build until clean
6. Mark component complete

**Do NOT skip build validation** - non-building code is non-functional code.

### Integration with Component Development Workflow

**Updated workflow with build validation:**
```
1. Discover site structure
2. Create Sitecore templates + __Standard Values
3. Create rendering definition + set Parameters Template
4. Add to Available Renderings
5. Create datasource folders
6. Write React component code
7. Register in component-map.ts
8. ⚠️ RUN BUILD AND FIX ERRORS ← NEW MANDATORY STEP
9. Create variants (if needed)
10. Create sample content
11. Publish & test in Pages editor
```

**This prevents deploying non-functional code.**
