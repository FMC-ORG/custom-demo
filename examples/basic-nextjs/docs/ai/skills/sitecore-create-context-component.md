# Sitecore create context-only component  
  
## Use when  
- the component should **not** use its own datasource item  
- the component renders content from **route/page fields**  
- the component may optionally use **rendering params**  
- the component is page-scoped content rather than reusable datasource content  
  
Examples:  
- PageHero  
- PageIntro  
- RouteBanner  
- PageHeader  
- Page-level CTA driven by route fields  
  
## Do not use when  
Do **not** use this workflow if:  
- the component needs its own datasource item  
- the component should be reusable across many pages via datasource selection  
- the component contains authorable child items  
- the rendering requires `ComponentQuery`  
  
In those cases, use:  
- `docs/ai/skills/sitecore-create-simple-component.md`  
- `docs/ai/skills/sitecore-create-list-component.md`  
  
## Load first  
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`  
- `docs/ai/skills/shared/react-uiim-guidelines.md`  
- `docs/ai/templates/sitecore-component-spec.template.yaml`  
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`  
  
## Examples  
- `docs/ai/examples/sitecore-create-context-component/page-hero.request.md`  
- `docs/ai/examples/sitecore-create-context-component/page-hero.spec.yaml`  
  
## Required inputs  
- `siteCollection`  
- `siteName`  
- `category`  
- component PascalCase name  
- route/page field list, or confirmation that existing route fields should be used  
- route/page template name if known  
- optional screenshot paths or attached screenshots  
- optional rendering params requirements  
  
## Visual reference handling  
If the user attaches screenshots or provides image paths:  
  
1. Inspect the screenshot first.  
2. Summarize visible UI elements:  
   - heading  
   - body text  
   - image/media  
   - labels/badges  
   - CTA links/buttons  
   - background treatments  
   - page-level decorative content  
3. Infer likely route fields.  
4. Determine whether the design is truly **context-only** or should actually be:  
   - simple datasource  
   - list datasource  
5. Populate:  
   - `design.references`  
   - `design.extractedLayout`  
   - `design.assumptions`  
   - `design.openQuestions`  
6. Do not invent hidden behavior unless explicitly requested.  
  
## Mandatory process  
1. Read the request.  
2. If screenshots are provided, inspect them first.  
3. Determine whether the request is truly context-only.  
4. Normalize the task into `docs/ai/templates/sitecore-component-spec.template.yaml`.  
5. Infer safe defaults.  
6. Ask concise follow-up questions if required information is missing.  
7. Before implementation, show:  
   - chosen classification  
   - inferred route/context field model  
   - assumptions  
   - completed or partially completed spec  
   - plan  
8. Then implement.  
  
## Safe defaults  
If not explicitly specified:  
  
- `component.kind = context-only`  
- `component.nameKebab` = kebab-case of the PascalCase name  
- `component.filePath = src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`  
- `component.componentMapKey = component.nameKebab`  
- `rendering.componentName = component.nameKebab`  
- `rendering.datasourceRequired = false`  
- `rendering.datasourceTemplatePath = ""`  
- `rendering.datasourceLocationQuery = ""`  
- `rendering.dataSource = ""`  
- `rendering.useComponentQuery = false`  
- `rendering.componentQuery = ""`  
- `react.propsShape = context-route`  
- `context.usesRouteFields = true`  
- `templates.parent.create = false`  
- `templates.child.create = false`  
- `folderTemplate.create = false`  
- `datasourceFolder.create = false`  
  
## Required follow-up questions  
Ask follow-up questions when any of these are unclear:  
  
- Which page/route template owns the fields?  
- Are the needed route fields already present?  
- If not, is the agent allowed to create/update the route template?  
- Are rendering params needed?  
- Should the component render only on certain templates/routes?  
- Is the content page-specific or intended to be reusable?  
  
## Sitecore implementation rules  
Use the **Sitecore marketer MCP** whenever Sitecore items must be created or updated.  
  
For a true context-only component, normally create/update only:  
1. the rendering item  
2. the React component file  
3. the component map registration  
4. optionally page/route template fields if explicitly confirmed or clearly in scope  
  
### Do not create by default  
For a true context-only component, do **not** create unless explicitly requested:  
- datasource template  
- child template  
- folder template  
- datasource content folder  
- `ComponentQuery`  
  
## Rendering rules  
- Create a **JSON Rendering** unless the repo explicitly requires otherwise.  
- `Datasource Template` must remain empty.  
- `Datasource Location` must remain empty.  
- `Data source` must remain empty.  
- `ComponentQuery` must remain empty.  
- `AddFieldEditorButton = 1` is still preferred unless project conventions differ.  
- The rendering should **not** require datasource selection.  
  
