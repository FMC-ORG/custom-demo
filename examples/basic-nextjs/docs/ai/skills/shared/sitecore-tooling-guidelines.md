# Shared Sitecore tooling guidelines  
  
## Source of truth priority  
1. Repo rules:  
   - `.cursor/rules/*.mdc`  
   - `.clinerules`  
2. Shared skills:  
   - `docs/ai/skills/*.md`  
   - `docs/ai/skills/shared/*.md`  
3. Internal project references:  
   - `docs/ai/reference/*.md`  
4. Official Sitecore docs:  
   - via `sitecore-documentation-docs` MCP  
5. Examples:  
   - `docs/ai/examples/**/*.md`  
   - `docs/ai/examples/**/*.yaml`  
  
## Tool usage rules  
### Sitecore marketer MCP  
Use the Sitecore marketer MCP whenever Sitecore items need to be created or updated, including:  
- templates  
- standard values  
- folder templates  
- datasource folders  
- renderings  
- datasource settings  
- ComponentQuery  
- insert options / `__Masters`  
  
If the marketer MCP is available, prefer it over hand-written pseudo-instructions.  
  
### sitecore-documentation-docs MCP  
Use the documentation MCP when:  
- official Sitecore mechanics are unclear  
- GraphQL or rendering behavior is uncertain  
- a product detail should not be guessed  
- validating Sitecore XM Cloud/JSS conventions  
  
Do not invent official Sitecore behavior when the docs MCP can clarify it.  
  
## Mandatory workflow for Sitecore tasks  
1. Classify the task:  
   - simple component  
   - list component  
   - context-only component  
   - datasource picker fix  
   - ComponentQuery fix  
   - add variants
2. If screenshots are attached or provided by path, inspect them first.  
3. Normalize the task into:  
   - `docs/ai/templates/sitecore-component-spec.template.yaml`  
4. Ask concise follow-up questions if required data is missing.  
5. Show:  
   - chosen skill/workflow  
   - completed or partial spec  
   - assumptions  
   - plan  
6. Then implement.  
7. Return:  
   - spec  
   - Sitecore actions/MCP actions  
   - code/files changed  
   - verification checklist  
  
## Non-negotiable Sitecore rules  
- Every custom template must have `__Standard Values`. After creating `__Standard Values`, set the `Standard values` field on the template item to the `__Standard Values` Item ID to link them.  
- `Datasource Template` must use full Sitecore paths, never GUIDs.  
- `Parameters Template [shared]` must use the **Item ID (GUID)**, never a path. Resolve the ID via MCP after creating the Rendering Parameters template.
- `Component Name [shared]` must be **PascalCase** and **exactly match** the TSX filename without extension (e.g. `EurobankHeader` for `EurobankHeader.tsx`).
- Every datasource template (parent and child) must set `__Base template` to `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}` (Standard Template + Grid Parameters). This does **not** apply to folder templates.
- After creating a datasource folder, set insert options **on the folder item itself** — not only on the folder template's `__Standard Values`.
- After creating a rendering, register it in the site's **Available Renderings**: read the **current** `Renderings [shared]` field value from the **Page Content** item at `/sitecore/content/<siteCollection>/<siteName>/Presentation/Available Renderings/Page Content`, then **concatenate** the new rendering ID with a pipe separator. **Never replace** the existing value — that removes all other components.
- Renderings should be JSON Renderings unless the repo clearly requires otherwise.  
- Component props **must** extend `ComponentProps` from `lib/component-props` — never define `params` manually.
- All Sitecore-managed fields **must** use SDK editable helpers (`Text`, `RichText`/`ContentSdkRichText`, `NextImage`/`ContentSdkImage`, `Link`/`ContentSdkLink`). Never use plain `<img>`, `<a>`, `next/image`, `next/link`, or hardcoded text for authorable fields.
- TSX files use PascalCase filenames (e.g. `EurobankHeader.tsx`). The containing folder is kebab-case (e.g. `navigation/`).
- Avoid GraphQL collision-prone field names:  
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
  
## Datasource rules  
### Simple component  
Must create:  
- datasource template (with base templates `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}`)
- folder template  
- datasource content folder (with insert options set on the folder item itself)
- example datasource item inside the folder
- Rendering Parameters template
- rendering (registered in Available Renderings — Page Content)
  
Must not use:  
- `ComponentQuery`  
  
### List component  
Must create:  
- parent datasource template (with base templates `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}`)
- child datasource template (with same base templates)
- standard values for both  
- folder template  
- datasource content folder (with insert options set on the folder item itself)
- example parent datasource item inside the folder
- example child items inside the parent item
- Rendering Parameters template
- rendering (registered in Available Renderings — Page Content)
- `ComponentQuery`  
  
Must set:  
- parent standard values `__Masters` -> child template  
- folder template standard values `__Masters` -> parent template  
- parent base template includes `_HorizonDatasourceGrouping`  
  
### Context-only component  
Usually:  
- no datasource template  
- no datasource folder  
- rendering may have no datasource requirement  
- fields come from route/page context or rendering params

Always create:
- Rendering Parameters template (even for context-only — variant and style support requires it)
- rendering (registered in Available Renderings — Page Content)
  
Confirm whether page template changes are in scope before making them.

### Variant support (all component types)
Every component must:
- use **named exports** (`export const Default`) — not `export default`
- have a `Default` Variant Definition item in Sitecore under:
  `/sitecore/content/<siteCollection>/<siteName>/Presentation/Headless Variants/<ComponentName>/Default`
- include a non-exported empty-state fallback component

To add variants beyond `Default`, use `docs/ai/skills/sitecore-add-variants.md`.

