# Issue 013: P0 — Durable recovery checkpoints and a shared execution boundary

**Label:** `ready-for-verification`
**Implementation status:** Implemented and tested locally; authorised live-service verification pending.
**Priority:** P0
**Parent:** [Issue 012 — P0 recovery contract](012-demo-builder-p0-resume-reliability.md)
**Retrospective coverage:** Minimum supporting scope from B7, B9, and E3.
**Depends on:** None.

## Problem Statement

The demo pipeline records progress through ad hoc phase updates. If a process stops after a remote write but before recording the result, the next agent cannot distinguish an operation that was never attempted from one that succeeded remotely. Phase-level complete flags also hide partial effects, and every agent currently has to invent its own recovery logic.

The SE needs durable evidence of what was attempted, what was verified, and what is still uncertain before any repeat mutation is allowed.

## Solution

Introduce a small shared recovery foundation used by the upload, datasource-population, and assembly helpers. Bind local records to the approved build and environment, persist operation intent before writes, checkpoint verified effects as they become known, and expose clear partial/blocked outcomes and handoff notes.

This supports single-workspace interrupted runs; it does not reconstruct lost histories or reconcile changed plans.

## User Stories

1. As an SE, I want a build identity tied to approved inputs, so that a resume cannot silently use a different plan.
2. As an SE, I want the target environment checked before recovery, so that recorded IDs are not used against another site.
3. As an SE, I want each write attempt recorded before it starts, so that an interrupted request is not mistaken for unstarted work.
4. As an SE, I want returned resource IDs saved promptly, so that later stages can reuse known effects.
5. As an SE, I want verification evidence distinguished from a successful response, so that progress reflects the remote result.
6. As an SE, I want an unresolved write reported clearly, so that I can reconcile it without guessing what was attempted.
7. As an SE, I want a failed local checkpoint to stop further writes, so that remote work does not continue without recoverable records.
8. As an SE, I want missing or corrupt records detected safely, so that restarting cannot duplicate existing remote content.
9. As an SE, I want intentional source changes detected, so that the recovery process does not overwrite previous work with a new plan.
10. As an SE, I want independent confirmed failures recorded separately, so that successful work remains reusable.
11. As an SE, I want workarounds included in the handoff without credentials, so that the next operator understands the remaining caveats.
12. As a maintainer, I want one fault-injection boundary around external services, so that interruption tests exercise the real recovery and persistence logic.
13. As a maintainer, I want the same recovery semantics across agent harnesses, so that reliability does not depend on a particular agent remembering instructions.

## Implementation Decisions

- Use a versioned, local build record with stable build, section, child, asset, and operation identities appropriate to the approved plan. File names or component names alone are not proof of remote ownership.
- Record an identity for approved intent and the target environment using non-secret identifiers. Exclude generated progress, learned remote IDs, and other output-only fields from the input comparison; otherwise normal execution would invalidate its own resume.
- Persist write intent and relevant pre-write evidence before a remote mutation. Save returned IDs and stage effects promptly, then persist the verification outcome.
- The conceptual outcomes must distinguish unstarted, attempted/in-flight, verified, confirmed failed, and needs reconciliation. An in-flight operation found on restart is uncertain, not automatically retryable.
- Perform bounded read-back reconciliation before repeating uncertain writes. A transient read error or temporarily absent result is not proof that a timed-out mutation never committed. If the available contract/evidence cannot establish a safe action, stop the operation and its dependants.
- Save authoritative recovery state using atomic replacement or equivalent crash-safe persistence. Concurrent independent operations within one run must not lose one another's updates. Do not claim distributed or multi-process worker safety.
- If progress cannot be durably saved, stop issuing new mutations. Preserve existing valid records and provide a useful diagnostic rather than overwriting them with guessed state.
- Treat missing, corrupt, incompatible, or legacy records lacking sufficient operation evidence as an explicit limitation. Do not auto-adopt or recreate matching remote resources. If a safe fresh start cannot be established, stop.
- Track remote IDs, intended target relationships, verification results, and minimal pre-write observations needed for reconciliation. Record explicit selection of any existing target-page instance before modifying it; do not infer permission to modify another demo.
- If affected remote state has diverged from the last verified state, do not silently restore the old state or merge human edits. Stop the affected work for a decision. This is a scoped consistency check, not an audit of every item in the environment.
- Separate aggregate status from per-operation status. Required failures block their dependent section; confirmed optional failures may allow independent work to continue; unresolved work prevents an overall automated complete result.
- Exceptions record the operation/phase, time, reason, permitted workaround if any, and follow-up. Exclude secrets and authentication material from diagnostics and checkpoints.
- Keep execution logic harness-neutral with thin external-service adapters. Sitecore writes continue through the marketer MCP; Content Hub uses its supported upload API. Do not introduce an alternate direct Sitecore write channel.
- Use the existing build progress, content mapping, and image manifest as the user-facing records. If a small operation journal is necessary, define which record is authoritative and how derived summaries recover after interruption; avoid conflicting sources of truth.
- Reuse the existing Node/Jest agent-tooling conventions. Single-skill helpers remain owned by their canonical skill, consistent with ADR 0007. Update only the necessary skill, progress-template, and handoff instructions.

