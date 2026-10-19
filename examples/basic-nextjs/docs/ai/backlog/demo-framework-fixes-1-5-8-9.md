# Demo framework fixes — handoff (items 1, 5, 8, 9)

Source: framework reliability review of a prior client demo build. All four items are **framework-wide**
(every client demo, every uiim component, the `sitecore-build-demo` pipeline) — no client-specific content or branding is included.
Do not hardcode any client name, colour or content.

App root: `examples/basic-nextjs/` (all paths below are relative to it).
Read first: `AGENTS.md` (non-negotiables), `docs/ai/reference/brand-variables.md`,
`.agents/skills/sitecore-build-demo/SKILL.md`, `.agents/skills/sitecore-build-demo/references/recovery.md`.

House rules that apply to every item:
- Work on a feature branch; one focused commit per item.
- Anything under `.agents/` is the source for generated agent files: after editing it run
  `npm run agents:sync`, then `npm run agents:check` must pass. Never edit `.claude/`, `.cursor/`, `.pi/` copies.
- Tests: `npx jest tools/agents` (pipeline/tooling) and `npx jest src` (components); `npx tsc --noEmit -p .`;
  `npm run agents:validate`. Do not commit `tsconfig.tsbuildinfo` or `next-env.d.ts` changes.
- `npm run lint` is currently broken by a circular ESLint config (pre-existing, out of scope) — don't rely on it.
- Never weaken the recovery guarantees in `.agents/skills/sitecore-build-demo/scripts/lib/*`
  (claim → call once → reply; unknown ≠ failed; no automatic re-creation).

Suggested order: 1 → 9 → 8 → 5 (1 and 9 touch components; 8 and 5 touch the pipeline/skills).

The upcoming pipeline contract follows decision 9: new builds only, with explicit rejection of older incompatible records before mutations. No migration, reset or automatic reconstruction is included. Normal interrupted-build recovery remains required for builds started under the new contract.

Initial delivery includes the font/alt regression fixes, whitespace-aware rendering, mandatory approved-target Header/Footer wiring, and bounded batch-wide approval/public-link verification. Creation-time field values are a deferred follow-up, not an initial-delivery dependency; see decision 10.

## Local implementation status

Framework-only delivery is prepared on `feature/demo-framework-fixes-dmz` for a pull request to `upstream/dmz`. Client-specific commits, branding, variants, assets, manifests and local records are excluded. The existing repeated-read performance fix is preserved. Creation-time fields and live probes remain deferred; no Sitecore/Content Hub mutations, shared-template edits, deployment configuration or workflow changes were made.

- **1 — Fonts and alt:** runtime `font-heading` / `font-body` utilities, framework component replacements and canonical guidance, with compiled-CSS and validator tests. Existing SmartMedia authored-alt fix is regression-tested. A local headless browser verified default inheritance, runtime family overrides and independent bold weight (700).
- **9a — Empty display content:** shared `src/lib/field-utils.ts`, whitespace/empty-markup-aware component conditions, text-only container gates, media preservation and editor-mode tests. Validator errors are based on confirmed SDK text/Rich Text usage; uncertain search/index expressions remain non-blocking review warnings.
- **8 — Propagation:** stage-specific asset/approval/link/public-access journals; shared 60-second approval and 90-second public-access windows, monotonic elapsed time, read-request deadline signals and overlapping read-only probes. Slow URLs do not starve ready images. No polling path recreates an asset/link or repeats an uncertain approval write.
- **5 — Shared designs:** approved exact Header/Footer instance wiring is journaled and verified; previous datasource and parameters are retained. Target-review classification and repurposing approval are frozen in input identity. Missing/mismatched targets remain partial without structural repair. Actual CLI claim/call/reply tests include lost shared-wiring responses.
- **Contract:** `demo-framework-v2` is required by new execution plans and pipeline journals. Older contracts are rejected before mutation/claim, even with `--initialize`; fresh upload runs also reject pre-existing asset/link markers without their ownership journal. Same-contract resumes remain supported. No migration is implemented.

