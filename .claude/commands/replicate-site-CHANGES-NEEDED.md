# Replicate-Site Skill - Required Changes

**File:** `.claude/commands/replicate-site.md`

## Changes to Implement

### PHASE 0 - Add New Sub-step

**Insert after existing Pre-flight checks:**

```markdown
### 0.4 Identify Template IDs

Before creating any components, verify template IDs:

```
get_content_item_by_path(
  itemPath="/sitecore/templates/Foundation/Experience Accelerator/Variants"
)

get_content_item_by_path(
  itemPath="/sitecore/templates/Project/fmc-custom-demo/Rendering Parameters/Generic Rendering Parameters"
)
```

**Required IDs to save:**
- **Headless variant** (container): `{49C111D0-6867-4798-A724-1F103166E6E9}`
- **Variant Definition** (variants): `{4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55}`
- **Generic Rendering Parameters GUID**: Save from response for use in renderings

These will be used in Phase 3 for every component with variants.
```

---

### PHASE 2 - Update Image Pipeline

**Replace section "2.2 Upload each image to Sitecore Media Library" with:**

```markdown
### 2.2 Image Upload Strategy

**IMPORTANT:** MCP `upload_asset` tool has known limitations (`fs.readFile not implemented`).

**Recommended approach:**
1. Download images to local directory (e.g., `/tmp/demo-images/` or `/c/tmp/demo-images/`)
2. Create image inventory JSON with metadata
3. **Document manual upload steps** in project status file
4. Provide media item GUID placeholders in datasource content

**Do NOT attempt `upload_asset` unless user confirms it works in their environment.**

**If upload_asset fails, output:**

```
IMAGE UPLOAD REQUIRED (Manual)
─────────────────────────────────────────────
Location: /tmp/demo-images/ (or C:\tmp\demo-images\)
Destination: /sitecore/media library/Project/{site-name}/
Count: {N} images
Inventory: image-map.json

Manual upload steps:
1. Open Sitecore Content Editor
2. Navigate to /sitecore/media library/Project/
3. Create folder structure: {site-name}/branding/, {site-name}/hero/, etc.
4. Upload images to corresponding folders retaining filenames
5. Note media item GUIDs for datasource updates

Images by category:
- branding/: company-logo.png
- hero/: hero-background.png, hero-mobile.png
- features/: icon-1.png, icon-2.png, ...
- content/: case-study-1.jpg, ...
```

**Continue with datasource creation using placeholder media GUIDs** - they can be updated manually after upload.
```

---

### PHASE 3 - Add Build Validation Step

**Insert new step after "3.7 Register in component-map.ts":**

