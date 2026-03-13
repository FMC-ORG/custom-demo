# sitecore-create-simple-component  
  
## Purpose  
Create a simple Sitecore XM Cloud component that uses a single datasource item and does not have Sitecore child datasource items.  
  
## Use when  
- The component uses one datasource item  
- It does not need child items under the datasource  
- It does not need a `ComponentQuery`  
- The React component should use the default JSS props shape:  
  - `fields.Title`  
  - `fields.Description`  
  - `fields.CtaLink`  
  - `.value`-based fields  
  
Examples:  
- Hero  
- Promo  
- Banner  
- CTA block  
  
## Source of truth  
Use these in priority order:  
1. `.cursor/rules/*.mdc`  
2. `docs/ai/reference/sitecore-marketer-mcp-reference.md`  
3. this skill  
  
## Mandatory intake step  
Before creating or changing anything, normalize the request into the shared template at:  
  
- `.cursor/skills/_shared/sitecore-component-spec.template.yaml`  
  
Fill the spec in-memory first and infer defaults where safe.  
  
If any required values are missing, ask concise follow-up questions.  
  
## Required minimum inputs  
- `siteCollection`  
- `siteName`  
- `category`  
- component PascalCase name  
- component field list  
  
## Defaults to infer  
If not explicitly provided:  
- `component.nameKebab` = kebab-case of PascalCase component name  
- `component.filePath` = `src/components/<category-lowercase>/<component-name-kebab>.tsx`  
- `component.componentMapKey` = `component.nameKebab`  
- `component.componentMapImportAlias` = lowercase, no hyphens  
- `templates.parent.sectionName` = `Data`  
- `rendering.name` = component PascalCase name  
- `rendering.componentName` = component kebab-case  
- `react.propsShape` = `default-jss`  
- `folderTemplate.name` = `<Component Name> Folder`  
- `datasourceFolder.name` = component PascalCase name or a sensible plural if explicitly requested  
  
## Non-negotiable rules  
- Every custom template MUST have `__Standard Values`  
- The rendering MUST use JSON Rendering  
- `Datasource Template` must be a full Sitecore path, never a GUID  
- `ComponentQuery` must stay empty for simple components  
- Create BOTH:  
  1. folder template under `/sitecore/templates/Project/<site-collection>/Folders/`  
  2. content folder under `/sitecore/content/<site-collection>/<site-name>/Data/`  
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
  
## Execution workflow  
  
### Step 1: Fill the normalized spec  
Populate:  
- `component.kind = simple`  
- `templates.parent.create = true`  
- `templates.child.create = false`  
- `rendering.useComponentQuery = false`  
- `react.propsShape = default-jss`  
  
### Step 2: Calculate canonical paths  
Use:  
- template path:  
  `/sitecore/templates/Project/<site-collection>/Components/<Category>/<ComponentName>`  
- folder template path:  
  `/sitecore/templates/Project/<site-collection>/Folders/<Component Name> Folder`  
- datasource folder path:  
  `/sitecore/content/<site-collection>/<site-name>/Data/<Folder Name>`  
- rendering path:  
  `/sitecore/layout/Renderings/Project/<site-collection>/<Category>/<ComponentName>`  
  
### Step 3: Validate field names  
Reject or rename collision-prone field names.  
  
Prefer names like:  
- `badgeText`  
- `promoImage`  
- `awardIcon`  
- `sectionTitle`  
  
### Step 4: Create template structure  
Create:  
1. template item  
2. `Data` section  
3. field items  
4. `__Standard Values`  
  
Set sensible default values in template standard values.  
  
### Step 5: Create folder template  
Create the folder template under `/Folders/`.  
  
Create its `__Standard Values` and set:  
- `__Masters` = parent datasource template ID  
  
### Step 6: Create content folder under `/Data/`  
Create the content folder instance using the folder template.  
  
This is mandatory for datasource picker usability.  
  
### Step 7: Create rendering  
Create JSON Rendering under the matching rendering category folder.  
  
Set:  
- `componentName`  
- `Datasource Template`  
- `Datasource Location`  
- `AddFieldEditorButton = 1`  
  
Leave empty:  
- `ComponentQuery`  
- `Data source`  
  
### Step 8: Write React component  
Use default JSS props shape:  
- fields at top level  
- PascalCase keys  
- `.value` data shape  
  
Expected pattern:  
- `fields.Title`  
- `fields.Description`  
- `fields.BackgroundImage`  
- `fields.CtaLink`  
  
### Step 9: Register in component map  
Update `.sitecore/component-map.ts`.  
  
The key must exactly equal:  
- rendering `componentName`  
- component file kebab-case name  
  
### Step 10: Output  
Return:  
1. completed normalized spec  
2. Sitecore items created or MCP calls needed  
3. files changed  
4. verification checklist  
  
## Verification checklist  
- [ ] Template created in correct category folder  
- [ ] `Data` section created  
- [ ] Field items created  
- [ ] `__Standard Values` created  
- [ ] Default values set on standard values  
- [ ] Folder template created  
- [ ] Folder template `__Masters` set  
- [ ] Content folder created under `/Data`  
- [ ] JSON Rendering created  
- [ ] `Datasource Template` is a full path  
- [ ] `ComponentQuery` is empty  
- [ ] TSX uses default JSS props shape  
- [ ] Component map key matches `componentName`  
- [ ] Restart/build reminder provided  
  
## Output style  
Be concise and structured.  
If making changes, present:  
- Spec  
- Plan  
- Changes  
- Verification  
  
## Example invocation  
Use the `sitecore-create-simple-component` skill.  
  
Create a Hero component for `mysite`.  
  
Fields:  
- Title (Single-Line Text)  
- Description (Rich Text)  
- BackgroundImage (Image)  
- CtaLink (General Link)  
  
First fill the shared component spec, then show the plan, then execute.  