## Testing Decisions

Test the public execution/recovery boundary using real temporary workspaces and controlled external-service adapters. Restart with a new execution instance and only persisted state. Assert remote effects, durable output, reported status, and absence of unsafe writes, not private function structure.

Prior art: existing agent-tooling CLI tests exercise public commands against temporary app fixtures and already check idempotency and preservation of unrelated files. Extend this approach rather than introduce a new test framework.

- [ ] An unchanged approved plan/environment resumes; changed intent or environment produces a diagnostic before any mutation.
- [ ] Recording returned IDs and output fields does not falsely count as a changed approved plan.
- [ ] Interruption before a remote write, after its effect, after its response, and during local persistence produces a safe next-run outcome.
- [ ] A successful remote effect with a lost response is either uniquely reconciled or left blocked; it is not blindly repeated.
- [ ] Missing/corrupt/incompatible recovery records do not trigger adoption or recreation of matching remote resources.
- [ ] A checkpoint write failure preserves previously valid state and prevents further mutations.
- [ ] Independent in-run checkpoint updates are both retained.
- [ ] Detected changes to affected remote resources do not trigger automatic overwrite.
- [ ] Confirmed independent failures preserve verified progress and produce a partial report.
- [ ] Exception output explains the target and follow-up without exposing credentials.
- [ ] The canonical helper entry points are used by the operational skill flow, not only by tests. Generated agent checks pass after canonical skill/template changes.

Normal automated tests require no credentials or real service mutations. Adapter behaviour must be confirmed separately before live-verified claims.

## Out of Scope

- Portable recovery, reconstruction after loss of local records, or transparent migration of legacy histories with insufficient evidence.
- Revised-plan application, merging remote edits, deletion/reset, or changes to shared templates.
- A generic workflow engine, arbitrary manifest-editing CLI, distributed locking, or multiple simultaneous build workers.
- Environment readiness tooling, agent routing redesign, or fixes for unrelated development/lint failures.

## Further Notes

### Local implementation

`scripts/lib/recovery.cjs`, `scripts/lib/file-bridge.cjs`, `scripts/lib/marketer.cjs`, and `scripts/demo-recovery.cjs` under the canonical demo-builder skill. Covered by recovery, bridge and executable CLI tests.

Operating instructions: [P0 recovery execution contract](../../.agents/skills/sitecore-build-demo/references/recovery.md). All ordinary tests use temporary workspaces and controlled service adapters; no live CMS/Content Hub mutation was performed. Local tests do not certify live MCP response shapes, clear/order behaviour, or Content Hub stage contracts.


This is a prerequisite for [014 — uploads](014-demo-builder-resumable-uploads.md), [015 — datasource population](015-demo-builder-datasource-ordering.md), and [017 — assembly](017-demo-builder-safe-page-assembly.md). Their tests must use the recovery behaviour established here rather than duplicate it.

The test boundary is the recommended implementation approach from specification, not a separately approved product decision. All seven product decisions in the parent issue are approved. No live Sitecore or Content Hub mutation is authorised merely by this ticket.
