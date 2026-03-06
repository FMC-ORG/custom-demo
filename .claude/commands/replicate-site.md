# Replicate Website as SitecoreAI Components

You are a SitecoreAI expert and agentic orchestrator. Your job is to replicate an existing 
website as a fully working custom demo in SitecoreAI — fetching images, uploading assets, 
creating datasource items, building pages, and placing components, all via the Marketer MCP.

**You have direct access to the Marketer MCP tools. Use them to take real actions in 
SitecoreAI. Do NOT generate manual GraphQL or API call instructions — execute everything.**

## Input

- **Website to replicate:** $ARGUMENTS
- **Screenshots folder:** `./screenshots/` in the current directory (your visual fallback)

---

## PHASE 1 — Analyse

### 1.1 Fetch the website
Fetch `$ARGUMENTS` and review the HTML. Also read every image in `./screenshots/` if present.

If the HTML is incomplete or JS-heavy (few or no `<img>` tags found), that is expected — 
the screenshots folder is the visual source of truth. Use both together.

Identify and document:
- Color palette, typography, spacing
- All distinct sections top-to-bottom (hero, nav, features, testimonials, CTA, footer, etc.)
- Which images belong to which section
- Text content per section (headlines, body copy, CTAs)
- Recurring patterns that should become reusable components

### 1.2 Build a Section Map
Before doing anything else, output a Section Map like this:

```
SECTION MAP
───────────────────────────────────────────────
Section       | Images needed | Component type
───────────────────────────────────────────────
hero          | 1 (bg image)  | Code (Promo clone)
nav           | 1 (logo)      | Code (PageContent)
features      | 3 (icons)     | Code (Promo clone x3)
testimonials  | 3 (avatars)   | Code (Promo clone)
cta-banner    | 0             | Code (PageContent)
footer        | 1 (logo)      | Code (PageContent)
───────────────────────────────────────────────
```

**Do not proceed to Phase 2 until the Section Map is complete.**

---

## PHASE 2 — Image Pipeline

Process sections **one at a time**, in top-to-bottom order.

### 2.1 Download images for the current section
Run the fetch script via bash:

```bash
node scripts/fetch-images.js $ARGUMENTS ./screenshots
```

This outputs `/tmp/demo-images/image-map.json` with all downloaded images 
grouped by section and their local file paths.

Read `image-map.json` to get the `localPath` for each image in the current section.

### 2.2 Upload each image to Sitecore Media Library
For each image in the current section, call the Marketer MCP upload tool:

```
Tool: upload_asset
  localPath:   /tmp/demo-images/[section]/[filename]
  name:        [descriptive name, e.g. "hero-background"]  
  folder:      Custom Demo/[site-name]/[section]
  tags:        ["custom-demo", "[section-name]", "[site-name]"]
```

**Store the returned `mediaId` and `mediaPath` — you need them in Phase 3.**

If an upload fails:
1. Check if a visually equivalent image exists in `./screenshots/` and use that instead
2. If no image is available, note it and continue — use a placeholder in the datasource

### 2.3 Track media uploads
Maintain a running media registry in memory:

```
MEDIA REGISTRY
─────────────────────────────────────────────────────
Section       | Field         | mediaId  | mediaPath
─────────────────────────────────────────────────────
hero          | BackgroundImg | abc-123  | /Custom Demo/...
features      | Icon1         | def-456  | /Custom Demo/...
...
─────────────────────────────────────────────────────
```

---

## PHASE 3 — Content & Datasource Creation

For each section, after its images are uploaded:

### 3.1 Create the datasource item
Call the Marketer MCP to create a datasource item for the section's component:

```
Tool: create_item (or equivalent datasource creation tool)
  template:  [appropriate template path]
  name:      [site-name]-[section-name]
  location:  /sitecore/content/[site]/Data/[ComponentName]
  fields:
    Title:          "[extracted headline text]"
    Subtitle:       "[extracted subheading]"  
    Body:           "[extracted body copy]"
    CtaText:        "[CTA button label]"
    CtaLink:        "[CTA URL]"
    Image:          [mediaId from Phase 2]
```

Use text extracted from the website fetch or screenshots analysis.
Match field names to what was defined in the Component Inventory (Phase 1).

### 3.2 Section-by-section rhythm
Always complete this full cycle per section before moving to the next:
```
Upload images → Create datasource → Confirm both succeeded → Next section
```

Never batch all uploads first then all datasources. This keeps each section 
recoverable independently if something fails.

---

## PHASE 4 — Component Architecture

### 4.1 Component Inventory
For each section, define the component:

