# Project Components - Vargroup Demo

This file documents the components built for this specific project (vargroup.com replication).

---

## Design System

**Color Scheme:**
- Primary Blue: `#0066FF` (`--vargroup-blue`)
- Green: `#2EAA6C` (`--vargroup-green`)
- Gray: `#6B7280` (`--vargroup-gray`)
- Light Gray: `#F3F4F6` (`--vargroup-light-gray`)
- Dark: `#1A1A1A` (`--vargroup-dark`)

**Typography:**
- Font family: System font stack (defined in `globals.css`)

**Configuration:**
- `examples/basic-nextjs/src/app/globals.css` - CSS variables
- `examples/basic-nextjs/tailwind.config.js` - Tailwind color palette

---

## Components Built

### 1. HeroBanner

**Purpose:** Hero sections with background image overlay, headline, subheadline, and CTA buttons

**Type:** Simple component (no ComponentQuery)

**Location:** `src/components/ui/hero-banner/HeroBanner.tsx`

**Variants:**
- **Default** - Full height, left-aligned, dual CTA
- **Centered** - Full height, center-aligned
- **Compact** - Reduced height, single CTA

**Template:** `/sitecore/templates/Project/fmc-custom-demo/Components/Banners/HeroBanner`

**Fields:**
- `backgroundImage` (Image) - Hero background
- `headline` (Single-Line Text) - Main heading
- `subheadline` (Rich Text) - Supporting text
- `ctaLink` (General Link) - Primary CTA
- `secondaryCtaLink` (General Link) - Optional secondary CTA

**Sample Content:**
- `/sitecore/content/claude/claudecode/Data/Heroes/Homepage Hero`
- `/sitecore/content/claude/claudecode/Data/Heroes/Services Hero`
- `/sitecore/content/claude/claudecode/Data/Heroes/Case Studies Hero`

---

### 2. ContentCards

**Purpose:** Parent/child grid component for case studies, blog posts, portfolio items

**Type:** Parent/child component (requires ComponentQuery)

**Location:** `src/components/ui/content-cards/ContentCards.tsx`

**Variants:**
- **Default** - 3 columns, card style
- **TwoColumn** - 2 columns, larger cards
- **Overlay** - Image with text overlay
- **Minimal** - 4 columns, minimal style

**Templates:**
- Parent: `/sitecore/templates/Project/fmc-custom-demo/Components/Cards/ContentCards`
- Child: `/sitecore/templates/Project/fmc-custom-demo/Components/Cards/ContentCard`

**Parent Fields:**
- `sectionTitle` (Single-Line Text)
- `sectionDescription` (Rich Text)

**Child Fields:**
- `title` (Single-Line Text)
- `image` (Image)
- `description` (Rich Text)
- `link` (General Link)
- `badgeText` (Single-Line Text)

**Sample Content:**
- Parent: `/sitecore/content/claude/claudecode/Data/Content Cards/Featured Case Studies`
- Children: 6 case study cards (Banking, Retail, Healthcare, Manufacturing, Insurance, Logistics)

---

### 3. FeatureCards

**Purpose:** Icon-based feature/service grid for showcasing capabilities

**Type:** Parent/child component (requires ComponentQuery)

**Location:** `src/components/ui/feature-cards/FeatureCards.tsx`

**Variants:**
- **Default** - 3 columns, left-aligned icons
- **FourColumn** - 4 columns, centered icons
- **TwoColumn** - 2 columns, left-aligned
- **Centered** - 3 columns, centered icons

**Templates:**
- Parent: `/sitecore/templates/Project/fmc-custom-demo/Components/Cards/FeatureCards`
- Child: `/sitecore/templates/Project/fmc-custom-demo/Components/Cards/FeatureCard`

**Parent Fields:**
- `sectionTitle` (Single-Line Text)
- `sectionDescription` (Rich Text)

**Child Fields:**
- `featureIcon` (Image)
- `featureTitle` (Single-Line Text)
- `featureDescription` (Rich Text)
- `featureLink` (General Link)

