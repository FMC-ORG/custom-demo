# Issue 012: P0 — Reliable same-workspace demo build recovery

**Label:** `ready-for-verification`
**Implementation status:** Implemented and tested locally; authorised live-service verification pending.
**Priority:** P0
**Type:** Delivery umbrella / integrated acceptance
**Origin:** Approved demo-builder reliability retrospective; the client-specific report remains outside this delivery branch.
**Scope:** B5, A3, A1, A2/A6, and the minimum execution/checkpointing helpers needed from B7/B9/E3.

## Problem Statement

An SE can interrupt a custom demo build and discover that restarting it creates duplicate Content Hub assets or page components, changes list order, or exposes datasource item names as customer-facing content. Successful API responses and non-empty field values do not prove the intended result. A timeout can occur after a remote write succeeds, and the current progress records do not reliably distinguish that outcome from failure.

The SE needs to continue a build without repeating verified work or silently damaging its result. This is interrupted-build recovery, not a general content synchronisation feature.

## Solution

Make the existing demo pipeline resumable in the same workspace, against the same approved inputs and environment. Small tested execution helpers perform uploads, datasource population, and page assembly, saving durable progress and verifying remote outcomes. The agent continues to own planning, approvals, and decisions.

Verified work is reused. Unknown write outcomes are reconciled through bounded read-back; unresolved ambiguity stops the affected operation and its dependants rather than triggering another mutation. Confirmed failures allow safe independent work to continue, with an explicit partial result and actionable handoff.

## User Stories

1. As an SE, I want to resume an interrupted build in the same workspace, so that I retain completed work.
2. As an SE, I want recovery bound to the approved plan and environment, so that a restart cannot silently become a different build.
3. As an SE, I want completed images reused, so that reruns do not create duplicate Content Hub assets.
4. As an SE, I want asset approval and public-link work resumed separately, so that an incomplete upload workflow does not require another binary upload.
5. As an SE, I want timed-out component additions checked against the page, so that successful additions are not repeated.
6. As an SE, I want repeated uses of one component tracked separately, so that a projects section cannot be mistaken for a news section.
7. As an SE, I want authorable children displayed in source order, so that numbered cards, navigation, and asymmetric layouts remain correct.
8. As an SE, I want unintended item-name defaults detected, so that internal names do not appear in the demo.
9. As an SE, I want explicitly blank optional display text distinguished from unspecified content, so that missing instructions do not erase valid fields.
10. As an SE, I want any permitted whitespace workaround recorded, so that the handoff accurately describes authored content.
11. As an SE, I want unknown write outcomes to stop safely, so that automation does not trade certainty for duplicate creation.
12. As an SE, I want confirmed optional failures isolated, so that useful independent work can still finish.
13. As an SE, I want unresolved work clearly reported as partial, so that I do not mistake progress for completion.
14. As an SE, I want shared templates and other demos left untouched, so that this reliability work has a bounded impact.
15. As an SE, I want missing recovery records identified before writes, so that a fresh invocation cannot silently rebuild over existing content.
16. As a maintainer, I want critical recovery mechanics implemented in tested helpers, so that each agent does not reinvent them from prose.
17. As a maintainer, I want interruption tests to restart from persisted state, so that passing tests reflect actual process recovery.
18. As an SE, I want automated completion distinguished from manual presentation tasks, so that a recovered build is not incorrectly described as demo-ready.

## Implementation Decisions

### Decisions approved during triage

- Recovery supports the same workspace, approved plan/content map, and target environment. Revised plans, changed assets, environment switches, and human-edit reconciliation are not applied automatically.
- Safety takes precedence over unattended completion. An unknown write outcome is not a confirmed failure. Never blindly retry it.
- Corrections are restricted to this build's recorded resources and explicitly approved target-page operations. Shared templates, their standard values, serialized baseline items, and other demos are not changed.
- A single-space workaround is permitted only for explicitly blank optional display-text fields on this build's datasource items, after clear/reset behaviour has been checked. Read it back and record the exception. It is never a substitute for required, unspecified, link, or image content.
- Recovery requires local build records. Missing or unusable records must not cause automatic adoption, deletion, or recreation of matching remote content.
- Confirmed failures may permit independent work to continue. Unresolved operations keep the affected section and aggregate automated build result partial or blocked.
- Implement small tested execution helpers and thin harness adapters, not a general workflow engine. Retain the existing cross-agent skill ownership and command-only invocation rules.

### Delivery tickets

| Ticket | Responsibility | Dependency |
|---|---|---|
| 013 | Recovery records, operation identity, outcome handling, and test boundary | None |
| 014 | Resumable Content Hub uploads | 013 |
| 015 | Resumable datasource creation and verified child ordering | 013 |
| 016 | Unintended-default detection and explicit blank handling | 015 |
| 017 | Reconciled page assembly and datasource wiring | 013; integrated verification also uses 014–016 |

The umbrella owns integrated acceptance and consistent skill/progress/handoff behaviour. It does not authorise the rest of the retrospective. Each child ticket should remain a focused change; shared recovery behaviour belongs to the foundation rather than being copied into each phase.

### Completion semantics

- A recorded ID or successful response is not sufficient proof of completion; use the relevant read-back evidence.
- An operation whose effect may have occurred remains unresolved until evidence identifies its outcome. If that evidence is unavailable, stop and report it.
- Completed automated work and expected manual handoff tasks are reported separately. Variant selection, publishing, and visual QA are not implemented by this P0 work.
- A permitted and verified blank-text workaround is a recorded exception, not an unresolved failure. Other unverified effects must not be hidden behind a complete phase flag.
- Client-side checkpoints cannot guarantee exactly-once remote execution. The guarantee is no blind repetition of ambiguous mutations, reuse of verified effects, and an honest stop when evidence is insufficient.

