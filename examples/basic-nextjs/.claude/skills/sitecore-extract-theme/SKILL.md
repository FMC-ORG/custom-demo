---
name: sitecore-extract-theme
description: Extract a client's brand visual identity from their website URL or screenshot. Use when starting a demo build, when the user provides a client URL, or when matching a client's look and feel. Triggers on "extract theme", "match their brand", "replicate the look", "demo for [client]", "their website is [URL]", "build a demo that looks like".
---

Read and follow `docs/ai/skills/sitecore-extract-theme.md` in full before proceeding.

Theme template: `docs/ai/templates/client-theme.template.yaml`
Output to: `docs/ai/themes/<client-kebab>.theme.yaml`

## Scripts

- **`scripts/setup.sh`** / **`scripts/setup.cmd`** — One-time Playwright install
- **`scripts/site-scraper.mjs`** — Headless Chromium scraper for JS-rendered sites

```bash
node .claude/skills/sitecore-extract-theme/scripts/site-scraper.mjs --url <URL> --output docs/ai/themes/<client>
```