| Component Name | Type | Clone Base | Datasource Fields |
|---|---|---|---|
| HeroBanner | Code | Promo | Title, Subtitle, CtaText, CtaLink, BackgroundImage |
| FeatureCard | Code | Promo | Title, Body, Icon (reused 3x with different data) |
| TestimonialItem | Code | Promo | Quote, AuthorName, AuthorRole, Avatar |
| CtaBanner | Code | PageContent | Title, Body, CtaText, CtaLink |
| SiteFooter | Code | PageContent | Logo, TagLine, Links |

**Maximise reusability:** If the same layout appears multiple times with different 
content (e.g. feature cards, team members), create ONE component and multiple datasource 
items — not multiple components.

### 4.2 React component code
For each Code component, generate the full `.tsx` file:

```tsx
import React from 'react';
import { 
  Text, Image as JssImage, Link as JssLink, RichText,
  Field, ImageField, LinkField 
} from '@sitecore-jss/sitecore-jss-nextjs';

interface Fields {
  Title: Field<string>;
  // ... all fields
}

type ComponentProps = {
  params: { [key: string]: string };
  fields: Fields;
};

const DefaultVariant = (props: ComponentProps): React.JSX.Element => (
  <div className={`component [name] ${props.params.styles ?? ''}`}>
    <div className="component-content">
      <span className="is-empty-hint">Assign a datasource to edit content.</span>
    </div>
  </div>
);

export const Default = (props: ComponentProps): React.JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const styles = `${props.params.GridParameters ?? ''} ${props.params.styles ?? ''}`.trim();

  if (!props.fields) return <DefaultVariant {...props} />;

  return (
    <div className={`component [name] ${styles}`} id={id ?? undefined}>
      {/* Markup closely matching the original site section */}
    </div>
  );
};
```

CSS should use variables matching the site's color palette and typography 
extracted in Phase 1.

### 4.3 Style Library definition
Output a style guide for the SitecoreAI Styles Library:

```
Colors:     primary / secondary / background / text / accent (hex values)
Typography: heading font + body font (with weights)
Spacing:    base unit, section padding, component gap
Radii:      border-radius values used
Shadows:    shadow definitions
```

---

## PHASE 5 — Page Assembly

### 5.1 Create pages
For each page of the demo site, call the Marketer MCP:

```
Tool: create_page
  name:     [page name]
  site:     [site name]
  template: [page template]
```

### 5.2 Add components to pages
For each section, in top-to-bottom order:

```
Tool: add_component_on_page
  page:        [page path]
  component:   [component name]
  placeholder: [placeholder key]
  datasource:  [datasource item path from Phase 3]
```

### 5.3 Page map
Document what was built:

```
HOME PAGE
  ├── /Header placeholder
  │     └── Navigation  (datasource: /Data/Navigation/main-nav)
  ├── /Main placeholder  
  │     ├── HeroBanner  (datasource: /Data/HeroBanner/hero-main)
  │     ├── FeatureCard (datasource: /Data/FeatureCard/feature-1)
  │     ├── FeatureCard (datasource: /Data/FeatureCard/feature-2)
  │     ├── FeatureCard (datasource: /Data/FeatureCard/feature-3)
  │     ├── TestimonialItem (datasource: /Data/Testimonial/testimonial-1)
  │     └── CtaBanner   (datasource: /Data/CtaBanner/cta-main)
  └── /Footer placeholder
        └── SiteFooter  (datasource: /Data/Footer/main-footer)
```

---

## PHASE 6 — Verification

After all pages are assembled:

1. Call `get_page_preview_url` for each page and report the preview URLs
2. List any sections where images failed to upload and what placeholder was used instead
3. List any content fields that were left empty due to incomplete HTML extraction
4. Output a final summary:

```
DEMO BUILD SUMMARY
──────────────────────────────────────────
Site:           [site name]
Pages created:  [n]
Components:     [n] unique, [n] total placements
Images:         [n] uploaded, [n] failed/placeholder
Preview URLs:   [list]
──────────────────────────────────────────
Issues to fix manually:
  - [list any gaps]
```

---

## Execution Rules

- **Work section by section.** Complete upload → datasource → placement before moving on.
- **Always use Marketer MCP tools** for all Sitecore actions. Never output manual API calls.
- **Use screenshots as the visual reference** when HTML is incomplete.
- **Infer content from context** when text can't be scraped — match the tone and structure 
  of the original, using placeholder-appropriate copy.
- **Stop and report** if a Marketer MCP tool call fails twice. Don't silently skip sections.
- **Apply all project rules** from `CLAUDE.md` throughout — naming conventions, folder 
  structure, component standards, etc.