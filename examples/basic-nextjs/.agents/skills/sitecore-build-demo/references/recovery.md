# Demo framework v2 execution contract

Applies to fresh builds using `contract: "demo-framework-v2"`, an inspected target, and the same approved inputs, environment and workspace on resume. Older pipeline journals are rejected before writes, including `--initialize`; keep them untouched and obtain an approved fresh build scope/workspace. A new directory is not permission to duplicate matching remote content or repurpose another client's experience. Journals do not provide recovery after their loss, plan changes, or human edits.

## Inputs and ownership

After the Phase 2 approval gate, prepare `execution-plan.json` in the client demo directory using `.agents/skills/sitecore-build-demo/assets/execution-plan.template.json`.

- Populate project paths from `docs/ai/config/project.yaml` and IDs from the manifest, then verify them through marketer MCP. `environment.marker` is the non-secret identifier of the authenticated target environment; verify the connection's environment again before resumption. Do not put an access token or Edge context secret here.
- Normalise the approved content map to one stable `key` per section and per child. Two occurrences of ProductPricingCards need different section keys.
- Supply exact template IDs, folder paths, names, fields, and explicit `fieldRules` (Sitecore field type and `required` boolean). Read the templates to establish optionality; never infer optionality merely from missing scraped content.
- Include inherited/default-bearing display fields in the rules even when not mapped. Omitted values mean unspecified; an empty string means an explicitly approved blank. Required fields cannot be missing/blank. System fields are owned by the helper, not supplied in `fields`.
- Link values may be complete Sitecore XML or an object with `text`, `href`, and optional `target`. Resolve relative source links against the client's origin before preparing the plan. Image values must be verified `imageFieldXml` from the upload result; do not invent a public URL.
- Prepare the field-ready execution plan after image upload. Freeze it before population; later progress and learned datasource IDs do not belong in its approved input section.
- Record `targetReview.classification` as `fresh`, `starter` or `existing-client` after inspecting the actual target experience. If another client's branding is found, pause and obtain `targetReview.repurposeApproved: true` before client-content writes. Do not infer freshness solely from a new local directory.
- Complete demo approval includes mandatory Header/Footer datasource wiring. Inspect the actual partial designs and rendering definitions; record each section's `placement: "partial-design"`, `renderingId`, and `sharedDesign: { approved: true, pageId, existingInstanceId, currentDatasource }` before freezing the plan. The helper only wires the exact existing instance, preserving parameters and recording its previous datasource. Missing/incompatible/ambiguous targets block that operation and require a separate repair decision; no automatic structural add/remove/replace. Do not insert `sharedDesign` into an older frozen plan.
- An `existingInstanceId` authorises reuse of that particular rendering on the approved target page. Record the selection explicitly; never select the first matching component name or take over another demo's instance.
- The helpers refuse unrecognised or paginated read shapes. Do not replace that guard with an empty list. Inspect the actual tool schema/response, then adapt and regression-test the normaliser.

The normalized plan is a required, reviewed projection of the approved build/content maps, not permission to change their content. Missing required image/content dependencies block that section rather than being silently replaced.

## Uploads

For an explicitly approved NEW upload run:

```bash
node .agents/skills/sitecore-build-demo/scripts/upload-to-content-hub.mjs --images-dir docs/ai/demos/<client>/images --initialize
```

Resume the same command **without** `--initialize`. `--dry-run` performs no authentication or uploads; it is NOT credential verification. Credentials remain in the existing optional local configuration or environment, never in the journal.

The uploader records asset creation, approval, link identity and anonymous-access verification independently. Approval read-back uses one shared **60-second** window for all pending assets (`--approval-timeout`, `CH_APPROVAL_TIMEOUT`). Public access uses one shared **90-second** window for all pending links (`--public-link-timeout`, `CH_PUBLIC_LINK_TIMEOUT`). Both defaults are configurable in seconds from 0 to 3600; 0 skips waiting and preserves unresolved state. Upload and mutation time are separate; request time is included in each read-only polling deadline. Deadlines are shared, never renewed per image. Delayed reads never trigger another approval/create write. Already approved assets do not receive approval writes, and links are created only after verified approval.

