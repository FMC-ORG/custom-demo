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
- `docs/ai/skills/sitecore-maintain-manifest.md`

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
6. Read `docs/ai/manifests/sitecore-manifest.yaml`.
   - If the component exists with `status: complete`, confirm with user before re-creating.
   - If `status: partial` or `failed`, resume using recorded item IDs.
   - If not found, register a `planned` entry.
7. Ask concise follow-up questions if required values are missing.
8. Before implementation, show:
   - chosen classification
   - inferred layout
   - inferred parent and child field models
   - assumptions
   - completed or partial spec
   - plan
9. Then implement.

If the user asks for an approval gate, stop after the plan and wait.

## Safe defaults
If not explicitly specified:

- `component.kind = list`
- `component.filePath = src/components/uiim/<category-kebab>/<ComponentNamePascal>.tsx`
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

0. Check `docs/ai/manifests/sitecore-manifest.yaml` → `lookups` for cached parent item IDs. Use cached IDs for structural paths instead of resolving via MCP. If lookups are empty (first task), resolve all 6 required structural paths and populate lookups before proceeding.
1. resolve or create parent container structure:
   - resolve `projectTemplatesRoot/Components` via `get_content_item_by_path`. If it does not exist, create it using template folder ID `0437fee2-44c9-46a6-abe9-28858d9fee8c`.
   - resolve or create the `<Category>` subfolder under `Components` (same template folder ID).
   - do the same for `renderingsRoot/<Category>` and `renderingParamsRoot/<Category>`.
   - **⚠️ IMPORTANT: If creating NEW category folders, create ALL 3 category folders FIRST in their own batch and wait for IDs. Only create templates in the NEXT batch. Creating templates in the same batch as their category folders risks placing them under the wrong parent (race condition).**
2. parent template
3. set `__Base template` on parent template to `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}` (Standard Template + Grid Parameters). This applies to all datasource templates, **not** folder templates.
4. parent `Data` section
5. parent field items — explicitly set each field `Type`
6. parent `__Standard Values`
7. link parent template to its `__Standard Values` — set the `Standard values` field on the parent template item to the `__Standard Values` Item ID
8. child template
9. set `__Base template` on child template to `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}`
10. child `Data` section
11. child field items — explicitly set each field `Type`
12. child `__Standard Values`
13. link child template to its `__Standard Values` — same as step 7
14. folder template
15. folder template `__Standard Values`
16. link folder template to its `__Standard Values` — same as step 7
17. set folder insert options / `__Masters` to parent template
15. datasource folder under `/sitecore/content/<siteCollection>/<siteName>/Data/`
16. set insert options on the datasource folder item itself (not only on the folder template `__Standard Values`)
17. create an example parent datasource item inside the folder (using the parent template)
18. create one or two example child items inside the parent item (using the child template)
19. create Rendering Parameters template under `renderingParamsRoot/<Category>/<ComponentName>`
20. set all four base templates on the Rendering Parameters template
21. rendering item
22. update rendering fields via MCP. Use these known MCP field names:
    - `componentName` = PascalCase component name matching TSX filename
    - `Parameters Template` = Item ID (GUID) of the Rendering Parameters template
    - `AddFieldEditorButton` = `1`
    - `ComponentQuery` = the GraphQL query
    - `Datasource Template` = full Sitecore path to the parent datasource template (silent-write — `updatedFields` will be empty, this is normal)
    - `Datasource Location` = dynamic query (silent-write). Use the standard pattern: `query:$site/*[@@name='Data']/*[@@templatename='<FolderTemplateName>']|query:$sharedSites/*[@@name='Data']/*[@@templatename='<FolderTemplateName>']`
23. register the rendering in Available Renderings
24. register the rendering in Available Renderings — **read the current value** of the `Renderings` field on the **Page Content** Available Renderings item, then **concatenate** (not replace) the new rendering ID with a pipe separator. Path: at `/sitecore/content/<siteCollection>/<siteName>/Presentation/Available Renderings/Page Content`
25. verify final state

### Batch operations cheat sheet (list component)

