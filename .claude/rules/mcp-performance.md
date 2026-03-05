# MCP Performance Best Practices

Optimize MCP operations by running independent tasks in parallel and dependent tasks sequentially.

## Parallel vs Sequential Operations

### ✅ Run in Parallel (Single Message, Multiple Tool Calls)

Execute these operations simultaneously in one message:

**1. Multiple Independent Fields in Same Section**
```
# Good - all fields created in parallel
create_content_item(name="title", templateId="<field-id>", parentId="<section-id>", fields={"Type": "Single-Line Text"})
create_content_item(name="description", templateId="<field-id>", parentId="<section-id>", fields={"Type": "Rich Text"})
create_content_item(name="image", templateId="<field-id>", parentId="<section-id>", fields={"Type": "Image"})
create_content_item(name="link", templateId="<field-id>", parentId="<section-id>", fields={"Type": "General Link"})
```

**2. Multiple Variant Definitions**
```
# Create all variants at once
create_content_item(name="Default", templateId="<variant-def-id>", parentId="<container-id>")
create_content_item(name="Compact", templateId="<variant-def-id>", parentId="<container-id>")
create_content_item(name="Centered", templateId="<variant-def-id>", parentId="<container-id>")
```

**3. Multiple Child Items (if parent exists)**
```
# Create all children in parallel after parent exists
create_content_item(name="Card 1", templateId="<card-id>", parentId="<parent-datasource-id>")
create_content_item(name="Card 2", templateId="<card-id>", parentId="<parent-datasource-id>")
create_content_item(name="Card 3", templateId="<card-id>", parentId="<parent-datasource-id>")
```

**4. Information Gathering (Multiple Reads)**
```
# Read multiple items in parallel
get_content_item_by_path(itemPath="/sitecore/templates/.../ComponentA")
get_content_item_by_path(itemPath="/sitecore/templates/.../ComponentB")
get_content_item_by_path(itemPath="/sitecore/content/.../Data")
```

### ❌ Run Sequentially (Separate Messages)

These operations have dependencies — must wait for previous result:

**1. Parent → Children (Need Parent ID)**
```
# Step 1 (Message 1): Create parent
create_content_item(name="ParentComponent", templateId="<template-id>", parentId="<components-folder>")

# Step 2 (Message 2): Create children using parent ID from Step 1
create_content_item(name="Data", templateId="<section-id>", parentId="<parent-id-from-step-1>")
```

**2. Template → __Standard Values (Need Template ID)**
```
# Step 1 (Message 1): Create template
create_content_item(name="ComponentName", templateId="<template-type-id>", parentId="<folder>")

# Step 2 (Message 2): Create __Standard Values using template's own ID
create_content_item(name="__Standard Values", templateId="<component-id>", parentId="<component-id>")
```

**3. Operations Requiring Validation**
```
# Step 1: Create item
create_content_item(...)

# Step 2: Verify it was created successfully
get_content_item_by_path(itemPath="<path-to-verify>")

# Step 3: Proceed based on result
update_content(...)
```

## Performance Impact

| Operation Type | Sequential Time | Parallel Time | Savings |
|----------------|----------------|---------------|---------|
| 5 fields | ~25 seconds | ~7 seconds | 72% |
| 4 variants | ~20 seconds | ~6 seconds | 70% |
| 6 children | ~30 seconds | ~9 seconds | 70% |
| **Total (typical project)** | **~75 seconds** | **~22 seconds** | **71%** |

**Real-world example:**
- Project: 4 components with 14 variants + 22 sample content items
- Could have saved ~40% of execution time with parallel operations
- Estimated savings: 30-45 minutes across full project

## Best Practices

### Batch Size Recommendations

**Fields**: Create 5-10 fields per parallel batch
- More than 10 = harder to debug if one fails
- Fewer than 5 = not enough benefit

