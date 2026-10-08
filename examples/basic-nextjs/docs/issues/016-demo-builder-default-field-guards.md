# Issue 016: P0 — Detect unintended defaults and handle explicit optional blanks

**Label:** `ready-for-verification`
**Implementation status:** Implemented and tested locally; authorised live-service verification pending.
**Priority:** P0
**Parent:** [Issue 012 — P0 recovery contract](012-demo-builder-p0-resume-reliability.md)
**Retrospective coverage:** A2 and A6, without shared-template changes.
**Depends on:** [Issue 015 — datasource population](015-demo-builder-datasource-ordering.md).

## Problem Statement

Some datasource child fields inherit or materialise an item-name standard value. If the source content has no attribution and population simply omits the field, the demo can display an internal name such as Client - Quote as the author. A non-empty read-back therefore looks successful while the customer-facing result is wrong.

The retrospective also reports that an empty-string field update can return success without clearing the value. This behaviour must be verified rather than generalised to every field or environment. The agreed P0 scope does not permit changes to shared templates.

## Solution

Extend the tested population helper with field-intent validation and post-create/post-update guards. Distinguish specified values, explicitly blank optional display text, and unspecified fields. Detect suspicious defaults without overwriting legitimate content. Verify a supported clear operation when available; otherwise allow the narrowly approved single-space workaround on this build's optional display text and record it explicitly.

## User Stories

1. As an SE, I want unintended item-name text detected, so that internal datasource names do not appear in the demo.
2. As an SE, I want legitimate content that equals an item name preserved, so that the guard does not erase intended copy.
3. As an SE, I want unspecified fields distinguished from explicit blanks, so that absent extraction data is not treated as permission to clear content.
4. As an SE, I want a true clear operation verified when supported, so that whitespace is not used unnecessarily.
5. As an SE, I want a documented fallback for explicitly blank optional display text, so that a known platform limitation does not force shared-template changes.
6. As an SE, I want the fallback read back exactly, so that a reported blank does not still contain the old item-name text.
7. As an SE, I want required fields excluded from the workaround, so that incomplete mandatory content cannot be disguised as blank.
8. As an SE, I want links and images excluded from the workaround, so that typed fields are not corrupted by a text workaround.
9. As an SE, I want already verified decisions retained on resume, so that the agent does not repeat clear attempts or duplicate exception notes.
10. As an SE, I want blocked field intent reported with its item and field, so that I can resolve the gap without inspecting the whole content tree.
11. As an SE, I want shared standard values and other demos untouched, so that this fix stays within the current build.
12. As a maintainer, I want the guard tested through actual population and read-back, so that a standalone string-comparison test cannot hide a broken write path.

## Implementation Decisions

- Extend the existing population entry point from the dependency; do not create a competing item-population pipeline.
- Normalise each mapped field's intent into a supplied value, an explicit blank, or unspecified. Missing keys are not implicit blanks. Optionality and field type must be established from the content model, not guessed from missing source content.
- Inspect relevant display fields after item creation and updates, comparing intended content and returned values. Item-name equality or an unresolved token is a warning signal, not automatic proof of incorrect content.
- Preserve a value that the approved map intentionally supplied, even if it equals the item name. Do not broadly remove values containing a client name or the standard-value token.
- If a suspicious default has no resolved intent, flag the field and leave the affected section unverified/partial rather than silently blanking it. Safe independent population may continue.
- Verify the marketer MCP's actual clear and reset behaviour for the relevant field. Resetting to a standard value is not equivalent to storing an empty value, especially when that standard value causes the defect.
- Do not claim that empty updates always fail based only on the retrospective. Record the observed behaviour and use the supported, verified operation if it meets the intended blank semantics.
- When a genuine blank cannot be established, the permitted fallback is exactly one space for an explicitly blank optional display-text field on an item owned by this build. Preserve that value through the update path rather than trimming it back to an ineffective empty string.
- Read back the fallback and confirm the unintended value is gone. Never apply it to required fields, unspecified fields, links, images, or arbitrary system fields.
- Record the item, field, reason, actual workaround, and verification as an exception. Do not label the stored value genuinely empty. Existing components may retain layout spacing; this ticket does not promise pixel-identical rendering.
- A verified, permitted fallback can complete that automated field operation with an exception. An ignored write, ambiguous write outcome, or unresolved field intent cannot.
- Use the recovery foundation to avoid replaying verified operations and duplicate exception notes. If an already verified field has changed externally, do not overwrite it automatically.
- Keep shared templates, standard values, serialization, and unrelated datasource items unchanged.
- Update only the necessary population instructions and MCP-behaviour reference. Preserve the distinction between observations, supported API semantics, and this approved workaround.

## Testing Decisions

Test through the population execution boundary with a fake marketer service that models materialised item-name defaults, successful clear operations, ignored empty writes, and ambiguous responses. Use the same real temporary checkpoints and fresh-run recovery tests as the datasource-population ticket.

Good tests assert stored and reported field values, verification status, write scope, and exceptions. Do not rely solely on non-empty checks or on the implementation's private detection helper.

- [ ] A missing optional attribution that materialises an item-name default is detected rather than accepted as populated.
- [ ] An explicitly supplied value equal to the item name remains intact and is not falsely corrected.
- [ ] An unspecified field does not receive whitespace merely because it lacks mapped content.
- [ ] A verified supported clear operation achieves the intended blank without using the fallback.
- [ ] Reset-to-standard is not accepted as clearing when it restores the unwanted name.
- [ ] An ignored empty-string update is caught by read-back.
- [ ] The single-space fallback is allowed only for explicitly blank optional display text and is read back exactly.
- [ ] Required fields, General Link fields, Image fields, and system fields never receive the fallback.
- [ ] An ignored fallback write or ambiguous write outcome prevents verified completion.
- [ ] A permitted fallback appears once in the exception/handoff output and is not described as truly empty.
- [ ] Resume reuses verified outcomes without unnecessary writes or duplicate exceptions.
- [ ] An unresolved field leaves the affected section partial while independent successes remain recorded.
- [ ] No shared-template, standard-value, serialization, or unrelated-item mutation occurs.

The reporter's live clear/reset observation requires separately authorised reproduction before claiming platform-wide behaviour. Read-back verification is not a substitute for any later visual QA of retained spacing.

## Out of Scope

- Removing standard values from templates, migrating existing items, or altering serialized baseline content.
- Guessing missing authors, generating replacement copy, or treating all missing values as blank.
- Introducing a general empty-field representation across Sitecore.
- Refactoring component markup or guaranteeing removal of all blank-line spacing.
- Automatic correction of human edits or other demos.

## Further Notes

### Local implementation

Population distinguishes explicit blanks from omitted fields, checks final values, and journals permitted single-space exceptions. Tests cover true clears, ignored clears, protected image fields, legitimate item-name text, and unintended defaults.

Operating instructions: [P0 recovery execution contract](../../.agents/skills/sitecore-build-demo/references/recovery.md). All ordinary tests use temporary workspaces and controlled service adapters; no live CMS/Content Hub mutation was performed. Local tests do not certify live MCP response shapes, clear/order behaviour, or Content Hub stage contracts.


The user explicitly approved the narrow whitespace workaround for this P0 release and explicitly declined shared-template changes. Both constraints are load-bearing.

A later template audit may address the root cause, but it must be a separately approved change. Removing a template token alone also does not necessarily remove values already populated on existing items.
