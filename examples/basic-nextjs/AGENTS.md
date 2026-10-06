# SitecoreAI Demo Builder — agent instructions

Applies to Claude Code, Cursor, and Pi. This is the only always-on instruction file: `CLAUDE.md` imports it and Cursor gets a generated pointer rule. Workflow detail lives in skills (`.agents/skills/`); project knowledge and state live in `docs/ai/`. Domain terms: `CONTEXT.md`.

**Stack:** Next.js App Router · Sitecore XM Cloud via `@sitecore-content-sdk/nextjs` · TypeScript · Tailwind · shadcn/ui. Components live in `src/components/uiim/<category-kebab>/<ComponentName>.tsx` and are registered in `.sitecore/component-map.ts`.

## Before any Sitecore task

1. Read `docs/ai/config/project.yaml` (siteCollection, siteName, renderingsRoot, projectTemplatesRoot). Derive `dataRoot = /sitecore/content/<siteCollection>/<siteName>/Data`, `projectFoldersRoot = projectTemplatesRoot/Folders`, `renderingParamsRoot = projectTemplatesRoot/Rendering Parameters`. Never take these from memory, examples, or other components. If the file is missing, ask the user and create it.
2. Read `docs/ai/manifests/sitecore-manifest.yaml`. Existing entry `complete` → confirm before re-creating; `partial`/`failed` → resume from recorded IDs; check `lookups` before resolving paths. Update it during and after every Sitecore task (`sitecore-manifest`).
3. Demo builds only: Content Hub credentials are in `docs/ai/config/credentials.local.yaml` (gitignored, optional).

## Route the request to a skill

Classify the request before writing code or touching Sitecore, then load the matching skill and `sitecore-standards`.

<!-- agents:router:start -->
| Request | Skill |
|---|---|
| Component renders route/page fields; no datasource | `sitecore-create-context` |
| Component with one datasource item; no child items, no ComponentQuery | `sitecore-create-simple` |
| Parent datasource with authorable child items; needs ComponentQuery | `sitecore-create-list` |
| Variant, variation, alternate layout or style for an existing component | `sitecore-add-variants` |
| Data not loading, children missing, query/React shape mismatch, datasource picker empty, authors cannot create items | `sitecore-diagnose-rendering` |
| New page type (route template, context components, partial design) — Article and Landing Page already exist as worked examples | `sitecore-create-page-template` |
| Record AI-created item IDs and status; validate the manifest after an environment switch or item-not-found errors | `sitecore-manifest` |
| Set up, configure, or debug site search | `sitecore-search` |
| Extract a client's brand theme from a screenshot or URL | `sitecore-extract-theme` |
| Pixel-perfect custom variants matching a client screenshot | `sitecore-demo-variants` |
| Shared implementation, React, MCP, and verification standards | `sitecore-standards` |

**Command-only** — never start these on your own; the user runs them explicitly (`/skill:<name>` in Pi, `/<name>` in Claude Code and Cursor):
`sitecore-build-demo` (full demo from a client homepage) · `sitecore-abm-page` (ABM landing page for one organization).
<!-- agents:router:end -->

Before implementing, show: chosen skill, assumptions, the spec (normalised with `.agents/skills/sitecore-standards/assets/sitecore-component-spec.template.yaml`), manifest status (new / resuming / updating), and the plan. Ask concise questions when critical information is missing. If screenshots are attached, inspect them first. If a repo convention conflicts with a skill default, follow the repo and say so.

## Non-negotiables

- **Sitecore items** are created and changed through the `sitecore_marketer` MCP server (refer to its tools by plain name, e.g. `get_content_item_by_path`). Resolve parents by path first, verify every create/update by reading it back, and never call something complete unless verified — say "created and verified" or "created; needs verification".
- **Available Renderings:** append new rendering IDs (pipe-separated) to the existing `Renderings` value. Never replace it.
- **Renderings:** `Component Name` is PascalCase and equals the TSX filename; `Parameters Template` is a GUID, never a path; `Datasource Template` is a full path, never a GUID.
- **Templates:** every template gets `__Standard Values`. Datasource templates use base templates `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}`.
- **React:** named exports only (`Default` first; every export name equals a Variant Definition item), props extend `ComponentProps`, wrapper uses `params.styles` and `params.RenderingIdentifier`, include a non-exported empty-state fallback.
- **Editability:** every Sitecore field renders through an SDK helper (`Text`, `RichText`, `NextImage`, `Link`) — never plain `<img>`, `<a>`, `next/image`, or hardcoded strings. Keep empty fields visible when `page.mode.isEditing`.
- **Demo content** is created in English, whatever the source language.

## Where things live

| Path | Contents |
|---|---|
| `.agents/skills/` | Skills: one folder each, with `scripts/`, `references/`, `assets/` |
| `docs/ai/config/` | Project identity (`project.yaml`), local credentials |
| `docs/ai/manifests/` | Manifest of AI-created Sitecore items |
| `docs/ai/catalog/` | Component, page-template, and capabilities registries |
| `docs/ai/reference/` | Platform facts: Sitecore rules, MCP behaviours, API limitations, brand variables |
| `docs/adr/` | Architecture decisions |
| `tools/agents/` | Agents tooling (`npm run agents:*`) |

## Agent files are generated

`.claude/skills/`, `.claude/agents/`, `.cursor/skills/`, `.cursor/rules/`, `.mcp.json`, `.cursor/mcp.json`, and `.pi/mcp.json` are generated from `.agents/`. Never edit them. After changing anything in `.agents/` or this file, run `npm run agents:sync`; `npm run agents:check` must pass.
