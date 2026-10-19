# Issue 018: Sync `basic-nextjs` with the Sitecore Starter — Content SDK 2.4, AI discoverability

**Label:** `ready-for-agent`
**Decisions:** [Sitecore upstream sync interview](../ai/backlog/upstream-sync-2026-10.md) (decisions 1–7)
**Sitecore Starter commit to sync:** `c0de3bcc` (2026-10-09). Last shared commit: `d8de384a` (2026-07-20).

## Problem Statement

The demo builder's rendering host was forked from the **Sitecore Starter** (`Sitecore/xmcloud-starter-js`) in July and has not been synced since. Sitecore has since moved its `basic-nextjs` app to Content SDK 2.4 (with its React, content, search and CLI packages), Next.js 16.3+ and new AI-discoverability features (SDK-generated page metadata, a Sitecore-authored `llms.txt`). Our app still runs Content SDK 2.2, search 0.3, Next.js 16.2 and a pinned TypeScript 5.7.3.

As a solo SE building demos fast, I am missing Sitecore's fixes and features, each month of drift makes the next sync harder, and demos show an older SDK than the one Sitecore presents to customers. The only written procedure (the sync runbook) is out of date: it assumes the git remote `upstream` is Sitecore (in this project it is the FMC-ORG framework repository), merges straight into `main` outside the DMZ flow, insists on Tailwind v3 (we already run v4), and cites an ADR that was never committed.

## Solution

Port the Sitecore Starter's `basic-nextjs` changes up to `c0de3bcc` into a normal feature branch and PR to `dmz`, without merging Sitecore's history and without taking its changes to other starters or its CI workflows. Upgrade the Sitecore packages, Next.js and TypeScript to the latest versions within their current major versions, adopt Sitecore's AI-discoverability changes, keep every demo-builder customisation working, and leave the search components' behaviour unchanged. Record the **Synced Commit**, rewrite the runbook for this port approach, and record the decision in ADR 0010 so the next sync starts from a known point.

## User Stories

