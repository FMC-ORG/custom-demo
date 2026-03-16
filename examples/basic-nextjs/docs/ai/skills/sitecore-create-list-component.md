# Sitecore create list component

Use this skill when creating a Sitecore XM Cloud component with a **parent datasource item** containing **authorable child items**, where the rendering requires `ComponentQuery`.

## Trigger hints
Use this skill when the component:
- has repeated authorable items
- needs parent + child datasource structure
- is a card grid, FAQ, accordion, tabs, slider, testimonial list, or similar
- should be author-managed from datasource children

## Do not use this skill when
- the component only needs one datasource item with no child items
- the rendering should not use `ComponentQuery`
- the component should render from route/page context only

Use instead:
- `docs/ai/skills/sitecore-create-simple-component.md`
- `docs/ai/skills/sitecore-create-context-component.md`

---

## Load first
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`
- `docs/ai/skills/shared/react-uiim-guidelines.md`
- `docs/ai/templates/sitecore-component-spec.template.yaml`
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`

## Examples
- `docs/ai/examples/sitecore-create-list-component/article-cards.request.md`
- `docs/ai/examples/sitecore-create-list-component/article-cards.spec.yaml`

---

## Inputs to collect

- `siteCollection`
- `siteName`
- `category`
- parent template name and field list
- child template name and field list
- optional screenshot paths or attached screenshots

---

## Required workflow

1. Read the request.
2. If screenshots are provided, inspect them first.
3. Confirm the request is a **list / parent-child datasource** component.
4. Normalize into `docs/ai/templates/sitecore-component-spec.template.yaml`.
5. Apply safe defaults (see below).
6. Ask concise follow-up questions if required values are missing.
7. Before implementation, show:
   - chosen classification
   - inferred layout
   - inferred parent and child field models
   - assumptions
   - completed or partial spec
   - plan
8. Then implement.

If the user asks for an approval gate, stop after the plan and wait.

## Safe defaults
If not explicitly specified:

- `component.kind = list`
- `component.filePath = src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`
- `rendering.datasourceRequired = true`
- `rendering.useComponentQuery = true`
- `react.propsShape = graphql-datasource`
- `templates.parent.standardValues.addHorizonDatasourceGrouping = true`
- `folderTemplate.name = <Component Name> Folder`
- `datasourceFolder.name = <Component Name>`

---

## Sitecore implementation rules

Use the **Sitecore marketer MCP** whenever Sitecore items must be created or updated.

Only fall back to manual/serialization output when:
- a specific MCP action fails
- permissions block the action
- repo governance explicitly requires serialized definitions

### Creation order

1. resolve or create parent container structure
2. parent template
3. parent `Data` section
4. parent field items — explicitly set each field `Type`
5. parent `__Standard Values`
6. child template
7. child `Data` section
8. child field items — explicitly set each field `Type`
9. child `__Standard Values`
10. folder template
11. folder template `__Standard Values`
12. set folder insert options / `__Masters` to parent template
13. datasource folder under `/sitecore/content/<siteCollection>/<siteName>/Data/`
14. create an example parent datasource item inside the folder (using the parent template)
15. create one or two example child items inside the parent item (using the child template)
16. create Rendering Parameters template under `renderingParamsRoot/<Category>/<ComponentName>`
17. set all four base templates on the Rendering Parameters template
18. rendering item
19. update rendering fields including `ComponentQuery` and `Parameters Template [shared]`
20. verify final state

### Parent resolution

Before creating child items:
- resolve parents with `get_content_item_by_path`
- use resolved item IDs
- do not guess IDs

### Template field rule

For each field:
- create the field item under the correct template section
- explicitly set the field item `Type`
- verify the resulting field type after update

Common field types: `Single-Line Text`, `Rich Text`, `Image`, `General Link`

### `__Standard Values` rule

- `name = "__Standard Values"`
- `parentId = owning template item ID`
- `templateId = owning template item ID`

Applies to parent, child, and folder templates.

Do **not** use the Standard template ID `1930bbeb-7805-471a-a3be-4858ac7cf696`.

### Parent/child rules

- Parent `__Standard Values` must set `__Masters` to the **child template**
- Parent must inherit `_HorizonDatasourceGrouping`
- Folder template `__Standard Values` must set `__Masters` to the **parent template**

### Rendering rules

- Must be a **JSON Rendering**
- `Datasource Template` must be a **full Sitecore path**, never a GUID
- `Datasource Location` must point to the folder template pattern
- `ComponentQuery` is **mandatory**
- `AddFieldEditorButton = 1`

### Preferred ComponentQuery pattern

```graphql
query ComponentName($datasource: String!, $language: String!) {
  datasource: item(path: $datasource, language: $language) {
    ... on ParentTemplateName {
      title { jsonValue }
    }
    children {
      results {
        ... on ChildTemplateName {
          id
          title { jsonValue }
          image { jsonValue }
          link { jsonValue }
        }
      }
    }
  }
}
```


### Example datasource item rule

After creating the datasource folder, create one example content item inside it.

This ensures:
- the datasource picker is not empty when the component is first used
- authors have something to duplicate or edit immediately
- the component can render in Experience Editor without manual content creation

**Simple component:** create one item using the datasource template. Name it after the component (e.g. `Hero`, `Promo Banner`). Use `__Standard Values` defaults for field values — do not invent placeholder copy.

**List component:** create one parent item using the parent template, then create one or two child items using the child template inside the parent.