Optimize MCP calls by batching independent operations. This is the proven sequence from 8+ list components:

```
Batch 1 (if new category): Create 3 category folders (Components, Rendering Parameters, Renderings)
   ↓ wait for IDs
Batch 2: Create parent template + child template + folder template (parallel)
Batch 3: Set base templates on both datasource templates + create both Data sections (parallel)
Batch 4: Create all fields — parent + child (parallel)
Batch 5: Set all field types (parallel)
Batch 6: Create all 3 __Standard Values (parallel)
Batch 7: Link all SVs + set defaults + set __Masters + create datasource folder + rendering params + rendering (all parallel)
Batch 8: Set folder insert options + rendering params base templates + rendering fields + create example parent + create variants container (all parallel)
Batch 9: Create example children + all variant definitions (parallel)
Batch 10: Ask user for Available Renderings value → append
```

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

After creating `__Standard Values`, **link it to the template**: set the `Standard values` field on the **template item** to the Item ID of the newly created `__Standard Values` item. Without this step, the template does not recognize its default values.

> **Note:** The `Standard values` field update may return empty `updatedFields` — this is a silent-write field. This is **not** a failure. Verify in Content Editor if needed.

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
- `Component Name [shared]` must be **PascalCase** and **exactly match** the TSX filename without extension (e.g. `ArticleCards` for `ArticleCards.tsx`)
- `Parameters Template [shared]` must be set to the **Item ID (GUID)** of the Rendering Parameters template — **never use a path**. Resolve the ID via MCP after creating the Rendering Parameters template.

### Preferred ComponentQuery pattern

**Always use the generic `field(name: "...")` accessor** instead of `... on TemplateName` fragments. XM Cloud instances often have multiple templates with the same name (from SXA, Foundation, Feature layers), which causes `... on` fragments to silently fail when the GraphQL type is disambiguated with a GUID suffix.

```graphql
query ComponentName($datasource: String!, $language: String!) {
  datasource: item(path: $datasource, language: $language) {
    title: field(name: "Title") { jsonValue }
    children {
      results {
        id
        title: field(name: "Title") { jsonValue }
        image: field(name: "Image") { jsonValue }
        link: field(name: "Link") { jsonValue }
      }
    }
  }
}
```

**Rules:**
- Use `field(name: "FieldName")` where `FieldName` is the **exact Sitecore field name** (PascalCase as created in the template)
- Use GraphQL aliases (camelCase) before the `field()` call to keep the data shape clean: `title: field(name: "Title")`
- Always include `id` in children results (required for React keys)
- Always wrap with `{ jsonValue }`
- **Do NOT use** `... on TemplateName` fragments — they are fragile in shared XM Cloud environments

**Avoided pattern (causes silent failures):**
```graphql
# ❌ DO NOT USE — breaks when template name conflicts exist
... on ParentTemplateName { title { jsonValue } }
children { results { ... on ChildTemplateName { id title { jsonValue } } } }
```


### Example datasource item rule

After creating the datasource folder, create one example content item inside it.

This ensures:
- the datasource picker is not empty when the component is first used
- authors have something to duplicate or edit immediately
- the component can render in Experience Editor without manual content creation

**Simple component:** create one item using the datasource template. Name it after the component (e.g. `Hero`, `Promo Banner`).

**List component:** create one parent item using the parent template, then create one or two child items using the child template inside the parent.

#### Field values for example items

- **If the user provided a screenshot or design reference:** populate the example item fields with content that matches the design — extract text, headings, descriptions, image URLs, and link targets from the visual reference. The goal is for the component to render identically to the design from day one.
- **If the user provided a URL in the prompt:** use it to extract real content for the example item fields (text, images, links visible on the page).
- **If no visual reference was provided:** use `__Standard Values` defaults where set. If no defaults exist, leave fields empty — do not invent placeholder copy.

Use `get_content_item_by_path` to resolve the folder, then `create_content_item` with:
- `parentId` = datasource folder item ID
- `templateId` = datasource template item ID
- `name` = component name