1. As an SE, I want the rendering host on Content SDK 2.4, so that my demos run the SDK version Sitecore currently supports and presents.
2. As an SE, I want the Content SDK React, content and core packages to move with the Next.js SDK, so that no mismatched SDK versions are installed together.
3. As an SE, I want the analytics-core and events packages on 2.1.2, so that tracking uses the same versions as the Sitecore Starter.
4. As an SE, I want the personalize package kept on its current latest version, so that personalization demos keep working without an unnecessary change.
5. As an SE, I want the Sitecore Content SDK CLI on 2.3, so that component registration and builds use the current tooling.
6. As an SE, I want Next.js on the latest 16.x release, so that I get the framework fixes Sitecore's app is built against.
7. As an SE, I want TypeScript on `~5.8.3` like the Sitecore Starter, so that type checking matches Sitecore's baseline instead of an unexplained exact pin.
8. As an SE, I want no major-version jumps in this sync, so that the upgrade stays predictable and easy to roll back.
9. As an SE, I want the lock file regenerated from the new versions, so that installs are reproducible and no stale transitive SDK versions remain.
10. As an SE, I want page titles, descriptions and Open Graph tags produced by the SDK's page-metadata helper, so that SEO and share previews follow Sitecore's supported implementation.
11. As an SE, I want the metadata helper to read the field names our page templates actually use (Title, metadata description, Open Graph title/description/image, thumbnail, page summary), so that existing demo pages keep their titles and share images.
12. As an SE, I want `llms.txt` served from content authored in Sitecore (Settings → Crawlers → LLMs.txt), so that content editors control what AI crawlers see.
13. As an SE, I want `llms.txt` to fall back to a sensible default when nothing is authored, so that a fresh demo site never returns an error.
14. As an SE, I want links in `llms.txt` resolved against the matched site's hostname, so that AI crawlers receive working absolute links.
15. As an SE, I want the page route-field types to include the SDK's page-metadata fields, so that page metadata is typed consistently with the SDK.
16. As an SE, I want our Person and Article page-field types kept, so that article and author components keep compiling and rendering.
17. As an SE, I want the unused MetaTitle and OpenGraph* field declarations removed, so that nobody assumes Article pages have separate SEO fields that nothing reads.
18. As an SE, I want the CLI to exclude non-component files (atoms, UI primitives, props and schema files) from component registration, so that only real Sitecore renderings are registered.
19. As an SE, I want our own CLI configuration additions kept alongside Sitecore's exclusions, so that the component map continues to match our UIIM components.
20. As an SE, I want the three search components (results, collection strip, typeahead) to behave exactly as before, so that search demos keep working after the SDK upgrade.
21. As an SE, I want the search package upgrade to compile without code changes where the API is additive, so that the sync stays small.
22. As an SE, I want the new search capabilities (query suggestions, facets, locale) recorded as a follow-up, so that they are not forgotten and can be configured properly in Sitecore Search later.
23. As an SE, I want every UIIM component, variant and the demo-builder tooling to keep working, so that the next demo build is unaffected by the sync.
24. As an SE, I want the existing routes (`/ai/service.json`, sitemap, LLM sitemap, `ai.txt`, robots) to keep responding, so that no discoverability endpoint regresses.
25. As an SE, I want Sitecore's changes to the other starter kits and its CI workflows left out, so that our lightweight CI and unused starters are not disturbed.
26. As an SE, I want the sync delivered as one feature branch with a PR to `dmz`, so that it follows the normal DMZ workflow and validation.
27. As an SE, I want the Synced Commit, the date and key versions recorded in the repository, so that the next sync knows exactly where to start comparing.
28. As an SE, I want the sync runbook rewritten for the port approach, so that I or an agent can repeat the sync without guesswork.
29. As an SE, I want the runbook to fetch the Sitecore Starter without adding a git remote, so that the repository's remotes keep pointing only to FMC-ORG.
30. As an SE, I want the runbook to say which files are ours, which are Sitecore's and which need a manual merge, so that conflicts are resolved consistently.
31. As an SE, I want the runbook's checks to match this sync's definition of done, so that every future sync is verified the same way.
32. As an SE, I want the port-instead-of-merge decision recorded in an ADR, so that a future reader understands why git does not track the shared history with Sitecore.
33. As an SE, I want the runbook and docs to call Sitecore's repository the "Sitecore Starter", never "upstream", so that agents do not confuse it with the FMC-ORG `upstream` remote.
34. As an SE, I want a production build against my Sitecore environment to pass, so that I know the deployed rendering host will build.
35. As an SE, I want Home and an Article page to render locally with UIIM components after the upgrade, so that I can trust the demo pages.
36. As an SE, I want the page head tags compared before and after the upgrade, so that any change to titles or share previews is visible and deliberate.
37. As an SE, I want the search verification scripts to pass after the upgrade, so that search is proven working end to end, not only in unit tests.
38. As an SE, I want the PR description to list versions before and after and any behaviour changes, so that I can review the sync quickly.
39. As an SE, I want no client-specific content in the sync, so that the framework stays client-free.
40. As an agent running a later sync, I want the record file and runbook to be enough to start, so that I do not need this conversation's context.

## Implementation Decisions

- **Port, not merge (decision 1, ADR 0010).** Fetch the Sitecore Starter's `main` without adding a git remote. Apply only its `basic-nextjs` changes between the last shared commit and `c0de3bcc` on a feature branch from `main`, PR to `dmz` (squash). No Sitecore history, no other starters, no `.github` changes from Sitecore.
- **Versions (decision 2).** `@sitecore-content-sdk/nextjs` 2.4.1 (resolving react 2.4.x, content 2.3.x, core 2.1.4, search 0.5.x), CLI 2.3.0, analytics-core and events 2.1.2, personalize 2.1.0 unchanged, Next.js latest 16.x, TypeScript `~5.8.3`. Lock file deleted and regenerated, never merged by hand. React and Tailwind majors unchanged.
- **Files that change only on Sitecore's side** (the page route, the `llms.txt` route): take Sitecore's version as is.
- **Files both sides changed:**
  - the dependency manifest: Sitecore's versions plus all our extra dependencies;
  - the page layout types: Sitecore's `PageMetadataFields` extension plus our Person/Article types, minus the four unused metadata fields (decision 3);
  - the Sitecore CLI configuration: the union of Sitecore's exclusions and our settings;
  - the generated Next.js type declaration file: stays generated and is not hand-edited.
