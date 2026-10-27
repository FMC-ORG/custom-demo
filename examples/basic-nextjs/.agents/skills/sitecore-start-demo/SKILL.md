---
name: sitecore-start-demo
description: "Prepare and check everything needed before building a new custom demo: create the demo branch from the latest main, install local tools, verify the marketer MCP sign-in, target site, manifest, Content Hub credentials and client URL, then hand over a ready build command. Use when an SE starts a new client demo, before sitecore-build-demo."
disable-model-invocation: true
---

# Start a new custom demo

Runs the **Start Check** once per new demo, before `sitecore-build-demo`. Design decisions: `docs/ai/backlog/demo-setup-skill.md`. Terms (**Demo Branch**, **Start Check**): `CONTEXT.md`.

## Rules

- Fix local setup only: the demo branch, dependencies, Chromium, the git hook, agent files. **Never change Sitecore, Content Hub or git remotes**; every marketer MCP call here is read-only.
- Never commit, push, stash or delete anything. Uncommitted changes stop setup.
- Never print credentials or tokens.

## Inputs

Ask for anything missing:

1. **Client name**: lowercase kebab-case (`acme`, `acme-2`). It names the Demo Branch `<client>-demo` and the folder `docs/ai/demos/<client>/`.
2. **Client homepage URL**.
3. **Optional: the deployed demo URLs.** These are the public **showcase URL** (the Vercel production URL of the demo project) and the Pages **editing host URL**. Pass them as `--showcase-url` / `--editing-host-url`. They're kept in `setup.json` and used by the build's Phase 8 (`wait-for-deploy.mjs`, `verify-demo.mjs`).
   - If the project isn't deployed yet, skip them and add them later with `--continue --showcase-url <url>`.
   - Never include query strings: a Vercel `x-vercel-protection-bypass` token would leak into the demo records, so the check refuses such URLs.

The screenshot is not needed yet; it goes with the build command.

## Step 1 — Local check

Run from `examples/basic-nextjs`:

```bash
node .agents/skills/sitecore-start-demo/scripts/start-demo.mjs --client <client> --url <url>
```

It prints a readable summary (stderr) and a JSON report (stdout); exit code 2 means blockers. On success it writes `docs/ai/demos/<client>/setup.json` (gitignored). Handle the result:

| Check | If it fails |
|---|---|
| `clean-tree` | List the files. Ask the user to commit them on their own demo branch or discard them, then re-run. Never stash. |
| `demo-branch` exists / `demo-folder` in use | Ask: **continue that demo** (re-run with `--continue`) or **choose a new name** (e.g. `<client>-2`). An existing folder may hold recovery records; never overwrite it. |
| `main-up-to-date` | Local `main` has its own commits: ask the user to move them to a branch. |
| `showcase-url` (info) / `editing-host-url` | Not set, unreachable, or refused (not HTTPS, credentials, or a query string). Never a blocker. Ask for the URL once the demo is deployed. |
| `framework-ahead` (warning) | Tell the user their fork is behind the framework and how many commits; do not change remotes. |
| `url` | The site does not load or is blocked by bot protection. Stop; the user may try another URL. |
| `content-hub` (warning) | Offer to set credentials: ask for host, user and password (client ID/secret only for OAuth), copy `docs/ai/config/credentials.example.yaml` to `docs/ai/config/credentials.local.yaml`, fill it in, and re-run. If declined, images fall back to manual upload. |
| `project-config` | Ask for `siteCollection` and `siteName` and create `docs/ai/config/project.yaml` (see `AGENTS.md`). |
| anything else | Show the message; the script already fixed what it safely could. |

Re-run the script after each fix until it reports no blockers.

## Step 2 — Sitecore checks (marketer MCP, read-only)

Use `siteCollection`/`siteName` from `docs/ai/config/project.yaml`.

0. **Right environment.** Read `/sitecore/content/Environment Markers` (a missing folder means no markers). The script reports the expected marker as `environmentMarker` (from `project.yaml`). Expected marker set → it must be the folder's only child; none expected → the folder must have no children. Anything else → **blocker**: the marketer MCP is signed into another SitecoreAI environment; ask the user to switch it with `/mcp`. Never create or delete markers. Do this before every other Sitecore call; several environments share identical paths and item IDs.
1. **Sign-in and site.** `get_content_item_by_path` for `/sitecore/content/<siteCollection>/<siteName>`.
   - Authentication error → **blocker**: sign in to `sitecore_marketer` (`/mcp`) and retry.
   - Not found → **blocker**: `project.yaml` does not match the connected environment.
   - Record the site item ID as `siteItemId`.
2. **Home inventory.** Resolve `…/<siteName>/Home`, then `get_components_on_page`. List each instance ID, component name, rendering ID, placeholder and datasource name. If the datasources look like another client's demo (for example names with a client prefix such as `<Client> - …`), **warn**: the build will ask to confirm taking it over and can propose `replace`/`removeInstances` from this list.
3. **Header/Footer.** `get_components_on_page` with the item IDs of `Presentation/Partial Designs/Header` and `Footer`. Report each instance and its datasource name.
4. **Preview.** `get_page_screenshot` for Home (version 1). An error or "Preview content is not found" → **warning**: the agent cannot check pages visually.
5. **Manifest.** Run the `sitecore-manifest` skill in validate mode, Quick level (`.agents/skills/sitecore-manifest/references/validate.md`):

   | Quick result | Action |
   |---|---|
   | All PASS | Continue |
   | Config mismatch only | Auto-fix, re-run Quick, continue |
   | Root paths fail | **Blocker**: ask the user to verify the environment |
   | React files missing | Warning: those components will not be used |
   | Component map mismatch | Warning: a dev-server restart may be needed |

   Stale IDs are auto-repaired by the manifest skill; show what changed. Run Full validation only if the user asks or Quick fails several checks.

## Step 3 — Record and hand over

1. Add a `sitecore` block to `setup.json`: `siteItemId`, `homeId`, `otherDemo` (prefix found, or `null`), and `manifest: { result: "pass" | "fail", checkedAt: <ISO time> }`.
2. Write `docs/ai/demos/<client>/setup-report.md` from `.agents/skills/sitecore-start-demo/assets/setup-report.template.md`.
3. In chat: blockers and warnings, what was fixed, the Home and Header/Footer summary, then — only if there are no blockers — the build command to paste:
   - Pi: `/skill:sitecore-build-demo build a custom demo for <client> from <url>`
   - Claude Code / Cursor: `/sitecore-build-demo build a custom demo for <client> from <url>`

   Remind the user to attach a full-page screenshot of the homepage.

## Check-only mode (used by `sitecore-build-demo`)

The build re-runs the Start Check without fixing or writing anything:

1. `node .agents/skills/sitecore-start-demo/scripts/start-demo.mjs --client <client> --check` (the URL comes from `setup.json`).
2. Step 2 items 0, 1, 2 and 4.
3. Step 2 item 5 **only if** `manifestReuse.reusable` is false or `manifestReuse.siteItemId` differs from the site item ID just read (same day, same `main` commit and same environment are required to reuse it).

Any blocker stops the build: tell the user to run `/skill:sitecore-start-demo <client> <url>`.
