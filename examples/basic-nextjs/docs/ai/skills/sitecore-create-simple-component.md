# Sitecore create simple component

Use this skill when creating a Sitecore XM Cloud component backed by a **single datasource item**.

## Trigger hints
Use this skill when the component:
- uses a single datasource item
- is a hero, promo, CTA, content block, image/text block, or quote block
- should be reusable by selecting a datasource item
- does not have repeated child datasource content

## Do not use this skill when
- the component needs repeated child items
- authors must create nested cards/rows/FAQ items/testimonials
- the rendering depends on `ComponentQuery`
- the component requires authorable collections of child datasource items

Use instead:
- `docs/ai/skills/sitecore-create-list-component.md`
- `docs/ai/skills/sitecore-create-context-component.md`

---

## Load first
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`
- `docs/ai/skills/shared/react-uiim-guidelines.md`
- `docs/ai/templates/sitecore-component-spec.template.yaml`
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`

## Examples
- `docs/ai/examples/sitecore-create-simple-component/hero.request.md`
- `docs/ai/examples/sitecore-create-simple-component/hero.spec.yaml`
- `docs/ai/examples/sitecore-create-simple-component/promo-banner.spec.yaml`

---

## Inputs to collect

Confirm or infer:
- component name
- category/grouping
- site collection and site name
- rendering name
- datasource template name
- folder template name
- React file path
- field names and field types
- screenshot/design reference if provided
- whether datasource is required
- whether repo process expects direct MCP item creation or serialization

If required information is missing, ask concise follow-up questions first.

---

## Required workflow

1. Classify the request as a simple datasource component.
2. Inspect screenshots/design references before implementation.
3. Normalize into `docs/ai/templates/sitecore-component-spec.template.yaml`.
4. Apply safe defaults (see below).
5. State assumptions clearly.
6. Before implementation, return:
   - chosen workflow
   - classification
   - assumptions
   - completed or partial spec
   - plan
7. Then implement.

If the user wants approval first, stop after the plan.

## Safe defaults
If not explicitly specified:

- `component.kind = simple`
- `component.filePath = src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`
- `rendering.datasourceRequired = true`
- `rendering.useComponentQuery = false`
- `rendering.componentQuery = ""`
- `react.propsShape = default-jss`

---

## Sitecore implementation rules

### Marketer MCP first

Use marketer MCP first for Sitecore item operations, including:
- datasource templates
- template sections
- template fields
- template `__Standard Values`
- folder templates
- folder template `__Standard Values`
- datasource folders
- renderings

Do not claim marketer MCP cannot create templates or renderings by default.

Only fall back to manual/serialization/patch-ready output when:
- a specific MCP action fails
- permissions block the change
- repo governance requires serialized definitions

---

### Creation order

1. resolve or create the folder/container structure
2. create datasource template
3. create template section
4. create template fields
5. explicitly set each field item `Type`
6. create template `__Standard Values`
7. create folder template
8. create folder template `__Standard Values`
9. set folder insert options / `__Masters`
10. create datasource folder under `/sitecore/content/<siteCollection>/<siteName>/Data`
11. create an example datasource item inside the folder (using the datasource template)
12. create Rendering Parameters template under `renderingParamsRoot/<Category>/<ComponentName>`
13. set all four base templates on the Rendering Parameters template
14. create rendering item
15. update rendering fields including `Parameters Template [shared]`
16. verify final state

---

### Parent resolution

Before creating child items:
- resolve parents with `get_content_item_by_path`
- use resolved item IDs
- do not guess IDs

---

### Template field rule

When creating template fields:
- create the field item under the correct section
- explicitly set the field item `Type`
- verify the final `Type`

Common field types:
- `Single-Line Text`
- `Rich Text`
- `Image`
- `General Link`

If needed, also set `Source`, `Shared`, `Unversioned`.

Do not assume the field type is correct by default.

---

### `__Standard Values` rule

To create `__Standard Values` for a template via MCP:
- `name = "__Standard Values"`
- `parentId = owning template item ID`
- `templateId = owning template item ID`

This applies to datasource templates and folder templates.

Do **not** use the Standard template ID `1930bbeb-7805-471a-a3be-4858ac7cf696`.

---

### Folder template rule

When creating a datasource folder template:
- create the folder template item
- create its `__Standard Values` using the folder template's own item ID as both `parentId` and `templateId`
- set insert options / `__Masters` so authors can create the correct datasource items inside the folder

Use exact field names returned by MCP inspection when updating insert options.

---

### Rendering rule

Prefer **JSON Rendering** unless repo convention differs.

For simple datasource components:
- datasource should normally be required
- `ComponentQuery` must remain empty
- `AddFieldEditorButton = 1` is preferred
- `Datasource Template` must use a full Sitecore path

Use exact field names returned by MCP inspection when updating the item.

---


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

Prefer MCP-based verification first. Verify:
- template path and section
- field existence and `Type`
- template `__Standard Values` is based on owning template
- folder template `__Standard Values` is based on owning folder template
- folder insert options / `__Masters`
- datasource folder path
- rendering datasource template, datasource location, component name

If something cannot be reliably verified through MCP, state that explicitly and mark it as follow-up required.

---

## React implementation rules

- Create under `src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`
- Use Tailwind CSS
- Use shadcn/ui primitives from `@/components/ui/*`
- Always import from `@sitecore-content-sdk/nextjs`
- Use top-level field access: `fields.Title`, `fields.Description`, `fields.PrimaryLink`, `fields.HeroImage`
- Preserve editability with `Text`, `RichText`, `Image`, `Link` helpers
- Do not model repeated child items in this workflow



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
5. follow-up verification or serialization requirements

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

- [ ] Request correctly classified as simple component
- [ ] Shared spec filled before implementation
- [ ] Datasource template created
- [ ] Template section created
- [ ] Template fields created with explicit `Type`
- [ ] `__Standard Values` created (using owning template ID, not Standard template ID)
- [ ] Folder template created
- [ ] Folder template `__Standard Values` created
- [ ] Folder template `__Masters` points to datasource template
- [ ] Datasource folder created under `/Data`
- [ ] Example datasource item created inside the folder
- [ ] Rendering Parameters template created under `renderingParamsRoot/<Category>`
- [ ] Rendering Parameters template base templates set (all four IDs)
- [ ] Rendering created as JSON Rendering
- [ ] `Parameters Template [shared]` set on rendering
- [ ] `Datasource Template` uses full Sitecore path
- [ ] `Datasource Location` is valid
- [ ] `ComponentQuery` is empty
- [ ] React file created under `src/components/uiim`
- [ ] TSX uses top-level `fields.<FieldName>`
- [ ] TSX imports from `@sitecore-content-sdk/nextjs`
- [ ] Tailwind used
- [ ] shadcn/ui primitives used where appropriate
- [ ] TSX uses named exports (`export const Default`, not `export default`)
- [ ] Empty-state fallback component included
- [ ] Headless Variants container item exists in Sitecore
- [ ] `Default` Variant Definition item created under Headless Variants container
- [ ] Component map updated with kebab-case key
