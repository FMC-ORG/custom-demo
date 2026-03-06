# Rendering Parameters - Component Configuration

## What Are Rendering Parameters?

Rendering parameters allow per-instance component configuration without editing the datasource.

**Difference from Datasource:**
- **Datasource:** Content data (title, image, text, link)
- **Parameters:** Presentation config (CSS styles, grid, variant selection, HTML ID)

**Example:**
- Same datasource (hero content)
- Different parameters (Default variant vs Compact variant, different grid sizes, different styles)

---

## Why Renderings Need Parameters Template

Even if your component doesn't need custom parameters, the Parameters Template provides essential Pages editor features:
- ✅ **Variant selector dropdown** (select Default, Compact, Centered, etc.)
- ✅ Styles/CSS configuration
- ✅ Grid layout options
- ✅ HTML ID field
- ✅ Dynamic placeholder support

**Without Parameters Template:**
- Component still works, but...
- ❌ **Cannot select variants** (always uses Default)
- ❌ No styles configuration
- ❌ No grid options
- ❌ Limited authoring experience

---

## Generic Rendering Parameters Template (Create Once Per Project)

At the start of every project, create a **generic rendering parameters template** that can be reused for ALL components (unless custom parameters needed).

### Location

```
/sitecore/templates/Project/fmc-custom-demo/Rendering Parameters/Generic Rendering Parameters
```

### The 4 Required Base Templates

**IMPORTANT:** These 4 GUIDs are always the same across all Sitecore projects.

**Base templates field value (pipe-separated, no spaces):**

```
{4247AAD4-EBDE-4994-998F-E067A51B1FE4}|{5C74E985-E055-43FF-B28C-DB6C6A6450A2}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}|{3DB3EB10-F8D0-4CC9-BE26-18CE7B139EC8}
```

**What each provides:**

1. **{4247AAD4-EBDE-4994-998F-E067A51B1FE4}** - Base Rendering Parameters
   - **IStyling:** Styles dropdown in Pages
   - **IComponentVariant:** Variant selector dropdown
   - **Grid Parameters:** Grid configuration

2. **{5C74E985-E055-43FF-B28C-DB6C6A6450A2}** - IDynamicPlaceholder
   - Dynamic placeholder keys support

3. **{44A022DB-56D3-419A-B43B-E27E4D8E9C41}** - _PerSiteStandardValues
   - Site-specific standard values

4. **{3DB3EB10-F8D0-4CC9-BE26-18CE7B139EC8}** - IRenderingId
   - HTML ID field (renders `id` attribute)

---

## MCP Workflow: Create Generic Rendering Parameters

**Run this ONCE at project start**, then reuse for all renderings.

### Step 1: Create Rendering Parameters Folder (if not exists)

```
get_content_item_by_path(
  itemPath="/sitecore/templates/Project/fmc-custom-demo"
)
```

Check if `Rendering Parameters` folder exists. If not, create it:

```
create_content_item(
  name="Rendering Parameters",
  templateId="0437fee2-44c9-46a6-abe9-28858d9fee8c",  # Template Folder
  parentId="<fmc-custom-demo-folder-id>"
)
```

---

### Step 2: Create Generic Rendering Parameters Template

```
create_content_item(
  name="Generic Rendering Parameters",
  templateId="ab86861a-6030-46c5-b394-e8f99e8b87db",  # Template
  parentId="<rendering-parameters-folder-id>"
)
```

**Save the returned `itemId`** - you'll need it for Steps 3, 4, and 5.

---

### Step 3: Set Base Templates (THE CRITICAL STEP)

```
update_fields_on_content_item(
  itemId="<generic-rendering-parameters-id>",
  fields={
    "__Base template": "{4247AAD4-EBDE-4994-998F-E067A51B1FE4}|{5C74E985-E055-43FF-B28C-DB6C6A6450A2}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}|{3DB3EB10-F8D0-4CC9-BE26-18CE7B139EC8}"
  }
)
```

**Format requirements:**
- Use pipe `|` separator (no spaces)
- Exact GUIDs with curly braces
- UPPERCASE GUIDs
- All 4 GUIDs on one line

---