**Sample Content:**
- Parent: `/sitecore/content/claude/claudecode/Data/Feature Cards/Our Core Services`
- Children: 8 service cards (Cloud, Software, Analytics, Security, AI/ML, DevOps, Consulting, Infrastructure)

---

### 4. CtaBanner

**Purpose:** Call-to-action sections for conversion points

**Type:** Simple component (no ComponentQuery)

**Location:** `src/components/ui/cta-banner/CtaBanner.tsx`

**Variants:**
- **Default** - Blue background (`vargroup-blue`)
- **Light** - Gray background (`vargroup-light-gray`)
- **Green** - Green background (`vargroup-green`)

**Template:** `/sitecore/templates/Project/fmc-custom-demo/Components/Banners/CtaBanner`

**Fields:**
- `headline` (Single-Line Text)
- `subheadline` (Rich Text)
- `ctaLink` (General Link)

**Sample Content:**
- `/sitecore/content/claude/claudecode/Data/CTA Banners/Get Started CTA`
- `/sitecore/content/claude/claudecode/Data/CTA Banners/Talk to Experts`
- `/sitecore/content/claude/claudecode/Data/CTA Banners/Learn More CTA`

---

### 5. ContentSplit

**Purpose:** Two-column layout with image and text content

**Type:** Simple component (no ComponentQuery)

**Location:** `src/components/ui/content-split/ContentSplit.tsx`

**Variants:**
- **Default / ImageLeft** - Image on left, text on right
- **ImageRight** - Image on right, text on left

**Template:** `/sitecore/templates/Project/fmc-custom-demo/Components/Content/ContentSplit`

**Fields:**
- `image` (Image)
- `headline` (Single-Line Text)
- `bodyText` (Rich Text)
- `ctaLink` (General Link)

**Sample Content:**
- (Existing component from starter project)

---

## Component Registration

All components registered in `examples/basic-nextjs/.sitecore/component-map.ts`:

```typescript
import * as HeroBanner from 'src/components/ui/hero-banner/HeroBanner';
import * as ContentCards from 'src/components/ui/content-cards/ContentCards';
import * as FeatureCards from 'src/components/ui/feature-cards/FeatureCards';
import * as CtaBanner from 'src/components/ui/cta-banner/CtaBanner';

export const componentMap = new Map([
  ['HeroBanner', { ...HeroBanner, componentType: 'client' }],
  ['ContentCards', { ...ContentCards, componentType: 'client' }],
  ['FeatureCards', { ...FeatureCards, componentType: 'client' }],
  ['CtaBanner', { ...CtaBanner, componentType: 'client' }],
  // ... other components
]);
```

---

## Sample Page Layouts

### Homepage
```
1. HeroBanner (Homepage Hero) - Default variant
2. FeatureCards (Our Core Services) - Default variant
3. ContentSplit (existing)
4. ContentCards (Featured Case Studies) - Default variant
5. CtaBanner (Get Started CTA) - Default variant
```

### Services Page
```
1. HeroBanner (Services Hero) - Compact variant
2. FeatureCards (Our Core Services) - FourColumn variant
3. ContentCards (Featured Case Studies) - TwoColumn variant
4. CtaBanner (Talk to Experts) - Light variant
```

### Case Studies Page
```
1. HeroBanner (Case Studies Hero) - Centered variant
2. ContentCards (Featured Case Studies) - Overlay variant
3. CtaBanner (Learn More CTA) - Green variant
```

---

## Project Stats

- **Components created:** 4 (HeroBanner, ContentCards, FeatureCards, CtaBanner)
- **Total variants:** 14
- **Sample content items:** 22
- **Development time:** ~4 hours
- **Status:** Demo-ready

---

## Related Documentation

- `VARGROUP-IMPLEMENTATION.md` - Full implementation guide
- `SITECORE-SETUP-GUIDE.md` - Step-by-step configuration
- `SAMPLE-CONTENT-CREATED.md` - Complete sample content reference
- `PROJECT-STATUS.md` - Overall project status
