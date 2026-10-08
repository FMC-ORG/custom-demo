# P0 recovery execution contract

Applies to new demo builds with the same approved inputs, environment, and local workspace. Existing legacy builds must not have new journals initialised over them automatically. Journals do not provide recovery after their loss, plan changes, or human edits.

## Inputs and ownership

After the Phase 2 approval gate, prepare `execution-plan.json` in the client demo directory using `.agents/skills/sitecore-build-demo/assets/execution-plan.template.json`.

- Populate project paths from `docs/ai/config/project.yaml` and IDs from the manifest, then verify them through marketer MCP. `environment.marker` is the non-secret identifier of the authenticated target environment; verify the connection's environment again before resumption. Do not put an access token or Edge context secret here.
- Normalise the approved content map to one stable `key` per section and per child. Two occurrences of ProductPricingCards need different section keys.
- Supply exact template IDs, folder paths, names, fields, and explicit `fieldRules` (Sitecore field type and `required` boolean). Read the templates to establish optionality; never infer optionality merely from missing scraped content.
- Include inherited/default-bearing display fields in the rules even when not mapped. Omitted values mean unspecified; an empty string means an explicitly approved blank. Required fields cannot be missing/blank. System fields are owned by the helper, not supplied in `fields`.
- Link values may be complete Sitecore XML or an object with `text`, `href`, and optional `target`. Resolve relative source links against the client's origin before preparing the plan. Image values must be verified `imageFieldXml` from the upload result; do not invent a public URL.
- Prepare the field-ready execution plan after image upload. Freeze it before population; later progress and learned datasource IDs do not belong in its approved input section.
- Header/footer datasource population uses normal simple/list items. Mark their `placement` as `partial-design`; the assembly helper deliberately skips shared-design changes and emits a manual task. This does not authorise switching a shared partial design.
- An `existingInstanceId` authorises reuse of that particular rendering on the approved target page. Record the selection explicitly; never select the first matching component name or take over another demo's instance.
- The helpers refuse unrecognised or paginated read shapes. Do not replace that guard with an empty list. Inspect the actual tool schema/response, then adapt and regression-test the normaliser.

The normalized plan is a required, reviewed projection of the approved build/content maps, not permission to change their content. Missing required image/content dependencies block that section rather than being silently replaced.

## Uploads

For an explicitly approved NEW upload run:

```bash
node .agents/skills/sitecore-build-demo/scripts/upload-to-content-hub.mjs --images-dir docs/ai/demos/<client>/images --initialize
```

Resume the same command **without** `--initialize`. `--dry-run` performs no authentication or uploads; it is NOT credential verification. Credentials remain in the existing optional local configuration or environment, never in the journal.

The uploader records asset creation, approval, and public-link verification independently. Known assets are reused. A lost creation response without a recoverable identity blocks that image instead of re-uploading it. A legacy uploaded entry can reuse a verified asset ID, but a public URL without a public-link ID is insufficient evidence to create another link automatically. Reconcile legacy records manually.

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

When resuming after a session break, add `--begin` once to discard cached observations. Within a handoff session reads are reused until a mutation invalidates them, and verified operations are reused within that session. `--begin` and a finished execution rotate the observation session. Prepared, unissued writes must pass a fresh precondition comparison before being claimed after a session break. An absent/uncertain result is never retried as a mutation; another `--begin` can obtain a fresh read-only reconciliation pass when visibility is delayed. Do not loop indefinitely.

After population is verified, start assembly once:

```bash
node .agents/skills/sitecore-build-demo/scripts/demo-recovery.cjs --plan docs/ai/demos/<client>/execution-plan.json --directory docs/ai/demos/<client> --phase assemble --initialize
```

Use the same claim/call/reply protocol. Subsequent assembly resumes omit `--initialize`. The assembly helper consumes `population-result.json`, rechecks datasource fields/order, and preserves existing rendering parameters. It cannot set a named visual variant and must not claim the variant is Default.

## Records and status

- `recovery-content.json`, `recovery-assembly.json`, and `recovery-uploads.json` are authoritative operation journals. Intent is saved before mutations; returned identities are checkpointed before the next stage.
- `mcp-populate.json` and `mcp-assemble.json` hold the durable MCP handoff and observation cache. Preserve them with the journals. The CLI refuses to initialise a replacement for a missing companion record, and journals are bound to their workspace path. They contain content and item IDs, not credentials; keep the demo directory gitignored.
- Phase result JSON files are derived read-back summaries. `demo-progress.yaml` and `content-map.yaml` datasource IDs are projected from them after a completed execution pass. A crash may leave a projection stale: rerun the helper, not a hand-written creation loop.
- Run one worker per build. Atomic replacement protects checkpoints, not independent concurrent processes or distributed workers. Do not open the same build in two running agents.
- `failed` means affirmative rejection; `needs-reconciliation` means an unknown effect or drift. Only the former is eligible for a new attempt after read/precondition checks.
- Confirmed optional failures may leave independent work complete. Missing required dependencies block the affected section; unknown placement stops the order-dependent assembly chain.
- Single-space blank fallbacks are only allowed for explicitly blank optional Single-Line/Multi-Line Text fields, after an acknowledged empty write and read-back demonstrate the limitation. Lost clear responses do not authorise the fallback. Required fields, unspecified fields, links and images never get whitespace.
- Recorded, verified fallback exceptions are not unverified failures. They are not genuinely empty values either; copy the caveat into the handoff.
- Any unverified operation keeps the automated result partial. Preserve the manual variant, partial-design, publish, and visual-QA checklist separately. Writing a summary never upgrades the actual build status.
- If a journal is missing/corrupt, the plan/environment changed, or affected remote content was edited, stop. Do not use `--initialize`, rename retries, delete items, or overwrite content to bypass the guard.

## Verification and limitations

Normal regression tests use real temporary records and controlled service adapters. They test lost responses, repeat execution, order, ownership, drift and blank semantics. Tests do not authenticate, upload real assets, or create CMS items.

Live MCP/Content Hub shape checks and failure-mode tests require explicit approval in a disposable scope. Until performed, report the implementation as locally tested, **live verification pending**. Do not mark the Sitecore manifest verified merely because these tools passed tests.
