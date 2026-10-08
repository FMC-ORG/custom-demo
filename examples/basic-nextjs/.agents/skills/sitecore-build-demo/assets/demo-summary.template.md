# {{CLIENT_NAME}} — Demo Build Summary

> **Client:** {{CLIENT_NAME}}
> **Source:** {{SOURCE_URL}}
> **Built:** {{DATE}}
> **Page:** {{PAGE_PATH}}
> **Automated result:** {{AUTOMATED_STATUS}} — not a presentation-readiness claim
> **Verification scope:** {{VERIFICATION_SCOPE}}

---

## Build Overview

| Metric | Count |
|--------|-------|
| Template components used | {{TEMPLATE_COUNT}} |
| Custom components built | {{CUSTOM_COUNT}} |
| Custom variants created | {{VARIANT_COUNT}} |
| Datasource items created | {{DATASOURCE_COUNT}} |
| Fields populated | {{FIELDS_COUNT}} |
| Images uploaded | {{IMAGES_UPLOADED}} / {{IMAGES_TOTAL}} |

---

## Component Inventory

| # | Component | Variant | Datasource | Status |
|---|-----------|---------|------------|--------|
| 1 | NavigationHeader | Unverified | {{CLIENT}} - Main Navigation | ⚠️ Manual placement |
| 2 | HeroBanner | BackgroundImage | {{CLIENT}} - Hero Banner | ✅ Wired |
| 3 | ValuePropositionGrid | Default | {{CLIENT}} - Value Props | ✅ Wired |
| ... | ... | ... | ... | ... |

<!-- STATUS KEY: ✅ Wired | ⚠️ Manual placement | ⚠️ Needs variant | ⚠️ Unresolved | ❌ Failed -->

## Recovery Notes

<!-- Populate from phase result files/journals. Preserve unresolved work even if most sections succeeded. -->

| Phase / operation | Target item or field | Result / evidence | Safe next action |
|-------------------|----------------------|-------------------|------------------|
| {{OPERATION}} | {{TARGET}} | {{RESULT}} | {{NEXT_ACTION}} |

### Verified Exceptions

<!-- Include permitted whitespace blanks with item ID, field, read-back evidence and visual caveat. Omit only when empty. -->

{{VERIFIED_EXCEPTIONS}}

---

## Theme

| Property | Value |
|----------|-------|
| Primary color | `{{PRIMARY_COLOR}}` |
| Heading font | `{{HEADING_FONT}}` |
| Body font | `{{BODY_FONT}}` |
| Delivery method | {{THEME_DELIVERY}} |
| Google Fonts | {{GOOGLE_FONTS_STATUS}} |

> [!TIP]
> Theme takes effect on next dev server restart. All components pick up `--brand-*` variables automatically.

---

## Image Upload Summary

**Content Hub:** `{{CONTENT_HUB_HOST}}`

| Result | Count |
|--------|-------|
| Uploaded + approved | {{IMAGES_OK}} |
| Uploaded, pending approval | {{IMAGES_PENDING_APPROVAL}} |
| Failed / incomplete / needs reconciliation | {{IMAGES_FAILED}} |
| Skipped (no credentials) | {{IMAGES_SKIPPED}} |
| **Total** | **{{IMAGES_TOTAL}}** |

<!-- If IMAGES_OK == IMAGES_TOTAL, show this: -->
> [!NOTE]
> All {{IMAGES_TOTAL}} images have verified asset approval and anonymous public links. Confirm datasource-field population separately in the content result.

<!-- If IMAGES_FAILED > 0, show this instead: -->
> [!WARNING]
> {{IMAGES_FAILED}} image(s) failed to upload. See the table below for details and manual upload instructions.

<!-- Only include this table if there are failed or skipped images -->
### Unresolved / Skipped Images

| # | File | Section | Target Component | Target Field | Error | Source URL |
|---|------|---------|-----------------|--------------|-------|------------|
| 1 | `hero-bg.jpg` | Hero Banner | HeroBanner | HeroImage | Step 2: HTTP 413 — file too large | {{SRC_URL}} |
| 2 | `card-1.png` | Product Cards | ProductPricingCards | CardImage | Step 1: HTTP 403 — permission denied | {{SRC_URL}} |
| ... | ... | ... | ... | ... | ... | ... |

**To reconcile manually:**
1. Read the recovery journal and inspect any recorded asset/link IDs in Content Hub. A timeout may have succeeded.
2. Reuse an existing verified asset/link; do not upload another file or create another link merely because a response was lost.
3. If identity cannot be established, stop and request reconciliation. New creation requires affirmative evidence that it is safe and approval within this build's scope.
4. Finish only the missing, approved stages and verify read-back/anonymous access.
5. Verify the target datasource Image field separately. Preserve unresolved targets and exceptions in this handoff.

<!-- If IMAGES_SKIPPED > 0 (no credentials), show: -->
> [!NOTE]
> Content Hub credentials were not provided. All {{IMAGES_SKIPPED}} images were downloaded locally but not uploaded.
> Follow `.agents/skills/sitecore-build-demo/references/recovery.md` when ready. An explicitly approved new run needs `--initialize`; an existing run resumes without it:
> ```bash
> node .agents/skills/sitecore-build-demo/scripts/upload-to-content-hub.mjs --images-dir docs/ai/demos/{{CLIENT_KEBAB}}/images
> ```

