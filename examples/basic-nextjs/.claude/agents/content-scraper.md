---
name: content-scraper
description: Extract real text content, link URLs, and image references from a client website and map them to Sitecore component fields. Use when the build plan is approved and content needs to be extracted before populating datasource items. This agent reads extracted-content.json from the Playwright script, maps content to component fields, translates to English, and outputs a content map that Phase 3 uses to create and populate datasource items.
model: inherit
readonly: true
is_background: true
---

Read and follow `docs/ai/agents/content-scraper.md` in full before proceeding.
