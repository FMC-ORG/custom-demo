# Available Renderings - Making Components Visible in Pages Editor

## ⚠️ CRITICAL: New Components Won't Show Without This

After creating a rendering definition, you MUST add it to the Available Renderings list or it will NOT appear in the Pages editor toolbar.

**This is the #1 reason components don't show up in Pages editor.**

---

## Location

```
/sitecore/content/<site-collection>/<site-name>/Presentation/Available Renderings/Page Content
```

**Template:** `Available Renderings`

**Field:** `Renderings` - Contains pipe-separated rendering item GUIDs

**Note:** Use `Page Content` for all custom components (other contexts exist but this simplifies workflow).

---

## Workflow

### Step 1: Get Your New Rendering GUID

After creating your rendering, save its GUID:

```
create_content_item(name="ComponentName", templateId="04646a89-...", parentId="<folder>")
```

**Returns:**
```json
{
  "itemId": "10C020B3-2A8F-4EC3-8F7E-D221B2111173",
  "name": "ComponentName",
  ...
}
```

**Save this `itemId`** - you'll need it for Step 3.

---

### Step 2: Get Current Available Renderings Value

```
get_content_item_by_path(
  itemPath="/sitecore/content/<site-collection>/<site-name>/Presentation/Available Renderings/Page Content",
  language="en"
)
```

**Returns:**
```json
{
  "itemId": "abc-123-...",
  "fields": {
    "Renderings": "{C5F905F8-FD1F-444E-A9E5-AC6B774FF0DE}|{2492BAC4-DA07-4C86-87F0-9873D40E2276}|{9C6D53E3-FE57-4638-AF7B-6D68304C7A94}",
    ...
  }
}
```

**Save:**
- Available Renderings `itemId`
- Current `Renderings` field value

---

### Step 3: Append New Rendering GUID

**Format rules:**
- GUIDs must be UPPERCASE with curly braces: `{ABC-123}`
- Separator is pipe: `|`
- No spaces
- Always APPEND (never replace or you'll lose existing components)

**Current value:**
```
{C5F905F8-FD1F-444E-A9E5-AC6B774FF0DE}|{2492BAC4-DA07-4C86-87F0-9873D40E2276}
```

**New value:**
```
{C5F905F8-FD1F-444E-A9E5-AC6B774FF0DE}|{2492BAC4-DA07-4C86-87F0-9873D40E2276}|{10C020B3-2A8F-4EC3-8F7E-D221B2111173}
```

---

### Step 4: Update Available Renderings

Use Marketer MCP `update_content` tool:

```
update_content(
  itemId="<available-renderings-item-id>",
  siteName="<site-name>",
  fields={
    "Renderings": "<current-value>|{<NEW-RENDERING-GUID>}"
  }
)
```

**Example:**
```
update_content(
  itemId="abc-123-...",
  siteName="claudecode",
  fields={
    "Renderings": "{C5F905F8-FD1F-444E-A9E5-AC6B774FF0DE}|{2492BAC4-DA07-4C86-87F0-9873D40E2276}|{10C020B3-2A8F-4EC3-8F7E-D221B2111173}"
  }
)
```

**Important:** Ensure new GUID is UPPERCASE when appending.

---

### Step 5: Publish

Available Renderings is a content item, so you MUST publish to Web database:

- Use Sitecore UI: Smart Publish or Incremental Publish
- Publish the Available Renderings item

---

### Step 6: Verify in Pages Editor

1. Open a page in Pages editor
2. Look for your component in the toolbar
3. If not visible, troubleshoot (see below)

---

## Multiple Components at Once

If creating several components, append all GUIDs in one update:

```
update_content(
  itemId="<available-renderings-item-id>",
  siteName="<site-name>",
  fields={
    "Renderings": "<existing>|{GUID-1}|{GUID-2}|{GUID-3}"
  }
)
```

---

## Troubleshooting

### Component Still Not Showing After Adding

**Check in order:**

1. **GUID format correct:**
   - ✅ `{10C020B3-2A8F-4EC3-8F7E-D221B2111173}` (uppercase, braces)
   - ❌ `{10c020b3-...}` (lowercase)
   - ❌ `10C020B3-...` (missing braces)

2. **Available Renderings published:**
   - Item must be published to Web database
   - Not just saved in Master

3. **Pipe separator used:**
   - ✅ `{GUID1}|{GUID2}` (pipe)
   - ❌ `{GUID1},{GUID2}` (comma)
   - ❌ `{GUID1} {GUID2}` (space)

4. **No extra spaces:**
   - ✅ `{GUID1}|{GUID2}`
   - ❌ `{GUID1} | {GUID2}` (spaces around pipe)

5. **Component registered:**
   - Must be in `component-map.ts`
   - Dev server restarted

6. **ComponentName matches:**
   - Rendering `componentName` field matches component-map key
   - Both use kebab-case

### Accidentally Replaced Instead of Appended

If you replaced the entire Renderings value, ALL previous components disappear from toolbar.

**Fix:**
1. Check item version history in Sitecore
2. Get previous Renderings value
3. Re-append new GUID to previous value
4. Update and publish

### Wrong Available Renderings Path

Verify path using site discovery:
```
get_content_item_by_path(
  itemPath="/sitecore/content/<site-collection>/<site-name>/Presentation/Available Renderings"
)
```

Check children to confirm `Page Content` item exists.

---

## When to Update

**Update Available Renderings when:**
- ✅ Creating a new rendering definition
- ✅ Before testing component in Pages editor
- ✅ Component should be available to content authors

**Don't need to update when:**
- ❌ Only modifying component code (React/TypeScript)
- ❌ Updating field values or datasources
- ❌ Creating variants (variants use parent rendering, already added)
- ❌ Modifying templates (unless also creating new rendering)

---

## Integration with Component Creation Workflow

**Full workflow:**
```
1. Create template + __Standard Values
2. Create rendering definition
3. ⚠️ ADD TO AVAILABLE RENDERINGS ← THIS STEP
4. Create datasource folder
5. Write component code
6. Register in component-map.ts
7. Create variants (optional)
8. Publish all items
9. Test in Pages editor
```

**Skip step 3 = component won't appear in toolbar.**

---

## Quick Reference

| Task | MCP Operation |
|------|---------------|
| Get Available Renderings | `get_content_item_by_path(itemPath=".../Available Renderings/Page Content")` |
| Note rendering GUID | Save `itemId` from rendering creation response |
| Format new value | `<current-value>|{NEW-GUID}` (uppercase, braces, pipe) |
| Update field | `update_content(itemId, siteName, fields={"Renderings": "..."})` |

**GUID Format:** `{ABC-123-...}` - Always uppercase with curly braces

---

## See Also

- [Sitecore Renderings](sitecore-renderings.md) - Creating rendering definitions
- [MCP Key Rules](mcp-key-rules.md) - All critical workflow rules
- [Troubleshooting](troubleshooting.md) - Component not in toolbar issues
