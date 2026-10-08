# Sitecore Content SDK Next.js Sample Application

## Overview

This is the basic Next.js (App Router) starter with minimal XM Cloud integration.

## How to Run This Starter Locally

Follow the [root README — How to Run a Next.js Starter Locally](../../README.md#how-to-run-a-nextjs-starter-locally), using this path: **`examples/basic-nextjs`**.

Optional: for stable absolute URLs in server-rendered code when the request has no `Host` header, set `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_BASE_URL` (see [`.env.remote.example`](.env.remote.example)).

From the repo root:

```bash
cd examples/basic-nextjs
npm install
npm run dev
```

Open **http://localhost:3000**.

## AI agents (Claude Code, Cursor, Pi)

Agent skills, rules, and MCP servers have one canonical source under `.agents/`; the per-tool files (`.claude/`, `.cursor/`, `.mcp.json`, `.pi/mcp.json`) are **generated** — never edit them by hand. See [ADR 0007](docs/adr/0007-cross-agent-skills-layout.md).

| Command | What it does |
|---|---|
| `npm run agents:setup` | Install the git pre-commit hook (run once per clone) |
| `npm run agents:sync` | Regenerate per-tool files after editing anything in `.agents/` |
| `npm run agents:check` | Verify generated files are current and lint skills (the hook runs this) |
| `npm run agents:validate` | Check that every component-map entry resolves to a file with a `Default` export |
| `npm run agents:browsers` | Install Playwright Chromium for the scraper/verify scripts (once per machine) |
| `npm run agents:eval` | Ask headless Pi / Claude Code which skill they would load for each prompt in `tools/agents/evals/routing.yaml` (costs tokens; run after changing skill descriptions or the router). Filters: `-- --agent pi`, `-- --case <id>` |

Skills live in `.agents/skills/<name>/SKILL.md`; `AGENTS.md` is the single always-on instruction file (`CLAUDE.md` imports it). To add or change a skill: edit it under `.agents/skills/`, add it to the router in `AGENTS.md` (unless it is a hidden subskill), add a routing case to `tools/agents/evals/routing.yaml`, then `npm run agents:sync` and `npm run agents:check`. Long pipelines are command-only: start them with `/skill:<name>` in Pi or `/<name>` in Claude Code and Cursor (e.g. `sitecore-build-demo`, `sitecore-abm-page`).

First run per tool: Claude Code and Cursor pick up the skills and MCP servers (`sitecore_marketer`, `sitecore_docs`) automatically. **Pi** loads project skills (`.agents/skills`) and `.pi/mcp.json` only after you start `pi` in this folder and trust the project. Re-authenticate each MCP server once if prompted.

## Documentation

- [Agent skills for this app](.agents/skills/) — one folder per skill; routing in [AGENTS.md](AGENTS.md). Repo-wide capability map: [docs/Skills.md](../../docs/Skills.md).
- [Sitecore Content SDK for XM Cloud](https://doc.sitecore.com/xmc/en/developers/content-sdk/sitecore-content-sdk-for-xm-cloud.html)
