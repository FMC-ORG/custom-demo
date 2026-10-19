# Issue 008: Cross-agent skills restructure (Claude Code, Cursor, Pi)

**Label:** `ready-for-agent`

## Parent

ADR: [0007 — One canonical skill layout for Claude Code, Cursor, and Pi](../adr/0007-cross-agent-skills-layout.md)
Plan: [plan-agent-skills-restructure.md](../adr/plan-agent-skills-restructure.md) (old → new mapping and per-phase checklists)

## Problem Statement

Solution Engineers (SEs) and developers build demos and Sitecore components using AI coding agents, but the demo builder's skills, rules, scripts, and MCP configuration only work properly in Claude Code:

- Pi sees none of the skills, cannot read the `@`-imported rules, and has no MCP servers configured.
- Cursor's skill wrappers and rules are hand-maintained copies that have drifted. Several skills that the router sends work to do not exist for Cursor or Claude at all.
- Skills hardcode tool-specific MCP tool IDs, so they break when a different agent runs them.
- The two analysis subagents only exist for Claude Code.
- The repo-root agent instructions contradict this app's rules, so every agent gets mixed guidance.
- Dead scripts, duplicate AI docs, and one-shot orchestrators whose output already exists clutter the toolbox. Nothing detects drift, so it keeps getting worse.
- Security hygiene: a committed example credentials file contains what appear to be real Content Hub credentials, and the Pi project folder (which holds auth data) is not gitignored.

The result: an SE's experience and output quality depend on which agent they use, and maintainers must edit the same instruction in several places.

## Solution

One canonical set of skills, rules, and MCP config. The equivalent for each agent is generated from it, and the generated files are checked automatically:

- Skills live once, in the Agent Skills format that Pi reads natively. Claude Code and Cursor get thin generated pointer wrappers.
- A short always-on instruction file holds the router and non-negotiables. Detailed standards load on demand via a shared standards skill.
- MCP servers are declared once and fanned out to all three agents, with names that produce identical tool IDs everywhere.
- Subagents become portable "file in → file out" skills. Claude Code still runs them as subagents; Pi and Cursor run them inline.
- Expensive orchestrators can only be started by explicit command; everyday component work routes automatically.
- The inventory is cut to 15 focused skills. Duplicates are merged, dead code removed, and campaign specifics parameterised.
- A sync check and a skill linter run in pre-commit and CI. Routing evals are available on demand.
- Rolled out in five independently shippable phases.

## User Stories

