# SitecoreAI ABM Landing Page Builder (Agentic Studio)

Sitecore demo artifact (branch `sitecore-demo`). An Agentic Studio standard agent plus a custom skill that build an ABM landing page selling SitecoreAI to one named account, for example `/lp/ikea-briefing`. Modelled on the HEINEKEN Press Release Builder agent.

These files are **not** a repo skill: they live outside `.agents/skills/` so `npm run agents:sync` ignores them. The repo's `sitecore-abm-page` skill (Pi, Claude Code, Cursor) is separate and unchanged.

| File | What it is |
|---|---|
| `SKILL.md` | Skill content, uploaded in Agentic Studio as **ABM Landing Page For One Account** |
| `agent.json` | Agent export, kept identical to the Studio export (skill `525f11e3-c359-4ac6-b980-4b2ba0e557a4`). After changing the agent in Studio, export it and replace this file |

## Prerequisites (sitecore-demo environment)

| Item | State | Owner |
|---|---|---|
| Landing Page Template, `/Home/lp` parent | Exist (IDs in `SKILL.md`) | — |
| `Sitecore` variants for the six landing sections | Variant Definitions created 2026-10-29; select them in the **Landing Page Layout** partial design in Page Builder | Marketer |
| Sitecore brand context `43723db2-…` | Exists (built from sitecore.com 2026-09-16) | — |
| Brand Kit named exactly `Sitecore Brand Kit`, published, current naming (SitecoreAI, Agentic Studio) | To recreate; the skill finds it by name, so no ID change is needed | Marketer |
| 3–5 Sitecore product or platform images tagged `abm-hero` in the media library | To do | Marketer |

## Install

1. Agentic Studio → **Skills** → **Create skill** → upload `SKILL.md`. Name: `ABM Landing Page For One Account`. Copy the new skill ID.
2. Put that ID in `agent.json` under `config.skills` (currently `525f11e3-…`), or select the skill under **Tools & skills** after import.
3. Agentic Studio → **Agents** → **Create Agent** → **Import JSON** → `agent.json`. Review the tabs; under **Tools & skills** confirm the skill is selected and, under **MCP**, the **Marketer MCP** (`marketer-mcp` in `defaultContext`). Save.
4. Run the agent from **Agentic → Chat**. No Context selection is needed: the agent reads the Sitecore brand context by ID through the Marketer MCP.

## Test

Run the agent with `IKEA` and answer the intake questions. Then read the new `/lp/ikea-…` page through the marketer MCP and check it against the skill's *Checklist*, plus: `ShowInNavigation = 0`, the page is not published, and no field holds an unsourced quote or figure. Fix the skill from the findings and re-upload it.

## Decisions (grill session 2026-10-29)

| # | Topic | Decision |
|---|---|---|
| 1 | Input | The marketer types the account name. The agent researches the web, then asks about gaps, one question at a time (max 5, each with a suggested answer). The marketer's answers win. Nothing is written before confirmation. |
| 2 | Goal | The marketer picks the goal per page (briefing or demo, event or webinar, account executive meeting) with its exact URL. Suggested default: `Book a SitecoreAI briefing` → `https://www.sitecore.com/request-a-demo`. Replaces the hardcoded Copenhagen event (May 2026, past). |
| 3 | Sitecore truth | Brand context = what Sitecore sells (read by ID with `marketer_mcp.get_brand_context`, since Studio drops brand context IDs from `defaultContext`); Brand Kit = voice; Sitecore documentation MCP = capability check; web = account research and sitecore.com verification. The old built-in "safe stats" are dropped. |
| 4 | Testimonial and stats | Testimonial: a real published Sitecore customer quote, verbatim, else empty. Stats: sourced Sitecore outcomes only, else empty. No partner logos unless supplied. Empty fields are hidden on the live page. |
| 5 | Page creation | `marketer_mcp.create_page` (Title only) + one `update_fields_on_item` from the Landing Page Template under `/Home/lp`; updates use one `update_content` with `createNewVersion`; never a duplicate of the example page (its DevOps filler would survive in empty fields). Name `<account>-<goal>`. Existing page for the account: ask update (new version) or new page. |
| 6 | Images | Marketer's image, else an `abm-hero` library asset, else empty. No image generation, no account logos or imagery. |
| 7 | Language | English only. Translation is a later, separate step. |
| 8 | Publishing | Never publishes. Ends with a review checklist and "Review in Pages before publishing. Nothing was published." Indexing is already off for this site (ADR 0012). |
| 9 | Location | Kept in this repo as Sitecore demo artifacts; the repo `sitecore-abm-page` skill stays as is. |
| 10 | Acceptance | Run for IKEA in Agentic Studio, then audit the page through the marketer MCP. |
| 11 | Intake format | Changed after the first run: each question offers at least 4 lettered options, one marked (Recommended), plus a free answer. The goal URL is checked before use. |
| 12 | Tools | All page work goes through `marketer_mcp`; tools load on demand via `ToolSearch`. The Marketer MCP is attached through `defaultContext` (`marketer-mcp`). Agent API Sites, Pages, Content and Brand Kits stay on by the marketer's choice, for reads only: the `pages` namespace has no `create_page`, and its `update_page_*` tools create a version per call, so the skill keeps all page writes in `marketer_mcp`. Lengths are counted with `skill_runtime.bash`. The page open in Page builder is never the target unless the marketer chose to update it. |

## Test log

| Date | Run | Result |
|---|---|---|
| 2026-10-29 | IKEA, skill attached (it used the skill's parent, template and `ShowInNavigation = 0`, yet broke its field rules) | `/lp/sitecoreai-for-ikea` failed audit: CTA URL `sitecore.com/contact` 404 (given by marketer), empty internal secondary link, invented testimonial, slogan stats, titles over 40 chars, low account density, FAQ topics off-spec |
| 2026-10-29 | Sage, from the Page builder chat with the IKEA page open | No Sage page: `create_page` not exposed. The agent probed update tools and created empty versions 2 and 3 of `sitecoreai-for-ikea`. Fixed by decision 12 |
| 2026-10-29 | Updated skill, no brand context selected | Stopped at step 1: "The Sitecore brand context is not available in this session." Guard works. The Studio export shows `defaultContext` reduced to `sitecore-ai-knowledge` and `contextRequirements` added (Brand Context, Pages, Content Items); `agent.json` synced to the export |
| 2026-10-29 | Brand context selected | Stopped at step 1: "Page creation is not available here." False stop from the upfront tool-list check; check moved to the write step |
| 2026-10-29 | "List all available tools" | `create_page` exists only in `marketer_mcp` (fields as `[{"Field": value}]`); `pages` has `duplicate_page` and version-creating `update_page_*`; `marketer_mcp` reads brand contexts by ID; `search_assets` with tags is in `marketer_mcp`; `skill_runtime.bash` available. Skill rewritten to `marketer_mcp`, Agent API toggles off |
| 2026-10-29 | Sage, after the `marketer_mcp` rewrite | `/lp/sage-briefing` created as version 1 only; all limits met; stats sourced (CIMIC customer story); testimonial empty for lack of a validated quote. `get_page_preview_url` returns a malformed URL that embeds the editing host's protection key and fails with 401: to be replaced by a Page builder link |
| 2026-10-29 | Page builder link | Report gives "Open in Page builder" built from a fixed pattern (organization and tenant of the sitecore-demo environment, item ID, version); `get_page_preview_url` removed from the skill |