Verify with `get_content_item_by_id` after creation.

---

### Datasource template base templates rule

Every datasource template (parent and child) must inherit these two base templates. This does **not** apply to folder templates.

Set `__Base template` to:
```
{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}
```

| ID | Purpose |
|---|---|
| `{1930BBEB-7805-471A-A3BE-4858AC7CF696}` | Standard Template |
| `{44A022DB-56D3-419A-B43B-E27E4D8E9C41}` | Grid Parameters |

Set this immediately after creating each datasource template item, before creating sections or fields.

---

### Insert options on datasource folder instance rule

After creating the datasource folder under `/Data`, you must set insert options **on the folder item itself** — not only on the folder template's `__Standard Values`.

Use `update_fields_on_content_item` on the datasource folder item to set insert options / `__Masters` pointing to the parent datasource template.

Without this step, authors cannot create new datasource items inside the folder.

---

### Available Renderings rule

After creating the rendering item, you must register it in the site's **Available Renderings** so it appears in the Experience Editor / Pages editor.

**Always add the rendering to the Page Content Available Renderings item:**
- Path: `/sitecore/content/<siteCollection>/<siteName>/Presentation/Available Renderings/Page Content`

**⚠️ CRITICAL: The `Renderings` field is both silent-write AND silent-read.** MCP cannot read the current value. If you write a value without knowing the current contents, you will **replace** all existing renderings and break the page editor.

**Steps:**
1. Resolve the Page Content Available Renderings item via `get_content_item_by_path` (cache the `itemId` in lookups)
2. **Ask the user for the current `Renderings` field value** — MCP cannot read it. The user must copy it from Content Editor.
3. **Concatenate** the new rendering's Item ID to the existing value with a pipe separator. **Do NOT replace the existing value** — overwriting it removes all other components from the page editor.
4. Update the `Renderings` field with the concatenated value

**Example:** If the current value is `{A8DB4692-0731-4067-A224-79EFFF24C639}` and the new rendering ID is `{B1234567-ABCD-1234-EFGH-123456789ABC}`, the updated value must be:
```
{A8DB4692-0731-4067-A224-79EFFF24C639}|{B1234567-ABCD-1234-EFGH-123456789ABC}
```
Never set it to just `{B1234567-ABCD-1234-EFGH-123456789ABC}` — that would remove the existing rendering.

**If you cannot get the current value from the user**, track the last-known value in the manifest. But always warn the user that another session or manual edit may have changed it.

Do **not** skip this step. Without it, authors cannot add the component to pages.

---

### Component Name rule

The `Component Name [shared]` field on the rendering item must be set to the **PascalCase** name that **exactly matches** the TSX filename without extension.

Examples:
- TSX file: `ArticleCards.tsx` → Component Name: `ArticleCards`
- TSX file: `Hero.tsx` → Component Name: `Hero`

Do **not** use kebab-case or camelCase. The Next.js component resolver uses this value to find the React component file.

---

### Verification rule

After create/update, verify:
- parent and child template paths, sections, fields, and `Type` values
- parent and child datasource template `Base template` includes `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}`
- parent and child `__Standard Values`
- parent `__Masters` points to child template
- parent inherits `_HorizonDatasourceGrouping`
- folder template `__Standard Values` sets `__Masters` to parent template
- datasource folder path
- insert options set on datasource folder instance (not only on folder template)
- `Component Name [shared]` is PascalCase matching TSX filename
- `Parameters Template [shared]` is set to the Item ID (GUID), not a path
- rendering datasource template (full path), datasource location, `ComponentQuery`, component name
- rendering is registered in Available Renderings (Page Content)

---

## React implementation rules

- Create under `src/components/uiim/<category-kebab>/<ComponentNamePascal>.tsx`
- Component props type **must** extend `ComponentProps` from `lib/component-props` — never define `params` manually
- Always use `params.styles` and `params.RenderingIdentifier` from `ComponentProps` in the wrapper element
- Use Tailwind CSS
- Use shadcn/ui primitives from `@/components/ui/*`
- Always import from `@sitecore-content-sdk/nextjs`
- Use GraphQL datasource shape:
  - `fields.data.datasource` for the parent item
  - `fields.data.datasource.children.results` for child items
  - `.jsonValue` for all authorable field values
