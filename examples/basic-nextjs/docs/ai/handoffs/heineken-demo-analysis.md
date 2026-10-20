# Heineken demo — analysis handoff

## Correction (analysis completed 2026-10-20)

The Footer cause **is known**. The Pi session log (`~/.pi/agent/sessions/--home-fedmuj-projects-heineken-examples-basic-nextjs--/2026-10-20T15-13-30-*.jsonl`, 18:34:52Z) recorded the MCP reply to `set_component_datasource`:

> `Datasource template mismatch: the provided item uses template '43ddc70d…' but component '4e7e77ef…' expects '98b34bff…' (422)`

The MCP requires the exact `Datasource Template`; the derived `HeinekenFooterData` is refused. Nothing changed: the new instance is still on placeholder `3b5c5e08…` and the old Footer is intact. It was not a transport failure (the request was recorded as `done`, not `issued`) and not delayed visibility.

Why it looked like a loop:

- About 1,500 MCP calls (about 1,200 reads, with 66 distinct reads repeated 5 or more times).
- 235 agent turns, because the ad-hoc runner forced a turn every 40 seconds.
- Eight helper and test edits mid-build.
- A 23-minute hung read (17:23 to 17:46Z).
- **72 minutes with no activity at all** (18:52 to 20:04Z) after the final checks. That was a stalled model request, not Sitecore work.
- Sleeps added only about 4.4 minutes in total.

Fixed in the helpers: 400/422 replies are now permanent, explained rejections that are never re-sent. A datasource-template preflight runs before any write. A bundled, budgeted runner has stop rules (`references/recovery.md`, "Run budget and stop rules"). On resume, the Footer section now stops at the preflight with this reason and makes no writes. **Chosen repair: (c) manual binding.** The user sets the new instance `5870c114…` Data Source to `66b47666…` in Content Editor. A read-only check then confirms it, and one resume through the runner verifies the wire by read, removes the old Footer and runs the approved cleanup. The template check skips wiring that was already issued, so it does not block this.

## Assignment and boundary

**Analyze why this build took excessively long and why Footer assembly remains unresolved. Do not resume the build automatically.** The user repeatedly reported that execution looked like a loop and lasted over an hour. The previous agent stopped Sitecore execution and pushed the work as **partial**.

Deliver an evidence-based diagnosis, distinguish confirmed defects from hypotheses, and propose a bounded repair/verification plan. Obtain approval before new Sitecore/Content Hub writes, instance removal, publishing, or modifying approved execution inputs.

## Workspace and Git

- App directory: `/home/fedmuj/projects/heineken/examples/basic-nextjs`
- Branch/upstream: `heineken-demo` / `origin/heineken-demo`
- Remote repository: `FMC-ORG/custom-demo`
- Pushed implementation: `c0a2c64d` — `feat: add Heineken demo theme, components and variants`
- Earlier setup commit: `2946aab9` — manifest validation timestamps
- Framework baseline: `d9269a5d`
- Review implementation with `git diff d9269a5d..c0a2c64d`.
- Working tree was clean after the implementation push. This handoff is a subsequent documentation change.

Read the app's `AGENTS.md`, `docs/ai/config/project.yaml`, and applicable skills before analysis. Relevant skills: `sitecore-diagnose-rendering`, `sitecore-manifest`, `sitecore-standards`; the build execution contract is `.agents/skills/sitecore-build-demo/references/recovery.md`.

## Approved scope

Client: `heineken`; source: https://www.theheinekencompany.com/.

The user approved the theme, screenshot-matching custom variants, the named Home/Header/Footer replacements/removals, a client-derived footer datasource/query extension, the explicit optional metrics heading blank, and commit/push. **This is not permission to repeat an uncertain mutation or silently broaden the footer repair scope.**

The authoritative screenshot is `docs/ai/demos/heineken/reference/homepage-desktop.png`. Original Windows source: `C:\Users\fmf\Downloads\screencapture-theheinekencompany-2026-10-20-17_51_43.png`.

Theme: `docs/ai/themes/heineken.theme.yaml`. Lora / Source Sans 3 substitutions were approved; proprietary fonts were not copied.

## Environment guard

Project configuration specifies collection `main`, site `main-website`, and **no Environment Marker expected**. Early setup initially connected to an environment containing `sitecore-demo`; the user switched MCP, after which `/sitecore/content/Environment Markers` was absent.

Before any live Sitecore investigation, check the connection again using read-only marketer MCP calls. Never create/delete markers. Several environments can share IDs/paths.

Configured site ID: `c963afd4-7293-485c-ae50-266b5c8e6753`; Home: `e2124310-f817-4644-8671-bff8e72b66d7`.

`execution-plan.json` uses `environment.marker = unmarked-main-main-website:c963afd4-7293-485c-ae50-266b5c8e6753` as the recovery helper's non-secret identity. It is **not** a marker-folder child. The first initialization was rejected because this identity was empty; it was corrected before any population journal existed.