1. As an SE using Pi, I want the demo builder skills to be discoverable without any setup, so that I can build demos with the agent I prefer.
2. As an SE using Cursor, I want the same skills Claude Code users have, so that I am not missing workflows the router refers to.
3. As an SE using Claude Code, I want my current skills and subagent behaviour to keep working, so that the restructure does not slow me down.
4. As an SE, I want to start a demo build with one explicit command in any of the three agents, so that I know exactly how to kick off the pipeline.
5. As an SE, I want long pipelines (demo build, ABM page) to never start on their own from a casual sentence, so that I do not burn time and Sitecore writes by accident.
6. As an SE, I want everyday requests like "create a hero component" to route to the right skill automatically, so that I do not need to memorise commands.
7. As an SE, I want every orchestrator to stop for my approval before writing to Sitecore, so that a wrong plan never reaches the CMS.
8. As an SE, I want the Sitecore marketer and docs MCP servers available in all three agents from the repo, so that I do not configure each tool by hand.
9. As an SE, I want skills to work regardless of how an agent names MCP tools, so that a skill written for one agent does not fail in another.
10. As an SE, I want the site analysis and content mapping steps to produce the same build plan and content map files in every agent, so that a demo can be resumed in a different agent.
11. As an SE on Windows, I want the setup to work without symlinks or developer mode, so that a fresh clone just works.
12. As an SE, I want a single setup command for agent tooling (e.g. Playwright for the scraper), so that onboarding is one step.
13. As an SE, I want short, namespaced skill names, so that they autocomplete together and never collide with my personal skills.
14. As an SE running an ABM campaign, I want campaign and event details in a separate config, so that I can run a new campaign without editing the skill.
15. As a developer, I want to edit a skill in exactly one place, so that I never have to keep three copies in sync.
16. As a developer, I want a generator to produce all agent-specific files, so that wrappers, rules, subagent definitions, and MCP configs are always consistent.
17. As a developer, I want commits to fail when generated files are stale, so that drift cannot be merged.
18. As a developer, I want a linter to flag skills whose referenced files, scripts, or npm commands do not exist, so that broken paths are caught before an SE hits them.
19. As a developer, I want the linter to reject tool-specific MCP tool IDs, old paths, and `@`-imports in the always-on file, so that portability rules are enforced, not just documented.
20. As a developer, I want the linter to verify that the router lists exactly the skills that exist, so that the router never points to a missing skill and no skill is unreachable.
21. As a developer, I want skill frontmatter validated against the Agent Skills spec (name format, name matches folder, description length, "Use when" guidance), so that every agent loads every skill.
22. As a developer, I want single-use scripts and templates to live inside the skill that uses them, so that a skill is self-contained and easy to delete or share.
23. As a developer, I want shared tools behind stable npm scripts, so that moving a file changes one place, not every skill.
24. As a developer, I want project knowledge and state (config, manifest, catalogs, platform reference) to stay in the visible docs area, so that humans can review them and they survive skill changes.
25. As a developer, I want the detailed Sitecore and React standards in one shared skill, so that the create skills only contain their type-specific steps.
26. As a developer, I want the two "fix" skills merged into one diagnose-rendering skill, so that rendering problems are triaged in one place.
27. As a developer, I want the two manifest skills merged, so that writing and validating the manifest follow one set of rules.
28. As a developer, I want the retired article/landing orchestrators preserved as worked examples, so that the know-how for building page types is not lost.
29. As a developer, I want a search skill that bundles the search verification scripts and the enablement recipe, so that the search capability has an owner.
30. As a developer, I want dead scripts and duplicate AI docs removed, so that agents and humans are not misled by stale material.
31. As a developer, I want the repo-root agent instructions trimmed to repo-generic guidance, so that they no longer contradict this app's conventions.
32. As a developer, I want Cursor rules generated (one always-on pointer plus a rule scoped to the component folder), so that Cursor applies the standards where they matter.
33. As a developer, I want to run routing evals on demand against Pi and Claude Code, so that I can see whether a description change broke routing.
34. As a developer, I want each migration phase to be its own PR, so that reviews are small and any step can be reverted alone.
35. As a developer, I want the pure-move phase to contain no content changes, so that git records renames and demo branches can rebase cleanly.
36. As a maintainer of demo branches, I want to absorb the restructure gradually, so that in-flight demos are not blocked by one huge conflict.
37. As a security-conscious maintainer, I want the example credentials scrubbed and the Pi auth folder ignored, so that secrets do not leak via git.
38. As a CI owner, I want the sync check and linter to run in the existing PR validation workflow, so that no new pipeline is needed.
39. As a new contributor, I want a README section explaining the supported agents, commands, and `agents:*` scripts, so that I can get productive without reading every ADR.
40. As an agent (any tool), I want the always-on file to be small and to point to on-demand detail, so that my context is not filled with rules irrelevant to the task.

## Implementation Decisions

Directory conventions appear below where the agents discover files by path. In those cases the path *is* the interface.

**Canonical sources**
- Skills: one folder per skill under the app's `.agents/skills/`, each with a `SKILL.md` and optional `scripts/`, `references/`, `assets/`.
- MCP: one canonical MCP server list under `.agents/`.
- Always-on instructions: one hand-written `AGENTS.md` (about 80 lines) with project config + manifest bootstrap, the router (trigger → skill), non-negotiables, a map of the docs area, and the list of command-only skills. `CLAUDE.md` contains only an import of `AGENTS.md`.

**Canonical skill frontmatter (interface consumed by the generator)**
- `name` (kebab-case, equals folder name, `sitecore-` prefix), `description` (what + "Use when…", ≤1024 chars).
- `disable-model-invocation: true` for command-only skills.
- `metadata.subagent: true` for skills that should also become Claude Code subagents.
- `metadata.owner` (informational).

