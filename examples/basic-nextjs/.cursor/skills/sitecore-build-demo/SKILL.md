---
name: sitecore-build-demo
description: Build a complete Sitecore demo from a client homepage screenshot (required) and optional URL. Extracts brand theme, analyzes the page, matches sections to template components, populates content with images, and applies theming. Use when an SE says "build a demo for [client]", "replicate this site", or provides a homepage screenshot.
---

Read and follow `docs/ai/skills/sitecore-build-demo.md` in full before proceeding.

**Critical behaviors that must not be skipped:**

1. **Phase 0 — Content Hub credentials:** ALWAYS check `docs/ai/config/credentials.local.yaml`. If missing or invalid, ASK the user for Content Hub URL + username + password before proceeding. Without credentials, images cannot be uploaded automatically.

2. **Phase 2 — Two mandatory questions at the approval checkpoint:**
   - "Does the build plan look correct? Approved to proceed?"
   - "Do you want pixel-perfect custom variants (Phase 5.5), or are generic template variants sufficient?"
   Record the answer in `demo-progress.yaml`. Do NOT defer the variant question.

3. **Phase 3 — Image upload runs FIRST:** Run `upload-to-content-hub.mjs` BEFORE creating datasource items. The `imageFieldXml` values it produces are needed when populating fields (text + links + images all in one `update_fields_on_content_item` call).

Output directory: `docs/ai/demos/<client-kebab>/`