Local checks: **274 tests across 28 suites passed**, TypeScript, `agents:sync`/`agents:check`, 33/33 component registrations, script syntax and whitespace/link validation. The pre-existing ESLint circular-configuration error still prevents linting. Local tests and the headless browser check do not certify live Sitecore/Content Hub behavior; authorised disposable-scope verification remains pending.

## Confirmed interview decisions

1. **Shared header/footer wiring is mandatory for a complete demo build.** The build is intended to establish the client's complete demo from the ground up, normally in a dedicated environment rather than over an existing content experience. Automatically assign the verified client datasources to the identified Header/Footer partial-design instances as part of the approved build. Do not ask a separate leave/switch question or defer datasource wiring to a final manual task. Keep target discovery, durable journaling, read-back verification, parameter preservation and previous-datasource evidence. The handling of unexpectedly reused environments is covered by decision 2; site provisioning is not authorised by these decisions.

2. **Pause before repurposing an existing client experience.** Starter-kit content is expected and does not itself require an extra approval. If target inspection discovers another client's branded experience, show the existing content and shared-design impact, then obtain explicit confirmation that the target site may be repurposed. Only after confirmation proceed with the approved complete build, including automatic Header/Footer wiring. Do not automatically create a separate site, delete unrelated items, or treat the original build approval as permission to replace an undisclosed existing client experience.

3. **One shared public-link verification window.** Create links as their assets become ready, then verify pending public URLs together for up to 90 seconds total by default, configurable for the run. This is a batch-wide elapsed-time budget, not 90 seconds per image. Upload and approval time are separate. Poll only known, readable links whose ownership is verified; never repeat asset/link creation to absorb propagation latency. Ready images finish independently. Links still unavailable at the deadline retain their recorded identities and remain partial/needs-reconciliation for a later resume. Approval-lag handling is covered by decision 4.

4. **One shared approval-verification window.** Issue each required asset approval through the journaled operation, then poll known pending assets together for up to 60 seconds total by default, configurable for the run. This is a batch-wide elapsed-time budget including read-request time, not 60 seconds per asset. Do not repeat an issued approval write to handle propagation lag or uncertainty. Assets already verified approved need no approval write. Create public links only after asset approval is verified; continue independently with verified assets and preserve unresolved asset/approval identities with a partial result. The approval window is separate from upload time and the 90-second public-link window.

5. **Retain the narrow optional-text whitespace fallback without changing shared templates.** Prefer genuinely blank values where creation-time fields and read-back prove the API supports them. If genuine clearing is still ineffective, retain the existing journaled single-space fallback only for explicitly blank optional Single-Line/Multi-Line Text fields, after an acknowledged ineffective clear is verified. Required/unspecified fields, links, images and other field types are not eligible. Components must treat whitespace-only display text as empty outside editing mode while preserving SDK editability in Pages. Do not alter shared template or `__Standard Values` defaults under this work. The disposable creation-time probe still requires separately approved targets; this interview is not permission to run it.

6. **Rich Text visibility is based on meaningful content, not string truthiness.** Whitespace and empty formatting markup (including non-breaking-space-only paragraphs) are empty outside editing mode. Actual text and content-bearing images, videos and embeds remain visible even without accompanying text. This is a visibility check only: preserve the authored HTML exactly and render through the SDK; do not strip, normalise or rewrite field values. Keep empty fields visible/editable in Pages. Plain-text and Rich Text checks have distinct semantics, and image/link field visibility remains separate.

7. **Missing or incompatible Header/Footer renderings require a repair decision.** If the identified partial design has no expected rendering, an incompatible rendering, or an ambiguous instance, stop that wiring operation and report the exact mismatch. Required wiring remains partial/blocked. Do not add, remove or replace partial-design components automatically, and never assign a datasource to an incompatible rendering. Ask for a separate repair decision before changing the structure. *Amended 2026-10-19 by [ADR 0009](../../adr/0009-replace-shared-header-footer-to-apply-variants.md):* when the approved plan sets `sharedDesign.replace: true`, a healthy Header/Footer instance is replaced by a new one to apply the client variant.

8. **Empty display text removes its text-only layout containers.** Outside editing mode, suppress empty field wrappers and containers whose only purpose is to hold that empty text, including their margins/padding. Preserve meaningful images, links and intentional structural layout. Do not automatically suppress an entire component merely because its text is empty. In editing mode, keep the empty fields and necessary containers accessible through SDK helpers.

