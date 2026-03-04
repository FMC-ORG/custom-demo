# Vargroup.com Replication - Implementation Guide

## Overview
This document outlines the implementation of a Sitecore XM Cloud website replicating the design and layout of vargroup.com.

## Design System

### Color Palette
- **Primary Blue**: `#0066FF` (--vargroup-blue)
- **Secondary Green**: `#2EAA6C` (--vargroup-green)
- **Gray**: `#6B7280` (--vargroup-gray)
- **Light Gray**: `#F3F4F6` (--vargroup-light-gray)
- **Dark**: `#1A1A1A` (--vargroup-dark)

### Typography
- Modern sans-serif font family (Open Sans)
- Clear hierarchy with bold headings
- Good contrast and whitespace

## Component Library

### 1. Hero Banner (`hero-banner`)
**Purpose**: Large hero sections with background image and overlay content

**Fields**:
- `BackgroundImage` (Image)
- `Headline` (Single-Line Text)
- `Subheadline` (Rich Text)
- `CtaLink` (General Link)
- `SecondaryCtaLink` (General Link)

**Variants**:
- `Default`: Full height, left-aligned, strong overlay (50%)
- `Centered`: Medium height, centered content, medium overlay (40%)
- `Compact`: Smaller height, left-aligned, light overlay (30%)

**Use Cases**: Homepage hero, service page headers, case study headers

---

### 2. Content Cards (`content-cards`)
**Purpose**: Parent/child grid component for displaying collections of content (case studies, blog posts, services)

**Parent Fields**:
- `sectionTitle` (Single-Line Text)
- `sectionDescription` (Single-Line Text)

**Child Fields** (ContentCard):
- `title` (Single-Line Text)
- `image` (Image)
- `description` (Single-Line Text)
- `link` (General Link)
- `badgeText` (Single-Line Text)

**Variants**:
- `Default`: 3 columns, card style with shadow, shows badges
- `TwoColumn`: 2 columns, card style
- `Overlay`: 3 columns, content overlaid on image
- `Minimal`: 4 columns, minimal style without shadows

**Use Cases**: Case study grids, blog post grids, service offerings

---

### 3. Feature Cards (`feature-cards`)
**Purpose**: Icon-based grid for displaying features, services, or capabilities

**Parent Fields**:
- `sectionTitle` (Single-Line Text)
- `sectionDescription` (Single-Line Text)

**Child Fields** (FeatureCard):
- `featureIcon` (Image)
- `featureTitle` (Single-Line Text)
- `featureDescription` (Multi-Line Text)
- `featureLink` (General Link)

**Variants**:
- `Default`: 3 columns, left-aligned
- `FourColumn`: 4 columns, center-aligned, compact
- `TwoColumn`: 2 columns, left-aligned
- `Centered`: 3 columns, center-aligned

**Use Cases**: Service capabilities, features overview, technology stack

---

### 4. CTA Banner (`cta-banner`)
**Purpose**: Call-to-action sections with headline and button

**Fields**:
- `Headline` (Single-Line Text)
- `Subheadline` (Single-Line Text)
- `CtaLink` (General Link)

**Variants**:
- `Default`: Blue background, white text, white button
- `Light`: Light gray background, dark text, blue button
- `Green`: Green background, white text, outline button

**Use Cases**: End-of-section CTAs, conversion-focused sections

---

### 5. Content Split (`content-split`)
**Purpose**: Two-column layout with image and text (already existing, enhanced)

**Fields**:
- `ContentSplitImage` (Image)
- `EyebrowLabel` (Single-Line Text)
- `SectionHeadline` (Single-Line Text)
- `BodyText` (Rich Text)
- `BulletPointsContent` (Rich Text)
- `CTALink` (General Link)

**Variants**:
- `Default` / `ImageLeft`: Image left, text right, bullets, CTA as button
- `ImageRight`: Image right, text left, no bullets, CTA as link

**Use Cases**: Alternating content sections, product features, service details

---

## Page Templates

### Homepage
**Structure**:
1. Hero Banner (Default or Centered)
2. Feature Cards (services overview)
3. Content Split (alternating product/service highlights)
4. Content Cards (case studies / recent work)
5. CTA Banner

### Service Page
**Structure**:
1. Hero Banner (Compact)
2. Content Split (service description)
3. Feature Cards (capabilities)
4. Content Cards (related case studies)
5. CTA Banner

### Case Study Page
**Structure**:
1. Hero Banner (Compact with project image)
2. Rich Text Content Block (project details)
3. Content Split (project highlights)
4. Content Cards (related case studies)
5. CTA Banner

---

## Next Steps

### Phase 3: Sitecore Configuration
1. Create templates for each component:
   - HeroBanner template
   - ContentCards parent + ContentCard child templates
   - FeatureCards parent + FeatureCard child templates
   - CtaBanner template

2. Create renderings:
   - Set componentName (kebab-case)
   - Configure Datasource Template (full path)
   - Configure Datasource Location (query)
   - Add ComponentQuery for parent/child components

3. Create datasource folders:
   - Create folder templates
   - Create folder instances in Data/

4. Create Variant Definitions:
   - Under `/Presentation/Headless Variants/`
   - Match variant export names exactly

### Phase 4: Content Creation
1. Upload brand assets (images, icons)
2. Create sample datasource items
3. Build sample pages
4. Test responsive design

---

## Technical Notes

- All components use Tailwind CSS for styling
- Components handle both GraphQL (camelCase/jsonValue) and JSS (PascalCase/.value) field formats
- Proper empty state handling for Pages editor
- Accessible markup with semantic HTML
- Responsive design (mobile-first)
- TypeScript for type safety

## Files Modified/Created

### Created:
- `src/components/ui/hero-banner/HeroBanner.tsx`
- `src/components/ui/content-cards/ContentCards.tsx`
- `src/components/ui/feature-cards/FeatureCards.tsx`
- `src/components/ui/cta-banner/CtaBanner.tsx`

### Modified:
- `src/app/globals.css` (color scheme updated)
- `tailwind.config.js` (vargroup colors added)
- `.sitecore/component-map.ts` (new components registered)

---

## Design Fidelity Checklist

✅ Color palette matches vargroup.com
✅ Component modularity and reusability maximized
✅ Responsive layout support
✅ Clean, semantic HTML structure
✅ Variant system for flexibility
⏳ Sitecore templates and renderings (next phase)
⏳ Sample content and pages (next phase)
⏳ Brand assets uploaded (next phase)

---

**Ready for customer presentation once Sitecore configuration and sample content are complete.**