### Step 4: Create __Standard Values

```
create_content_item(
  name="__Standard Values",
  templateId="<generic-rendering-parameters-id>",  # Same ID as template
  parentId="<generic-rendering-parameters-id>"     # Same ID as template
)
```

---

### Step 5: Document Both Path and GUID for Reuse

**Generic Rendering Parameters template:**

**Path (for documentation):**
```
/sitecore/templates/Project/fmc-custom-demo/Rendering Parameters/Generic Rendering Parameters
```

**GUID (for MCP operations):**
```
{TEMPLATE-ID-FROM-STEP-2}
```

**IMPORTANT:** Save the GUID from Step 2 when you create the template. You'll need it for:
- Setting Parameters Template field on renderings
- Updating renderings via update_fields_on_content_item

**Example:**
```
# Step 2 returns itemId:
{
  "itemId": "E211F6A3-C549-41D1-9A02-F5523415DA7A",
  ...
}

# Save this GUID for all future rendering updates
```

**Do NOT use path string in MCP operations** - it won't work.

---

## Using Generic Rendering Parameters on Renderings

When creating ANY rendering, set the `Parameters Template` field to the **GUID**, not the path:

```
update_fields_on_content_item(
  itemId="<rendering-id>",
  fields={
    "componentName": "component-name",
    "Datasource Template": "/sitecore/templates/Project/fmc-custom-demo/Components/.../ComponentName",
    "Datasource Location": "query:...",
    "AddFieldEditorButton": "1",
    "Parameters Template": "{GENERIC-RENDERING-PARAMS-GUID}",  # Use GUID
    "ComponentQuery": "..." # if parent/child
  }
)
```

**Path string format will not work:**
```
# ❌ WRONG - will cause errors
"Parameters Template": "/sitecore/templates/Project/fmc-custom-demo/Rendering Parameters/Generic Rendering Parameters"

# ✅ CORRECT - use GUID
"Parameters Template": "{E211F6A3-C549-41D1-9A02-F5523415DA7A}"
```

**Why:** MCP update_fields_on_content_item expects template ID format, not path.

**This enables:**
- ✅ Variant selector dropdown in Pages editor
- ✅ Styles configuration
- ✅ Grid options
- ✅ HTML ID field

---

## When to Create Custom Parameters Template

Create custom parameters template when component needs **specific configuration options** beyond standard functionality.

**Examples requiring custom parameters:**
- ✅ Carousel with "autoplay speed" number parameter
- ✅ Map component with "zoom level" parameter
- ✅ Video with "autoplay" boolean parameter
- ✅ Gallery with "items per row" parameter
- ✅ Button with "button style" (primary/secondary/tertiary) parameter

**Standard functionality (use generic):**
- ❌ Just need variant selection → use generic
- ❌ Just need CSS styles → use generic
- ❌ Just need grid configuration → use generic
- ❌ No custom configuration needed → use generic

**99% of components use generic rendering parameters.**

---

## Creating Custom Parameters Template

If component needs custom configuration fields:

### Step 1: Create Custom Parameters Template

```
create_content_item(
  name="Component Name Parameters",
  templateId="ab86861a-6030-46c5-b394-e8f99e8b87db",  # Template
  parentId="<rendering-parameters-folder-id>"
)
```

**Save the returned itemId** - you'll need it for all subsequent steps.

---

### Step 2: Set Same 4 Base Templates

```
update_fields_on_content_item(
  itemId="<custom-parameters-id>",
  fields={
    "__Base template": "{4247AAD4-EBDE-4994-998F-E067A51B1FE4}|{5C74E985-E055-43FF-B28C-DB6C6A6450A2}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}|{3DB3EB10-F8D0-4CC9-BE26-18CE7B139EC8}"
  }
)
```

**Must include the same 4 base templates** to get variant selection, styles, grid.

---

### Step 3: Add Template Section

```
create_content_item(
  name="Parameters",
  templateId="e269fbb5-3750-427a-9149-7aa950b49301",  # Template Section
  parentId="<custom-parameters-id>"
)
```

---

### Step 4: Add Custom Fields

