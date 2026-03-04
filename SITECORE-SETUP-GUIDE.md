# Sitecore Setup Guide - Vargroup Components

This guide provides all specifications needed to create templates and renderings for the new vargroup components.

## Prerequisites
- MCP connection to Sitecore XM Cloud
- Site name identified (use `list_sites` or `search_site`)
- Project folder: `fmc-custom-demo`

---

## Component 1: Hero Banner

### Step 1: Create Template
**Location**: `/sitecore/templates/Project/fmc-custom-demo/Components/Banners/`

**Template Name**: `HeroBanner`
**Template ID**: Generate new GUID

**Section**: `Data`
**Fields**:
1. **BackgroundImage**
   - Type: `Image`
   - Title: Background Image

2. **Headline**
   - Type: `Single-Line Text`
   - Title: Headline

3. **Subheadline**
   - Type: `Rich Text`
   - Title: Subheadline

4. **CtaLink**
   - Type: `General Link`
   - Title: CTA Link

5. **SecondaryCtaLink**
   - Type: `General Link`
   - Title: Secondary CTA Link

### Step 2: Create __Standard Values
Set default values:
```
BackgroundImage: (empty or placeholder)
Headline: "Welcome to Our Website"
Subheadline: "<p>Discover innovative solutions</p>"
CtaLink: '<link text="Learn More" anchor="" linktype="external" class="" title="" target="" querystring="" url="#" />'
SecondaryCtaLink: '<link text="Contact Us" anchor="" linktype="external" class="" title="" target="" querystring="" url="#" />'
```

### Step 3: Create Folder Template
**Name**: `HeroBanner Folder`
**__Masters**: Set to HeroBanner template ID

### Step 4: Create Folder Instance
**Location**: `/sitecore/content/<site-collection>/<site-name>/Data/`
**Name**: `Heroes`
**Template**: HeroBanner Folder

### Step 5: Create Rendering
**Location**: `/sitecore/layout/Renderings/Project/fmc-custom-demo/Banners/`
**Name**: `HeroBanner`
**Template**: JSON Rendering (`04646a89-996f-4ee7-878a-ffdbf1f0ef0d`)

**Fields**:
- **componentName**: `HeroBanner` (exact match to component-map)
- **Datasource Template**: `/sitecore/templates/Project/fmc-custom-demo/Components/Banners/HeroBanner`
- **Datasource Location**: `query:$site/*[@@name='Data']/*[@@templatename='HeroBanner Folder']|query:$sharedSites/*[@@name='Data']/*[@@templatename='HeroBanner Folder']`
- **AddFieldEditorButton**: `1`
- **ComponentQuery**: (leave empty - simple component)

### Step 6: Create Variant Definitions
**Location**: `/sitecore/content/<site-collection>/<site-name>/Presentation/Headless Variants/`

1. Create container: `HeroBanner` (Variants container template)
2. Create variants:
   - `Default` (Variant Definition)
   - `Centered` (Variant Definition)
   - `Compact` (Variant Definition)

---

## Component 2: Content Cards (Parent/Child)

### Step 1: Create Child Template (ContentCard)
**Location**: `/sitecore/templates/Project/fmc-custom-demo/Components/Cards/`

**Template Name**: `ContentCard`
**Section**: `Data`
**Fields**:
1. **title** - Single-Line Text
2. **image** - Image
3. **description** - Single-Line Text
4. **link** - General Link
5. **badgeText** - Single-Line Text

**__Standard Values**:
```
title: "Card Title"
description: "Card description text"
badgeText: "NEW"
link: '<link text="Read More" anchor="" linktype="external" class="" title="" target="" querystring="" url="#" />'
```

### Step 2: Create Parent Template (ContentCards)
**Location**: `/sitecore/templates/Project/fmc-custom-demo/Components/Cards/`

**Template Name**: `ContentCards`
**Base Templates**: Add `_HorizonDatasourceGrouping` (`{D0F6BE14-2A2D-4C56-ACB5-80CAA573B8E2}`)

**Section**: `Data`
**Fields**:
1. **sectionTitle** - Single-Line Text
2. **sectionDescription** - Single-Line Text