9. **The changed pipeline requires a fresh build contract.** Do not migrate or resume older incomplete builds under the new pipeline contract. Require a new workspace and explicitly approved fresh build scope; preserve older records and remote resources unchanged. Detect an incompatible contract before any mutation and explain the fresh-build requirement. A fresh directory alone is not permission to recreate matching remote content, reuse another build's identities, reset journals, or delete existing items/assets. Interrupted builds created under the new contract still support same-workspace recovery normally. This breaking-contract decision applies to the upcoming pipeline changes in this backlog, not retroactively to the independently implemented, backward-compatible repeated-read performance fix. See [ADR 0008](../../adr/0008-fresh-build-contract-for-demo-framework.md).

10. **Deliver the safe fixes before the creation-time blank probe.** Implement fonts, whitespace-aware rendering, mandatory Header/Footer wiring and bounded batch-wide polling without waiting for unverified creation-time field behaviour. Retain the existing narrow, verified blank fallback. Creation-time fields remain disabled/deferred until a separately approved disposable live probe confirms support; enabling them is a follow-up decision with recovery-contract implications, not an automatic change on a current build's resume. This interview authorises neither live probe targets nor shared-template changes.

11. **Validation blocks clear regressions and warns on uncertain matches.** Fail component validation for ambiguous brand-font family utilities and confirmed plain-text/Rich Text visibility mistakes. Recognise valid explicit font-family/font-weight syntax and keep image/link visibility checks separate. When field type or expression intent cannot be established, emit a review warning rather than a false-positive blocking error. Include file/location and an actionable correction. Tests must cover both rejected regressions and accepted valid patterns; documentation reproductions of the old bug are not runtime violations.

---

## 1. Brand font classes are the wrong Tailwind v4 utility (all uiim components)

### Problem
Components use `font-[var(--brand-heading-font,inherit)]` and `font-[var(--brand-body-font,inherit)]`
to apply the client fonts. In **Tailwind v4** an arbitrary `font-[...]` value containing only `var()` is
resolved as **font-weight**, not font-family. Verified by compiling with `@tailwindcss/postcss`:

```
.font-[var(--brand-heading-font,inherit)] { --tw-font-weight: var(--brand-heading-font,inherit); font-weight: var(--brand-heading-font,inherit); }
```

Consequences:
- Client fonts never applied through these classes in any demo (fonts fell back to Open Sans).
- The utility is emitted *after* `font-bold`/`font-semibold` etc. in the utilities layer, so it competes with
  real weight classes. On the prior client demo page weights still computed to 700, but this is accidental — don't rely on it.

Other `[var()]` arbitrary classes in use were checked and are fine (they resolve to the right property):
`bg-[var(...)]` → background-color, `text-[var(...)]` → color, `border-[var(...)]` → border-color,
`rounded-[var(...)]` → border-radius.

### Default typography retained by this fix
`src/app/globals.css`, inside the existing `@layer base`:
```css
body { ...; font-family: var(--brand-body-font); }
h1, h2, h3, h4, h5, h6 { font-family: var(--brand-heading-font); }
```
Keep this (it is the correct default for elements without a font class), but it does not fix the
broken classes: body-copy elements that should use the *heading* font, or headings that should use the
*body* font, still can't be expressed.

### Scope (measured)
- 140 occurrences in 20 files under `src/` (72 × body-font, 68 × heading-font):
  `grep -rlE "font-\[var\(--brand-" src`
- `docs/ai/reference/brand-variables.md` documents the broken pattern → update it.
- Skill guidance/examples that generate new components or variants may teach the same pattern: search
  `.agents/` and `docs/ai/` for `font-[var(` and update every template/example.

### Implementation
1. Register font utilities in the Tailwind v4 theme (`src/app/globals.css`, existing `@theme` block or a
   new `@theme inline` block):
   ```css
   @theme inline {
     --font-heading: var(--brand-heading-font);
     --font-body: var(--brand-body-font);
   }
   ```
   Verified to generate `.font-heading { font-family: var(--brand-heading-font) }` and
   `.font-body { font-family: var(--brand-body-font) }`. Use `inline` so the utility references the runtime
   variable (client `:root` overrides keep working).