- **Page metadata (decision 3).** Use the SDK's page-metadata helper with Sitecore's field-name mapping. Our page templates already use the mapped names. Do not extend the mapping for the removed MetaTitle/OpenGraph* fields.
- **Search (decision 4).** No behaviour change. The 0.3 → 0.5 API change is additive for us (`useSearch`/`useInfiniteSearch` gain optional `locale`, `facet`, `seedItemId`, `seedItemUrl` and return `facets`; a new `useSuggest` hook). Fix only what TypeScript or the tests reveal.
- **Records (decision 6).**
  - A small YAML record in the AI config area: Sitecore Starter repository, Synced Commit, sync date, key package versions.
  - The sync runbook in the ADR folder rewritten for the port approach: fetch without a remote, diff from the Synced Commit, ownership table, steps, the checks from decision 5, update the record. It also removes the stale Tailwind-v3 rule, the wrong remote naming and the reference to the uncommitted ADR 0001.
  - New ADR 0010 for the port decision.
- **Terminology (decision 7).** Use "Sitecore Starter" and "Synced Commit" (glossary) in all new docs; never "upstream" for Sitecore.
- **Follow-up item** for the search features (query suggestions in the typeahead, facets in results) noting the Sitecore Search setup each needs.

## Testing Decisions

- **Good tests here check external behaviour:** what renders, what the routes return, and what the search components display. They don't check how Sitecore's ported code is structured internally. No new test seams; no unit tests for Sitecore's ported code, because extracting it into testable modules would make it drift from the Sitecore Starter.
- **Seam 1 — existing CI checks:**
  - TypeScript type checking, which catches SDK API changes;
  - the full Jest suites: UI component tests, including the search component tests that mock `useSearch`/`useInfiniteSearch` (prior art: the search results, collection and typeahead tests), and the agent-tooling tests;
  - component validation and agent checks.

  All must pass unchanged in intent. Existing tests are adjusted only when an SDK type or mock shape legitimately changed.
- **Seam 2 — the running app over HTTP**, using the local Sitecore environment (`.env`):
  - production build;
  - dev server: Home and an Article page render with UIIM components;
  - page `<head>` (title, description, Open Graph) captured before the upgrade and compared after;
  - `/llms.txt`, `/sitemap.xml`, `/robots.txt` and `/ai/service.json` respond;
  - the three existing search verification scripts pass (prior art: the `sitecore-search` skill's verify scripts).
- Record the results (pass/fail, versions, notable head-tag differences) in the PR description.

## Out of Scope

- Changes to the other starter kits under `examples/`, the authoring serialization, local containers, and Sitecore's GitHub workflows.
- Major-version upgrades (React, Tailwind, TypeScript 6/7, Content SDK 3).
- New search features (query suggestions, facets, locale), Sitecore Search index or suggestion configuration — tracked as a follow-up.
- A Pages-editor or deployed-environment check (not required by decision 5; recommended before promoting `dmz` to `main`).
- Fixing the existing React Hooks lint errors.
- Authoring `llms.txt` content in Sitecore.

## Further Notes

- Sitecore's 6 relevant commits: Dependabot fixes, CLI exclusions, SDK 2.3 bump, SDK 2.4 upgrade, and "Utilize CSDK 2.4 AI discoverability features".
- Content SDK 2.x is Sitecore's active, supported line; 0.x pre-releases are unsupported, so staying current within 2.x matters.
- Merge `dmz` → `main` with a merge commit, and check the PR's head commit before merging (GitHub was slow to register pushes recently).

## Comments

**2026-10-19 — implementation.** Ported on `feature/sitecore-starter-sync-2-4`. Passing: type-check, all unit tests, agent checks, component validation, lint (no new errors), production compile.

Blocked: the decision 5 runtime checks (pages, head tags, `llms.txt`/sitemap, search scripts). The local `.env` Edge context ID is rejected by Edge ("No sitecore context") before and after the upgrade, and the earlier baseline came from Next's fetch cache. Needs a `.env` with a working context ID for the demo environment, then run the checks and record before/after.