## Current result — checked from saved records

- Uploads: **complete**, 20 mapped images approved and public-link verified.
- Population: **complete**, 12 parent datasources + 40 children; `unresolved: []`, `issues: []`, 104 verified operations.
- Assembly: **partial**, 11 verified instances (Header + ten Home sections); 46 verified operations and one `needs-reconciliation` operation.
- Three custom components: `HeinekenInvestorNews`, `HeinekenSustainability`, `HeinekenSiteSelector`.
- Nine template-component variants were created and applied to verified placements.
- Original variants and example datasources were preserved; Available Renderings was appended from a live 37-entry value to 40 entries, then read back.
- Publishing was not performed. Pixel-level delivered matching and mobile QA are unverified. Screenshot API repeatedly returned `Failed to get rendering host URL (500)`.

### Exact Footer blocker

| Entity | ID / state |
|---|---|
| Footer partial design | `c08d4fb5-8667-459e-93e0-471c9efc10dc` |
| Rendering | `4e7e77ef-529c-4c28-a5d8-94c5aca065ff` (`SiteFooter`) |
| New instance | `5870c114-727f-4cf0-9cf0-105ce63ab8f8` |
| Planned client datasource | `66b47666-925f-4354-ba7f-8c91f2ece19b` |
| Auto-created placeholder datasource | `3b5c5e08-f09e-4790-8e2a-264a1c7279d3` |
| Old instance, still retained | `dfd74e57-3439-425b-8730-c43566be5238` |
| Old datasource | `f8fdfefe-119a-49de-9eae-36849c17b9d3` |
| New variant | `00d71ec3-8c5f-41ad-aea2-2abe14d5f6a3` (`HeinekenFooter`) |

In `recovery-assembly.json`:

- `site-footer:variant-first`: verified.
- `site-footer:shared-add`: verified, at `2026-10-20T18:34:24.817Z`.
- `site-footer:variant-restore`: verified; original folder order restored.
- **`site-footer:shared-new-wire`: `needs-reconciliation`, reason `write outcome unknown`, at `2026-10-20T18:34:40.221Z`; no successful `result` is checkpointed.**
- `site-footer:shared-remove-old` was not executed.

A subsequent live inventory showed the new instance still referencing `local:/Data/heineken_SiteFooter_site-footer`, resolved to the placeholder ID above, with the correct Heineken variant parameters. The old instance remained unchanged.

The exact failed transport/application response was not recovered. After phase completion, the consumed request was no longer present in `mcp-assemble.json`, and the runner had deleted its temporary reply file. **Do not describe the cause as a confirmed template rejection or confirmed network failure.**

Footer template extension: `HeinekenFooterData` (`43ddc70d-fbad-472a-abfb-87e1100d57ca`) inherits `SiteFooterData` (`98b34bff-0d74-4798-b2d8-cb52c19f7c92`); children use `HeinekenFooterLink` (`c48f39a2-f263-4d46-bf85-d1a74ef499cb`). The existing rendering's Datasource Template path was preserved; its ComponentQuery was expanded with optional client fields/children. Derived-template compatibility is an **unproven hypothesis to investigate**, not an established diagnosis.

The starter CTA `722144e9-b524-417d-9b25-fc1041c8764e` and SearchCollection `90cb6e51-03b8-4e81-bf6e-ef83d18d9e93` remain: final cleanup is gated on a clean assembly. Eleven verified auto-created placeholder datasource IDs are listed in `assembly-result.json`; do not delete referenced placeholders.

## Evidence files — read in this order

All paths below are relative to the app:

1. `docs/ai/demos/heineken/demo-summary.md` and `manual-tasks.md`
2. `docs/ai/demos/heineken/assembly-result.json`
3. `docs/ai/demos/heineken/recovery-assembly.json`, focusing on the four Footer steps
4. `docs/ai/demos/heineken/mcp-assemble.json`
5. `docs/ai/demos/heineken/population-result.json` and `recovery-content.json`
6. `docs/ai/demos/heineken/execution-plan.json` — approved, frozen inputs
7. `docs/ai/demos/heineken/target-inspection.json`, `build-plan.yaml`, `content-map.yaml`
8. `docs/ai/demos/heineken/definitions-journal.json`, `template-field-verification.json`
9. `docs/ai/demos/heineken/images/upload-result.json` and `recovery-uploads.json`
10. `docs/ai/manifests/sitecore-manifest.yaml` — committed IDs/status, not ownership evidence replacing journals

**The entire `docs/ai/demos/heineken/` directory is gitignored and local to this workspace.** A fresh clone will not contain these files. If they are unavailable, ask for a secure workspace handoff; do not initialize replacement journals or recreate remote resources. Credentials/logs must not be printed or committed.

## Why execution expanded

Observed sequence:

1. Bundled screenshot scraper navigated to Cookie Policy during popup dismissal; later attempts hit Cloudflare. User supplied the valid screenshot. A later content extraction succeeded and downloaded 28 inputs, filtered to 20 mapped uploads.
2. Templates, field types, Standard Values, folders, renderings and content were created/read back through many sequential MCP calls.
3. The CLI handoff protocol requires separate step, claim, MCP call, reply, and next-step commands. A local runner processed short batches.
4. Delayed reads repeatedly produced partial population results. Fresh sessions/finished phases invalidated observation caches, causing revalidation of earlier verified sections. Several passes read most of the dataset again.
5. The local runner added sleeps after mutations (eventually 10 seconds for population field writes, 3 seconds otherwise). These were not a proven global latency measurement and increased wall time.
6. The agent implemented helper fixes during the client build, repeatedly ran checks, and did not enforce an early time/call budget or hand over the blocker soon enough. The user explicitly objected to this behavior.
7. Population eventually completed; assembly reached the independent, still-unresolved Footer binding outcome. The agent stopped and pushed partial work.

Do not infer total MCP call count from current bridge files: `FileBridge.finish()` prunes consumed requests. Use available timestamps, journals, the runner, and session audit history if available; state any evidence gaps.

## Helper changes to audit

Committed in `c0a2c64d`:

- `.agents/skills/sitecore-build-demo/scripts/lib/populate.cjs`
  - `updateItem` verification requests a fresh observation for every bounded attempt, including attempt 0.
  - Final field verification uses a separate fresh-read tag.
- `.agents/skills/sitecore-build-demo/scripts/lib/assemble.cjs`
  - Shared datasource preconditions compare genuine GUIDs independent of braces/casing; non-GUID strings remain exact.
- Regression tests added in `tools/agents/__tests__/demo-handoff-scaling.test.js`, `demo-populate.test.js`, and `demo-shared-replace.test.js`.

The tests failed before their associated fixes and passed afterward. Final check: **16 demo test suites / 100 tests passed**, TypeScript and targeted ESLint passed, agent sync/check passed, component map validated 36/36. These are local checks, not proof of live service timing or visual correctness.

Local-only orchestration to inspect:

- `docs/ai/demos/heineken/handoff-runner.js` — services helper requests; does not create content independently.
- `definition-tools.js` / `definitions-journal.json` — custom definition creation, separate from population journals.
- `prepare-execution.cjs`, `map-content.cjs`, `final-records.cjs` — input/projection helpers. Derived progress files may lag and must not override journals.

## Build and visual caveats

`npm run build` failed locally with `EUNKNOWNCONFIG`: `npm-run-all` forwarded legacy package-config flags (`--template`, `--appName`, `--graphQLEndpointPath`, `--language`) rejected by the installed npm. The equivalent supported stages **passed**:

```bash
NODE_ENV=production npm run sitecore-tools:generate-map
NODE_ENV=production npm run sitecore-tools:build
NODE_ENV=production npm run next:build
```

Build logs are local and may contain sensitive configuration; inspect through filtering rather than dumping them. `next-env.d.ts` and `tsconfig.tsbuildinfo` generated changes were restored and excluded from the implementation commit.

The source wheel artwork differs from the screenshot (“Raise the Bar 2030” versus “Together We Can 2030”). Cookie settings is an authored but disabled control outside editing pending consent-manager integration. Video links to the verified YouTube source in a new tab; no in-page player is claimed. Source-domain links and shared-design impact require QA. An existing Dutch production personalization was left unchanged; no A/B flows were found on the two shared partial designs.

## Requested analysis output

Produce a short report with:

1. **Footer diagnosis:** observed facts, ranked hypotheses, and the minimum read-only evidence needed to discriminate between compatibility, application rejection, transport failure, and delayed visibility.
2. **Loop diagnosis:** where cache invalidation, partial-result finalization, full-phase replay, sleeps and command handoffs increased work. Quantify from available records and identify missing evidence.
3. **Fix audit:** whether the three helper changes are correct, bounded and adequately tested; preserve drift/ownership checks and unknown-outcome handling.
4. **Bounded next plan:** a small read-only budget first, clear stop conditions, any required new approval, and how to reconcile the existing binding without duplicating or reissuing unknown mutations.
5. **Reporting:** separate code/build success, verified CMS state, required unresolved wiring, publishing and visual QA. Do not call this a completed pixel-perfect demo.

### Hard safety boundaries

- Keep the approved execution plan and all journals/transport records intact.
- A claimed mutation with no successful recorded response is unknown, not automatically failed. Reconcile; do not repeat its claim.
- Preserve the old Footer until the replacement's datasource is verified.
- No new initialization, renamed retry resources, manual journal status edits, or invented read-back values.
- No automatic publishing, cleanup deletion, branch merge, or further repair writes under this analysis-only assignment.
- Record recommendations and ask for approval rather than restarting the long-running build pipeline.
