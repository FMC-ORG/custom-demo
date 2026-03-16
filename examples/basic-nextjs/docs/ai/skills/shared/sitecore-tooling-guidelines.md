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
- Every custom template must have `__Standard Values`.  
- `Datasource Template` must use full Sitecore paths, never GUIDs.  
- Renderings should be JSON Renderings unless the repo clearly requires otherwise.  
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
- datasource template  
- folder template  
- datasource content folder  
- example datasource item inside the folder
- Rendering Parameters template
- rendering  
  
Must not use:  
- `ComponentQuery`  
  
### List component  
Must create:  
- parent datasource template  
- child datasource template  
- standard values for both  
- folder template  
- datasource content folder  
- example parent datasource item inside the folder
- example child items inside the parent item
- Rendering Parameters template
- rendering  
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
  
Confirm whether page template changes are in scope before making them.

### Variant support (all component types)
Every component must:
- use **named exports** (`export const Default`) — not `export default`
- have a `Default` Variant Definition item in Sitecore under:
  `/sitecore/content/<siteCollection>/<siteName>/Presentation/Headless Variants/<ComponentName>/Default`
- include a non-exported empty-state fallback component

To add variants beyond `Default`, use `docs/ai/skills/sitecore-add-variants.md`.