- Default `children.results` to `[]` if undefined
- Return `null` if the datasource is missing
- **All** Sitecore-managed fields must use SDK editable helpers (`Text`, `RichText`, `NextImage as ContentSdkImage`, `Link as ContentSdkLink`) — never use plain `<img>`, `<a>`, or hardcoded text for authorable fields



### Rendering Parameters template rule

Every rendering requires a Rendering Parameters template. Create it before the rendering item.

**Path:** `renderingParamsRoot/<Category>/<ComponentName>`

Where `renderingParamsRoot` = `projectTemplatesRoot` + `/Rendering Parameters`

**Steps:**
1. Resolve or create the Category folder under `renderingParamsRoot`
2. Create the Rendering Parameters template item (using the standard Template template ID)
3. Set `__Base template` to all four required base templates (pipe-separated):
   ```
   {4247AAD4-EBDE-4994-998F-E067A51B1FE4}|{5C74E985-E055-43FF-B28C-DB6C6A6450A2}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}|{3DB3EB10-F8D0-4CC9-BE26-18CE7B139EC8}
   ```
4. Verify the template exists with correct base templates via MCP
5. Then create the rendering item and set `Parameters Template [shared]` to this template's **Item ID (GUID)**, not a path. Resolve the ID via MCP after creation.

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
6. updated manifest entry

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
- [ ] Parent template `Base template` set to `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}`
- [ ] Child template created
- [ ] Child template `Base template` set to `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}`
- [ ] Parent template fields created with explicit `Type`
- [ ] Child template fields created with explicit `Type`
- [ ] Parent `__Standard Values` created (using owning template ID)
- [ ] Parent template `Standard values` field linked to its `__Standard Values` Item ID
- [ ] Child `__Standard Values` created (using owning template ID)
- [ ] Child template `Standard values` field linked to its `__Standard Values` Item ID
- [ ] Parent `__Masters` points to child template
- [ ] Parent inherits `_HorizonDatasourceGrouping`
- [ ] Folder template created
- [ ] Folder template `__Standard Values` created
- [ ] Folder template `__Masters` points to parent template
- [ ] Datasource folder created under `/Data`
- [ ] Insert options set on datasource folder instance (not only folder template)
- [ ] Example parent datasource item created inside the folder
- [ ] Example child items created inside the parent item
- [ ] Rendering Parameters template created under `renderingParamsRoot/<Category>`
- [ ] Rendering Parameters template base templates set (all four IDs)
- [ ] Rendering created as JSON Rendering
- [ ] `Component Name [shared]` is PascalCase matching TSX filename exactly
- [ ] `Parameters Template [shared]` set to Item ID (GUID), not a path
- [ ] `Datasource Template` uses full Sitecore path
- [ ] `ComponentQuery` exists and matches the component
- [ ] Rendering registered in Available Renderings (Page Content)
- [ ] React file created under `src/components/uiim`
- [ ] TSX reads `fields.data.datasource.children.results`
- [ ] TSX uses `.jsonValue`
- [ ] TSX imports from `@sitecore-content-sdk/nextjs`
- [ ] Props type extends `ComponentProps` from `lib/component-props`
- [ ] Component uses `params.styles` and `params.RenderingIdentifier` in wrapper
- [ ] All Sitecore fields use SDK editable helpers (Text, ContentSdkRichText, ContentSdkImage, ContentSdkLink)
- [ ] No plain `<img>`, `<a>`, or hardcoded text used for Sitecore-managed fields
- [ ] Tailwind used
- [ ] shadcn/ui primitives used where appropriate
- [ ] TSX uses named exports (`export const Default`, not `export default`)
- [ ] Empty-state fallback component included
- [ ] Headless Variants container item exists in Sitecore
- [ ] `Default` Variant Definition item created under Headless Variants container
- [ ] Component map updated with kebab-case key