**Agents tooling module** (one CLI, exposed as `agents:sync`, `agents:sync:check`, `agents:lint`, `agents:eval`, `agents:validate`, `agents:setup`)
- A single exported entry point `run(args, { cwd })` returns `{ exitCode, messages, filesWritten }`. The npm scripts are thin shells around it, so tests and CI share one seam.
- **sync** writes, from the canonical sources:
  - Claude Code and Cursor skill wrappers: frontmatter copied from the canonical skill, body "Read and follow the canonical SKILL.md". The command-only flag is translated per tool.
  - Claude Code subagent definitions for `metadata.subagent` skills.
  - Generated Cursor rules: one always-apply pointer to `AGENTS.md`, plus a rule scoped to the component folder that loads the standards skill.
  - MCP config files for Claude Code, Cursor, and Pi.
  - Generated files carry a "do not edit" header. Stale generated files whose source no longer exists are removed.
- **sync --check** writes nothing. It exits non-zero and lists every file that would change.
- **lint** checks:
  - frontmatter against the spec
  - referenced relative paths (skill-relative and app-root-relative) exist
  - referenced `npm run` scripts exist
  - forbidden patterns: tool-prefixed MCP IDs, removed legacy paths, `@`-imports in `AGENTS.md`
  - the router in `AGENTS.md` lists exactly the non-hidden skills
  - It reports file + rule + message for each problem.
- **eval** runs the prompts in the routing eval file through headless Pi and Claude Code and reports which skill was loaded versus expected. It is manual, never a CI gate.
- **validate / setup** wrap the existing component validator and the cross-platform setup scripts.

**MCP**
- Servers are renamed `sitecore_marketer` and `sitecore_docs` so tool IDs match across agents.
- Skill text names tools by their plain name only.
- The Pi project folder is gitignored except its settings and MCP files.

**Skill inventory (15)**
- `sitecore-build-demo` (command-only, orchestrator; delegates to subagents when available, else loads them inline)
- `sitecore-analyze-site` (command-only, subagent; screenshot + theme → build plan file)
- `sitecore-map-content` (command-only, subagent; build plan + extracted content → content map file)
- `sitecore-extract-theme`
- `sitecore-demo-variants`
- `sitecore-create-simple`, `sitecore-create-list`, `sitecore-create-context` (type-specific steps only)
- `sitecore-create-page-template` (with article and landing worked examples)
- `sitecore-add-variants`
- `sitecore-diagnose-rendering` (merge of ComponentQuery + datasource-picker fixes)
- `sitecore-manifest` (merge of maintain + validate; validate is a mode)
- `sitecore-search` (enablement recipe + verification scripts)
- `sitecore-abm-page` (command-only; campaign/event details in a campaign config reference)
- `sitecore-standards` (detailed implementation, React, MCP and manifest rules, the shared verification checklist, the component spec template)

**Placement rule**
- If something would be deleted along with a skill, it lives in that skill.
- Otherwise it stays in the docs area: config, manifest, catalogs, shared platform reference, designs, and the gitignored demo/theme outputs.

**Removals**
- Retired orchestrators: article page, landing page.
- Unreferenced scripts: image downloader, type-check wrapper, search debug script, Pages UI variant clicker.
- Hand-written wrappers, rules, and agents for Claude/Cursor (replaced by generated ones).
- App-level Copilot/Cline/Skills docs.
- The old skills/agents/scripts/templates/examples folders once emptied.

**Repo root**
- Root-level agent instructions are trimmed to repo-generic guidance. This is a fork-only change; it is accepted that the fork diverges from upstream here.

**Security**
- Example credentials are replaced with placeholders. Rotating the exposed Content Hub password is a manual follow-up.

**Rollout: five PRs, each with its own done-criteria (see plan)**
1. Tooling, security and MCP
2. Pure move (renames only)
3. Rules
4. Consolidation
5. Cleanup and evals

## Testing Decisions

**What makes a good test here:**
- Assert only on external behaviour of the agents CLI: files it writes (presence and content), exit code, and reported problems.
- Never assert on internal helpers, parse trees, or ordering that is not part of the contract.
- Fixtures describe *situations* (e.g. "a skill references a missing script"), not implementation steps.

