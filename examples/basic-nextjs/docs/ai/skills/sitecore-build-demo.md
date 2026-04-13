# Sitecore build demo from URL

Use this skill when a Solution Engineer wants to create a Sitecore demo that replicates a client's homepage.

## Trigger hints
Use this skill when:
- the user provides a URL and says "build a demo", "replicate this site", "create a demo for [client]"
- the user provides a screenshot of a homepage and asks to build components for it
- the user says "analyze this homepage and build the components"

## Prerequisites
- Template component library must be built (check manifest for 17+ components with status "complete")
- Playwright scraper must be installed (`node docs/ai/scripts/site-scraper.mjs --help` should work)

## Load first
- `docs/ai/catalog/component-registry.yaml`
- `docs/ai/catalog/theme-component-mapping.md`
- `docs/ai/manifests/sitecore-manifest.yaml`

## Full workflow

### Phase 0 — Gather inputs (screenshot required)

A screenshot is the **primary input** for demo creation. Without a visual reference, the build plan will be wrong.

**Collect from the user:**
1. **Client name** (required) — for file naming and content
2. **Screenshot** (required) — full-page desktop screenshot of the homepage to replicate
3. **Client URL** (optional) — used for content extraction in Phase 2.5 and theme scraping

**How to obtain the screenshot:**

| User provides | Action |
|---|---|
| URL only | Run Playwright scraper to capture screenshot. If scraper fails (403, auth, CAPTCHA), ask user to provide a screenshot manually. Do NOT proceed without one. |
| Screenshot only | Use it directly. URL-based content extraction (Phase 2.5) will be skipped — content comes from screenshot analysis. |
| URL + screenshot | Use the screenshot for visual analysis (Phases 1-2). Use the URL for content extraction (Phase 2.5). |
| Neither | Ask for at least a screenshot. Do not proceed without visual reference. |

**HARD RULE: Never proceed to Phase 1 without a screenshot.** Web fetch and web search are insufficient — they miss layout, spacing, card styles, section backgrounds, and visual hierarchy that drive variant selection.

### Phase 0.5 — Manifest health check

Before any demo work, validate that the manifest is usable and pointing at the right environment.

**Run the `sitecore-validate-manifest` skill in Quick mode.**

This performs:
1. Config consistency check (`project.yaml` vs manifest `project` block)
2. Root path validation (7 parallel MCP calls to verify structural folders exist)
3. React file existence check (all component files present)
4. Component map cross-check

**Decision tree:**

