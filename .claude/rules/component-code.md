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