### Successful Uploads

<!-- Only include if IMAGES_OK > 0 — helps the SE verify images are correct -->

| # | File | Section | Asset ID | Public URL | Dimensions |
|---|------|---------|----------|------------|------------|
| 1 | `hero-bg.jpg` | Hero Banner | `{{ASSET_ID}}` | [link]({{PUBLIC_URL}}) | 1200 x 600 |
| 2 | `logo.png` | Navigation | `{{ASSET_ID}}` | [link]({{PUBLIC_URL}}) | 200 x 60 |
| ... | ... | ... | ... | ... | ... |

---

## Videos

<!-- Only include this section if manualVideoTasks has entries. Otherwise omit entirely. -->

> [!NOTE]
> {{VIDEOS_COUNT}} section(s) on the live site use video. Videos are not uploaded automatically — poster images are used as static fallbacks. Upload videos to Content Hub manually if needed.

| # | Section | Component | Poster | Video Source | What to do |
|---|---------|-----------|--------|-------------|------------|
| 1 | Hero | HeroBanner (VideoBackground) | `hero-poster.jpg` | `https://client.com/hero.mp4` | Upload to Content Hub, set URL on component |
| ... | ... | ... | ... | ... | ... |

<!-- If no videos found, omit this entire section. -->

---

## Manual Tasks

These items require action in the **Pages editor** or **Content Editor**. Work through them in order.

### 1. Variant Selection (~2 min)

Open the page in Pages editor and set these variants:

| # | Component | Current | Set to |
|---|-----------|---------|--------|
| 1 | NavigationHeader | {{OBSERVED_OR_UNVERIFIED}} | Transparent |
| 2 | ProductPricingCards | {{OBSERVED_OR_UNVERIFIED}} | Horizontal |
| ... | ... | ... | ... |

**Steps per component:**
1. Click the component on the canvas
2. In the right-hand pane, click **Design** tab
3. Select the variant from the dropdown

### 2. Shared Partial Designs / Context Components

Verify actual rendering configuration and placement. Shared-design switches need separate approval; datasource-backed headers/footers are not context-only merely because they appear in partial designs:

- [ ] **NavigationHeader** — after approval, assign the verified "{{CLIENT}} - Main Navigation" datasource on the intended Header partial design.
- [ ] **SiteFooter** — lives in Footer partial design. Assign "{{CLIENT}} - Site Footer" datasource in Content Editor.

### 3. Link Verification

Demo links point to the client's live site. Update any that should point to internal demo pages:

- [ ] Hero CTA — currently `{{HERO_CTA_URL}}`
- [ ] Product cards — currently linking to `{{CLIENT_DOMAIN}}/...`

### 4. Cleanup (if reusing Home page)

Remove these OOB starter kit components that were already on the page:

- [ ] RichText (position 3)
- [ ] Image (position 5)
- [ ] Container (position 7)

> [!NOTE]
> These cannot be removed via API. In Pages editor: click the component → three-dot menu → **Remove**.

### 5. Personalization (Optional)

To show different content per audience segment, create additional datasource items:

| Component | Folder | Template |
|-----------|--------|----------|
| HeroBanner | /Data/HeroBanners | HeroBanner |
| ProductPricingCards | /Data/ProductPricingCards | ProductPricingCards |

**Naming:** `{{CLIENT}} - <ComponentName> - <Segment>` (e.g., "{{CLIENT}} - Hero Banner - Families")

Then in Pages: select component → **Personalize** → add condition → assign segment datasource.

---

## Output Files

All files are saved under `docs/ai/demos/{{CLIENT_KEBAB}}/`.

### Build Pipeline Files
_Used by the automation to track progress and enable resume. You don't need to edit these._

| File | What it contains |
|------|-----------------|
| `demo-progress.yaml` | Derived phase/section status; not authority for repeating mutations |
| `execution-plan.json` | Approved normalized inputs; keep unchanged during recovery |
| `recovery-*.json`, `mcp-*.json` | Authoritative operation records and durable MCP handoff; preserve locally |
| `*-result.json`, `images/upload-result.json` | Verified phase results, partial operations and exceptions |
| `build-plan.yaml` | Maps each page section to a template component and variant |
| `content-map.yaml` | Client content (text, links, images) mapped to Sitecore field names |

### Reference Files for the SE
_Use these while finishing the demo in Pages editor._

| File | When to use it |
|------|---------------|
| `build-plan-summary.md` | Review before approving — shows what each page section maps to |
| `demo-summary.md` | Start here after build — full overview of what was built and what needs manual work |
| `manual-tasks.md` | Step-by-step checklist for remaining manual tasks (variants, context components, links, cleanup) |
| `variant-checklist.md` | Quick-reference table for setting component variants in Pages editor |

### Assets

| File | What it contains |
|------|-----------------|
| `images/` | Source images downloaded from the client site, used for Content Hub uploads |
| `images/image-manifest.json` | Maps each image to its source URL, Content Hub asset ID, and upload status |

---

> [!TIP]
> **Quick test:** Open `{{PAGE_URL}}` in a browser. You should see the client's colors, fonts, and content on all components. Then walk through `manual-tasks.md` to finish the last mile.