Known same-contract assets and links are reused through the authoritative journal. A lost creation response without a recoverable identity blocks that image instead of re-uploading it. A fresh v2 run rejects pre-existing asset/link markers without its journal rather than adopting an older build; preserve those resources for separate reconciliation. A public URL without a public-link ID is never sufficient evidence to create another link automatically.

The upload session/request, binary transfer, and finalize calls form a conservatively guarded asset-creation operation. If interrupted before the asset ID is known, it stops for reconciliation; it does not promise automatic recovery of upload sessions whose state cannot be read through the supported API.

The HTTP adapter reads asset lifecycle relationships and link ownership, then checks anonymous media accessibility. Unexpected lifecycle/relationship shapes block completion. These contracts need authorised live verification in each supported Content Hub environment; local tests are not that verification.

`image-manifest.json` is updated after stages. `recovery-uploads.json` is authoritative; `upload-result.json` reports partial work and target images. Exit 2 means unresolved work, not an instruction to reset the journal.

## Datasource population and assembly

For an explicitly approved NEW population run:

```bash
node .agents/skills/sitecore-build-demo/scripts/demo-recovery.cjs --plan docs/ai/demos/<client>/execution-plan.json --directory docs/ai/demos/<client> --phase populate --initialize
```

The command does not connect to Sitecore. It either returns a result or a structured `awaiting-tool` request. The agent services that request through its existing authenticated **marketer MCP**:

1. Read the request ID, plain tool name, and arguments from the command output.
2. Invoke the same command arguments with `--claim <request-id>` (without `--initialize`). This durably records that the call may be issued. Do not execute unless the claim succeeds.
3. Discover the named tool in the harness and call it exactly once with the claimed arguments. Never use a direct Sitecore HTTP write as a substitute.
4. Save the JSON MCP result to a temporary file in the gitignored demo directory. Do not include authentication headers or credentials. If the harness itself fails or no response is received, do not manufacture a successful result.
5. Invoke the command with `--reply <request-id> --result <result-file>` to record the response, then delete the temporary response file.
6. Invoke the original phase command without `--initialize` to continue. Repeat for each requested tool.

If a process or agent dies **after claim but before reply**, never claim or execute that mutation again. Run the phase normally: the persisted intent and page/item reads are used to reconcile it. Ambiguous outcomes remain blocked. Read-only requests can be safely claimed again.

When resuming after a session break, add `--begin` once to discard cached observations. Within a handoff session raw reads are reused until a mutation invalidates them. Verified operations and completed read-only checkpoints (folder identity, final fields/order, and assembly datasource checks) are reused within that session, so each MCP handoff does not reread every earlier section. Failed or awaiting checks are never saved as successes. `--begin` and a finished execution rotate the observation session, invalidating both kinds of reusable verification. Prepared, unissued writes must pass a fresh precondition comparison before being claimed after a session break. An absent/uncertain result is never retried as a mutation; another `--begin` can obtain a fresh read-only reconciliation pass when visibility is delayed. Do not loop indefinitely.

**Delayed visibility.** A parent's children listing can show a newly created item only seconds (sometimes minutes) after `create_content_item` returned. The helper therefore verifies a create by the `itemId` the tool returned: it reads that item by ID and checks its name, template and exact path under the planned parent. The listing is used only when no ID came back (lost response). Verification and final-order checks retry with up to five fresh reads; each retry appears as a new read-only `awaiting-tool` request — service it like any other read. Only after those attempts does an operation become `needs-reconciliation`.

After population is verified, start assembly once:

```bash
node .agents/skills/sitecore-build-demo/scripts/demo-recovery.cjs --plan docs/ai/demos/<client>/execution-plan.json --directory docs/ai/demos/<client> --phase assemble --initialize
```

Use the same claim/call/reply protocol. Subsequent assembly resumes omit `--initialize`. The assembly helper consumes `population-result.json`, rechecks datasource fields/order, and preserves existing rendering parameters.

