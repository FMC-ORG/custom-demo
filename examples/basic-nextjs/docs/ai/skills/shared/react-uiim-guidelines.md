# React UIIM guidelines  
  
## Component location  
Generated React components must live under:  
  
- `src/components/uiim`  
  
Preferred file path pattern:  
  
- `src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`  
  
Examples:  
- `src/components/uiim/banners/hero.tsx`  
- `src/components/uiim/cards/article-cards.tsx`  
  
## Styling and UI system  
Use:  
- Tailwind CSS  
- shadcn/ui components from `@/components/ui/*`  
  
Prefer composition with shadcn primitives such as:  
- `Card`  
- `Button`  
- `Badge`  
- `Separator`  
- `Accordion`  
- `Tabs`  
- `Skeleton`  
  
Avoid:  
- CSS modules unless the repo already uses them for that component area  
- styled-components  
- large custom stylesheet files for simple layout work  
- inline styles unless required for dynamic behavior  
  
## Sitecore field rendering  
For editable Sitecore-managed content, prefer helpers from:  
  
- `@sitecore-content-sdk/nextjs`  
  
Use:  
- `Text`  
- `RichText`  
- `Image`  
- `Link`  
  
Do not replace Sitecore-editable fields with plain JSX text unless the field is not authorable.  
  
## Tailwind + shadcn + Sitecore rule  
Use shadcn for layout and UI primitives.  
Use Sitecore JSS field helpers for editable content values.  
  
Example:  
- shadcn `Card` wraps content  
- Sitecore `Text` renders editable title  
- Sitecore `Link` renders editable CTA  
- Tailwind classes handle spacing/layout  
  
## Utility imports  
If available in the repo, use:  
- `cn` from `@/lib/utils`  
- `buttonVariants` from `@/components/ui/button`  
  
If these local utilities differ, adapt to the repo’s existing pattern.  
  
## Accessibility  
Always prefer:  
- semantic headings  
- visible link/button affordances  
- alt-capable image handling  
- keyboard-accessible interactive components  
- reasonable focus states through shadcn/tailwind patterns  
  
## Props shape rules  
  
### Simple component  
Use default JSS field shape:  
- `fields.Title`  
- `fields.Description`  
- `fields.CtaLink`  
  
### List component  
Use GraphQL datasource shape:  
- parent item: `fields.data.datasource`  
- child items: `fields.data.datasource.children.results`  
- field values via `.jsonValue`  
  
### Context-only component  
Use route context when confirmed:  
- `useSitecoreContext()`  
- `sitecoreContext.route?.fields`  
  
## Example: simple component pattern  
  
```tsx  
import {  
  Field,  
  Image as SitecoreImage,  
  ImageField,  
  Link as SitecoreLink,  
  LinkField,  
  RichText,  
  Text,  
} from '@sitecore-content-sdk/nextjs';  
import { Card, CardContent } from '@/components/ui/card';  
import { buttonVariants } from '@/components/ui/button';  
import { cn } from '@/lib/utils';  
  
type HeroFields = {  
  Title: Field<string>;  
  Description: Field<string>;  
  BackgroundImage: ImageField;  
  CtaLink: LinkField;  
};  
  
type HeroProps = {  
  fields: HeroFields;  
  params?: Record<string, string>;  
};  
  
export default function Hero({ fields }: HeroProps) {  
  return (  
    <section className="py-12 md:py-20">  
      <Card className="overflow-hidden border-0 shadow-none">  
        <CardContent className="grid gap-8 p-6 md:grid-cols-2 md:p-10">  
          <div className="space-y-4">  
            <Text  
              tag="h1"  
              field={fields.Title}  
              className="text-4xl font-semibold tracking-tight md:text-5xl"  
            />  
            <RichText  
              field={fields.Description}  
              className="prose prose-neutral max-w-none"  
            />  
            {fields.CtaLink?.value?.href ? (  
              <SitecoreLink  
                field={fields.CtaLink}  
                className={cn(buttonVariants({ size: 'lg' }))}  
              />  
            ) : null}  
          </div>  
  
          <div className="overflow-hidden rounded-xl">  
            <SitecoreImage  
              field={fields.BackgroundImage}  
              className="h-full w-full object-cover"  
            />  
          </div>  
        </CardContent>  
      </Card>  
    </section>  
  );  
}  