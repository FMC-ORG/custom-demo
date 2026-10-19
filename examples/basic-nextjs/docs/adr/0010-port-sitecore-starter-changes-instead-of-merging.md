# ADR 0010: Port Sitecore Starter changes instead of merging its history

We bring the Sitecore Starter's (`Sitecore/xmcloud-starter-js`) updates into this project by porting only its `examples/basic-nextjs` changes, as an ordinary feature branch and PR to `dmz`. We do not merge its git history. The last ported Sitecore commit (the Synced Commit) is recorded in `docs/ai/config/upstream-sync.yaml`, and the next sync diffs the Sitecore Starter's `basic-nextjs` from that commit.

A full merge would pull in every Sitecore commit: changes to starter kits this demo builder does not use, and Sitecore's own CI workflows, which conflict with ours by design. It also complicates the DMZ flow, which requires branches to be based on our latest `main`. Porting keeps each sync small and reviewable. The cost is that git no longer tracks the shared history, so the recorded Synced Commit is the only link; the runbook makes updating it a required step.

The Sitecore Starter is fetched without adding a git remote, so the repository's remotes keep pointing to FMC-ORG only. This replaces the old runbook's "full merge, never squash or rebase" rule, whose ADR was never committed.

Decision source: [Sitecore upstream sync interview](../ai/backlog/upstream-sync-2026-10.md), decisions 1 and 6.
