# Recommendations: Skill & Rules Improvements

**Based on:** Vargroup.com demo replication (March 2026)
**Scope:** 4 custom components, 14 variants, sample content, homepage assembly

---

## 🎯 CRITICAL ISSUES DISCOVERED

### Issue #1: Variant Definition Template IDs Not Documented
**Problem:** Rules never mentioned the specific template IDs for variant system
- Container: Headless variant `{49C111D0-6867-4798-A724-1F103166E6E9}`
- Variants: Variant Definition `{4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55}`
- We used Template Folder template initially, had to delete and recreate all

**Impact:** Created 18 incorrect items, wasted 15 minutes

**Fix Required:** Add to `sitecore-variants.md`

### Issue #2: Parameters Template Format Ambiguity
**Problem:** Rules say "Set Parameters Template field to path" but MCP expects GUID
- Documentation shows: `/sitecore/templates/Project/.../Generic Rendering Parameters`
- API requires: `{E211F6A3-C549-41D1-9A02-F5523415DA7A}`
- Homepage assembly failed with "template doesn't exist" error

**Impact:** Failed page assembly, required re-updating all 4 renderings

**Fix Required:** Update `sitecore-rendering-parameters.md` and `sitecore-renderings.md`

### Issue #3: TypeScript Build Not in Workflow
**Problem:** Skill doesn't include "run build and fix errors" step
- Created all components successfully
- All registered in component-map.ts
- Build failed with generic vs specific props errors
- Had to manually fix 3 component files

**Impact:** Non-functional code until build errors fixed

**Fix Required:** Add to skill workflow

### Issue #4: Image Upload Not Addressed
**Problem:** Skill mentions image pipeline but doesn't handle MCP limitations
- `upload_asset` tool has `fs.readFile not implemented` error
- Skill doesn't provide fallback strategy
- No documentation about manual upload process

**Impact:** Demo incomplete without images

**Fix Required:** Update skill Phase 2 with realistic expectations

---

## 📋 SKILL IMPROVEMENTS

### replicate-site.md

#### PHASE 0 - Add to checklist:

**0.4 Identify Variant Template IDs**
```
Before creating any components, verify template IDs:

get_content_item_by_path(
  itemPath="/sitecore/templates/Foundation/Experience Accelerator/Variants"
)

Required IDs:
- Headless variant (container): {49C111D0-6867-4798-A724-1F103166E6E9}
- Variant Definition (variants): {4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55}

Save these - you'll use them in Phase 3 for every component with variants.
```

#### PHASE 2 - Rewrite Image Pipeline:

**Current problem:** Assumes upload will work
**New approach:**

```markdown
### 2.2 Image Strategy

**MCP upload_asset has known limitations** (fs.readFile not implemented).

**Recommended approach:**
1. Download images to local directory (e.g., `/tmp/demo-images/`)
2. Create image inventory JSON with metadata
3. Document manual upload steps in project status file
4. Provide media item GUID placeholders in datasource content

**Do NOT attempt upload_asset unless user confirms it works in their environment.**

Instead, output:
```
IMAGE UPLOAD REQUIRED (Manual)
Location: /tmp/demo-images/
Destination: /sitecore/media library/Project/{site-name}/
Count: {N} images
Inventory: image-map.json

Manual steps:
1. Open Sitecore Content Editor
2. Navigate to media library destination
3. Create folder structure matching local dirs
4. Upload images retaining filenames
5. Update datasource items with media GUIDs if needed
```
```

#### PHASE 3 - Add Component Validation:

**New sub-step after 3.7 (Register in component-map.ts):**

