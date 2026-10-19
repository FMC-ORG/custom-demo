# `sitecore-start-demo` skill — interview decisions

Goal: a skill that prepares and checks everything needed **before** a new custom demo is built, so
`sitecore-build-demo` starts on a working setup.

## Decisions

1. **Fixes local things only.** The skill checks and reports; it may fix safe local setup (create
   the demo branch, install dependencies and Chromium, install the git hook, run `agents:sync`). It
   never changes Sitecore, Content Hub or git remotes.
2. **Separate command, re-run by the build.** Started explicitly
   (`/skill:<setup-skill> <client>`), never by natural-language routing. `sitecore-build-demo` starts
   by running the same checks in check-only mode and stops on a blocker, telling the user to run
   setup. The build's own credential and manifest checks move into the setup skill so they live in
   one place.

3. **Another client's demo on the site: warn, don't block.** The report names the demo it found
   (Home components, Header/Footer datasources) and lists the Home components with instance and
   rendering IDs, so the build plan can propose `replace`/`removeInstances`. The build's existing
   repurposing confirmation still applies. Leftover items (old datasources, variants, placeholder
   datasources) are not cleaned. *Later idea, not in scope:* a separate "reset demo site" skill.

4. **Input: client name and URL.** The name gives the branch (`<client>-demo`) and demo folder
   (`docs/ai/demos/<client>/`). The URL is checked (the site loads; the scraper is not blocked by
   bot protection or a cookie wall) and saved in the demo folder for the build. The screenshot
   stays with the build command.

5. **Strict git handling.** Uncommitted changes stop setup with instructions (never an automatic
   stash). An existing `<client>-demo` branch or `docs/ai/demos/<client>/` folder stops setup and
   asks: continue that demo, or choose a new name (e.g. `<client>-2`). Never overwrite an existing
   demo folder (it may hold recovery records; ADR 0008). One working folder; no worktree per demo.

6. **Blockers and warnings.**
   - Blockers: not on a fresh `<client>-demo` branch from the latest `main`; dependencies or
     Chromium missing (setup fixes); `agents:check` failing (setup runs `agents:sync`); marketer MCP
     not signed in or token expired; `project.yaml` does not match the connected environment; client
     URL does not load or is blocked.
   - Warnings: Content Hub credentials missing or failing (images fall back to manual upload);
     `.env.local` missing; page preview or screenshots not working; another client's demo on the
     site.
   - Info: leftover test items or old variants.

7. **Output.** A chat summary plus, in the gitignored demo folder: `setup-report.md` (pass, warn
   or fail per check, what was fixed, what is on Home, next step) and `setup.json` (client name,
   URL, branch, `main` commit, date). Ends with the ready-to-paste build command and a reminder
   to attach the screenshot. The build reads `setup.json` for the URL but always re-runs the
   checks; it never trusts an old report.

8. **Name: `sitecore-start-demo`.** Read as "start, then build" next to `sitecore-build-demo`;
   avoids confusion with one-time machine setup (`agents:setup`, deploy).

9. **Script plus agent.** A tested Node script (`start-demo.mjs --client <name> --url <url>`,
   `--check` for no-fix mode) does the local checks and fixes (git, npm, Chromium, files, URL,
   Content Hub login) and prints JSON. The agent adds the marketer MCP checks (sign-in, site matches
   `project.yaml`, Home inventory, preview) and writes the report. `sitecore-build-demo` runs the
   same script with `--check` plus the same MCP checks. Sitecore access stays MCP-only.

10. **Manifest check: full at start, reused by the build only when fresh.** The Sitecore manifest
    check (formerly build Phase 0.5, about 2.5 minutes of MCP reads) runs in full in
    `sitecore-start-demo`. The build re-runs every other check, and skips the manifest check only if
    `setup.json` is from the same day, the same `main` commit and the same environment; otherwise it
    runs it again. This is the one deliberate exception to "never trust an old report" (decision 7).

11. **"Latest main" = what local `main` tracks** (`main@{upstream}`, else `origin/main`). Setup
    fetches it and fast-forwards local `main` when that is clean; local commits on `main` stop
    setup. If an FMC-ORG remote exists and is ahead, warn that the fork is behind the framework by
    N commits. Remotes are never added or changed.

## Implementation status

Implemented in `.agents/skills/sitecore-start-demo/` (script + tests in `tools/agents/__tests__/start-demo.test.js`); `sitecore-build-demo` Phase 0/0.5 use its check-only mode. Not yet run against a live environment.

## Implementation outline

1. `.agents/skills/sitecore-start-demo/` (command-only): `SKILL.md`, `scripts/start-demo.mjs`, a
   report template.
2. `start-demo.mjs`: git (clean tree, tracked `main` fast-forward, FMC-ORG behind warning,
   branch/folder exists), npm dependencies and Chromium, `agents:check` (`agents:sync` fix),
   `project.yaml` present, `.env.local`, client URL (loads, not blocked), Content Hub login. JSON
   output; `--check` disables every fix. Jest tests with temporary git repos and fake fetch.
3. MCP part (agent): marketer sign-in, `project.yaml` site exists in the connected environment,
   Home inventory (instance and rendering IDs, other client's demo), Header/Footer datasources,
   preview/screenshot, full manifest check. Writes `setup-report.md`, `setup.json`, build command.
4. `sitecore-build-demo`: Phase 0/0.5 call the Start Check in check-only mode (manifest reuse per
   decision 10); move the credential and manifest steps out; read the URL from `setup.json`.
5. Router entry in `AGENTS.md` (command-only list), routing eval case, README per-demo steps,
   `agents:sync` / `agents:check`.