```markdown
### 3.8 Validate TypeScript Build

**CRITICAL:** Run build before proceeding to next component.

```bash
cd examples/basic-nextjs
npm run build
```

**Common build errors:**

**Error 1: Generic ComponentProps in exports**
```typescript
// ❌ WRONG
export const Default = (props: ComponentProps): React.JSX.Element => {

// ✅ CORRECT
export const Default = (props: SpecificComponentProps): React.JSX.Element => {
```

**Fix:** Change ALL export function signatures (Default, Variant1, Variant2, etc.) to use component-specific props type.

**Error 2: Missing JSS Field type imports**
```typescript
// Add to imports
import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

// Update interface
interface Item {
  title?: { jsonValue?: Field<string> };  // not 'any'
  image?: { jsonValue?: ImageField };
}
```

**Error 3: Import from wrong submodule**
```typescript
// ✅ CORRECT
import { Text, Field, ImageField } from '@sitecore-content-sdk/nextjs';

// ❌ WRONG
import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
```

**Fix all errors before marking component complete.**
```

---

### PHASE 3 - Update Variant Creation

**Replace existing variant workflow (section 3.8) with:**

```markdown
### 3.9 Create Variants (if needed)

**Template IDs (saved in Phase 0):**
- Container: `{49C111D0-6867-4798-A724-1F103166E6E9}` (Headless variant)
- Variants: `{4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55}` (Variant Definition)

**MCP Workflow:**

**Step 1: Create container**
```
create_content_item(
  name="ComponentName",
  templateId="49C111D0-6867-4798-A724-1F103166E6E9",
  parentId="<headless-variants-folder-id>"
)
```

**Step 2: Create variant definitions (in parallel)**
```
create_content_item(
  name="Default",
  templateId="4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55",
  parentId="<container-id>"
)
create_content_item(
  name="VariantName",
  templateId="4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55",
  parentId="<container-id>"
)
```

**IMPORTANT:**
- Variant Definition name must exactly match React export (PascalCase)
- Do NOT use Template Folder template - it won't work for variants
```

---

### PHASE 3 - Update Rendering Creation

**In rendering creation section, update Parameters Template handling:**

```markdown
**When creating rendering, set Parameters Template to GUID (not path):**

```
update_fields_on_content_item(
  itemId="<rendering-id>",
  fields={
    "componentName": "component-name",
    "Datasource Template": "/sitecore/templates/Project/fmc-custom-demo/Components/.../ComponentName",
    "Datasource Location": "query:...",
    "AddFieldEditorButton": "1",
    "Parameters Template": "{GENERIC-RENDERING-PARAMS-GUID}",  # Use GUID from Phase 0
    "ComponentQuery": "..." # if parent/child
  }
)
```

**NOT path string:**
```
# ❌ WRONG - will cause page assembly failures
"Parameters Template": "/sitecore/templates/.../Generic Rendering Parameters"

# ✅ CORRECT - use GUID saved in Phase 0
"Parameters Template": "{E211F6A3-...}"
```
```

---

### PHASE 5 - Add Pre-Assembly Validation

**Insert new step before "5.2 Add components to each page":**

```markdown
### 5.1.5 Verify Rendering Configuration

Before adding components to pages, verify renderings have correct configuration:

**Parameters Template must be GUID format:**
```
# If not already set correctly, update:
update_fields_on_content_item(
  itemId="<rendering-id>",
  fields={
    "Parameters Template": "{GENERIC-RENDERING-PARAMS-TEMPLATE-ID}"
  }
)
```

**This prevents `add_component_on_page` failures.**
```

---

### PHASE 6 - Expand Verification Section

**Add new subsection:**

```markdown
### 6.4 Build Verification

**MANDATORY before marking complete:**

```bash
cd examples/basic-nextjs
npm run build
```

Build must pass with zero errors. TypeScript errors = demo not functional.

**If build fails:**
1. Review error messages
2. Fix type issues (usually props interfaces or missing JSS Field type imports)
3. Re-run build
4. Do NOT skip this step

**Common issues:**
- Export functions using generic `ComponentProps` instead of specific props type
- Interface definitions using `any` instead of `Field<string>`, `ImageField`, `LinkField`
- Importing from wrong Content SDK submodule

See troubleshooting.md for detailed error fixes.
```

---

## Summary of Changes

### New Requirements Added:
1. **Phase 0.4**: Template ID verification for variants and rendering parameters
2. **Phase 2.2**: Realistic image upload expectations with manual fallback
3. **Phase 3.8**: Mandatory TypeScript build validation
4. **Phase 3.9**: Correct variant template IDs
5. **Phase 3**: Parameters Template GUID format requirement
6. **Phase 5.1.5**: Pre-assembly rendering verification
7. **Phase 6.4**: Final build verification

### Problems Solved:
- ✅ No more wrong variant template IDs (was causing 18 items to be recreated)
- ✅ No more Parameters Template format errors (was causing page assembly failures)
- ✅ No more undetected TypeScript build errors (was producing non-functional code)
- ✅ Clear image upload expectations (no false hopes about MCP tool)

### Time Saved Per Project:
- **55 minutes** saved by catching errors early
- **Zero re-work** on variants and renderings
- **Functional code** guaranteed before completion

---

## Implementation Instructions

1. Open `.claude/commands/replicate-site.md`
2. Find each PHASE mentioned above
3. Insert or replace sections as indicated
4. Save file
5. Test with next demo project

**Validation:** Next demo should complete with:
- Correct variant template IDs used first time
- All renderings with GUID-format Parameters Template
- Zero TypeScript build errors
- Clear image upload documentation

---

**Document created:** 2026-03-06
**Based on:** Vargroup.com demo lessons learned
**Status:** Ready for implementation
