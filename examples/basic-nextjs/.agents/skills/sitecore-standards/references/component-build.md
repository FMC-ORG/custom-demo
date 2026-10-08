# Building a Sitecore component — shared procedure

Used by `sitecore-create-simple`, `sitecore-create-list`, and `sitecore-create-context`. Each create skill lists its kind-specific creation order and refers to the sections below by name (§1–§12).

## §1 Before implementation

1. If screenshots or a design are attached, inspect them first.
2. Confirm the component kind (simple, list, context-only); if it is a different kind, switch skills and say so.
3. Normalise the request into `.agents/skills/sitecore-standards/assets/sitecore-component-spec.template.yaml`, applying the skill's safe defaults.
4. Check the manifest (`sitecore-manifest` skill): `complete` → confirm before re-creating; `partial`/`failed` → resume from recorded IDs; not found → register a `planned` entry.
5. Ask concise follow-up questions if required values are missing.
6. Before implementing, show: classification, inferred field model, assumptions, the spec, manifest status, and the plan. If the user wants an approval gate, stop here.

## §2 Marketer MCP usage

- Create and update all items (templates, sections, fields, `__Standard Values`, folder templates, datasource folders, renderings) with the `sitecore_marketer` MCP. Never claim it cannot create templates or renderings.
- Fall back to manual or serialization output only when a specific MCP call fails, permissions block it, or repo governance requires serialized definitions — and say which.
- Resolve parents with `get_content_item_by_path` (or the manifest `lookups` cache) and use the returned IDs; never guess IDs.
- Use the exact field names returned by item inspection; see `docs/ai/reference/sitecore-marketer-mcp-reference.md` for silent-write fields and known quirks.
- Verify every create/update by reading the item back. Record IDs in the manifest as you go.

## §3 Structural lookups and category folders

- Check the manifest `lookups` for cached structural IDs first. On the first task, resolve the six structural paths (`dataRoot`, `projectTemplatesRoot/Components`, `projectFoldersRoot`, `renderingParamsRoot`, `headlessVariantsRoot`, Available Renderings Page Content) and cache them.
- Resolve or create the `<Category>` subfolders under `projectTemplatesRoot/Components`, `renderingsRoot`, and `renderingParamsRoot` with the Template Folder template `0437fee2-44c9-46a6-abe9-28858d9fee8c`. Resolve or create `projectFoldersRoot` for simple and list components.
- **Race condition:** when creating new category folders, create all of them in their own batch and wait for their IDs before creating anything inside them.

## §4 Datasource templates (simple, list)

1. Create the template under `projectTemplatesRoot/Components/<Category>/`.
2. Immediately set `__Base template` to `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}` (Standard Template + Grid Parameters). Not for folder templates.
3. Create a `Data` section, then the field items. **Explicitly set each field's `Type`** (`Single-Line Text`, `Rich Text`, `Image`, `General Link`, …) and verify it; set `Source`, `Shared`, `Unversioned` when needed.
4. Avoid collision-prone field names (`id`, `name`, `path`, `url`, `template`, `parent`, `children`, `language`, `version`, `displayName`, `icon`); prefer descriptive names (`SectionTitle`, `CardTitle`, `HeroImage`, `PrimaryLink`).

## §5 `__Standard Values` (every template)

- Create with `name = "__Standard Values"`, `parentId` = owning template ID, `templateId` = owning template ID. Never use the Standard Template ID `1930bbeb-…`.
- Link it: set `__Standard values` on the template item to the SV item ID (silent-write — empty `updatedFields` is normal).
- Defaults: `$name` for title fields; leave Image and Link fields empty.

## §6 Folder template and datasource folder (simple, list)

1. Create the folder template under `projectFoldersRoot` (`<Component Name> Folder`), with its own `__Standard Values` (§5).
2. Set `__Masters` on the folder template's SV to the template authors should create in the folder (simple: the datasource template; list: the parent template). Silent-write.
3. Create the datasource folder under `dataRoot` from the folder template.
4. **Also set `__Masters` on the datasource folder item itself** — without it authors cannot create items there.

## §7 Example datasource items (simple, list)

Create one example item in the datasource folder (list: one parent plus one or two children inside it) so the picker is not empty and the component renders immediately.
- Screenshot or design provided → fill fields to match it. URL provided → use its real content.
- Otherwise use `__Standard Values` defaults or leave fields empty — never invent placeholder copy.
- Verify with `get_content_item_by_id`.

## §8 Rendering Parameters template (all kinds)

Create at `renderingParamsRoot/<Category>/<ComponentName>` **before** the rendering, and set `__Base template` to all four:
`{4247AAD4-EBDE-4994-998F-E067A51B1FE4}|{5C74E985-E055-43FF-B28C-DB6C6A6450A2}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}|{3DB3EB10-F8D0-4CC9-BE26-18CE7B139EC8}` (variant picker, styling, grid, rendering ID).

## §9 Rendering (all kinds)

Create a **JSON Rendering** at `renderingsRoot/<Category>/<ComponentName>` and set, with these MCP field names:

| Field | Value |
|---|---|
| `componentName` | PascalCase, exactly the TSX filename without extension |
| `Parameters Template` | Item ID (GUID) of the §8 template — never a path |
| `AddFieldEditorButton` | `1` |
| `Datasource Template` | Full path (simple: datasource template; list: parent template; context: empty). Silent-write. |
| `Datasource Location` | `query:$site/*[@@name='Data']/*[@@templatename='<FolderTemplateName>']\|query:$sharedSites/*[@@name='Data']/*[@@templatename='<FolderTemplateName>']` (context: empty). Silent-write. |
| `ComponentQuery` | List only — single-line, see `sitecore-create-list`. Empty for simple and context. |

## §10 Available Renderings (all kinds)

The `Renderings` field on `/sitecore/content/<siteCollection>/<siteName>/Presentation/Available Renderings/Page Content` is silent-write **and** silent-read.
1. Take the current value from the manifest `availableRenderings.lastKnownValue` (verified this session) or ask the user.
2. **Append** `|{NEW-RENDERING-GUID}` (uppercase, braces). **Never replace** — that removes every other component from Pages.
3. Update `lastKnownValue` in the manifest.

## §11 React component (all kinds)

- File: `src/components/uiim/<category-kebab>/<ComponentName>.tsx`; import helpers from `@sitecore-content-sdk/nextjs`; Tailwind + shadcn/ui primitives from `@/components/ui/*` (check they exist first).
- Props extend `ComponentProps` from `lib/component-props`; the wrapper uses `params.styles` and `params.RenderingIdentifier`.
- Every Sitecore field renders through an SDK helper (`Text`, `RichText`, `NextImage as ContentSdkImage`, `Link as ContentSdkLink`); keep empty fields visible when `page?.mode?.isEditing`.
- Named exports only, `Default` first; each export name equals a Variant Definition item. Include a non-exported empty-state fallback. More variants → `sitecore-add-variants`.
- Register in `.sitecore/component-map.ts` following the existing pattern (or regenerate with `npm run sitecore-tools:generate-map`).
- Data shape per kind: `references/react-shadcn.md` and `references/react-uiim-guidelines.md`.

## §12 Output and completion

**Before implementation:** classification · assumptions · spec · manifest status · plan.

**After implementation:** Sitecore/MCP operations performed · files changed · verification results (create skill checklist + `references/verification-checklist.md`) · follow-ups (unverifiable silent-write fields, serialization) · updated manifest entry.

The task is complete only when the React component exists and is registered, the Sitecore items were created or clearly reported as blocked, and important values were verified or explicitly flagged. Never silently downgrade unverified work to "manual setup required".
