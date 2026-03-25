# Sitecore build demo from URL

Use this skill when a Solution Engineer wants to create a Sitecore demo that replicates a client's homepage.

## Trigger hints
Use this skill when:
- the user provides a URL and says "build a demo", "replicate this site", "create a demo for [client]"
- the user provides a screenshot of a homepage and asks to build components for it
- the user says "analyze this homepage and build the components"

## Prerequisites
- Template component library must be built (check manifest for 18 components with status "complete")
- Playwright scraper must be installed (`node .claude/skills/sitecore-extract-theme/scripts/site-scraper.mjs --help` should work)

## Load first
- `docs/ai/catalog/component-registry.yaml`
- `docs/ai/catalog/theme-component-mapping.md`
- `docs/ai/manifests/sitecore-manifest.yaml`

## Available sub-agents
- `.claude/agents/site-analyzer.md` — decomposes homepage into component sections
- `.claude/agents/content-scraper.md` — extracts real text content for datasource population

## Available scripts
- `.claude/skills/sitecore-extract-theme/scripts/site-scraper.mjs` — Playwright theme/screenshot scraper
- `.claude/skills/sitecore-extract-theme/scripts/content-extractor.mjs` — Playwright content extractor

## Full workflow

### Phase 0 — Gather inputs

Collect from the user:
1. **Client URL** (required) — the homepage to replicate
2. **Client name** (required) — for file naming
3. **Screenshot** (optional) — if the user provides one, use it alongside the scraper output

If only a screenshot is provided (no URL), skip the scraper and work from the screenshot + manual input.

### Phase 1 — Extract the brand theme

Use the `sitecore-extract-theme` skill:

1. Run the Playwright scraper:
   ```
   node .claude/skills/sitecore-extract-theme/scripts/site-scraper.mjs --url <URL> --output docs/ai/themes/<client-kebab>
   ```
2. Read the scraper output (`extracted-styles.json`, `meta.json`)
3. Inspect the screenshots
4. Produce `docs/ai/themes/<client-kebab>.theme.yaml`
5. Present the theme to the user for review

**Do not proceed past Phase 1 until the user confirms the theme.**

### Phase 2 — Analyze the homepage

Use the `site-analyzer` agent (`.claude/agents/site-analyzer.md`):

1. Read the component registry and theme mapping
2. Inspect the desktop screenshot top-to-bottom
3. Identify every section on the page
4. Match each section to a template component + variant
5. Extract visible content from the screenshot
6. Output `docs/ai/demos/<client-kebab>/build-plan.yaml`
7. Present the build plan to the user:
   - List of sections with matched components and variants
   - Any sections marked as "custom" that need building from scratch
   - Confidence levels
   - Count: N template matches + M custom components

**Do not proceed past Phase 2 until the user confirms the build plan.**

### Phase 3 — Extract content from the client site

Run the content extraction in parallel with user review:

1. Run the Playwright content extractor:
   ```
   node .claude/skills/sitecore-extract-theme/scripts/content-extractor.mjs --url <URL> --output docs/ai/demos/<client-kebab>
   ```
2. Use the `content-scraper` agent (`.claude/agents/content-scraper.md`) to:
   - Read the build plan
   - Read `extracted-content.json` from the script
   - Map extracted content to component fields
   - Output `docs/ai/demos/<client-kebab>/content-map.yaml`

The content map contains:
- Exact text for every Single-Line Text and Rich Text field
- Link URLs and button text for General Link fields
- Image URLs noted for manual Media Library upload
- Count of child items needed vs existing example items

### Phase 4 — Populate Sitecore content

For each section in the content map:

**Simple components (datasource item update):**
1. Read the component's `exampleItem.itemId` from the manifest
2. Use `update_fields_on_content_item` to set text fields with extracted content
3. Note Image and Link fields as needing manual update

**List components (parent + children):**
1. Read the parent `exampleItem.itemId` from the manifest
2. Update parent fields (Title, Description) via MCP
3. For each child in the content map:
   - If `needsCreation: false` → update existing child item by ID
   - If `needsCreation: true` → create new child item under the parent using `create_content_item`, then update its fields
4. If the client has fewer children than existing examples, note the extras for deletion

**Context-only components (NavigationHeader, SiteFooter):**
- No datasource content to populate
- Note that nav items and footer links are placeholders

**Content population order:** Follow `buildOrder.phase1_sitecore` from the build plan, top-to-bottom.

### Phase 5 — Apply the theme

The theme was extracted in Phase 1. To make the demo visually match the client:

1. Generate a `globals-brand.css` file with the CSS variables from the theme's `cssVariables` block
2. If the theme uses Google Fonts, add the import to the Next.js layout:
   - Add `<link>` tag with `typography.googleFontsUrl` to `src/app/layout.tsx` or equivalent
3. Import `globals-brand.css` in the app's global stylesheet

Output theme files to `docs/ai/demos/<client-kebab>/theme-files/`:
- `globals-brand.css` — CSS variable overrides
- `layout-changes.md` — what to add to the layout file

### Phase 6 — Build custom components (if any)

For each section in the build plan with `matchType: "custom"`:

1. Use the appropriate Sitecore creation skill (simple/list/context-only)
2. Follow the `customComponents` section of the build plan for field specs
3. Build with theme CSS variables applied
4. Update the manifest

### Phase 7 — Summary

Present to the user:
- Total components used: N template + M custom
- Content populated: X fields across Y datasource items
- Theme applied: CSS variables + Google Fonts
- Child items created: Z new items for list components
- What needs manual attention:
  - Images needing Media Library upload (with URLs)
  - Links needing real URLs (client links won't work on demo)
  - Any low-confidence matches to verify
  - Silent-write fields needing Content Editor check

## Output files

After completion, the demo directory contains:
```
docs/ai/demos/<client-kebab>/
├── build-plan.yaml          # section-by-component mapping
├── extracted-content.json   # raw content from Playwright
├── content-map.yaml         # structured content mapped to fields
├── theme-files/
│   ├── globals-brand.css    # CSS variable overrides
│   └── layout-changes.md    # layout file modifications needed
├── summary.md               # what was done + manual tasks
```

## Important rules

- **Never replace existing Available Renderings** — template components are already registered
- **Never recreate template components** — they already exist, just populate their datasource items
- **Always use the manifest** for item IDs — don't re-resolve paths
- **Always present the plan before executing** — the SE must approve theme and build plan
- **Extract content exactly** — don't paraphrase or improve the client's text
- **Mark images as manual** — scraper extracts URLs but Media Library upload is manual
- **Count children carefully** — match the client's item count, create additional children if needed