## Route/page field rules  
### If route fields already exist  
- Use the existing route/page fields.  
- Do not create duplicate fields with new names.  
- Match field names exactly to the actual Sitecore template when possible.  
  
### If route fields do not exist  
- Propose the required route/page template changes first.  
- Ask for confirmation before modifying page templates unless the user already requested that scope.  
- If creating/updating route templates:  
  - use the Sitecore marketer MCP  
  - create required fields under the correct section  
  - create/update `__Standard Values`  
  - avoid collision-prone GraphQL names:  
    - `icon`  
    - `id`  
    - `name`  
    - `path`  
    - `url`  
    - `template`  
    - `parent`  
    - `children`  
    - `language`  
    - `version`  
    - `displayName`  
  
### Field modeling guidance  
Map common page UI to route fields like:  
  
- Title -> `Title`  
- Eyebrow -> `EyebrowText`  
- Description -> `Description`  
- Hero image -> `HeroImage`  
- CTA -> `PrimaryLink`  
- Secondary CTA -> `SecondaryLink`  
- Background image -> `BackgroundImage`  
  
Prefer descriptive, non-conflicting field names.  
  
## React implementation rules  
- Create the component under:  
  - `src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`  
- Use:  
  - Tailwind CSS  
  - shadcn/ui primitives from `@/components/ui/*`  
  - Sitecore JSS helpers from `@sitecore-jss/sitecore-jss-nextjs`  
- Prefer route access via:  
  - `useSitecoreContext()`  
  - `sitecoreContext.route?.fields`  
  
### Authorable field rendering  
Keep route fields editable using:  
- `Text`  
- `RichText`  
- `Image`  
- `Link`  
  
Do not replace authorable fields with plain JSX strings unless the field is definitely not Sitecore-managed.  
  
### Preferred implementation pattern  
- Use shadcn components for structure and interaction  
- Use Tailwind for spacing, layout, and responsive styling  
- Use Sitecore JSS helpers for editable content  
- Keep the component typed  
- Gracefully handle missing route fields  
  
## Suggested React pattern  
Use a structure similar to this:  
  
```tsx  
import {  
  Field,  
  Image as SitecoreImage,  
  ImageField,  
  Link as SitecoreLink,  
  LinkField,  
  RichText,  
  Text,  
  useSitecoreContext,  
} from '@sitecore-jss/sitecore-jss-nextjs';  
import { Card, CardContent } from '@/components/ui/card';  
import { buttonVariants } from '@/components/ui/button';  
import { cn } from '@/lib/utils';  
  
type PageHeroRouteFields = {  
  EyebrowText?: Field<string>;  
  Title?: Field<string>;  
  Description?: Field<string>;  
  HeroImage?: ImageField;  
  PrimaryLink?: LinkField;  
};  
  
export default function PageHero() {  
  const { sitecoreContext } = useSitecoreContext();  
  const routeFields = (sitecoreContext?.route?.fields ?? {}) as PageHeroRouteFields;  
  
  return (  
    <section className="py-12 md:py-20">  
      <Card className="overflow-hidden border-0 shadow-none">  
        <CardContent className="grid gap-8 p-6 md:grid-cols-2 md:p-10">  
          <div className="space-y-4">  
            {routeFields.EyebrowText ? (  
              <Text  
                tag="p"  
                field={routeFields.EyebrowText}  
                className="text-sm font-medium uppercase tracking-wider text-muted-foreground"  
              />  
            ) : null}  
  
            {routeFields.Title ? (  
              <Text  
                tag="h1"  
                field={routeFields.Title}  
                className="text-4xl font-semibold tracking-tight md:text-5xl"  
              />  
            ) : null}  
  
            {routeFields.Description ? (  
              <RichText  
                field={routeFields.Description}  
                className="prose prose-neutral max-w-none"  
              />  
            ) : null}  
  
            {routeFields.PrimaryLink?.value?.href ? (  
              <SitecoreLink  
                field={routeFields.PrimaryLink}  
                className={cn(buttonVariants({ size: 'lg' }))}  
              />  
            ) : null}  
          </div>  
  
          {routeFields.HeroImage ? (  
            <div className="overflow-hidden rounded-xl">  
              <SitecoreImage  
                field={routeFields.HeroImage}  
                className="h-full w-full object-cover"  
              />  
            </div>  
          ) : null}  
        </CardContent>  
      </Card>  
    </section>  
  );  
}  