**__Standard Values**:
```
sectionTitle: "Featured Content"
sectionDescription: "Explore our latest work"
__Masters: <ContentCard template ID>
```

### Step 3: Create Folder Template
**Name**: `ContentCards Folder`
**__Masters**: ContentCards template ID

### Step 4: Create Folder Instance
**Location**: `/sitecore/content/<site-collection>/<site-name>/Data/`
**Name**: `Content Cards`
**Template**: ContentCards Folder

### Step 5: Create Rendering
**Name**: `ContentCards`
**componentName**: `ContentCards`
**Datasource Template**: `/sitecore/templates/Project/fmc-custom-demo/Components/Cards/ContentCards`
**Datasource Location**: `query:$site/*[@@name='Data']/*[@@templatename='ContentCards Folder']|query:$sharedSites/*[@@name='Data']/*[@@templatename='ContentCards Folder']`
**AddFieldEditorButton**: `1`

**ComponentQuery**:
```graphql
query ContentCards($datasource: String!, $language: String!) {
  datasource: item(path: $datasource, language: $language) {
    ... on ContentCards {
      sectionTitle { jsonValue }
      sectionDescription { jsonValue }
    }
    children {
      results {
        ... on ContentCard {
          id
          title { jsonValue }
          image { jsonValue }
          description { jsonValue }
          link { jsonValue }
          badgeText { jsonValue }
        }
      }
    }
  }
}
```

### Step 6: Create Variant Definitions
Container: `ContentCards`
Variants:
- `Default`
- `TwoColumn`
- `Overlay`
- `Minimal`

---

## Component 3: Feature Cards (Parent/Child)

### Step 1: Create Child Template (FeatureCard)
**Location**: `/sitecore/templates/Project/fmc-custom-demo/Components/Cards/`

**Template Name**: `FeatureCard`
**Section**: `Data`
**Fields**:
1. **featureIcon** - Image
2. **featureTitle** - Single-Line Text
3. **featureDescription** - Multi-Line Text
4. **featureLink** - General Link

**__Standard Values**:
```
featureTitle: "Feature Name"
featureDescription: "Feature description"
featureLink: '<link text="Learn More" anchor="" linktype="external" class="" title="" target="" querystring="" url="#" />'
```

### Step 2: Create Parent Template (FeatureCards)
**Location**: `/sitecore/templates/Project/fmc-custom-demo/Components/Cards/`

**Template Name**: `FeatureCards`
**Base Templates**: Add `_HorizonDatasourceGrouping`

**Section**: `Data`
**Fields**:
1. **sectionTitle** - Single-Line Text
2. **sectionDescription** - Single-Line Text

**__Standard Values**:
```
sectionTitle: "Our Services"
sectionDescription: "What we offer"
__Masters: <FeatureCard template ID>
```

### Step 3: Create Folder Template & Instance
**Folder Template Name**: `FeatureCards Folder`
**Folder Instance Location**: `/sitecore/content/<site-collection>/<site-name>/Data/Feature Cards`

### Step 4: Create Rendering
**Name**: `FeatureCards`
**componentName**: `FeatureCards`
**Datasource Template**: `/sitecore/templates/Project/fmc-custom-demo/Components/Cards/FeatureCards`
**Datasource Location**: `query:$site/*[@@name='Data']/*[@@templatename='FeatureCards Folder']|query:$sharedSites/*[@@name='Data']/*[@@templatename='FeatureCards Folder']`
**AddFieldEditorButton**: `1`

**ComponentQuery**:
```graphql
query FeatureCards($datasource: String!, $language: String!) {
  datasource: item(path: $datasource, language: $language) {
    ... on FeatureCards {
      sectionTitle { jsonValue }
      sectionDescription { jsonValue }
    }
    children {
      results {
        ... on FeatureCard {
          id
          featureIcon { jsonValue }
          featureTitle { jsonValue }
          featureDescription { jsonValue }
          featureLink { jsonValue }
        }
      }
    }
  }
}
```

### Step 5: Create Variant Definitions
Container: `FeatureCards`
Variants:
- `Default`
- `FourColumn`
- `TwoColumn`
- `Centered`

