---
name: sitecore-build-demo
description: Build a complete Sitecore demo from a client homepage URL or screenshot. Extracts brand theme, analyzes the page, matches sections to template components, populates content, and applies theming. Use when an SE says "build a demo for [client]", "replicate this site", "create components from this URL", or provides a homepage screenshot for demo creation.
---

Read and follow `docs/ai/skills/sitecore-build-demo.md` in full before proceeding.

This skill orchestrates the full demo creation pipeline:
1. Theme extraction (uses `sitecore-extract-theme` skill + Playwright scraper)
2. Homepage analysis (uses `site-analyzer` agent from `.claude/agents/site-analyzer.md`)
3. Content population (updates existing template component datasource items via MCP)
4. Theme application (generates CSS variable overrides)
5. Custom component building (if needed, uses creation skills)

Key references:
- `docs/ai/catalog/component-registry.yaml` — template component library
- `docs/ai/catalog/theme-component-mapping.md` — theme-to-variant mapping
- `docs/ai/manifests/sitecore-manifest.yaml` — existing component item IDs

Output directory: `docs/ai/demos/<client-kebab>/`