**Variants**: Create all variants in one parallel batch (typically 3-4)
- Variants are lightweight
- Rarely fail
- All belong together logically

**Children**: Create up to 10 children per parallel batch
- More than 10 = consider if design needs parent/child pattern
- Group related children together

### Error Handling

**When one operation in parallel batch fails:**
- Other operations may still succeed
- Check individual results, don't assume all-or-nothing
- Retry failed operations individually
- Don't retry the entire batch

**Example:**
```
# Parallel batch creates 5 fields
# Field 3 fails due to name collision
# Fields 1, 2, 4, 5 succeed

# Next step: Only recreate field 3 with different name
# Don't recreate all 5 fields
```

## Decision Tree

```
Are the operations independent?
├─ YES → Can they run in any order?
│   ├─ YES → Run in parallel ✅
│   └─ NO → Run sequentially ❌
└─ NO → Does operation B need result from operation A?
    └─ YES → Run sequentially ❌
```

## Common Patterns

### Pattern 1: Template Creation

```
Message 1: Create template + section (parallel)
├─ create_content_item(name="ComponentName", templateId="<template>", ...)
└─ create_content_item(name="Data", templateId="<section>", parentId="<template-folder>")

Message 2: Create fields (parallel)
├─ create_content_item(name="fieldName1", ...)
├─ create_content_item(name="fieldName2", ...)
└─ create_content_item(name="fieldName3", ...)

Message 3: Create __Standard Values (sequential)
└─ create_content_item(name="__Standard Values", templateId="<component-id>", parentId="<component-id>")
```

**Why split?**
- Message 1: Section needs template folder ID → sequential
- Message 2: Fields need section ID, but independent of each other → parallel
- Message 3: __Standard Values needs template ID → sequential

### Pattern 2: Component with Variants

```
Message 1: Create rendering
└─ create_content_item(name="ComponentName", templateId="<json-rendering>", ...)

Message 2: Create variant container
└─ create_content_item(name="ComponentName", templateId="<variants-container>", ...)

Message 3: Create all variant definitions (parallel)
├─ create_content_item(name="Default", ...)
├─ create_content_item(name="VariantName1", ...)
└─ create_content_item(name="VariantName2", ...)
```

### Pattern 3: Parent/Child Content

```
Message 1: Create parent datasource
└─ create_content_item(name="Parent Content Item", templateId="<parent>", ...)

Message 2: Create all children (parallel)
├─ create_content_item(name="Child Item 1", templateId="<child>", parentId="<parent-id>", ...)
├─ create_content_item(name="Child Item 2", templateId="<child>", parentId="<parent-id>", ...)
└─ create_content_item(name="Child Item 3", templateId="<child>", parentId="<parent-id>", ...)
```

## Troubleshooting

**All operations in parallel batch failed:**
- Check parent path exists
- Verify templateId is correct
- Check for naming conflicts
- Try one operation alone to isolate issue

**Some operations succeeded, some failed:**
- Review individual error messages
- Don't retry successful operations
- Fix and retry only failed ones

**Parallel operations slower than expected:**
- May indicate server load or network latency
- Not a code issue, environmental factor
- Results still correct, just slower

## Quick Reference

| Scenario | Approach | Reason |
|----------|----------|--------|
| Multiple fields in section | Parallel ✅ | Independent, same parent |
| Multiple variants | Parallel ✅ | Independent, same container |
| Multiple children | Parallel ✅ | Independent, same parent (if parent exists) |
| Template → Section → Fields | Sequential ❌ | Each needs ID from previous |
| Template → __Standard Values | Sequential ❌ | Needs template's own ID |
| Parent datasource → Children | Sequential ❌ | Children need parent ID |
| Multiple independent reads | Parallel ✅ | No dependencies |
| Create → Verify → Update | Sequential ❌ | Each step needs previous result |

**Rule of thumb:** If you need an ID/result from operation A to do operation B, they must be sequential. Otherwise, parallel.