---

## Component 4: CTA Banner

### Step 1: Create Template
**Location**: `/sitecore/templates/Project/fmc-custom-demo/Components/Banners/`

**Template Name**: `CtaBanner`
**Section**: `Data`
**Fields**:
1. **Headline** - Single-Line Text
2. **Subheadline** - Single-Line Text
3. **CtaLink** - General Link

**__Standard Values**:
```
Headline: "Ready to Get Started?"
Subheadline: "Contact us today to learn more"
CtaLink: '<link text="Get Started" anchor="" linktype="external" class="" title="" target="" querystring="" url="#" />'
```

### Step 2: Create Folder Template & Instance
**Folder Template Name**: `CtaBanner Folder`
**Folder Instance**: `/sitecore/content/<site-collection>/<site-name>/Data/CTA Banners`

### Step 3: Create Rendering
**Name**: `CtaBanner`
**componentName**: `CtaBanner`
**Datasource Template**: `/sitecore/templates/Project/fmc-custom-demo/Components/Banners/CtaBanner`
**Datasource Location**: `query:$site/*[@@name='Data']/*[@@templatename='CtaBanner Folder']|query:$sharedSites/*[@@name='Data']/*[@@templatename='CtaBanner Folder']`
**AddFieldEditorButton**: `1`
**ComponentQuery**: (leave empty)

### Step 4: Create Variant Definitions
Container: `CtaBanner`
Variants:
- `Default`
- `Light`
- `Green`

---

## MCP Command Reference

### Create Template
```
create_content_item(
  name="<TemplateName>",
  templateId="ab86861a-6030-46c5-b394-e8f99e8b87db",
  parentId="<parent-folder-id>"
)
```

### Create Section
```
create_content_item(
  name="Data",
  templateId="e269fbb5-3750-427a-9149-7aa950b49301",
  parentId="<template-id>"
)
```

### Create Field
```
create_content_item(
  name="<FieldName>",
  templateId="455a3e98-a627-4b40-8035-e683a0331ac7",
  parentId="<section-id>",
  fields={"Type": "<field-type>"}
)
```

### Create __Standard Values
```
create_content_item(
  name="__Standard Values",
  templateId="<template-id>",
  parentId="<template-id>"
)
```

### Update Fields
```
update_fields_on_content_item(
  itemId="<item-id>",
  fields={
    "FieldName": "Value",
    "__Masters": "<child-template-id>"
  }
)
```

### Create Rendering
```
create_content_item(
  name="<ComponentName>",
  templateId="04646a89-996f-4ee7-878a-ffdbf1f0ef0d",
  parentId="<renderings-folder-id>"
)
```

---

## Post-Creation Steps

1. **Publish**: Publish all new templates and renderings
2. **Create Sample Content**: Create sample datasource items for each component
3. **Build Sample Pages**: Create homepage, service page, case study page
4. **Test**: Verify components work in Pages editor
5. **Upload Assets**: Upload brand images and icons to Media Library

---

## Troubleshooting

**Components not showing in Pages editor:**
- Verify componentName matches component-map key exactly
- Check rendering is JSON Rendering template
- Publish rendering items

**Datasource picker empty:**
- Verify folder template exists
- Verify folder instance exists in Data/
- Check Datasource Location query syntax
- Ensure __Masters is set on folder template's __Standard Values

**Children not editable in Content tab:**
- Add `_HorizonDatasourceGrouping` to parent template base templates
- Set __Masters on parent's __Standard Values to child template ID

**GraphQL errors:**
- Validate ComponentQuery syntax
- Check template names match (PascalCase)
- Ensure all fields have `{ jsonValue }`
- Include `id` in children results

---

## Quick Start Script

Once MCP is available, use the following order:

1. Create all templates (HeroBanner, ContentCard, ContentCards, FeatureCard, FeatureCards, CtaBanner)
2. Create sections and fields for each
3. Create __Standard Values for each
4. Create folder templates
5. Create folder instances in Data/
6. Create renderings
7. Create variant definitions
8. Publish
9. Test in Pages editor

---

**Next**: Once Sitecore configuration is complete, create sample content and build demonstration pages.
