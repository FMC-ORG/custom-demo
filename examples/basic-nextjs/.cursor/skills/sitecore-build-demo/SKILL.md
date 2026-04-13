---
name: sitecore-build-demo
description: Build a complete Sitecore demo from a client homepage screenshot (required) and optional URL. Extracts brand theme, analyzes the page visually, matches sections to template components + variants, populates English content, and applies theming. Use when an SE says "build a demo for [client]", "replicate this site", or provides a homepage screenshot for demo creation. REQUIRES a screenshot before proceeding.
---

Read and follow `docs/ai/skills/sitecore-build-demo.md` in full before proceeding.

This skill orchestrates the full demo creation pipeline:

0. **Gather inputs** — screenshot is REQUIRED. URL is optional. Never proceed without a visual reference.
0.5. Manifest health check (uses `sitecore-validate-manifest` skill — Quick mode)
1. Theme extraction (uses `sitecore-extract-theme` skill — screenshot is primary input)
2. Homepage analysis + variant gap analysis + API-addable classification
   **⛔ MANDATORY CHECKPOINT — show plan, wait for user approval before proceeding**
2.5. Content extraction + mapping — ALL CONTENT IN ENGLISH regardless of source language
3. Content population (creates new client datasource items via MCP from content-map.yaml)
   - Verify `create_component_ds` children after creation (known reliability issue)
4. Theme application (generates CSS variable overrides)
5. Custom variant/component building (if variant gap analysis found gaps)
6. Page assembly on existing Home page (adds API-addable components + generates manual tasks for context-only)
7. Summary (what was done + manual tasks including variant selection)

Key rules:
- **Screenshot required** — never start without one
- **Approval gate** — stop after Phase 2, show plan, wait for "go ahead"
- **English only** — all content in English, translate from source language
- **Verify children** — read back list component parents to confirm children exist
- **Context-only = manual** — NavigationHeader/SiteFooter cannot be added via API
- **Use Home page** — always assemble on the existing Home page, never create a new subpage unless explicitly asked

Output directory: `docs/ai/demos/<client-kebab>/`