```
create_content_item(
  name="autoplaySpeed",
  templateId="455a3e98-a627-4b40-8035-e683a0331ac7",  # Template Field
  parentId="<parameters-section-id>",
  fields={
    "Type": "Integer"
  }
)
```

Create additional fields as needed.

---

### Step 5: Create __Standard Values

```
create_content_item(
  name="__Standard Values",
  templateId="<custom-parameters-id>",
  parentId="<custom-parameters-id>"
)
```

Set default values for custom fields if needed.

---

### Step 6: Use Custom Template on Rendering (GUID Format)

```
update_fields_on_content_item(
  itemId="<rendering-id>",
  fields={
    "Parameters Template": "{CUSTOM-PARAMETERS-TEMPLATE-ID}"
  }
)
```

**Use the GUID from Step 1, not a path string.**

---

## Component Code Access

Parameters are passed to components via `props.params`:

```typescript
interface ComponentProps {
  params: { [key: string]: string };  // Rendering parameters
  fields: Fields;                     // Datasource fields
}

export const Default = (props: ComponentProps) => {
  const id = props.params.RenderingIdentifier;  // From IRenderingId
  const styles = props.params.styles;           // From IStyling

  return (
    <div
      className={`component my-component ${styles}`}
      id={id ? id : undefined}
    >
      {/* Component content */}
    </div>
  );
};
```

**Custom parameters:**
```typescript
const autoplaySpeed = props.params.autoplaySpeed;  // Custom field
```

---

## Troubleshooting

### No Variant Dropdown in Pages Editor

**Cause:** Rendering missing `Parameters Template` field
**Fix:** Set `Parameters Template` to Generic Rendering Parameters GUID (not path)

---

### Variants Created But Dropdown Not Showing

**Cause:** Parameters template missing base templates
**Fix:** Verify `__Base template` field includes all 4 GUIDs

---

### Custom Parameter Not Showing

**Cause:** Custom parameters template missing the 4 base templates
**Fix:** Custom templates MUST include the 4 base templates, THEN add custom fields

---

### Variant Selector Shows But Variants Don't Render

**Cause:** Variant Definitions not created in Sitecore
**Fix:** Create Variant Definition items under `/Presentation/Headless Variants/` (see sitecore-variants.md)

---

### "Template doesn't exist" Error When Adding Component to Page

**Cause:** Parameters Template field set to path string instead of GUID
**Fix:** Update rendering to use GUID format:

```
update_fields_on_content_item(
  itemId="<rendering-id>",
  fields={
    "Parameters Template": "{GENERIC-RENDERING-PARAMS-GUID}"
  }
)
```

---

## Quick Reference

| Action | Details |
|--------|---------|
| **When to create generic** | ONCE at project start |
| **Location** | `/sitecore/templates/Project/fmc-custom-demo/Rendering Parameters/` |
| **Name** | "Generic Rendering Parameters" |
| **Base templates** | 4 GUIDs (always the same, pipe-separated) |
| **Save from Step 2** | Template GUID for use in renderings |
| **Use on rendering** | Set `Parameters Template` field to **GUID** (not path) |
| **When to use generic** | 99% of components |
| **When to create custom** | Component needs specific config fields (autoplay, zoom, items-per-row, etc.) |
| **Without Parameters Template** | Component works, but no variant selection |

---

## Integration with Component Creation Workflow

**Project Setup (ONCE at start):**
```
1. Create Rendering Parameters folder
2. Create Generic Rendering Parameters template
3. Set 4 base templates (CRITICAL)
4. Create __Standard Values
5. Save GUID from creation for reuse
```

**Per Component (EVERY TIME):**
```
1. Create templates
2. Create rendering
3. ⚠️ SET PARAMETERS TEMPLATE ← Generic Rendering Parameters GUID
4. Add to Available Renderings
5. Create datasources
6. Write code
7. Register in component-map
8. Create variants (optional)
```

---

## See Also

- [Sitecore Renderings](sitecore-renderings.md) - Rendering configuration
- [Sitecore Variants](sitecore-variants.md) - Creating and using variants
- [MCP Key Rules](mcp-key-rules.md) - All workflow rules
- [Troubleshooting](troubleshooting.md) - Common issues
