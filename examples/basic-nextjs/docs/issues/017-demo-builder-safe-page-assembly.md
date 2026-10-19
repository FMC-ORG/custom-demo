# Issue 017: P0 — Reconcile page assembly before retrying uncertain writes

**Label:** `ready-for-verification`
**Implementation status:** Implemented and tested locally; authorised live-service verification pending.
**Priority:** P0
**Parent:** [Issue 012 — P0 recovery contract](012-demo-builder-p0-resume-reliability.md)
**Retrospective coverage:** A3 and the assembly portion of B7.
**Depends on:** [Issue 013 — recovery checkpoints](013-demo-builder-recovery-checkpoints.md).
**Integrated verification:** Uses verified datasource output from Issues 015–016 and image outcomes from Issue 014.

## Problem Statement

Adding a component can time out even though Sitecore added it. The call can also create a local datasource before returning. A naive retry can therefore duplicate a page component or collide with an existing item name. Losing the returned component instance ID also breaks subsequent placement and datasource wiring.

Component-name matching is insufficient: a demo may contain two ProductPricingCards sections with different purposes and datasources. Recovery must identify the intended instance, not merely any instance of that rendering.

## Solution

Provide a tested assembly helper that records per-section identity and pre-write page state, adds components sequentially, verifies actual page changes, and checkpoints the resulting instance before wiring its datasource. On timeout or restart, reconcile the operation against the page before deciding what is safe. Stop unresolved ambiguity instead of bypassing it with a fresh item name.

## User Stories

1. As an SE, I want an add timeout checked against the actual page, so that successful additions are not repeated.
2. As an SE, I want each planned section associated with its own rendering instance, so that repeated component types are not conflated.
3. As an SE, I want instance IDs persisted before later placement, so that a restart preserves insertion order.
4. As an SE, I want an already-added component wired without being added again, so that recovery continues from the actual stage.
5. As an SE, I want a timed-out datasource assignment verified before another mutation, so that unknown outcomes are not blindly repeated.
6. As an SE, I want components placed in approved order, so that recovery does not append them to arbitrary positions.
7. As an SE, I want name collisions investigated before retry, so that leftover local datasources do not cause duplicate page sections.
8. As an SE, I want ambiguous page changes to stop with evidence, so that another agent's or human's changes are not misidentified as mine.
9. As an SE, I want a completed assembly rerun to create nothing, so that I can safely resume a build whose last response was lost.
10. As an SE, I want unrelated components and parameters preserved, so that recovery does not modify another section or demo.
11. As an SE, I want unresolved assembly reported per section, so that manual reconciliation is actionable.
12. As an SE, I want the final component order and datasource assignments verified, so that completion describes the page rather than the attempted API calls.
13. As a maintainer, I want actual assembly entry-point tests with delayed and lost responses, so that recovery behaviour is repeatable across harnesses.

## Implementation Decisions

- Consume the approved section plan, target-page identity, verified datasource records, and the shared recovery foundation. Sitecore mutations remain marketer MCP calls.
- Assign stable identities to planned section occurrences, including repeated use of a rendering. Bind each to the expected rendering, placeholder, datasource, and recorded instance once known.
- Existing component reuse requires an explicit, recorded selection on the approved target page. Do not implicitly select the first matching component name, alter another demo, or modify existing datasource content to make it fit.
- Before each add, checkpoint intent and a relevant snapshot of page instance IDs and relationships. Use deterministic, section-specific datasource item names; do not generate a new name on every retry.
- Add sequentially where placement depends on the preceding instance. Do not chain insertion after an unverified or unknown instance ID.
- Read the page after every add, including a nominal success. Identify the effect using pre/post evidence, expected rendering and placeholder, and the planned occurrence. A name match alone is insufficient.
- If exactly one effect can be safely attributed to the attempt, record and verify that instance, then continue. If no effect is yet visible, use bounded reconciliation. A temporarily absent component is not proof that an aborted add will never commit.
- If multiple candidates, external changes, inconclusive reads, or incomplete API evidence prevent attribution, mark needs reconciliation and stop the affected assembly chain. Do not resolve ambiguity by adding again.
- A name collision or an orphaned auto-created local datasource is not proof that a corresponding page component exists. Inspect state and stop if a safe retry cannot be established; do not automatically delete the local item or bypass the collision.
- Checkpoint the added instance before datasource wiring. Wire the planned client datasource ID, never the manifest's example datasource.
- Treat datasource assignment as its own verified operation. If the response is lost, read back the current assignment. Continue if it matches; otherwise reconcile conservatively before repeating or overwriting it.
- Verify final relative order, full placeholder placement, distinct planned occurrences, and datasource relationships. Preserve unrelated page components and rendering parameters, including existing variant selections.
- Do not claim or assume that newly added components use Default. This ticket preserves/reportably observes existing presentation state but does not implement variant selection or the full live variant-checklist improvement.
- Only consume section dependencies that are ready for assembly under the approved plan. A required population failure must not be hidden by placing the section anyway. Confirmed independent failures may preserve completed work, but unknown add outcomes must not be skipped to continue an order-dependent chain.
- Record confirmed automatic local datasource effects when discoverable and list cleanup candidates without deleting them. Orphan cleanup remains a separate manual or future task.
- Update the canonical assembly instructions to invoke the helper rather than write new inline add/retry loops. Preserve the command-only demo invocation and existing approval gates.

