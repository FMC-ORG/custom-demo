# Sitecore build demo from URL

Use this skill when a Solution Engineer wants to create a Sitecore demo that replicates a client's homepage.

## Trigger hints
Use this skill when:
- the user provides a URL and says "build a demo", "replicate this site", "create a demo for [client]"
- the user provides a screenshot of a homepage and asks to build components for it
- the user says "analyze this homepage and build the components"

## Prerequisites
- Template component library must be built (check manifest for 17+ components with status "complete")
- Playwright scraper must be installed (`node .claude/skills/sitecore-extract-theme/scripts/site-scraper.mjs --help` should work)

## Load first
- `docs/ai/catalog/component-registry.yaml`
- `docs/ai/catalog/theme-component-mapping.md`
- `docs/ai/manifests/sitecore-manifest.yaml`

## Full workflow

### Phase 0 — Gather inputs

Collect from the user:
1. **Client URL** (required) — the homepage to replicate
2. **Client name** (required) — for file naming
3. **Screenshot** (optional) — if the user provides one, use it alongside the scraper output

If only a screenshot is provided (no URL), skip the scraper and work from the screenshot + manual input.

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
   - Estimated work: N template components + M custom components

**Do not proceed past Phase 2 until the user confirms the build plan.**

### Phase 3 — Populate content for template components

For each section in the build plan with `matchType: "template"`:

1. Find the component's existing datasource item in the manifest (from `exampleItem`)
2. Update the datasource item fields with the content extracted in the build plan:
   - Use `update_fields_on_content_item` via Marketer MCP
   - Set text fields (Title, Description, etc.) with the content from `sections[N].content`
   - For Image and Link fields: note them as needing manual population (images require Media Library upload, links need real URLs)
3. If the component is a list type (has children), create the appropriate number of child items matching what's visible on the client page

**Content population order:**
- Work through sections top-to-bottom following `buildOrder.phase1_sitecore`
- Use cached item IDs from the manifest — don't re-resolve paths

### Phase 4 — Apply the theme

The theme was extracted in Phase 1. For the demo to actually look like the client site:

1. Generate a `globals.css` override file with the CSS variables from the theme's `cssVariables` block
2. If the theme uses Google Fonts, add the `<link>` tag to the Next.js layout or `_document`
3. The template components already use `var(--brand-*)` — they'll automatically pick up the new theme

Output the theme application as a set of file changes the user can review.

### Phase 5 — Build custom components (if any)

For each section in the build plan with `matchType: "custom"`:

1. Use the appropriate Sitecore creation skill (simple/list/context-only)
2. Follow the `customComponents` section of the build plan for field specs
3. Build the component from scratch with the client theme applied
4. Update the manifest

### Phase 6 — Summary

Present to the user:
- Total components used: N template + M custom
- Content populated for each section
- Theme applied (CSS variables + fonts)
- What needs manual attention:
  - Images needing Media Library upload
  - Links needing real URLs
  - Any low-confidence matches that should be verified
  - Silent-write fields needing Content Editor verification

## Output files

After completion, the demo directory should contain:
```
docs/ai/demos/<client-kebab>/
├── build-plan.yaml          # the section-by-component mapping
├── theme-applied.md         # log of theme changes made
├── content-populated.md     # log of content updates made
└── manual-tasks.md          # things the SE needs to do manually
```

## Important rules

- **Never replace existing Available Renderings** — template components are already registered
- **Never recreate template components** — they already exist, just populate their datasource items with client content
- **Always use the manifest** for item IDs — don't re-resolve paths that are already cached
- **Always present the plan before executing** — the SE must approve the theme and build plan
- **Mark images and links as manual** — the scraper can extract URLs but uploading to Media Library requires manual steps