## Testing Decisions

Use the existing Node/Jest agent-tooling test conventions: public execution entry points, temporary workspaces, and assertions on observable outputs. Prefer one shared external-service adapter boundary for fault injection, with real checkpoint files and fresh execution instances after interruption. Do not mock away the execution or persistence logic being tested.

The recommended testing boundary was proposed during specification; the user requested ticket creation without a separate testing-design confirmation. It is an implementation recommendation, not an additional approved product decision.

### Integrated acceptance

Checked items below refer to controlled local fixtures and local repository checks, not live-platform certification. The CLI tests restart Node processes between handoffs and deliberately discard committed create/add responses before recording IDs.

- [x] Interrupt and resume the same fixture build across uploads, datasource population, and assembly; counts, IDs, order, and wiring match one successful build.
- [x] Run a completed fixture build again; it creates no additional assets, datasource items, child items, or component instances.
- [x] Simulate a remote mutation succeeding followed by a lost response; recovery either reuses the uniquely verified effect or stops without repeating the mutation.
- [x] Simulate interruption between remote success and saving the returned ID; persisted intent prevents the next execution from treating the operation as never attempted.
- [x] Confirm two sections using the same rendering retain their own instance identities and datasource assignments.
- [x] Confirm child order matches the approved source sequence, including non-alphabetical names.
- [x] Confirm unintended item-name defaults are caught and the narrow blank workaround is verified and reported.
- [x] Confirm an optional rejected image does not discard independent successes; the aggregate result remains partial and the handoff names the unresolved target field.
- [x] Confirm changed inputs/environment, corrupt records, and missing records with matching remote content lead to no automatic corrective writes.
- [x] Confirm existing demos, shared templates, unrelated page components, and unrelated assets remain unchanged.
- [x] Canonical skills instruct agents to use the tested helpers rather than independently recreate recovery loops. Generated agent configuration is synchronised and its checks pass when those sources change.
- [x] Existing unit tests and type checking remain passing. Report existing unrelated lint/environment blockers rather than claiming those checks passed or expanding this issue to fix them.

Automated tests must not require credentials or mutate real services. Actual MCP read/clear/order behaviour and Content Hub stage contracts require separately authorised verification in a disposable scope before being described as live-verified. Report automated and live verification separately; preserve existing client demos.

## Out of Scope

- Revised-plan reconciliation, remote human-edit merging, or destructive reset/rebuild.
- Recovery from another machine, recovery after loss of local state, or automatic reconstruction of legacy runs without adequate evidence.
- Shared-template/standard-value changes, serialization changes, cleanup/deletion of duplicates or orphaned local datasources.
- New component types, highlighted headings, variant organisation changes, or automatic variant selection.
- Header/footer redesign or shared partial-design switching.
- Extractor/theme improvements, upload selection optimisation, environment doctor, development-command fixes, and ESLint repair.
- A generic manifest editor, general workflow framework, or distributed/concurrent execution system.
- A claim of pixel-perfect, deployed, published, or presentation-ready completion without the corresponding separate verification.

## Further Notes

### Local implementation and verification

- Canonical execution entry points: `scripts/upload-to-content-hub.mjs` and `scripts/demo-recovery.cjs` under `.agents/skills/sitecore-build-demo/`.
- Shared modules implement write-ahead journals, a durable allowlisted marketer MCP handoff, staged uploads, datasource/default guards, assembly reconciliation, and derived progress views.
- [Recovery contract and operating instructions](../../.agents/skills/sitecore-build-demo/references/recovery.md) cover reviewed field-ready plans, explicit initialisation, same-workspace resumes, safe claims, partial results, and legacy-run exclusions.
- Added regression coverage in `tools/agents/__tests__/demo-*.test.js`, including executable CLI handoffs, controlled HTTP adapters, lost replies, and an integrated upload/populate/assemble fixture. No test requires credentials or live service mutations.
- Local checks: full Jest suite, TypeScript, agent sync/check, 33/33 component registrations, script syntax, and whitespace validation. ESLint still fails while loading its pre-existing configuration with `TypeError: Converting circular structure to JSON`; this P0 does not change it.
- No live Sitecore/Content Hub writes, shared template/serialization changes, or legacy demo migration were performed. Pre-existing local generated changes and the client-specific retrospective were preserved outside this delivery branch.
- Live response-shape, clear/reset, ordering and Content Hub lifecycle/public-link verification remains a separately authorised disposable-scope task. Do not mark the live Sitecore manifest verified from these local results.


Child tickets:
- [013 — Recovery checkpoints and execution boundary](013-demo-builder-recovery-checkpoints.md)
- [014 — Resumable Content Hub uploads](014-demo-builder-resumable-uploads.md)
- [015 — Resumable datasource population and child order](015-demo-builder-datasource-ordering.md)
- [016 — Unintended defaults and optional blank text](016-demo-builder-default-field-guards.md)
- [017 — Safe page assembly after uncertain writes](017-demo-builder-safe-page-assembly.md)

Source: a demo-builder retrospective and seven user-approved triage decisions. ADR 0007 governs canonical skills, script ownership, generated wrappers, and cross-agent behaviour. This is fork-specific work, not an upstream contribution. Creating these tickets does not run the demo pipeline or authorise live test mutations.
