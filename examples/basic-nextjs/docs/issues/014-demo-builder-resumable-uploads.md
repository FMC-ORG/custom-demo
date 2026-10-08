# Issue 014: P0 — Resume Content Hub uploads without duplicate assets

**Label:** `ready-for-verification`
**Implementation status:** Implemented and tested locally; authorised live-service verification pending.
**Priority:** P0
**Parent:** [Issue 012 — P0 recovery contract](012-demo-builder-p0-resume-reliability.md)
**Retrospective coverage:** B5; the uploader-specific portion of B7.
**Depends on:** [Issue 013 — recovery checkpoints](013-demo-builder-recovery-checkpoints.md).

## Problem Statement

The uploader currently selects downloaded images even after recording that they were uploaded. A second invocation therefore creates duplicate Content Hub assets. It also saves its image manifest only after processing the batch, so interruption can lose the record of already-created assets.

An asset can be created successfully while approval or public-link creation remains unfinished. Treating this whole sequence as a single upload success/failure either repeats the binary upload or hides incomplete delivery.

## Solution

Make the existing upload command resume from verified per-image stage records. Reuse a known asset, complete only its unfinished approval/public-link work, checkpoint progress as it occurs, and stop rather than upload again when an earlier creation has an unknown outcome.

Confirmed failures for optional images should produce an actionable partial handoff while independent images can continue.

## User Stories

1. As an SE, I want a second upload invocation to reuse completed images, so that I do not create duplicate assets.
2. As an SE, I want an interrupted batch to retain each known asset ID, so that successful uploads are not lost with the process.
3. As an SE, I want approval failures retried against the existing asset, so that another binary upload is unnecessary.
4. As an SE, I want public-link creation resumed independently, so that link failures do not duplicate assets.
5. As an SE, I want a lost creation response treated as uncertain, so that another asset is not created on guesswork.
6. As an SE, I want rejected optional images isolated, so that unrelated images can still complete.
7. As an SE, I want the report to identify the image and target field that remain unresolved, so that manual follow-up is actionable.
8. As an SE, I want a completed stage verified before it is reused, so that stale records do not produce an invalid image field.
9. As an SE, I want existing image manifests handled conservatively, so that adopting the fix does not silently re-upload previously completed images.
10. As an SE, I want changed source files or a different Content Hub environment detected, so that a resume cannot reuse the wrong asset.
11. As a maintainer, I want crash/retry tests to exercise the real upload workflow, so that tests catch duplicate remote creation rather than just checking a filter expression.

## Implementation Decisions

- Route the existing uploader's execution through the shared recovery foundation while retaining its current role in the demo pipeline.
- Distinguish local download state, asset creation, approval, public-link creation, and verified field-ready completion. A binary upload alone is not the final successful state.
- Do not infer upload eligibility solely from a downloaded status. Inspect verified stage records and any existing asset identity before deciding whether a create operation is needed.
- Preserve and checkpoint the asset ID/identifier as soon as available, before subsequent approval/link work. Persist intent before any creation that can yield a remote resource.
- Apply unknown-outcome reconciliation to asset creation and public-link creation. If the response is lost and an existing effect cannot be uniquely verified, stop the affected image rather than repeat the creation.
- Reuse known assets for approval and link retries. Record a public-link identifier when exposed by the service so that a later failure does not cause blind link duplication.
- Do not mark an image field-ready merely because a plausible URL was constructed. Verify the required asset/approval/link results; a fallback URL is not evidence of successful public delivery.
- Existing entries with uploaded markers and asset IDs require validation, not blanket re-upload or unquestioning trust. Contradictory/incomplete legacy entries must be reconciled or reported blocked.
- Bind per-image recovery to unchanged approved source intent and the Content Hub target, using the build foundation's non-secret identity checks. A different binary under the same filename is not the same approved input.
- A confirmed rejection of an optional image permits independent work to continue. Keep the unresolved image and affected field explicit, preserve all verified asset records, and return a partial result.
- Do not silently invent placeholder imagery or change the approved map to make failures disappear.
- Do not alter the optional-Content-Hub product behaviour. Missing credentials remain an explicit manual-upload handoff, never a successful automated upload.
- Preserve the existing image field data needed by datasource population, including asset identity, dimensions when available, and public/thumbnail URLs. Maintain coherent compatibility between the operation record and the image manifest.
- Update the canonical build instructions to invoke this behaviour. This ticket does not introduce asset deletion, replacement, or a force-reupload workflow.

## Testing Decisions

Exercise the actual upload execution entry point with a stateful fake Content Hub adapter and real temporary files. The fake must be able to create an asset and then lose the response, reject approval, delay visibility, and interrupt public-link creation. Restart execution from persisted records to verify effects.

Use the existing Node/Jest agent-tooling patterns and the foundation's shared adapter/persistence seam; do not test only private selection helpers.

- [ ] Upload N images, rerun unchanged inputs, and observe zero additional asset or public-link creations.
- [ ] Interrupt after one or more successful images; a fresh invocation reuses their recorded assets and continues unfinished images.
- [ ] Interrupt after asset creation but before approval; resume approval/link work without another upload.
- [ ] Reject approval or public-link creation definitively; resume the failed stage against the same asset.
- [ ] Lose an asset/public-link creation response; uniquely visible effects are reused, while unresolved outcomes stop without another create.
- [ ] Exercise a remote-success/local-checkpoint gap; persisted intent prevents automatic re-upload.
- [ ] Existing uploaded entries with valid asset evidence are not selected as fresh uploads merely because their download status remains downloaded.
- [ ] Unverifiable or contradictory legacy entries are reported instead of being automatically recreated.
- [ ] A confirmed optional file rejection does not lose independent successes; the report remains partial and names the intended field.
- [ ] An inaccessible or unverified public URL is not reported as a verified field-ready image.
- [ ] Changed source bytes or target environment fail the resume precondition without remote mutation.
- [ ] Previously completed image metadata and exceptions remain available after restart.

Live upload and approval verification requires a separately approved disposable Content Hub scope. Do not use existing client assets as destructive test fixtures.

## Out of Scope

- Uploading only mapped images, extractor changes, poster capture, deduplication across unrelated builds, or global Content Hub asset search.
- Deleting existing duplicates, force-reupload, replacing assets, or recovering after loss of local records.
- Credential onboarding or an environment doctor.
- Changes to Sitecore templates or image-rendering components.

## Further Notes

### Local implementation

The upload CLI delegates to `scripts/lib/uploads.cjs` and `scripts/lib/content-hub.cjs`. Covered by upload-stage, HTTP-adapter, CLI dry-run and integrated pipeline tests. Lost upload-session/asset/link identities stop for reconciliation rather than starting another upload.

Operating instructions: [P0 recovery execution contract](../../.agents/skills/sitecore-build-demo/references/recovery.md). All ordinary tests use temporary workspaces and controlled service adapters; no live CMS/Content Hub mutation was performed. Local tests do not certify live MCP response shapes, clear/order behaviour, or Content Hub stage contracts.


The confirmed source defect is a mismatch between the downloaded selection flag and the uploaded result flag, combined with batch-end persistence. A filter-only patch can address ordinary reruns but cannot satisfy the agreed interruption contract.

The broader P0 acceptance and limitations are defined by the parent issue. Unknown outcomes must not be converted to retryable failures simply to finish a batch.
