## Problem Statement

The `custom-demo` repository was forked from `Sitecore/xmcloud-starter-js` and has diverged significantly -- 322 commits, 19 custom UIIM components, an AI-driven demo builder pipeline, and 20+ customer demo branches. Meanwhile, upstream has shipped Content SDK 2.0 (with new packages: `analytics-core`, `events`, `personalize`), upgraded Next.js from 15 to 16, and introduced breaking changes (`middleware.ts` renamed to `proxy.ts`, `initContentSdk` initialization, env var renames). The demo builder currently runs on SDK 1.5.1 and Next.js 15, falling further behind with each upstream release.

There is no `upstream` git remote configured and no established process for incorporating upstream improvements (SDK upgrades, security patches, new starter features) without breaking the custom demo pipeline.

## Solution

Establish `Sitecore/xmcloud-starter-js` as a permanent `upstream` git remote and perform a one-time merge to catch up to current upstream `main` (SDK 2.0, Next.js 16). Migrate all 19 UIIM components to SDK 2.0 APIs. Verify the merge by building, running the dev server, and executing the demo builder pipeline. Document the process so future syncs (triggered by upstream SDK releases) are repeatable.

## User Stories

1. As a demo builder SE, I want the repo to be on the latest Content SDK, so that demos use current APIs and don't hit deprecated behavior.
2. As a demo builder SE, I want Next.js 16 support, so that demos benefit from framework improvements and security patches.
3. As a demo builder SE, I want an `upstream` git remote configured, so that I can fetch upstream changes at any time.
4. As a demo builder SE, I want the merge done on a feature branch (`upstream-sync-2.0`), so that `main` stays clean until verification passes.
5. As a demo builder SE, I want a file-by-file conflict resolution strategy, so that upstream SDK versions are adopted while my UIIM components and AI docs are preserved.
6. As a demo builder SE, I want all 19 UIIM components updated for SDK 2.0 imports, so that they compile and render correctly after the merge.
7. As a demo builder SE, I want `component-map.ts` to contain both upstream and custom component registrations after the merge, so that all components are available.
8. As a demo builder SE, I want `package.json` to include upstream SDK versions AND my extra dependencies (radix-ui, framer-motion, lucide-react, etc.), so that nothing is lost.
9. As a demo builder SE, I want `next.config.ts` to adopt upstream's structure while retaining my Content Hub image domains and SVG config, so that images render correctly.
10. As a demo builder SE, I want `content-sdk/` added to `.gitignore` before the merge, so that the reference clone (3,800+ files) is never accidentally committed.
11. As a demo builder SE, I want existing demo branches (Eurobank, Howdens, Mandarin, Sage, etc.) left untouched, so that completed demo snapshots are preserved.
12. As a demo builder SE, I want the merge verified by `npm run build` passing, so that there are no TypeScript or import errors.
13. As a demo builder SE, I want the merge verified by the dev server rendering pages, so that runtime errors are caught before push.
14. As a demo builder SE, I want the merge verified by running `/sitecore-build-demo` on a test client, so that the core pipeline works end-to-end.
15. As a demo builder SE, I want the new analytics packages (`analytics-core`, `events`, `personalize`) included, so that demos can leverage upstream analytics features.
16. As a demo builder SE, I want the sync process documented so that future upstream syncs are repeatable by any team member.
17. As a demo builder SE, I want future syncs triggered by upstream SDK releases (not on a fixed schedule), so that syncs are meaningful and not noisy.
18. As a demo builder SE, I want a follow-up task to update AI docs (`docs/ai/rules/`, `docs/ai/skills/`, `CLAUDE.md`) for SDK 2.0 import patterns, so that the demo builder generates correct code after the migration.

## Implementation Decisions

### Git strategy
- Add `Sitecore/xmcloud-starter-js` as `upstream` remote.
- Use standard `git merge` (not rebase, not squash). Rebase would orphan 20+ demo branches. Squash would break merge-base tracking for future syncs.
- Work on a `upstream-sync-2.0` feature branch. Merge to `main` only after all verification gates pass.

### Conflict resolution (file-by-file ownership)
- **Upstream owns:** SDK dependency versions in `package.json`, Next.js version, `tsconfig.json`, upstream starter components, all non-`basic-nextjs` example directories
- **We own:** `src/components/uiim/**`, `docs/ai/**`, `docs/adr/**`, any file only we have touched
- **Manual merge:** `package.json` (upstream versions + our extra deps), `next.config.ts` (upstream structure + our Content Hub domains), `.sitecore/component-map.ts` (both sets of registrations)

### SDK 2.0 migration scope
- 19 UIIM components need import/API fixes. The SDK package name stays the same (`@sitecore-content-sdk/nextjs`) but exports, initialization, and submodule paths may have changed.
- Three new packages added: `@sitecore-content-sdk/analytics-core`, `events`, `personalize`.
- `middleware.ts` to `proxy.ts` rename -- no conflict expected since neither file exists locally; upstream will add `proxy.ts`.
- Environment variable changes (`SITECORE_EDGE_URL` removed, replaced by `SITECORE_EDGE_PLATFORM_HOSTNAME`).

### Demo branches
- All 20+ customer demo branches are left untouched. They are historical snapshots. New work branches from current `main`.

### Sitecore items
- No changes needed. SDK 2.0 is purely a front-end upgrade.

### AI docs update
- Deferred to a follow-up task. The demo builder will produce incorrect import patterns between merge and docs update. Accepted trade-off to avoid scope creep in the merge itself.

### ADR recorded
- See `docs/adr/0001-upstream-sync-strategy.md` for the full rationale, alternatives considered, and consequences.

## Testing Decisions

### Verification gates (in order)
1. **Build gate:** `npm install && npm run build` must pass with zero TypeScript errors. This catches broken imports, missing types, and SDK API changes.
2. **Dev server gate:** `npm run dev` and manual page navigation. Catches runtime errors the build misses (hydration failures, missing context providers).
3. **Demo pipeline gate:** Run `/sitecore-build-demo` on a test client. This is the real proof -- if the demo builder can generate, compile, and render a demo homepage, the migration succeeded.

### Component smoke testing
- Each of the 19 UIIM components should render without errors after the SDK migration. The build gate catches most issues (TypeScript), but the dev server gate catches runtime problems (missing hooks, changed context shapes).

### What NOT to test
- Other example starters (`article-starter`, `location-finder`, etc.) -- accept upstream state. If they break, fix later.
- Sitecore item configuration -- no CMS-side changes in this migration.
- AI docs correctness -- deferred to follow-up.

## Out of Scope

- Updating AI docs (`docs/ai/rules/`, `docs/ai/skills/`, root `CLAUDE.md`) for SDK 2.0 patterns -- tracked as a separate follow-up task
- Rebasing or updating existing customer demo branches (Eurobank, Howdens, etc.)
- Testing or fixing non-`basic-nextjs` example starters
- Any Sitecore item or CMS-side changes
- Setting up the DMZ git flow described in CLAUDE.md -- that is a separate initiative

## Further Notes

- The `content-sdk/` directory inside `examples/basic-nextjs/` is a reference clone used by coding agents to look up SDK internals. It must be gitignored but not deleted.
- `package-lock.json` will fully regenerate after the merge, producing a large diff. This is expected and unavoidable.
- The ADR for this decision is already committed at `docs/adr/0001-upstream-sync-strategy.md`.