**Variant selection.** A new instance takes the first Variant Definition of its component (ordered by `__Sortorder`, then name). For a section with `variant`, the helper journals `<key>:variant-first` (sets `__Sortorder` to `-100000` unless already first, verified by the folder's child order), adds the component, checks `FieldNames`, then journals `<key>:variant-restore` (clears `__Sortorder`, verified against the original order) — also when the add fails. A missing variant, unconfirmed reorder or unexpected `FieldNames` never blocks assembly; it becomes a manual task. A section is never reordered again once its add was issued. `__Sortorder` is not echoed by item reads; only the folder order is observable.

**Shared Header/Footer replacement (ADR 0009).** For a `partial-design` section with `variant` and `sharedDesign.replace: true`, the helper journals `variant-first`, `<key>:shared-add` (new instance after the old one, in the same placeholder; requires the approved instance and current datasource), `variant-restore`, `<key>:shared-new-wire` (client datasource) and `<key>:shared-remove-old` (`remove_component_on_page` with `userConfirmed: true`, justified only by the plan approval). The old instance is removed only after the replacement is verified as wired; a removal with an unknown outcome is never repeated and keeps the build partial until a read shows it gone. If the variant is missing or the reorder unconfirmed, no structural change happens and the datasource switch runs instead. The add's auto-created datasource is reported as a manual cleanup task.

**Page instances and leftover components.** A page section with `existingInstanceId`, `variant` and `replace: true` uses the same sequence on the target page (`<key>:replace-add`, `replace-new-wire`, `replace-remove-old`); the new instance takes the old one's position. After a clean assembly, each approved `removeInstances` entry is journaled as `remove:<instanceId>`: its rendering must still match, an already-absent instance needs no write, an unknown outcome is never repeated. Instances approved for removal are excluded from later "unrelated components unchanged" checks. `assembly-result.json` lists `removed` and `cleanupDatasources` (placeholder datasources created by each add).

## Records and status

- `recovery-content.json`, `recovery-assembly.json`, and `recovery-uploads.json` are authoritative operation journals. Intent is saved before mutations; returned identities are checkpointed before the next stage.
- `mcp-populate.json` and `mcp-assemble.json` hold the durable MCP handoff and observation cache. Preserve them with the journals. The CLI refuses to initialise a replacement for a missing companion record, and journals are bound to their workspace path. They contain content and item IDs, not credentials; keep the demo directory gitignored.
- Phase result JSON files are derived read-back summaries. `demo-progress.yaml` and `content-map.yaml` datasource IDs are projected from them after a completed execution pass. A crash may leave a projection stale: rerun the helper, not a hand-written creation loop.
- Recovery journals may contain an optional `observations` map of successful read-only checks, keyed by the transport session. Same-contract journals without that map remain supported. Older pipeline contracts require a fresh approved build instead of migration; no reset is permitted. These checkpoints are not permission to skip verification in a fresh session.
- Run one worker per build. Atomic replacement protects checkpoints, not independent concurrent processes or distributed workers. Do not open the same build in two running agents.
- `failed` means affirmative rejection; `needs-reconciliation` means an unknown effect or drift. Only the former is eligible for a new attempt after read/precondition checks.
- Confirmed optional failures may leave independent work complete. Missing required dependencies block the affected section; unknown placement stops the order-dependent assembly chain.
- Single-space blank fallbacks are only allowed for explicitly blank optional Single-Line/Multi-Line Text fields, after an acknowledged empty write and read-back demonstrate the limitation. Lost clear responses do not authorise the fallback. Required fields, unspecified fields, links and images never get whitespace.
- Recorded, verified fallback exceptions are not unverified failures. They are not genuinely empty values either; copy the caveat into the handoff.
- Any unverified operation keeps the automated result partial. Preserve manual variant, publishing and visual-QA tasks separately. Required Header/Footer datasource wiring is automated and an unresolved switch keeps the build partial. Writing a summary never upgrades the actual build status.
- If a journal is missing/corrupt, the plan/environment changed, or affected remote content was edited, stop. Do not use `--initialize`, rename retries, delete items, or overwrite content to bypass the guard.

## Verification and limitations

Normal regression tests use real temporary records and controlled service adapters. They test lost responses, repeat execution, order, ownership, drift and blank semantics. Handoff scaling tests count requests at the external MCP boundary and verify that successful population/assembly read counts grow with authored items, not quadratically with plan replay. They also check fresh-session drift detection and zero new writes on completed reruns. Tests do not authenticate, upload real assets, or create CMS items.

Live MCP/Content Hub shape checks and failure-mode tests require explicit approval in a disposable scope. Until performed, report the implementation as locally tested, **live verification pending**. Do not mark the Sitecore manifest verified merely because these tools passed tests.
