# Issue 015: P0 — Resumable datasource population with verified child order

**Label:** `ready-for-verification`
**Implementation status:** Implemented and tested locally; authorised live-service verification pending.
**Priority:** P0
**Parent:** [Issue 012 — P0 recovery contract](012-demo-builder-p0-resume-reliability.md)
**Retrospective coverage:** A1 and the datasource-population portion of B7.
**Depends on:** [Issue 013 — recovery checkpoints](013-demo-builder-recovery-checkpoints.md).

## Problem Statement

The current content-population instructions create list children without requiring explicit sort order. Sitecore can then return siblings alphabetically, even when all individual fields were populated successfully. That changes navigation order, numbered stages, news chronology, and position-dependent card layouts.

Content creation is also written as agent-authored loops. An interrupted run can lose the relationship between a planned section and its datasource/children, leading to duplicate items or repeated updates during recovery.

## Solution

Introduce a tested population helper that creates and populates this build's datasources through the marketer MCP, checkpoints item identities, sets explicit child sort order from the approved content map, and verifies both field values and the actual returned child sequence. On resume it continues only unfinished, safely reconciled operations.

## User Stories

1. As an SE, I want list children to retain source order, so that the demo matches the approved page plan.
2. As an SE, I want explicit ordering independent of item names, so that editorial naming cannot rearrange the display.
3. As an SE, I want parallel child creation to produce the same final order, so that execution timing does not change the page.
4. As an SE, I want parent datasource IDs saved before children are created, so that a restart does not create another parent.
5. As an SE, I want each planned child associated with its returned ID, so that unfinished children can be resumed separately.
6. As an SE, I want lost creation responses reconciled before another create, so that retries do not duplicate datasource items.
7. As an SE, I want populated fields read back, so that a successful response is not mistaken for correct content.
8. As an SE, I want the resulting child sequence verified, so that a silently ignored sort-order write is caught.
9. As an SE, I want shared example datasources left unchanged, so that the starter and other demos retain their defaults.
10. As an SE, I want required population failures to block their dependent section, so that assembly does not consume an incorrectly completed datasource.
11. As an SE, I want confirmed independent failures to preserve other sections, so that a partial run remains useful.
12. As a maintainer, I want tested field/XML population behaviour reused by the skill, so that every agent does not implement the same conversion loop differently.

## Implementation Decisions

- Consume approved content-map intent, existing template/folder identities, and verified image metadata. Use the shared recovery foundation for all mutations and records.
- Resolve and verify the intended parents and templates using project identity and the manifest before creation. Preserve Sitecore rules: writes go through the marketer MCP and every claimed completed effect is read back.
- Create client datasource instances rather than modifying example items. Use recorded build ownership and planned identities to distinguish this build from unrelated resources.
- Use stable section and child identities within the unchanged plan. Do not identify a child only by its display name or treat two sections using the same component as one datasource.
- Record parent creation before child operations. Record each child creation independently; a parent-created marker does not imply children exist.
- Persist intent before each create and reconcile unknown outcomes before any retry. If a matching item cannot be uniquely attributed to the attempted operation, stop rather than use a different name to bypass a collision.
- Set an explicit monotonically increasing integer sort order for each planned child, derived from its source index. Include it with the child's field update where supported. The exact spacing between integers is an implementation detail; ordering must not depend on creation time.
- Verify the returned child ID sequence against the intended sequence after population. Checking names or the written sort-order numbers alone is insufficient.
- Verify the ordered data shape used by the component's ComponentQuery where feasible. If parent inspection and delivered ordering differ, report the discrepancy rather than claiming order is correct.
- Stop affected work when unexpected children, identity conflicts, or changes to already verified build resources make safe reconciliation impossible. Do not delete, rename, or reorder unrelated items.
- Reuse the repository's field conventions for direct datasource fields, list parents/children, General Link XML, and Content Hub Image XML. Correctly escape attribute content and preserve the mapped values; no invented copy or link destinations to conceal missing data.
- Use the existing per-section datasource-item output consumed by assembly. Save progress throughout execution, not only after a parent or whole batch completes.
- Integrate the explicit blank/default guard from the dependent field-guard ticket before declaring end-to-end P0 content population complete. This ticket provides the public population entry point used by that guard.
- Update canonical build and list-creation guidance to require source-order writes and read-back verification. Keep skill changes focused, with generated wrappers synchronised normally.

## Testing Decisions

Exercise the public population entry point through a stateful fake marketer MCP adapter and real temporary build records. Model parent/child creation and ordering as the remote service exposes them. Use a fresh execution on resume; do not mock the population helper itself.

Prior art: the agent-tooling Node/Jest fixture pattern, public command tests, and idempotency checks. Share the recovery seam established in the foundation.

- [ ] Children named Strategy, Engineering, Execution, and Operate are returned in that planned order, not alphabetical order.
- [ ] Out-of-order completion of independent child creates still yields the planned final sequence.
- [ ] Sort order is written explicitly for each child and verification compares child IDs.
- [ ] A silently ignored sort-order update prevents the section being marked verified.
- [ ] Interruption after parent creation reuses that parent; interruption after some children reuses their IDs and creates only unstarted children.
- [ ] Parent/child creation succeeds but loses its response; reconciliation either reuses the uniquely identified item or stops without another create.
- [ ] Repeating a fully verified population creates no additional parents or children and does not replay unnecessary field writes.
- [ ] Two sections of the same component type keep separate parent/child mappings.
- [ ] Unexpected children or divergent verified state cause a diagnostic without changing unrelated items.
- [ ] Required population failures prevent dependent assembly readiness; independent verified sections remain intact.
- [ ] General Link/Image XML containing special characters preserves intended values without malformed attributes.
- [ ] Existing examples, shared templates, and another demo's datasources remain unchanged.
- [ ] The actual canonical build flow calls this helper, and the agent configuration checks pass after skill changes.

Authorised live verification must confirm actual MCP field-write and child-order behaviour and, when available, the ComponentQuery result. Automated fake-service tests alone are not proof of live Sitecore behaviour.

## Out of Scope

- New datasource templates, changing standard values, changing ComponentQuery to introduce new content models, or serialized-item edits.
- Reordering existing unrelated content, reconciling human edits, deleting duplicates, or recovering with missing local records.
- Changes to the extractor, component visual design, or general-purpose field/XML tooling beyond the population needs.

## Further Notes

### Local implementation

`scripts/lib/populate.cjs` creates owned datasource/child items, writes source order and verifies returned IDs/order. Derived progress/content-map views use `scripts/lib/progress.cjs`. Population, CLI and integrated pipeline tests cover reruns and lost responses.

Operating instructions: [P0 recovery execution contract](../../.agents/skills/sitecore-build-demo/references/recovery.md). All ordinary tests use temporary workspaces and controlled service adapters; no live CMS/Content Hub mutation was performed. Local tests do not certify live MCP response shapes, clear/order behaviour, or Content Hub stage contracts.


[016 — field guards](016-demo-builder-default-field-guards.md) extends this population path. [017 — page assembly](017-demo-builder-safe-page-assembly.md) consumes its verified datasource output.

The ordering defect is a silent correctness failure: every field can be non-empty and still produce the wrong page. Completion must include relationship and sequence verification, not just successful updates.
