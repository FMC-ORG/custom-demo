---
name: sitecore-extract-theme
description: Extract a client's brand visual identity (colors, fonts, spacing, shape, tone) from their website URL or screenshot. Use when starting a demo build, when the user provides a client URL to replicate, or when any task requires matching a client's brand look and feel. Triggers on phrases like "extract theme", "match their brand", "replicate the look", "demo for [client]", "their website is [URL]", "build a demo that looks like".
---

Read and follow `docs/ai/skills/sitecore-extract-theme.md` in full before proceeding.

Theme template format is at `docs/ai/templates/client-theme.template.yaml`.

Output theme files to `docs/ai/themes/<client-kebab>.theme.yaml`.

## Available scripts

These scripts handle dynamic page rendering, computed CSS extraction, and image downloading. The agent runs them via the terminal and uses their JSON output to populate the theme YAML.

### One-time setup

Install Playwright and Chromium before first use.

**Windows (cmd or PowerShell):**
```cmd
node .cursor\skills\sitecore-extract-theme\scripts\setup.cmd
```

Or with PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .cursor\skills\sitecore-extract-theme\scripts\setup.ps1
```

**macOS / Linux:**
```bash
bash .cursor/skills/sitecore-extract-theme/scripts/setup.sh
```

### Main scraper — `site-scraper.mjs`

Renders the client site with headless Chromium (handles JavaScript-rendered pages, SPAs, lazy-loaded content), then extracts screenshots, computed CSS, fonts, meta data, and key images.

**Usage (works on all platforms):**
```
node .cursor/skills/sitecore-extract-theme/scripts/site-scraper.mjs --url https://example.com --output docs/ai/themes/example
```

On Windows, backslashes also work:
```
node .cursor\skills\sitecore-extract-theme\scripts\site-scraper.mjs --url https://example.com --output docs\ai\themes\example
```

**Options:**
- `--url` — URL to scrape (required)
- `--output` — Output directory for screenshots and data (required)
- `--timeout` — Page load timeout in ms (default: 30000)
- `--wait` — Extra wait after load in ms (default: 3000, increase for slow sites)
- `--no-images` — Skip downloading images

**Output files:**
- `screenshot-desktop.png` — Full-page desktop (1440×900)
- `screenshot-mobile.png` — Full-page mobile (390×844)
- `screenshot-hero.png` — Hero/above-the-fold viewport only
- `extracted-styles.json` — Computed CSS tokens (colors, fonts, spacing, radii)
- `meta.json` — Meta tags, font URLs, OG data, logo/image URLs
- `images/` — Downloaded logo, hero-bg, og-image, favicon

## Workflow with scripts

1. **Run the scraper** to get raw data and screenshots
2. **Read `extracted-styles.json`** for computed CSS values
3. **Read `meta.json`** for font URLs, theme-color, OG data
4. **Inspect the screenshots** for visual tone assessment
5. **Map everything** to the theme YAML template using the skill instructions
6. **Present the theme** to the user for review

If the scraper fails (site blocks headless browsers, requires auth, etc.):
- Fall back to basic `web_fetch` for HTML analysis
- Use a user-provided screenshot for visual analysis
- Set `extraction.confidence: "low"` and note the limitation
