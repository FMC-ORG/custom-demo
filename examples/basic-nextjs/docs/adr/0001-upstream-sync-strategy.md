# ADR 0001: Upstream Sync Strategy with Sitecore/xmcloud-starter-js

**Date:** 2026-05-18
**Status:** Accepted
**Deciders:** FMC team

## Context

This repository (`FMC-ORG/custom-demo`) was forked from `Sitecore/xmcloud-starter-js` and has diverged significantly: 322 commits, 19 custom UIIM components, an AI-driven demo builder pipeline (`/sitecore-build-demo`), 20+ customer demo branches, and a `docs/ai/` documentation layer that upstream does not have.

Upstream has moved from Content SDK 1.x to 2.0 (now 2.1), upgraded Next.js from 15 to 16, added analytics packages (`analytics-core`, `events`, `personalize`), renamed `middleware.ts` to `proxy.ts`, and introduced `initContentSdk` initialization.

We need a strategy to incorporate upstream improvements (SDK upgrades, security patches, new features) without breaking our custom demo builder pipeline.

## Decision

### Sync relationship

Establish `Sitecore/xmcloud-starter-js` as an `upstream` git remote and use **standard `git merge`** (not rebase, not squash) to bring in changes. Merge preserves both histories and allows git to track what has already been merged on future syncs.

### Sync cadence

Sync is **triggered by upstream SDK releases** (e.g. 2.0, 2.1, 3.0), not on a fixed schedule and not on every upstream commit. Most upstream commits are CI fixes and doc tweaks that don't warrant a sync.

### Scope

Merge the **full upstream repo** (all example directories, authoring, containers, build config). Conflict resolution effort is focused on `examples/basic-nextjs/` since that's the only starter the demo builder uses. Other starters accept upstream changes as-is.

### Conflict resolution rules

File-by-file ownership:

- **Upstream owns:** SDK dependency versions, Next.js version, `tsconfig.json`, upstream's own components, other starter directories
- **We own:** `src/components/uiim/**`, `docs/ai/**`, `.sitecore/component-map.ts` (merge both sets), any file only we have touched
- **Shared (manual merge):** `package.json` (upstream versions + our extra deps), `next.config.ts` (upstream structure + our Content Hub domains)

### Branch workflow

All upstream syncs happen on a **feature branch** (e.g. `upstream-sync-2.0`), not directly on `main`. The branch is merged to `main` only after:

1. `npm install && npm run build` passes
2. Dev server renders pages correctly
3. `/sitecore-build-demo` pipeline runs successfully on a test client

### Demo branches

Existing customer demo branches (Eurobank, Howdens, Mandarin, Sage, etc.) are **left untouched**. They are historical snapshots of completed demos. If a client needs updates, a new branch is created from current `main`.

### AI docs

AI documentation (`docs/ai/rules/`, `docs/ai/skills/`, `CLAUDE.md`) is updated in a **separate follow-up** after the merge, not as part of the merge itself. This means the demo builder may produce incorrect import patterns until docs are updated.

### Sitecore items

Content SDK 2.0 is a front-end-only upgrade. No Sitecore item changes (templates, renderings, datasources) are required.

## Alternatives Considered

### Rebase instead of merge

Would give linear history but rewrites all commit hashes, breaking every demo branch's relationship to `main`. Force-push required. Rejected because it orphans 20+ branches.

### Squash-merge upstream

Simpler single-commit diff, but destroys upstream's commit granularity and breaks git's merge-base tracking. Future syncs would require re-squashing with no way for git to know what's already been merged. Rejected because it makes recurring syncs painful.

### Two-phase migration (merge first, SDK upgrade second)

Safer in theory, but upstream's code already assumes SDK 2.0. Splitting the merge from the upgrade leaves the codebase in an inconsistent state where upstream files reference v2 APIs against v1 dependencies. Rejected because the inconsistent intermediate state is worse than a larger single merge.

### Cherry-pick specific upstream commits

Maximum control but requires manually identifying and picking each relevant commit. Doesn't scale for recurring syncs and loses merge-base tracking. Rejected because it doesn't support the ongoing relationship we want.

## Consequences

- First sync is a significant effort: Next.js 15 to 16, Content SDK 1.5 to 2.0, 19 UIIM component fixes
- Window of broken demo builder between merge and AI docs update
- Future syncs will be smaller and easier because git tracks the merge base
- `content-sdk/` reference clone must be gitignored before the merge to avoid accidentally committing 3,800+ files
- `package-lock.json` will fully regenerate, producing a large diff