**Seam 1 (primary, automated): the agents CLI entry point against a fixture app folder.** Each test builds a temporary app folder with canonical skills, MCP config, `AGENTS.md`, and a `package.json`, calls `run(args, { cwd })`, and asserts on outcomes. Cases include:
- sync produces Claude/Cursor wrappers whose frontmatter matches the canonical skill
- command-only flag translated for each tool
- subagent flag yields a Claude subagent definition, and absence yields none
- MCP fan-out produces the three files with identical servers
- Cursor rules generated
- removed canonical skill → its generated wrappers are deleted
- running sync twice is idempotent
- `--check` passes on a clean tree; fails and lists files when a wrapper is hand-edited or missing; writes nothing
- lint flags each rule (bad name, name ≠ folder, long description, missing "Use when", missing referenced file, missing npm script, prefixed MCP ID, legacy path, `@`-import in `AGENTS.md`, router lists a missing skill, skill not in router); passes a clean fixture

**Seam 2 (automated, existing CI): the real app as fixture.**
- `agents:sync:check` and `agents:lint` run in the existing PR validation workflow and in pre-commit.
- This validates the migrated content with no extra test code.

**Seam 3 (manual): routing evals** via `agents:eval` against headless Pi and Claude Code, run before merging description or router changes.

**Test runner:**
- A second Jest project with the Node environment, rooted at the agents tooling folder, alongside the existing jsdom project.
- One `npm test`, one coverage report, and it is picked up by the existing CI test step.

**Prior art:**
- Existing Jest suites under the app's tests folder (e.g. search component tests) for structure, mocking style, and naming.
- The `--dry-run` pattern in the Content Hub upload script for no-write modes.

**Not automated:** skill prose quality, and Sitecore/MCP behaviour. Those are verified manually against the real environment in phases 3–4 (a component create and a rendering diagnosis in at least one agent, plus Quick manifest validation).

## Out of Scope

- Building a Pi extension that provides real subagents (deferred until inline context pressure proves it necessary).
- Sharing skills with other starters in `examples/` or publishing them as a Pi package or plugin.
- Rewriting the substance of Sitecore workflows beyond the merges and parameterisation listed here.
- Fixing the runtime code findings from discovery (component-map exclusions, duplicate content-sdk folder, ArticleBody brand tokens, retained superseded search code). Track separately.
- Fixing Marketer MCP platform limitations (rendering parameters, removing components, `delete_content` no-op).
- Making routing evals a CI gate.
- Rotating the Content Hub password (manual follow-up, not code).

## Further Notes

- Verify before phase 4:
  - the team's Cursor version loads skill folders and honours a command-only flag (otherwise generate Cursor rules with manual application instead)
  - Claude Code honours `disable-model-invocation` on the team's version
- Pi reads the project MCP file only after project trust. Document the trust prompt in the README.
- Each user re-authenticates MCP once per agent after the server rename.
- ADR 0001 (upstream sync strategy) is referenced by the upstream sync runbook but missing. It is unrelated to this work, but the new ADR was numbered 0007 to avoid the gap.

## Acceptance criteria

- [ ] Phase 1: all three agents list both MCP servers; `agents:sync:check` and `agents:lint` run in pre-commit and PR validation; Pi auth data ignored; example credentials scrubbed.
- [ ] Phase 2: skills discoverable and loadable by command in Pi, Claude Code, and Cursor; a bundled script runs from its skill; history recorded as renames.
- [ ] Phase 3: `AGENTS.md` is the single always-on source; "create a hero component with title and image" routes to `sitecore-create-simple` in each agent, which reads project config and manifest first; root guidance no longer contradicts the app.
- [ ] Phase 4: 15-skill inventory in place; command-only skills cannot be auto-invoked; component create + rendering diagnosis verified against real Sitecore; Quick manifest validation passes.
- [ ] Phase 5: dead code and duplicate docs removed; `agents:eval` passes for Pi and Claude Code; README documents agents, commands, and scripts.
- [ ] Seam 1 test suite covers every sync and lint behaviour listed in Testing Decisions and passes in CI.

## Blocked by

None.
