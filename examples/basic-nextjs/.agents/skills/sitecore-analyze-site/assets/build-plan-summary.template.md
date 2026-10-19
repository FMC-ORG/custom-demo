# {{CLIENT_NAME}} — Build Plan

> **Source:** {{SOURCE_URL}}
> **Analyzed:** {{DATE}}
> **Sections:** {{TOTAL_SECTIONS}} ({{TEMPLATE_MATCHES}} template, {{CUSTOM_REQUIRED}} custom)

---

## Page Sections (top to bottom)

<!-- One row per section. The "What We'll Use" column is the most important for SE review. -->

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _Thin black utility bar with "Find a Hotel" links_ | Announcement Bar | Highlight | High | |
| 2 | _Logo + nav links + Book Now over hero image_ | Navigation Header | Transparent | High | Verified shared Header target; automatic datasource wiring |
| 3 | _Full-bleed atmospheric photo_ | Hero Banner | BackgroundImage | High | |
| ... | ... | ... | ... | ... | ... |

---

## Sections that need attention

> [!WARNING]
> These sections have low confidence or need custom work. Review before approving.

<!-- Only include sections with matchConfidence "low" or matchType "custom" -->

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 5 | _Interactive hero with expanding accordion categories_ | No template supports hero + accordion overlay | Custom component, or split into HeroBanner + FAQAccordion |
| ... | ... | ... | ... |

<!-- If no sections need attention, replace with:
> [!NOTE]
> All sections matched with medium or high confidence. No custom work needed.
-->

---

## Variant Decisions

Why each variant was chosen — helps the SE validate the plan matches the screenshot.

<!-- Only include non-Default variants and any where the reason isn't obvious -->

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 1 | Announcement Bar | Highlight | High-contrast bar on dark background |
| 2 | Navigation Header | Transparent | Logo overlays hero image with light text |
| 3 | Hero Banner | BackgroundImage | Full-bleed photo with text overlay, luxury style |
| ... | ... | ... | ... |

---

## Components by type

### Will be added automatically (API-addable)
_These have datasource templates and can be placed + wired via the build pipeline._

| # | Component | Datasource needed |
|---|-----------|------------------|
| 1 | Announcement Bar | Simple (1 item) |
| 3 | Hero Banner | Simple (1 item) |
| 6 | Feature Cards Grid | List (parent + 4 children) |
| ... | ... | ... |

### Shared header & footer — included in complete-build approval

| Target | Partial design / instance | Current datasource | Planned client datasource | Affected pages |
|--------|---------------------------|--------------------|---------------------------|----------------|
| Header | {{HEADER_TARGET}} | {{HEADER_CURRENT_DATASOURCE}} | {{HEADER_CLIENT_DATASOURCE}} | {{HEADER_USAGE_OR_UNKNOWN}} |
| Footer | {{FOOTER_TARGET}} | {{FOOTER_CURRENT_DATASOURCE}} | {{FOOTER_CLIENT_DATASOURCE}} | {{FOOTER_USAGE_OR_UNKNOWN}} |

These datasources will be switched automatically and verified; previous datasource and instance IDs are recorded. **Proposed: replace each instance so the client variant is applied** (`sharedDesign.replace: true`, ADR 0009): a new instance is added and wired, then the old instance `{{HEADER_INSTANCE_ID}}` / `{{FOOTER_INSTANCE_ID}}` is removed from the partial design — this affects every page listed above. Without approval, only the datasource is switched and the variant stays a manual task. Missing/incompatible instances block wiring and require a repair decision. If another client's branded experience is found, stop for explicit repurposing confirmation. Do not assume every page uses these designs.

### Existing page components — replace or remove (needs approval)

| Instance | Component | Proposal | Why |
|----------|-----------|----------|-----|
| {{INSTANCE_ID}} | HeroBanner | Replace with the client section (`replace: true`) so its variant is applied | Reused position |
| {{INSTANCE_ID}} | SearchCollection | Remove (`removeInstances`) | Starter content not in the client page |

Approving the plan confirms these removals. Without approval they stay on the page and appear as manual tasks.

### Must be placed manually
Only actual context components or unsupported placement, identified from rendering configuration—not Header/Footer by name. List them when present; variant selection remains manual.

### Custom components needed
_These don't match any template and need to be built from scratch._

<!-- If none, replace with: "None — all sections matched template components." -->

| # | What's on the page | Suggested approach | Fields needed |
|---|-------------------|-------------------|---------------|
| ... | ... | ... | ... |

---

## Build Order

```
Phase 0 — Custom component definitions (if any; needed before the execution plan is frozen)

Phase 1 — Sitecore content (create datasource items):
  1. AnnouncementBar
  2. HeroBanner
  3. RichTextBlock
  4. TabNavigationSection
  5. FeatureCardsGrid (STAY)
  6. FeatureHighlight
  7. CTABanner
  8. FeatureCardsGrid (DINE)
  9. ValuePropositionGrid
  10. FeatureCardsGrid (MORE)

Phase 2 — Apply theme (CSS variables + fonts), then pixel-perfect variants (if chosen)

Phase 3 — Assemble the page with each section's planned variant; replace Header/Footer (if approved)
```

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Look at the table above and compare against the screenshot.
2. **Do you want pixel-perfect custom variants** (Phase 5.5) or are the generic template variants sufficient?
3. **Replace the shared Header/Footer instances** listed above so their client variants are applied? This removes the named instances from the partial designs and affects the listed pages.
4. **Replace or remove the existing page components** listed above?

> Reply "approved" to proceed, or describe any changes needed.