Use `get_content_item_by_path` to resolve the folder, then `create_content_item` with:
- `parentId` = datasource folder item ID
- `templateId` = datasource template item ID
- `name` = component name

Verify with `get_content_item_by_id` after creation.

---

### Verification rule

After create/update, verify:
- parent and child template paths, sections, fields, and `Type` values
- parent and child `__Standard Values`
- parent `__Masters` points to child template
- parent inherits `_HorizonDatasourceGrouping`
- folder template `__Standard Values` sets `__Masters` to parent template
- datasource folder path
- rendering datasource template (full path), datasource location, `ComponentQuery`, component name

---

## React implementation rules

- Create under `src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`
- Use Tailwind CSS
- Use shadcn/ui primitives from `@/components/ui/*`
- Always import from `@sitecore-content-sdk/nextjs`
- Use GraphQL datasource shape:
  - `fields.data.datasource` for the parent item
  - `fields.data.datasource.children.results` for child items
  - `.jsonValue` for all authorable field values
- Default `children.results` to `[]` if undefined
- Return `null` if the datasource is missing
- Preserve editability with `Text`, `RichText`, `Image`, `Link` helpers



### Rendering Parameters template rule

Every rendering requires a Rendering Parameters template. Create it before the rendering item.

**Path:** `renderingParamsRoot/<Category>/<ComponentName>`

Where `renderingParamsRoot` = `projectTemplatesRoot` + `/Rendering Parameters`

**Steps:**
1. Resolve or create the Category folder under `renderingParamsRoot`
2. Create the Rendering Parameters template item (using the standard Template template ID)
3. Set `Base template` to all four required base templates (pipe-separated):
   ```
   {4247AAD4-EBDE-4994-998F-E067A51B1FE4}|{5C74E985-E055-43FF-B28C-DB6C6A6450A2}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}|{3DB3EB10-F8D0-4CC9-BE26-18CE7B139EC8}
   ```
4. Verify the template exists with correct base templates via MCP
5. Then create the rendering item and set `Parameters Template [shared]` to this template's full path

This applies to **all component types** — simple, list, and context-only.

---

### Named exports and variants rule

Every XM Cloud component must use **named exports**, not `export default` for the component function. This is required for the Sitecore variant mechanism to work.

Always export at least `Default`. Each additional named export corresponds to a variant:

```tsx
export const Default = ({ fields }: HeroProps): JSX.Element => {
  if (!fields) return <HeroDefaultComponent />;
  return ( ... );
};

export const Centered = ({ fields }: HeroProps): JSX.Element => {
  if (!fields) return <HeroDefaultComponent />;
  return ( ... );
};
```

Include a non-exported empty-state fallback:

```tsx
const HeroDefaultComponent = (): JSX.Element => (
  <div className="component">
    <span className="is-empty-hint">ComponentName</span>
  </div>
);
```

If variants are needed beyond `Default`, use `docs/ai/skills/sitecore-add-variants.md` to create the Sitecore Variant Definition items.

### Component map rule

When a new component is created:
- update `.sitecore/component-map.ts`
- use **kebab-case** for the map key
- follow the existing naming pattern in the file

---

## Output format

Before implementation:
1. chosen workflow
2. classification
3. assumptions
4. completed or partial spec
5. plan

After implementation:
1. Sitecore actions performed
2. MCP/item operations performed
3. files changed
4. verification results
5. any follow-up verification or serialization requirements

---

## Completion rule

A task is only fully complete when:
- the React component is implemented
- the component map is updated when required
- the needed Sitecore items were created/updated or clearly reported as blocked
- the important Sitecore values were verified or explicitly flagged for follow-up

Do not silently downgrade unverified Sitecore work to "manual setup required" without explaining why.

---

## Verification checklist

- [ ] Request correctly classified as list component
- [ ] Shared spec filled before implementation
- [ ] Parent template created
- [ ] Child template created
- [ ] Parent template fields created with explicit `Type`
- [ ] Child template fields created with explicit `Type`
- [ ] Parent `__Standard Values` created (using owning template ID)
- [ ] Child `__Standard Values` created (using owning template ID)
- [ ] Parent `__Masters` points to child template
- [ ] Parent inherits `_HorizonDatasourceGrouping`
- [ ] Folder template created
- [ ] Folder template `__Standard Values` created
- [ ] Folder template `__Masters` points to parent template
- [ ] Datasource folder created under `/Data`
- [ ] Example parent datasource item created inside the folder
- [ ] Example child items created inside the parent item
- [ ] Rendering Parameters template created under `renderingParamsRoot/<Category>`
- [ ] Rendering Parameters template base templates set (all four IDs)
- [ ] Rendering created as JSON Rendering
- [ ] `Parameters Template [shared]` set on rendering
- [ ] `Datasource Template` uses full Sitecore path
- [ ] `ComponentQuery` exists and matches the component
- [ ] React file created under `src/components/uiim`
- [ ] TSX reads `fields.data.datasource.children.results`
- [ ] TSX uses `.jsonValue`
- [ ] TSX imports from `@sitecore-content-sdk/nextjs`
- [ ] Tailwind used
- [ ] shadcn/ui primitives used where appropriate
- [ ] TSX uses named exports (`export const Default`, not `export default`)
- [ ] Empty-state fallback component included
- [ ] Headless Variants container item exists in Sitecore
- [ ] `Default` Variant Definition item created under Headless Variants container
- [ ] Component map updated with kebab-case key
