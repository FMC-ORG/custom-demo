---
name: sitecore-extract-theme
description: Extract a client's brand visual identity from their website URL or screenshot. Use when starting a demo build, when the user provides a client URL, or when matching a client's look and feel. Triggers on "extract theme", "match their brand", "replicate the look", "demo for [client]", "their website is [URL]", "build a demo that looks like".
---

Read and follow `docs/ai/skills/sitecore-extract-theme.md` in full before proceeding.

Theme template: `docs/ai/templates/client-theme.template.yaml`
Output to: `docs/ai/themes/<client-kebab>.theme.yaml`

Scripts live in `docs/ai/scripts/`:
- `setup.sh` / `setup.cmd` / `setup.ps1` — One-time Playwright install
- `site-scraper.mjs` — Headless Chromium scraper for JS-rendered sites

```bash
node docs/ai/scripts/site-scraper.mjs --url <URL> --output docs/ai/themes/<client>
```