2. Codemod `src/**/*.tsx`:
   - `font-[var(--brand-heading-font,inherit)]` → `font-heading`
   - `font-[var(--brand-body-font,inherit)]` → `font-body`
   - Also catch variants with other fallbacks / spacing (regex
     `font-\[var\(--brand-(heading|body)-font[^\]]*\)\]`).
   - Equivalent explicit syntax if you prefer not to add theme keys: `font-(family-name:--brand-heading-font)`.
3. The `inherit` fallback disappears: confirm defaults in `globals.css` `@layer base :root` still define both
   variables (`--brand-heading-font: inherit; --brand-body-font: var(--font-open-sans);` — they do today).
   `font-family: inherit` is valid, so un-themed sites render as before.
4. Update `docs/ai/reference/brand-variables.md` (Typography table + "Tailwind usage") and any skill text,
   e.g. `.agents/skills/sitecore-demo-variants/SKILL.md`, `.agents/skills/sitecore-standards/references/react-uiim-guidelines.md`,
   component templates/examples in `.agents/skills/sitecore-create-*`.
5. Add a guard to `tools/agents/validate-components.mjs` (runs as `npm run agents:validate`): fail on confirmed ambiguous brand-font family utilities with an actionable file/location message: "use font-heading / font-body; an untyped font-[var()] can resolve as font-weight in Tailwind v4". Accept explicit `family-name:`/`weight:` syntax and valid numeric/arbitrary weight utilities. Warn for other ambiguous cases requiring review rather than rejecting every `font-[...]` match. Test clear regressions, valid alternatives, and uncertain cases.
6. Same audit item (generic shared media helper regression): `src/components/uiim/media/SmartMedia.tsx`
   used to pass `alt={alt}` unconditionally; `alt={undefined}` overrode the image field's authored alt.
   Add a unit test (under `src/`, alongside existing tests) asserting the rendered `<img>` keeps the
   field's `alt` when the `alt` prop is omitted, and uses the prop when provided.
   Check `src/components/uiim/search/SearchResults.tsx:57` and `SearchCollection.tsx:47` (`alt={alt}` on
   `next/image` with computed alt — verify alt can't be undefined/empty there).

### Acceptance criteria
- Runtime component classes and canonical guidance/templates contain no ambiguous brand-font family utilities. Preserve historical bug reproductions in backlog/reference text where clearly labelled; do not demand that every `font-[...]` example or legitimate weight utility disappear.
- Compiled CSS contains `.font-heading`/`.font-body` with `font-family`, and no `font-weight: var(--brand-*-font`.
- With a client theme (e.g. `--brand-heading-font: 'Georgia', serif`) headings and elements tagged
  `font-heading` compute to that family; un-themed site computes to the previous fonts (Open Sans / inherited).
- Heading weights still come from `font-bold` etc. (spot-check computed `font-weight` on a few components).
- `npm run agents:validate` fails on a deliberately reintroduced ambiguous brand-font family utility and passes after correction. Valid explicitly typed family/weight utilities and valid numeric weights pass; uncertain cases produce review warnings.
- `npx tsc --noEmit -p .`, `npx jest src`, `npx jest tools/agents` pass.

### Verification recipe (no dev server needed)
```js
// node --input-type=module, from the app root
import postcss from 'postcss'; import tw from '@tailwindcss/postcss';
const src = `@import 'tailwindcss'; @source inline("font-heading font-body font-bold");` /* + theme block */;
console.log((await postcss([tw()]).process(src, { from: process.cwd() + '/x.css' })).css);
```
For a running page: Playwright `getComputedStyle(el).fontFamily` / `fontWeight`.
Note: on WSL the Next dev server may miss `globals.css` edits — restart it before judging the result.

---

## 5. Automatically wire shared header/footer as part of a complete demo build

### Problem
Header and footer usually live in **shared partial designs** (`/sitecore/content/<collection>/<site>/Presentation/Partial Designs/Header|Footer`)
used by the pages assigned designs that include them (actual usage must be inspected, not assumed). The pipeline correctly populates client datasources for them
(`placement: "partial-design"`) and the assembly helper deliberately skips switching them
(`.agents/skills/sitecore-build-demo/scripts/lib/assemble.cjs` — `if (section.placement === 'partial-design') continue;`).
But the SE only learns this in the final summary, so the demo page shows a generic header/footer and the
SE asks "why is the logo missing?". A complete demo requires this wiring automatically; the build plan must disclose its shared-design impact up front, not offer an optional switch.

### Current text to change
- `.agents/skills/sitecore-build-demo/SKILL.md`: Phase 2 "MANDATORY CHECKPOINT — Ask TWO questions";
  Phase 3 step 3 (line ~251); Phase 6 step 5 (line ~357: "Do not switch shared headers/footers under this P0 recovery scope");
  Phase 7 Manual Tasks section (line ~405).
- `.agents/skills/sitecore-analyze-site/SKILL.md` + `assets/build-plan-summary.template.md` (lines ~73–74
  "Assign datasource in Content Editor" — outdated: these are datasource-backed list/simple components now).
- `.agents/skills/sitecore-build-demo/references/recovery.md` line ~15.
- `.agents/skills/sitecore-build-demo/assets/demo-summary.template.md` → "Shared Partial Designs" subsection.

### Implementation
1. **Phase 2 analysis (sitecore-analyze-site):** for header/footer sections, read the actual partial
   designs via marketer MCP (`get_content_item_by_path` on `.../Presentation/Partial Designs`, then
   `get_components_on_page` with the partial design item ID as `pageId`) and record in `build-plan.yaml`:
   ```yaml
   targetPage:
     sharedPartialDesigns:
       header: { path, itemId, component, instanceId, currentDatasource, pagesUsingIt: "<count or 'unknown'>" }
       footer: { ... }
   ```
   Do not classify by component name — use the manifest/rendering and the partial design read
   (the existing rule in SKILL.md line ~176).
2. **Summary template:** add a "Shared header & footer" block to `build-plan-summary.template.md` showing
   current datasource, the client datasource that will be created, and the site-wide impact.
3. **Approval gate:** retain the existing plan-approval and variant questions. The presented plan includes automatic shared Header/Footer datasource wiring and discloses the identified targets and known/unknown page impact. Approval of the complete build includes that wiring; there is no separate leave/switch question. If inspection reveals another client's branded experience, pause and obtain explicit confirmation to repurpose that target before client-content or shared-design writes. Record the approved targets and any repurposing confirmation in the plan and progress.
4. **Automatic wiring:** perform it as an explicit, journaled step — not an ad-hoc call. Extend the assembly phase with an operation per identified Header/Footer partial-design section, bound to the approved complete-build plan, e.g. in `execution-plan.json`:
   ```json
   { "key": "header", "placement": "partial-design",
     "sharedDesign": { "approved": true, "pageId": "<partial design item id>", "existingInstanceId": "<rendering instance id>" } }
   ```
   Implement in `assemble.cjs` using the same `recovery.operation` pattern as the existing `:wire` step
   (`before` reads `get_components_on_page` for the partial design; `write` = `set_component_datasource`;
   `verify` reads back and checks datasource + unchanged parameters). Record the previous datasource ID in
   the journal so the SE can revert manually. Never add/remove/replace components in a partial design. If the expected rendering is missing, incompatible or ambiguous, block the wiring operation and request a separate structural repair decision; do not guess an instance or assign an incompatible datasource.
   Variant selection still can't be set via API — keep it as a manual task (and see background note below).
   Add tests in `tools/agents/__tests__/` mirroring the existing assembly tests (approved complete build → wired and verified; unapproved build or missing/ambiguous target → blocked without a write; instance mismatch → blocked). The journaled helper is required; an ad-hoc fallback is not completion.
5. **Summary:** `demo-summary.md`/`manual-tasks.md` show "switched (verified, previous datasource X)" or the exact unresolved wiring operation. Unresolved required Header/Footer wiring keeps the automated build partial; it is not an expected optional manual task.
6. `npm run agents:sync && npm run agents:check`.

### Acceptance criteria
- Phase 2 output always contains the shared-design targets and impact, and describes automatic datasource wiring as part of the complete build; no separate leave/switch question.
- No shared partial design is modified outside the approved complete-build targets.
- Another client's branded experience triggers a pause and explicit repurposing confirmation before client-content/shared-design writes. Starter-kit content alone does not trigger that pause.
- Required wiring is journaled, verified by read-back and reported with the previous datasource ID.
- Missing/ambiguous targets, incompatible renderings or unverified required wiring keep the build partial/blocked rather than silently leaving generic Header/Footer content. No structural repair occurs without a separate decision.
- Existing safety tests remain applicable; new tests cover approved complete-build wiring / unapproved or missing target / mismatch.
- Older incompatible build contracts are rejected before any shared-design/content mutation. Fresh-build recovery within the new contract retains ownership, intent and no-blind-retry safeguards.

### Background (not part of this item, but don't contradict it)
`docs/ai/reference/agent-api-limitations.md` says `add_component_on_page` always yields the Default variant.
In the prior client demo run Sitecore instead assigned non-default `FieldNames` (apparently the most recently created
variant). Keep variant selection manual and always report the *observed* `FieldNames`, never assume Default.

---

## 8. Content Hub public links: poll known links within a shared verification window

### Problem
`upload-to-content-hub.mjs` → `lib/uploads.cjs` creates asset → approves → creates an `M.PublicLink` →
verifies it (`api.readLink` + `api.verifyPublic(url)`, anonymous GET with `Range: bytes=0-0`).
Content Hub generates public link renditions asynchronously. In the prior client demo run 14 of 21 links failed the
first verification (`needs-reconciliation`) although the links existed; a manual rerun ~75 s later verified
all of them. The verify loop in `lib/recovery.cjs` (`for (let attempt = 0; attempt < this.attempts; attempt++)`,
`attempts = 3`) retries **immediately**, with no delay, so it can't absorb propagation latency.

### Implementation
1. Separate link creation/identity reconciliation from anonymous-access verification. Create links as their assets become ready and immediately persist known identities. A readable link with verified asset ownership but unavailable public content is pending propagation, not permission to create another link. Unknown identity or conflicting ownership still requires reconciliation rather than propagation polling.
2. After the creation stages, verify pending public URLs as a batch using bounded **read-only** backoff and a single shared elapsed-time deadline. Default: 90 seconds total, configurable via `--public-link-timeout <seconds>` / `CH_PUBLIC_LINK_TIMEOUT`. Include verification request time in the deadline; do not allocate a fresh window to each image or count only sleep time. Upload and approval time are separate from this public-link window.
3. Inject sleep and time through options so tests can advance a fake clock without real waiting. Successful images finish independently; another image's delay must not discard them.
4. If still not serving at the deadline, retain the link ID and report partial/`needs-reconciliation`. A later resume re-verifies the same link without duplicating creation. Print a clear hint: "public link exists (id …) but is not served yet — rerun the same command without --initialize in a minute".
5. Separate journaled approval requests from approval read-back. Poll known pending assets together within one configurable 60-second approval-verification window, including request time in the shared budget. Skip approval writes for assets already verified approved. Do not repeat an issued approval write to absorb delayed visibility or an unknown response; reconcile it by reading the known asset. Start link creation only for assets whose approval is verified. Retain pending approvals as partial when the deadline expires, while independent approved assets proceed. This approval window is separate from the public-link window and upload time; approval is never inferred from URL accessibility.

### Tests (`tools/agents/__tests__/`, pattern: `demo-entrypoints.test.js` uses a fake `fetchImpl`)
- Public URL returns 404 twice then 200 → image ends `uploaded`, exactly one link created, sleeps observed.
- Public URL never serves within the cap → `needs-reconciliation`, link ID journaled, resume run (fake now
  serving) → `uploaded` without a second `POST /api/entities`.
- Several images remain unavailable: their combined public-link polling uses one configured elapsed-time window, not one full window per image. Fast images finish independently and all known link IDs survive interruption.
- A verification request or backoff delay consumes the remaining shared budget; the runner does not start another full window when moving to the next image.
- Approval lag: asset status remains unapproved on initial read-back, then becomes approved → verified, with exactly one approval write and no link creation before verified approval.
- Multiple delayed approvals share one 60-second elapsed-time budget. At expiry, unresolved approvals remain partial and their assets are retained; approved assets continue independently.
- Resume after an unresolved approval reuses the asset and reconciles its state without duplicating an uncertain approval write.
- Existing tests still pass.

### Acceptance criteria
- A fresh upload of ~20 images whose known links become publicly accessible within the shared verification window finishes `complete` without a manual resume. This is conditional on observed service readiness, not a guarantee about Content Hub propagation time.
- Public-link polling is bounded by one shared 90-second elapsed-time window by default; upload/approval time is separate. Ready images finish and unavailable links retain their identities with a partial result.
- Approval polling uses one shared 60-second elapsed-time window by default, separate from upload time and public-link polling. No public link is created before the corresponding asset's approval is verified.
- No duplicate assets or public links under any retry path, and no repeated approval write to handle lag or uncertainty (assert POST counts in tests).
- Both timeouts are configurable; their batch-wide defaults and resume behaviour are documented in `references/recovery.md` and the skill's Phase 3 text.

---

## 9. Blank optional fields end up as a single space

### Problem
Many project datasource templates have `__Standard Values` = `$name` on display fields (observed live:
`Title` on HeroBanner, RichTextBlock, FeatureCardsGrid, TrustStatsRow, LegalComplianceBanner, CTABanner;
`CardTitle` on FeatureCardItem; `StatValue` on StatItem; `Caption` on ImageGallery). When an item is
created, Sitecore replaces `$name` with the item name, so the field is non-empty.
When the approved content says a field must be blank, `lib/populate.cjs` writes `""` via
`update_fields_on_item`; Sitecore **acknowledges but ignores empty writes**, so the helper falls back to a
single space `" "` (documented exception, `populate.cjs` ~lines 80–118). Components then treat `" "` as
content: `(fields.Title?.value || isEditing)` is truthy → empty `<h2>` with margins is rendered.
Measured: 153 such truthiness checks in 28 uiim files; only the prior client demo variants use `.trim()`.

Two complementary tracks: deliver 9a now with the existing verified pipeline blank fallback. Defer the creation-time-field change in 9b until a separately approved live probe confirms support; it does not block initial delivery.

### 9a. Components: treat whitespace-only text as empty (framework-wide)
1. Add a shared helper, e.g. `src/lib/field-utils.ts`:
   ```ts
   export const hasText = (value?: unknown): boolean =>
     typeof value === 'string' ? value.trim().length > 0 : !!value;
   ```
   Add a distinct `hasRichText` visibility helper: treat whitespace and empty formatting markup such as `'<p></p>'`, `'<p> </p>'`, `'<p>&nbsp;</p>'` as empty, but retain text, images, videos and embeds as meaningful content. Inspect without rewriting the authored HTML; the original field still renders through the SDK.
2. Replace text/rich-text visibility checks in `src/components/uiim/**`:
   `(x?.value || isEditing)` → `(hasText(x?.value) || isEditing)` and the jsonValue equivalent
   `(x?.jsonValue?.value || isEditing)`. Use `hasRichText` rather than `hasText` for Rich Text fields, including the corresponding jsonValue shape. Leave image (`.value?.src`) and link (`.value?.href`) checks alone.
   Remove the local `hasText`/`client-demoHasText` duplicates in RichTextBlock, TrustStatsRow, ImageGallery,
   FeatureCardsGrid (introduced by the prior client demo variants) in favour of the shared helper.
3. Keep `|| isEditing` everywhere (editability rule: empty fields stay visible in the editor). In view mode, gate empty field wrappers and text-only containers as well as the SDK text, so their margins/padding do not leave accidental gaps. Preserve image/link content and intentional structural layout; whole-component suppression is outside this change.
4. Update `.agents/skills/sitecore-standards/references/react-uiim-guidelines.md` ("Edit-mode visibility
   rule") and component templates in creation skills to use `hasText`.
5. Add a check to `tools/agents/validate-components.mjs`: fail on confirmed plain-text/Rich Text visibility checks using value truthiness instead of the appropriate meaningful-content helper. Identify field type from available declarations/SDK-helper usage where possible; unknown types or complex expressions produce review warnings, not speculative blocking errors. Exclude valid image/link visibility checks such as `.src`/`.href`. Test both detected regressions and accepted valid patterns.
6. Unit tests for `hasText`/`hasRichText`: cover whitespace, empty formatting markup, non-breaking spaces, actual text, and image/video/embed-only content. Component render tests verify whitespace and empty markup suppress view-mode wrappers/spacing but remain editable; media-only Rich Text remains rendered with its authored HTML unchanged.

### 9b. Deferred follow-up: avoid creating the `$name` value in the first place

Not part of initial implementation. Keep the existing creation arguments and verified blank fallback until the probe and follow-up change are separately approved.

1. **Probe first (live, read/write in a disposable scope, needs approval):** does `create_content_item`
   with `fields: [{ name: 'Title', value: '' }]` produce an empty field, or is `$name` still expanded?
   Does it accept a non-empty value at creation (it does — the tool supports `fields`)?
   Record findings in `docs/ai/reference/sitecore-marketer-mcp-reference.md`.
2. If creation-time fields work: change `lib/populate.cjs` `createItem` to pass the node's approved field
   values (including explicit blanks) in `create_content_item` — the item is born with the right values.
   Keep the subsequent `update_fields_on_item` + read-back verification unchanged (idempotent), and keep the
   single-space fallback only as a last resort with the existing exception record. Bind creation arguments and approved field intent to the new build contract and update recovery tests accordingly. Older incompatible journals must be rejected before mutations rather than migrated or accepted with silently changed creation arguments. Same-contract resumes still reconcile issued operations without repeating uncertain writes.
3. If creation-time blanks are still overwritten, retain the existing narrow, verified single-space fallback for explicitly blank optional Single-Line/Multi-Line Text fields. Record each exception and rely on the framework-wide whitespace-aware display checks to suppress empty view-mode elements while keeping fields editable. Do not change shared template or `__Standard Values` defaults. Other field types that cannot be cleared remain unresolved; whitespace is not a substitute for their intended values.
4. Initial-delivery tests in `tools/agents/__tests__/` verify that the existing narrow blank fallback still works and is recorded, while ineligible blanks remain unresolved. For an approved follow-up, add a controlled creation-time-field test using the verified API behaviour: explicit blank with a `$name` default produces a genuinely empty field with no exception if the probe confirmed that result. Do not make simulated support a substitute for the live probe.

### Acceptance criteria
- A field holding `' '` renders nothing outside edit mode in every uiim component and is still editable in
  Pages.
- Rich Text containing only empty formatting markup/non-breaking spaces suppresses its view-mode wrapper. Text and image/video/embed-only content remain visible, authored HTML is unchanged, and empty fields remain editable through SDK helpers.
- Empty text-only containers and their incidental spacing disappear outside editing mode without removing meaningful images/links, intentional layout or entire components. Editing mode retains the empty fields and necessary wrappers.
- Initial delivery retains the narrow verified fallback for eligible explicitly blank optional display-text fields, with an exception in `recovery-content.json`; ineligible fields remain unresolved and shared template defaults remain unchanged. Creation-time-field support is not required for initial acceptance.
- Deferred follow-up acceptance: after a separately approved creation-time probe and implementation, verify genuinely empty values where the API supports them, while preserving the fallback and no-blind-retry guarantees.
- `npx jest src`, `npx jest tools/agents`, `npm run agents:validate`, `npx tsc --noEmit -p .` pass;
  `npm run agents:check` passes after `.agents/` edits.

---

## Reference facts from the prior client demo run (for context)
- Marketer MCP live response shapes (already handled in `lib/marketer.cjs`, commit 0fc747be):
  item `template: { templateId }`; page component `id` = rendering instance, `componentId` = rendering
  definition, `parameters` is a JSON string.
- Content Hub relation shapes (handled in `lib/content-hub.cjs`): asset
  `FinalLifeCycleStatusToAsset: { parent: { href } }`; public link `AssetToPublicLink: { href }` → GET →
  `{ parents: [{ href }] }`.