| Quick result | Action |
|---|---|
| All PASS | Proceed to Phase 1 |
| Config mismatch only | Auto-fix applied, re-run Quick, then proceed |
| Root paths fail | STOP — ask user to verify environment. Do not proceed. |
| React files missing | WARN user, but can proceed (missing components won't be used in this demo) |
| Component map mismatch | WARN user — dev server restart may be needed after demo build |

**If Quick validation finds stale IDs** (items exist but with different GUIDs), the skill auto-repairs the manifest. The user is shown what changed before proceeding.

**If the user requests Full validation** (or Quick fails on multiple checks), run Full mode. This adds per-component deep checks (~3-5 minutes) but guarantees every template, rendering, datasource folder, example item, and variant container exists.

**Do not skip this phase.** A stale manifest causes silent failures in Phase 3 (content population) that are hard to diagnose.

### Phase 1 — Extract the brand theme

Use the `sitecore-extract-theme` skill:

1. Run the Playwright scraper:
   ```
   node docs/ai/scripts/site-scraper.mjs --url <URL> --output docs/ai/themes/<client-kebab>
   ```
2. Read the scraper output (`extracted-styles.json`, `meta.json`)
3. Inspect the screenshots
4. Produce `docs/ai/themes/<client-kebab>.theme.yaml`
5. Present the theme to the user for review

**Do not proceed past Phase 1 until the user confirms the theme.**

### Phase 2 — Analyze the homepage

Use the `site-analyzer` agent (`docs/ai/agents/site-analyzer.md`):

1. Read the component registry and theme mapping
2. Inspect the desktop screenshot top-to-bottom
3. Identify every section on the page
4. Match each section to a template component + best-fit variant
5. **Variant gap analysis** — for each matched section:
   - Check if the selected variant already exists (named export in TSX + Variant Definition in Sitecore)
   - If variant exists → mark as `variantMatch: "exact"`
   - If no existing variant matches the visual → mark as `variantMatch: "none"` and describe the custom variant needed:
     ```yaml
     customVariantNeeded:
       name: "EurobankCards"     # PascalCase, will become React export name
       description: "2x3 card grid with top images, red accent links, hover scale effect"
       parentComponent: "FeatureCardsGrid"  # existing component to add variant to
     ```
   - If a variant partially matches → mark as `variantMatch: "partial"` and note what differs
6. Extract visible content from the screenshot (in English)
7. **API-addable classification** — classify each component:
   - `apiAddable: true` — has a datasource template, can be added via `add_component_on_page`
   - `apiAddable: false` — context-only component (no datasource template), must be added manually in Pages editor

   Context-only components (NavigationHeader, SiteFooter) will fail with "No datasource template found" when using `add_component_on_page`. Flag these in the build plan so the assembly phase skips them and includes them in the manual tasks checklist.
8. Output `docs/ai/demos/<client-kebab>/build-plan.yaml`
7. Present the build plan to the user:
   - List of sections with matched components and variants
   - Any sections marked as "custom" that need building from scratch
   - Confidence levels
   - Estimated work: N template components + M custom components

**⛔ MANDATORY CHECKPOINT — Do not proceed past Phase 2.**

Present the build plan to the user and STOP. Wait for explicit approval before creating any Sitecore items, datasource content, or React code.

Show:
1. Section-by-section component mapping with variants
2. Variant gap analysis (which variants exist vs. which need creation)
3. Components classified as API-addable vs. manual-only
4. Content language: confirm all content will be in English
5. Estimated work: N existing components + M custom variants + P manual steps

The user must say "approved", "go ahead", "looks good", or equivalent before Phase 2.5 begins. If the user requests changes, update the plan and re-present.

**Why this gate exists:** In the Eurobank demo build, skipping approval led to creating wrong variants, wrong content language, and wrong page structure — all of which had to be redone. This checkpoint prevents ~15 minutes of wasted MCP calls.

### Phase 2.5 — Extract and map content

After the build plan is approved, extract precise content from the client site and map it to component fields.

**Step 1 — Run the content extractor script:**
```bash
node docs/ai/scripts/content-extractor.mjs --url <CLIENT_URL> --output docs/ai/demos/<client-kebab>
```

This produces `docs/ai/demos/<client-kebab>/extracted-content.json` with:
- DOM-extracted text per section (headings, paragraphs, links, images)
- Repeated item detection (cards, list items)
- Source language detection
- Background color hints per section

**Step 2 — Run the content-scraper agent** (`docs/ai/agents/content-scraper.md`):

The agent reads the build plan + extracted content and:
1. Matches extracted DOM sections to build plan sections (using headings as anchors)
2. **Translates all content to English** (if source language is not English)

> **HARD RULE: All demo content must be created in English (en), regardless of source page language.**
> Never create datasource items in the source language (Greek, Spanish, French, etc.) even if the screenshot shows non-English text. Always translate to natural English.
> This rule exists because demos are shown to English-speaking stakeholders. Creating in the source language then translating back wastes two round-trips of MCP calls.
3. Maps content to specific Sitecore component fields
4. Handles field types (plain text vs Rich Text vs General Link vs Image)
5. Outputs `docs/ai/demos/<client-kebab>/content-map.yaml`

The content map is the input for Phase 3 — it contains exact field values ready to write to Sitecore.

**Why this phase exists:** Phase 2 extracts approximate content from screenshots (good enough for the build plan). Phase 2.5 extracts precise content from the DOM (needed for accurate datasource population). The extractor also captures links, image URLs, and content that isn't visible in screenshots (below the fold, inside accordions, etc.).

**If the extractor fails** (site blocks headless browsers, requires auth):
- Fall back to the build plan's screenshot-extracted content
- Set `contentSource: "screenshot"` in the content map
- Note reduced accuracy in the summary

### Phase 3 — Populate content for template components

Create **new datasource items** with the client's content. Never modify the example items from serialization — they serve as clean defaults for every demo.

**Input:** Read `docs/ai/demos/<client>/content-map.yaml` (produced by Phase 2.5). This contains exact, English-translated field values for every section, with content already mapped to Sitecore field names.

**Context:** Each demo runs on an isolated branch + dedicated Sitecore environment deployed from serialization. All manifest IDs are valid (serialization preserves GUIDs). Example items remain untouched.

#### Naming convention

```
<ClientName> - <ComponentName>                    # default client content
<ClientName> - <ComponentName> - <Segment>        # personalization variant (SE creates later)
```

Examples:
```
Data/HeroBanners/
  ├── Hero Banner                                 # original example (untouched)
  ├── Eurobank - Hero Banner                      # default (pipeline creates)
  ├── Eurobank - Hero Banner - Families           # personalization (SE creates)
  └── Eurobank - Hero Banner - Retirees           # personalization (SE creates)
```

#### Step 1 — Create client datasource items

For each section in `buildOrder.phase1_sitecore` with `matchType: "template"`:

**Context-only components** (NavigationHeader, SiteFooter): skip — no datasource.

**Simple components:**
```
create_content_item(
  name="<ClientName> - <ComponentName>",
  templateId=manifest.templates.datasource.itemId,
  parentId=manifest.datasourceFolder.itemId
)
```
Save the returned `itemId` — Phase 6 (page assembly) will wire this to the page.

**List components (parent + children):**
```
create_content_item(
  name="<ClientName> - <ComponentName>",
  templateId=manifest.templates.datasource.itemId,
  parentId=manifest.datasourceFolder.itemId
)
```
Then create each child item under the new parent (see Step 4).

#### Step 2 — Populate text fields

For each new client datasource item:
```
update_fields_on_content_item(newItemId, {
  "Title": contentMap.sections[N].fields.Title,
  "Description": contentMap.sections[N].fields.Description,
  ... all Single-Line Text and Rich Text fields from the content map
})
```

Run multiple simple component updates in parallel — they're independent.

#### Step 3 — Populate link fields (auto-convert to Sitecore XML)

For each General Link field in the content map, convert the `{ text, href, target }` to Sitecore link XML format:

```xml
<link text="Learn more" anchor="" linktype="external" class="" title="" target="_blank" querystring="" url="https://client.com/page" />
```

Conversion rules:
- `href` starts with `http` → `linktype="external"`, set `url` attribute
- `href` is `#` or empty → `linktype="external"`, `url="#"`
- `href` is relative → prepend client domain, `linktype="external"`
- `target` is `_blank` or absent → set `target` accordingly
- **All attributes must be present** even if empty (see `docs/ai/rules/sitecore-field-formats.md`)

Include link fields in the same `update_fields_on_content_item` call as text fields when possible.

#### Step 4 — Handle children (list components only)

For each list component section, create all child items under the new client parent:

```
For each child in contentMap.sections[N].children:
  create_content_item(
    name="<ClientName> - <descriptive child name>",
    templateId=manifest.templates.child.itemId,
    parentId=<new client parent itemId from Step 1>
  )
  update_fields_on_content_item(newChildId, {
    child text fields + link fields (XML-converted)
  })
```

The number of children matches exactly what the content map specifies (extracted from the client site). No comparison with example item children needed — these are fresh items.

Children within the same parent can be created in parallel (they share a parent but are independent).

> **KNOWN ISSUE: `create_component_ds` may not reliably create children.**
>
> The `create_component_ds` tool accepts a `children` array, but children may not actually be created. After creating any list component datasource:
> 1. Read the parent item back with `get_content_item_by_id`
> 2. Check if `children.results` contains the expected number of items
> 3. If children are missing, create them individually with `create_content_item` under the parent
>
> This verification step adds ~5 seconds per list component but prevents empty card grids and stat rows.

#### Step 5 — Note image fields for manual upload

For each Image field in the content map's `imageFields` arrays, record in the image manifest:

```markdown
## Images to Upload

| Component | Field | Source URL | Alt Text | Media Library Path |
|-----------|-------|-----------|----------|-------------------|
| Eurobank - Hero Banner | HeroImage | https://eurobank.com/hero.jpg | Hero background | /media/Project/main/main-website/eurobank/hero |
| Eurobank - Feature Highlight | FeatureImage | https://eurobank.com/feature.png | Mobile app | /media/Project/main/main-website/eurobank/feature |

Downloaded images available at: docs/ai/themes/<client>/images/
```

**Note:** No `upload_asset` MCP tool exists. Images must be uploaded manually to Media Library and assigned to fields in Pages editor. See `docs/ai/reference/agent-api-limitations.md`.

#### Step 6 — Record all new items

Save all created item IDs to `docs/ai/demos/<client>/content-map.yaml`:

```yaml
client:
  name: "Eurobank"
  createdAt: "2026-04-09T..."

datasourceItems:
  - componentName: "HeroBanner"
    itemName: "Eurobank - Hero Banner"
    itemId: "{new-guid}"
    parentFolder: "{manifest datasource folder id}"
    fieldsPopulated: ["Title", "Subtitle", "PrimaryLink", "SecondaryLink"]
    imageFieldsPending: ["HeroImage"]
    children: []

  - componentName: "ProductPricingCards"
    itemName: "Eurobank - Product Pricing Cards"
    itemId: "{new-guid}"
    parentFolder: "{manifest datasource folder id}"
    fieldsPopulated: ["Title", "Description"]
    imageFieldsPending: []
    children:
      - name: "Eurobank - Personal Banking"
        itemId: "{new-guid}"
        fieldsPopulated: ["CardTitle", "CardDescription", "BadgeText", "PriceText", "CardLink"]
        imageFieldsPending: ["CardImage"]
      - name: "Eurobank - Business Banking"
        itemId: "{new-guid}"
        fieldsPopulated: [...]
```

This content map is consumed by Phase 6 (page assembly) to wire the correct datasource items.

#### Personalization readiness

The pipeline creates one default datasource per component. To add personalization:

1. **SE creates additional datasource items** in the same folder using the naming convention:
   ```
   <ClientName> - <ComponentName> - <Segment>
   ```
2. **SE sets up personalization rules** in Pages editor:
   - Select the component on the page
   - Add a personalization condition (audience segment, campaign, etc.)
   - Assign the segment-specific datasource

The pipeline provides a note in `manual-tasks.md`:
```markdown
## Personalization (Optional)

To show different content for different audience segments, create
additional datasource items in the same folder:

| Component | Folder | Template |
|-----------|--------|----------|
| Hero Banner | /Data/HeroBanners | HeroBanner template |
| Product Pricing Cards | /Data/ProductPricingCards | ProductPricingCards template |

Naming convention: "<ClientName> - <ComponentName> - <Segment>"
Example: "Eurobank - Hero Banner - Families"

Then in Pages editor: select component → Personalize → add condition → assign datasource.
```

#### Content population order

- Work through sections top-to-bottom following `buildOrder.phase1_sitecore`
- Simple components can run in **parallel** (independent datasource folders)
- List component parent must be created **before** children (sequential)
- Children within the same parent can run in **parallel**
- Use manifest IDs for template and folder lookups — don't re-resolve paths

### Phase 4 — Apply the theme

The theme was extracted in Phase 1. All 18 template components consume `--brand-*` CSS variables (see `docs/ai/reference/brand-variables.md` for the full contract).

**Write `src/app/globals-brand.css`:**

1. Read the theme YAML's `cssVariables` block (produced in Phase 1)
2. Write a `:root` block to `src/app/globals-brand.css` with all `--brand-*` overrides:
   ```css
   :root {
     --brand-primary: #00827f;
     --brand-primary-foreground: #ffffff;
     --brand-heading-font: 'Poppins', sans-serif;
     /* ... all 19 variables from the theme */
   }
   ```
3. The import is already in place (`globals.css` imports `globals-brand.css`) — no additional wiring needed

**Google Fonts (if applicable):**

4. If the theme specifies `typography.googleFontsUrl`, add a `<link>` tag to `src/app/layout.tsx`:
   ```html
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap" />
   ```

**Present the theme diff to the user before proceeding:**
- Show the `globals-brand.css` content
- Show the Google Fonts link (if any)
- Note any font substitutions (proprietary -> Google Fonts alternative)
- Ask: "Does this look correct? Ready to apply?"

The theme takes effect on next dev server restart. All 18 components pick up the new values automatically via `var(--brand-*)` references.

### Phase 5 — Build custom components (if any)

For each section in the build plan with `matchType: "custom"`:

1. Use the appropriate Sitecore creation skill (simple/list/context-only)
2. Follow the `customComponents` section of the build plan for field specs
3. Build the component from scratch with the client theme applied
4. Populate the datasource with client content
5. Update the manifest (template, rendering, datasource folder, example item, variants)
6. Register in Available Renderings
7. Register in component-map.ts

Custom components must be fully built before page assembly so they can be placed alongside template components in a single pass.

If there are no custom components (`customComponents: []` in build plan), skip to Phase 6.

### Phase 6 — Assemble the page

Add components to the page in build-plan order and wire each to its datasource item.

**Known limitation:** The Agent API cannot set rendering parameters (including variant selection) when adding components. Variants must be set manually in Pages editor after assembly. See `docs/ai/reference/agent-api-limitations.md`.

#### Step 1 — Use the existing Home page (default)

**Always use the existing Home page** unless the user explicitly asks for a new subpage. Do not create a new page by default — the Home page is the primary demo surface and already has the correct Page Design, partial designs (header/footer), and URL routing.

**Steps:**
1. Resolve the Home page: `get_content_item_by_path("/sitecore/content/<siteCollection>/<siteName>/Home")`
2. Read current components: `get_components_on_page(homePageId)`
3. Inventory what's already on the page:
   - **Custom uiim components** already placed (match by `componentName`) — these will be re-wired to new client datasources, not re-added
   - **OOB starter kit components** (RichText, Image, Container, Promo — identified by paths under `/sitecore/layout/Renderings/Feature/`) — these cannot be removed via MCP, note them for manual cleanup
4. Use the Home page ID for all subsequent `add_component_on_page` and `set_component_datasource` calls

**Only create a new subpage if the user explicitly requests it:**
```
create_page(name="<client-name> Demo", parentId=<home-page-id>, templateId=<page-template-id>)
```

Do NOT ask the user "should I use the Home page or create a new page?" — just use the Home page.

#### Step 2 — Add components to the page

For each section in the build plan, top to bottom (following `buildOrder.phase1_sitecore`):

**If component already exists on page** (Option A, matched by `componentName`):
- Skip adding — it's already placed
- Proceed to Step 3 to update its datasource

**If component is NOT on the page:**
```
add_component_on_page(
  pageId=<target-page-id>,
  componentRenderingId=<rendering itemId from manifest>,
  placeholderPath="headless-main",
  componentItemName=<componentName>
)
```

**Ordering:** Use `insertAfterComponentId` to place each component after the previous one. For the first component, omit this parameter (appends to end). Track the returned component instance for the next insertion.

**Context-only components** (NavigationHeader, SiteFooter):
- These components have no datasource template and **cannot be added via `add_component_on_page`** — the API returns "No datasource template found"
- If they live in partial designs, they're already on the page via the Page Design — skip
- If they need to be in `headless-main`, add them to the manual tasks checklist with clear positioning instructions (e.g., "Add NavigationHeader between AnnouncementBar and HeroBanner")
- Do NOT attempt to add them via API — it will fail and waste time

**Skip adding OOB components** that aren't in the build plan (RichText, Image, Container, Promo from starter kit). These cannot be removed via MCP — note them for manual cleanup.

#### Step 3 — Wire datasources

For each component that was added or already existed:

Read the **client datasource item IDs** from `docs/ai/demos/<client>/content-map.yaml` (created in Phase 3). Do NOT use the manifest's `exampleItem` IDs — those are the clean defaults.

**Simple components (own datasource):**
```
set_component_datasource(
  pageId=<target-page-id>,
  componentId=<component instance id from add response or get_components_on_page>,
  datasourceId=<client item ID from content-map.yaml>
)
```

**List components (parent datasource with children):**
Same as simple — wire the client parent item ID. The children live under it and ComponentQuery resolves them automatically.

**Context-only components (NavigationHeader, SiteFooter):**
No datasource to set — skip this step.

#### Step 4 — Generate the variant checklist

Since variants cannot be set via MCP, generate a clear checklist for the SE.

For each component in the build plan that uses a **non-Default** variant:

```markdown
## Variant Selection Checklist

Open the page in Pages editor and set these variants:

| # | Component | Current | Needed | Variant ID |
|---|-----------|---------|--------|-----------|
| 1 | NavigationHeader | Default | Transparent | {A46EFC9D-...} |
| 2 | ProductPricingCards | Default | Horizontal | {C9B441F5-...} |
| 3 | LegalComplianceBanner | Default | WithImage | {21600F34-...} |
| 4 | CTABanner | Default | WithImage | {2DC4E1E9-...} |
| 5 | TrustStatsRow | Default | WithIcons | {A31EA0E4-...} |
| 6 | ImageGallery | Default | Gallery | {CF1F5876-...} |

Steps per component:
1. Click the component on the canvas
2. In the right-hand pane, click Design tab
3. Select the variant from the dropdown
4. Repeat for next component

Estimated time: ~2 minutes
```

Components that use the **Default** variant don't need action — Default is applied automatically when the component is added.

Save this checklist to `docs/ai/demos/<client-kebab>/variant-checklist.md`.

#### Step 5 — Verify assembly

After all components are added and datasources wired:

1. `get_components_on_page(targetPageId)` — read final state
2. Verify each build plan section has a matching component on the page
3. Verify each component has a non-empty `dataSource` (except context-only)
4. Report any gaps

Present the assembly result:
```
Page assembly complete:
- Components added: 12 (of 14 in build plan)
- Datasources wired: 10 (2 context-only, no datasource)
- Already on page: 3 (reused existing)
- Variants needing manual selection: 6 (see variant-checklist.md)
- OOB components to clean up manually: 4 (RichText x2, Image, Container)
```

### Phase 7 — Summary

Present to the user:
- Total components used: N template + M custom
- Content populated: X fields across Y datasource items
- Theme applied: CSS variables + Google Fonts
- Page assembled: Z components in `headless-main`
- What needs manual attention:
  - **Variant selection** — see `variant-checklist.md` (~2 min)
  - Images needing Media Library upload (with source URLs)
  - Links needing real URLs (client links won't work on demo)
  - OOB components to remove from page (if reusing existing page)
  - Any low-confidence matches that should be verified
  - Silent-write fields needing Content Editor verification

## Output files

After completion, the demo directory should contain:
```
docs/ai/demos/<client-kebab>/
├── build-plan.yaml            # the section-by-component mapping
├── content-populated.md       # log of content updates made
├── theme-applied.md           # log of theme changes made
├── variant-checklist.md       # manual variant selection guide for the SE
├── page-assembly.md           # log of components added + datasources wired
└── manual-tasks.md            # everything the SE needs to do manually
```

## Important rules

- **Never replace existing Available Renderings** — template components are already registered
- **Never recreate template components** — they already exist, just populate their datasource items with client content
- **Always use the manifest** for item IDs — don't re-resolve paths that are already cached
- **Always present the plan before executing** — the SE must approve the theme and build plan
- **Mark images and links as manual** — the scraper can extract URLs but uploading to Media Library requires manual steps
- **Mark variants as manual** — generate the variant checklist, don't skip this step. See `docs/ai/reference/agent-api-limitations.md` for why.
- **Use `insertAfterComponentId` for ordering** — add components sequentially, passing the previous component's instance ID to maintain build-plan order
- **Use the existing Home page by default** — do not create a new subpage unless the user explicitly asks. The Home page already has the correct Page Design and URL routing. Note any OOB components for manual cleanup.
- **All content in English** — regardless of source page language, all datasource content must be in English (en). Translate from the source language during content extraction, never after content creation.