```markdown
### 3.8 Validate TypeScript Build

**CRITICAL:** Run build before proceeding to next component.

```bash
cd examples/basic-nextjs
npm run build
```

**Common build errors:**

1. **Generic ComponentProps in exports:**
```typescript
// ❌ WRONG
export const Default = (props: ComponentProps): React.JSX.Element => {

// ✅ CORRECT
export const Default = (props: SpecificComponentProps): React.JSX.Element => {
```

2. **Missing JSS Field type imports:**
```typescript
// Add to imports
import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

// Update interface
interface Item {
  title?: { jsonValue?: Field<string> };  // not 'any'
  image?: { jsonValue?: ImageField };
}
```

**Fix all errors before marking component complete.**
```

#### PHASE 3 - Update Variant Creation:

**Replace existing variant workflow with:**

```markdown
### 3.8 Create Variants (if needed)

**Template IDs (verify in Phase 0):**
- Container: `{49C111D0-6867-4798-A724-1F103166E6E9}` (Headless variant)
- Variants: `{4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55}` (Variant Definition)

**MCP Workflow:**

Step 1: Create container
```
create_content_item(
  name="ComponentName",
  templateId="49C111D0-6867-4798-A724-1F103166E6E9",
  parentId="<headless-variants-folder-id>"
)
```

Step 2: Create variant definitions (in parallel)
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
- Do NOT use Template Folder template - it won't work
```

#### PHASE 5 - Update Page Assembly:

**Add step before 5.2:**

```markdown
### 5.1.5 Verify Rendering Parameters Template

Before adding components to pages, verify renderings have correct Parameters Template format:

**MCP expects GUID, not path:**
```
update_fields_on_content_item(
  itemId="<rendering-id>",
  fields={
    "Parameters Template": "{GENERIC-RENDERING-PARAMS-TEMPLATE-ID}"
  }
)
```

**Not path string** - this will cause add_component_on_page to fail:
```
"Parameters Template": "/sitecore/templates/Project/.../Generic Rendering Parameters"  ❌
```

Get Generic Rendering Parameters GUID in Phase 0 and use consistently.
```

#### PHASE 6 - Expand Verification:

**Add:**

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
2. Fix type issues (usually props interfaces)
3. Re-run build
4. Do NOT skip this step
```

---

## 📚 RULES FILE IMPROVEMENTS

### sitecore-variants.md

**Add section at top:**

```markdown
## Template IDs Reference

### Required Template IDs

You need two specific template IDs for the variant system:

**1. Headless variant (container folders)**
- Template ID: `{49C111D0-6867-4798-A724-1F103166E6E9}`
- Path: `/sitecore/templates/Foundation/Experience Accelerator/Variants/Headless variant`
- Purpose: Container folder for component variants
- One per component (HeroBanner, FeatureCards, etc.)

**2. Variant Definition (variant items)**
- Template ID: `{4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55}`
- Path: `/sitecore/templates/Foundation/Experience Accelerator/Variants/Variant Definition`
- Purpose: Individual variant definitions (Default, Compact, etc.)
- Multiple per container, matching React exports

### Verification

**Before creating variants, verify these IDs exist:**

```
get_content_item_by_path(
  itemPath="/sitecore/templates/Foundation/Experience Accelerator/Variants"
)
```

Check response for both template names. IDs should match above.

**Common mistake:** Using Template Folder template (`{0437fee2-44c9-46a6-abe9-28858d9fee8c}`)
- This is NOT correct for variants
- Will create items but variants won't function
- Must use the two IDs above
```

**Update Step 3: Sitecore — Headless Variant Definitions:**

```markdown
### MCP Workflow

**Use correct template IDs from Template IDs Reference section above.**

```
1. get_content_item_by_path(path="<site>/Presentation/Headless Variants")

2. create_content_item(
     name="ComponentName",
     templateId="49C111D0-6867-4798-A724-1F103166E6E9",  # Headless variant
     parentId="<headless-variants-folder-id>"
   )

3. create_content_item(
     name="Default",
     templateId="4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55",  # Variant Definition
     parentId="<component-container-id>"
   )

4. create_content_item(
     name="VariantName",
     templateId="4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55",  # Variant Definition
     parentId="<component-container-id>"
   )
```

**Template ID verification:**
- If MCP returns error "template doesn't exist", verify IDs in your environment
- Template paths may differ across Sitecore versions
- IDs are generally stable but confirm before batch operations
```

### sitecore-rendering-parameters.md

**Update Step 5: Document Path for Reuse:**

```markdown
### Step 5: Document Both Path and GUID for Reuse

**Generic Rendering Parameters template:**

**Path (for documentation):**
```
/sitecore/templates/Project/fmc-custom-demo/Rendering Parameters/Generic Rendering Parameters
```

**GUID (for MCP operations):**
```
{TEMPLATE-ID-FROM-CREATION}
```

**IMPORTANT:** Save the GUID when you create the template. You'll need it for:
- Setting Parameters Template field on renderings
- Updating renderings via update_fields_on_content_item

**Example:**
```
# Step 2 returns itemId:
{
  "itemId": "E211F6A3-C549-41D1-9A02-F5523415DA7A",
  ...
}

# Save this GUID for Step 6 and all future rendering updates
```

**Do NOT use path string in MCP operations** - it won't work.
```

**Update "Using Generic Rendering Parameters on Renderings":**

```markdown
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
```

### sitecore-renderings.md

**Update "Critical Fields" section:**

**After field #5 (AddFieldEditorButton), add:**

```markdown
### 6. `Parameters Template` — GUID format, not path

**IMPORTANT:** Use template GUID, not path string.

```
update_fields_on_content_item(
  itemId="<rendering-id>",
  fields={
    "Parameters Template": "{GENERIC-RENDERING-PARAMS-GUID}"
  }
)
```

**Common mistake:**
```
# ❌ WRONG - path string won't work in MCP operations
"Parameters Template": "/sitecore/templates/Project/.../Generic Rendering Parameters"

# ✅ CORRECT - use GUID
"Parameters Template": "{E211F6A3-C549-41D1-9A02-F5523415DA7A}"
```

Get Generic Rendering Parameters GUID when you create it (see sitecore-rendering-parameters.md).
```

### component-code.md

**Add new section at end:**

```markdown
## TypeScript Build Validation

### Mandatory Build Check

**Before marking component complete:**

```bash
cd examples/basic-nextjs
npm run build
```

**Build must pass with zero errors.**

### Common Build Errors

#### Error 1: Generic ComponentProps in Exports

**Problem:** Export functions use generic `ComponentProps` which doesn't include component-specific fields.

**Error message:**
```
Property 'fields' does not exist on type 'ComponentProps'
```

**Fix:** Use component-specific props interface:

```typescript
// ❌ WRONG
export const Default = (props: ComponentProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  if (!props.fields?.data?.datasource) {  // Error here
    return <DefaultComponent {...props} />;
  }
  return <ComponentDefault {...props} isPageEditing={isEditing} />;
};

// ✅ CORRECT
export const Default = (props: ComponentNameProps): React.JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  if (!props.fields?.data?.datasource) {
    return <DefaultComponent {...props} />;
  }
  return <ComponentDefault {...props} isPageEditing={isEditing} />;
};
```

**Apply to ALL export functions** (Default, Variant1, Variant2, etc.)

#### Error 2: Missing JSS Field Types

**Problem:** Interface uses `any` type instead of proper JSS Field types.

**Error message:**
```
Unexpected any. Specify a different type
```

**Fix:** Import and use proper types:

```typescript
// Add to imports
import { Text, Image as JssImage, Link as JssLink, useSitecore, Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

// Update interface
interface ComponentItem {
  id: string;
  title?: { jsonValue?: Field<string> };       // not 'any'
  image?: { jsonValue?: ImageField };          // not 'any'
  link?: { jsonValue?: LinkField };            // not 'any'
  description?: { jsonValue?: Field<string> };
}
```

**Required types:**
- Text fields: `Field<string>`
- Image fields: `ImageField`
- Link fields: `LinkField`
- Rich text fields: `Field<string>`

#### Error 3: Import from Wrong Submodule

**Problem:** Importing from server-only submodules in client components.

**Error message:**
```
Module not found: Can't resolve '@sitecore-content-sdk/nextjs/config'
```

**Fix:** Only use main package in components:

```typescript
// ✅ CORRECT - client component imports
import { Text, RichText, Image, Link, Field, ImageField, LinkField, useSitecore } from '@sitecore-content-sdk/nextjs';

// ❌ WRONG - server-only imports
import { defineConfig } from '@sitecore-content-sdk/nextjs/config';
import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
```

See CLAUDE.md "Content SDK Import Guidelines" for complete rules.

### Build Workflow

**Recommended workflow:**

1. Create component file
2. Register in component-map.ts
3. **Run `npm run build`**
4. Fix any errors
5. Re-run build until clean
6. Mark component complete

**Do NOT skip build validation** - non-building code is non-functional code.
```

### troubleshooting.md

**Add new section:**

```markdown
## Build Errors

### TypeScript Build Failures

**Build command:** `cd examples/basic-nextjs && npm run build`

**Component prop type errors:**
```
Property 'fields' does not exist on type 'ComponentProps'
```

**Cause:** Export functions using generic ComponentProps instead of specific component props interface

**Fix:** Change all export function signatures to use component-specific props:
```typescript
// Change this
export const Default = (props: ComponentProps): React.JSX.Element => {

// To this
export const Default = (props: HeroBannerProps): React.JSX.Element => {
```

Apply to ALL exported variants (Default, Compact, Centered, etc.)

**"Unexpected any" errors:**

**Cause:** Interface definitions using `any` for field types

**Fix:** Import JSS Field types and update interfaces:
```typescript
import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

interface Item {
  title?: { jsonValue?: Field<string> };  // not 'any'
  image?: { jsonValue?: ImageField };     // not 'any'
}
```

**Module resolution errors:**

**Cause:** Importing from wrong Content SDK submodule

**Fix:** Only import from main package in components:
```typescript
// Correct
import { ... } from '@sitecore-content-sdk/nextjs';

// Wrong
import { ... } from '@sitecore-content-sdk/nextjs/config';
```

See [Component Code Rules](component-code.md#typescript-build-validation) for details.
```

### mcp-key-rules.md

**Add to "CRITICAL" section:**

```markdown
### 🚨 CRITICAL - Do These First, Always

1. **MANDATORY __Standard Values** — every template, every time...

[existing items 1-5]

6. **Variant system template IDs** — Verify before creating variants:
   - Headless variant (containers): `{49C111D0-6867-4798-A724-1F103166E6E9}`
   - Variant Definition (variants): `{4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55}`
   - Do NOT use Template Folder - won't function
   - See sitecore-variants.md for verification workflow

7. **Parameters Template = GUID format** — not path string:
   - ✅ `"{E211F6A3-...}"`
   - ❌ `"/sitecore/templates/.../Generic Rendering Parameters"`
   - Path format causes add_component_on_page failures
   - Get GUID when creating template, use consistently

8. **Run TypeScript build** — after component-map.ts registration:
   - `cd examples/basic-nextjs && npm run build`
   - Fix errors before marking component complete
   - Common: generic vs specific props, missing JSS Field types
   - Build failure = non-functional component
```

---

## 🎭 WORKFLOW IMPROVEMENTS

### Add Mandatory Checkpoints

**After each phase:**

| Phase | Checkpoint | Command | Expected Result |
|-------|-----------|---------|-----------------|
| Phase 0 | Template IDs verified | MCP get_content_item_by_path | Have variant + rendering params GUIDs |
| Phase 3 | Component builds | `npm run build` | Zero TypeScript errors |
| Phase 3 | Variants created | MCP get_content_item_by_path | Correct template IDs confirmed |
| Phase 4 | Content created | MCP queries | All datasources present |
| Phase 5 | Page assembled | MCP get_page | All components added |
| Phase 6 | Final build | `npm run build` | Zero errors before completion |

### Validation Script Template

**Add to skill as optional helper:**

```bash
# validate-demo.sh
#!/bin/bash

echo "Validating Sitecore demo..."

# Check 1: TypeScript build
echo "1. Running TypeScript build..."
cd examples/basic-nextjs
if npm run build; then
  echo "✅ Build passed"
else
  echo "❌ Build failed - fix errors before deploying"
  exit 1
fi

# Check 2: Component registrations
echo "2. Checking component registrations..."
if grep -q "hero-banner" .sitecore/component-map.ts; then
  echo "✅ Components registered"
else
  echo "❌ Components not registered"
  exit 1
fi

# Check 3: Environment variables
echo "3. Checking environment..."
if [ -f ".env.local" ]; then
  echo "✅ Environment configured"
else
  echo "❌ Missing .env.local"
  exit 1
fi

echo "✅ All validation checks passed"
```

---

## 📊 IMPACT SUMMARY

### Time Savings (per project)

| Issue | Time Lost (Current) | Time Saved (Fixed) |
|-------|---------------------|---------------------|
| Wrong variant template IDs | 15 min | 0 min |
| Parameters Template format | 10 min | 0 min |
| Build errors after "completion" | 20 min | 0 min |
| Image upload confusion | 10 min | 0 min |
| **Total per project** | **55 minutes** | **0 minutes** |

### Quality Improvements

**Current state:**
- Demo appears complete but doesn't build
- Variants don't work (wrong templates)
- Page assembly fails (Parameters Template format)
- Images not addressed

**With fixes:**
- Demo builds successfully before marked complete
- Variants work immediately
- Page assembly succeeds first time
- Clear image upload expectations

---

## ✅ IMPLEMENTATION PRIORITY

### Priority 1 (Critical) - Fix Immediately

1. **sitecore-variants.md** - Add template IDs section
2. **sitecore-rendering-parameters.md** - GUID vs path clarification
3. **component-code.md** - Add build validation section
4. **replicate-site skill** - Add build checkpoint to Phase 3

### Priority 2 (High) - Fix Soon

5. **troubleshooting.md** - Add build errors section
6. **mcp-key-rules.md** - Add variant template IDs to critical rules
7. **replicate-site skill** - Update image pipeline expectations

### Priority 3 (Medium) - Enhance Later

8. **replicate-site skill** - Add validation script template
9. **All rules** - Add workflow checkpoints table
10. **CLAUDE.md** - Add link to build validation in workflow

---

## 🔄 MAINTENANCE NOTES

**These improvements based on:**
- Real production workflow (not theoretical)
- Actual MCP tool limitations discovered
- TypeScript build errors encountered
- Time lost to trial-and-error

**Update frequency:**
- Review after each major demo project
- Track new error patterns
- Validate MCP tool changes
- Monitor Sitecore template ID stability

**Test coverage:**
- All fixes tested on vargroup.com demo
- Build validation confirmed working
- Variant system verified with correct IDs
- Parameters Template GUID format validated

---

**Document version:** 1.0
**Last updated:** 2026-03-06
**Based on:** 4 components, 14 variants, full demo workflow
**Status:** Ready for implementation