## Testing Decisions

Exercise the real public assembly execution boundary with a stateful fake marketer service and real temporary checkpoint records. The fake must model component addition, local datasource side effects, datasource assignment, name collisions, delayed visibility, and responses lost after commit.

Assert final remote state, persisted instance mapping, diagnostics, and prohibited duplicate mutations. Avoid tests tied to private helper call order, except where mutation ordering is an externally observable safety contract.

- [ ] A successful add followed by a timeout is found by read-back, recorded, and not repeated.
- [ ] Interruption after add but before recording its returned ID reconciles from persisted intent and pre-write evidence.
- [ ] Delayed visibility triggers bounded read-back rather than an immediate second add.
- [ ] An unresolved outcome stops without another add, even after the reconciliation budget is exhausted.
- [ ] Multiple plausible new instances produce needs reconciliation without automatic adoption or deletion.
- [ ] A local-datasource name collision without a verified component does not trigger a renamed retry.
- [ ] Two ProductPricingCards occurrences retain distinct instance IDs, positions, and datasource assignments.
- [ ] Resume after add but before wiring assigns the datasource without creating another component.
- [ ] A successful wiring call with a lost response is verified from the current assignment.
- [ ] Divergent affected page state prevents silent overwrite or reconstruction.
- [ ] Sequential insertion and final verification preserve approved relative section order.
- [ ] A fully verified assembly rerun creates no components and performs no unnecessary datasource updates.
- [ ] Unrelated components, variants, and parameters remain unchanged.
- [ ] Missing or incompatible recovery state does not permit a fresh build over ambiguous matching content.
- [ ] Required dependency failures and uncertain placement keep affected sections incomplete; diagnostics identify the operation and target.
- [ ] The actual build skill uses the helper and its generated-agent consistency checks pass.

Separately authorised live verification must confirm the marketer API's actual page-read, placement, timeout, and datasource-assignment behaviour. Do not use destructive failure tests on existing client pages.

## Out of Scope

- Automatic component removal, orphan deletion, duplicate cleanup, or destructive page reset.
- Applying revised plans, moving human-edited components, or restoring old values over external changes.
- Shared partial-design changes, automatic header/footer switching, variant selection, or dynamic split-layout support.
- Variant Definition creation, browser preview overrides, publishing, or visual acceptance.
- A server-side exactly-once guarantee or changes to the Sitecore MCP server itself.

## Further Notes

### Local implementation

`scripts/lib/assemble.cjs` consumes verified population output plus its authoritative ownership journal. Tests cover repeated rendering types, lost add/wiring responses, ambiguity, parameter preservation, missing journals, and actual CLI request/result handoffs.

Operating instructions: [P0 recovery execution contract](../../.agents/skills/sitecore-build-demo/references/recovery.md). All ordinary tests use temporary workspaces and controlled service adapters; no live CMS/Content Hub mutation was performed. Local tests do not certify live MCP response shapes, clear/order behaviour, or Content Hub stage contracts.


The central rule is that a timeout reports an unknown outcome, not a failed mutation. Deterministic naming is useful evidence, but does not itself provide idempotency.

This ticket must not turn the remote-success/local-checkpoint gap into another add. If the platform exposes insufficient evidence, an explicit stop is the accepted P0 result. See the parent issue for aggregate status and manual handoff distinctions.
