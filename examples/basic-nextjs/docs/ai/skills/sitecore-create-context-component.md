# Sitecore create context-only component

Use this skill when creating a Sitecore XM Cloud component that renders content from **route/page fields** rather than a datasource item.

## Trigger hints
Use this skill when the component:
- should not have its own datasource item
- should render route/page fields
- may optionally use rendering params
- is page-scoped content such as a page hero, page intro, route banner, or section header driven by page fields

## Do not use this skill when
- the component needs its own datasource item
- the component should be reusable across many pages via datasource selection
- the component contains authorable child items
- the rendering requires `ComponentQuery`

Use instead:
- `docs/ai/skills/sitecore-create-simple-component.md`
- `docs/ai/skills/sitecore-create-list-component.md`

---

## Load first
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md`
- `docs/ai/skills/shared/react-uiim-guidelines.md`
- `docs/ai/templates/sitecore-component-spec.template.yaml`
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`

## Examples
- `docs/ai/examples/sitecore-create-context-component/page-hero.request.md`
- `docs/ai/examples/sitecore-create-context-component/page-hero.spec.yaml`

---

## Inputs to collect

- `siteCollection`
- `siteName`
- `category`
- component PascalCase name
- route/page field list, or confirmation that existing route fields should be used
- route/page template name if known
- optional screenshot paths or attached screenshots
- optional rendering params requirements

---

## Required workflow

1. Read the request.
2. If screenshots are provided, inspect them first.
3. Determine whether the request is truly context-only.
4. Normalize into `docs/ai/templates/sitecore-component-spec.template.yaml`.
5. Apply safe defaults (see below).
6. Ask concise follow-up questions if required information is missing.
7. Before implementation, show:
   - chosen classification
   - inferred route/context field model
   - assumptions
   - completed or partial spec
   - plan
8. Then implement.

If the user asks for an approval gate, stop after the plan and wait.

## Safe defaults
If not explicitly specified:

- `component.kind = context-only`
- `component.filePath = src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`
- `rendering.datasourceRequired = false`
- `rendering.datasourceTemplatePath = ""`
- `rendering.datasourceLocationQuery = ""`
- `rendering.dataSource = ""`
- `rendering.useComponentQuery = false`
- `rendering.componentQuery = ""`
- `react.propsShape = context-route`
- `templates.parent.create = false`
- `templates.child.create = false`
- `folderTemplate.create = false`
- `datasourceFolder.create = false`

---

## Sitecore implementation rules

Use the **Sitecore marketer MCP** whenever Sitecore items must be created or updated.

For a true context-only component, normally create/update only:
1. the Rendering Parameters template
2. the rendering item (with `Parameters Template [shared]` set)
3. the React component file
4. the component map registration
4. optionally page/route template fields if explicitly confirmed or clearly in scope

### Do not create by default
- datasource template
- child template
- folder template
- datasource content folder
- `ComponentQuery`

### Rendering rules
- Create a **JSON Rendering**
- `Datasource Template` must remain empty
- `Datasource Location` must remain empty
- `Data source` must remain empty
- `ComponentQuery` must remain empty
- `AddFieldEditorButton = 1` is still preferred
- The rendering should **not** require datasource selection

### Route/page field rules

If route fields already exist: use them, do not create duplicates.

If route fields do not exist:
- propose the required route/page template changes first
- ask for confirmation before modifying page templates
- avoid collision-prone field names: `id`, `name`, `path`, `url`, `template`, `parent`, `children`, `language`, `version`, `displayName`
- any new or updated template must include `__Standard Values`

### Verification rule

After create/update, verify:
- rendering path and component name
- rendering `Datasource Template` is empty
- rendering `Datasource Location` is empty
- rendering `ComponentQuery` is empty
- rendering does not require datasource
- if route template fields were created: field existence, field `Type`, `__Standard Values`

---

## React implementation rules

- Create under `src/components/uiim/<category-lowercase>/<component-name-kebab>.tsx`
- Use Tailwind CSS
- Use shadcn/ui primitives from `@/components/ui/*`
- Always import from `@sitecore-content-sdk/nextjs`
- Use `useSitecoreContext()` and access `sitecoreContext.route?.fields`
- Preserve editability with `Text`, `RichText`, `Image`, `Link` helpers
- Handle missing route fields safely with optional chaining



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
- the rendering item was created/updated or clearly reported as blocked
- the important Sitecore values were verified or explicitly flagged for follow-up
- any required route template changes were confirmed and executed

Do not silently downgrade unverified Sitecore work to "manual setup required" without explaining why.

---

## Verification checklist

- [ ] Request correctly classified as context-only
- [ ] Shared spec filled before implementation
- [ ] No datasource template created unless explicitly requested
- [ ] No datasource folder created
- [ ] No `ComponentQuery` used
- [ ] Rendering Parameters template created under `renderingParamsRoot/<Category>`
- [ ] Rendering Parameters template base templates set (all four IDs)
- [ ] Rendering created as JSON Rendering
- [ ] `Parameters Template [shared]` set on rendering
- [ ] Rendering does not require datasource
- [ ] React file created under `src/components/uiim`
- [ ] TSX uses `useSitecoreContext()` + `sitecoreContext.route?.fields`
- [ ] TSX imports from `@sitecore-content-sdk/nextjs`
- [ ] Tailwind used
- [ ] shadcn/ui primitives used where appropriate
- [ ] Sitecore SDK editable helpers used for authorable fields
- [ ] Component map updated with kebab-case key
- [ ] TSX uses named exports (`export const Default`, not `export default`)
- [ ] Empty-state fallback component included
- [ ] Headless Variants container item exists in Sitecore
- [ ] `Default` Variant Definition item created under Headless Variants container
- [ ] If page template changed, `__Standard Values` created
