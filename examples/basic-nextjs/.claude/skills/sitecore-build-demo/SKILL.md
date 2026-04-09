---
name: sitecore-build-demo
description: Build a complete Sitecore demo from a client homepage URL or screenshot. Extracts brand theme, analyzes the page, matches sections to template components, populates content, and applies theming. Use when an SE says "build a demo for [client]", "replicate this site", "create components from this URL", or provides a homepage screenshot for demo creation.
---

Read and follow `docs/ai/skills/sitecore-build-demo.md` in full before proceeding.

This skill orchestrates the full demo creation pipeline:
0.5. Manifest health check (uses `sitecore-validate-manifest` skill — Quick mode)
1. Theme extraction (uses `sitecore-extract-theme` skill + Playwright scraper)
2. Homepage analysis (uses `site-analyzer` agent from `docs/ai/agents/site-analyzer.md`)
2.5. Content extraction + mapping (Playwright extractor script + `content-scraper` agent → content-map.yaml)
3. Content population (creates new client datasource items via MCP from content-map.yaml)
4. Theme application (generates CSS variable overrides)
5. Custom component building (if needed — must exist before page assembly)
6. Page assembly (adds ALL components to page via MCP + generates variant checklist for SE)
7. Summary (what was done + manual tasks including variant selection)

Key references:
- `docs/ai/catalog/component-registry.yaml` — template component library
- `docs/ai/catalog/theme-component-mapping.md` — theme-to-variant mapping
- `docs/ai/manifests/sitecore-manifest.yaml` — existing component item IDs

Output directory: `docs/ai/demos/<client-kebab>/`
