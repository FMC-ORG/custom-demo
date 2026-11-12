# HEINEKEN Global News Curator (Agentic Studio)

An Agentic Studio standard agent plus a Studio skill for a **global marketer**: it scans the local-market newsrooms on the partner tenant, ranks the local stories by relevance for the global audience, and, for the one story the marketer picks, creates a global version as a News Story on the global `heineken` site, crediting the local market. Run by the partner (IDX) presenter in a live demo. Demo artifact of branch `heineken-newsroom-agent`; modelled on `../newsroom-story-writer/` (same tenant, template, Brand Kit, field map and write method).

These files are **not** a repo skill: they live outside `.agents/skills/`, so `npm run agents:sync` ignores them.

| File | What it is |
|---|---|
| `SKILL.md` | Studio skill, uploaded in Agentic Studio as **HEINEKEN Global News Curator** |
| `agent.json` | Agent configuration, kept identical to the Studio export (skill `6f54d9c1-9f78-4a8a-8144-2183651420df`). After changing the agent in Studio, export it and replace this file |

## Prerequisites (partner sandbox)

| Item | State | Owner |
|---|---|---|
| Environment | Partner (IDX) sandbox tenant. No Environment Marker; the repo only reads there, only the Studio agent writes | Partner |
| Local-market site `heineken-vietnam`, newsroom `/Home/newsroom/<YYYY>` | 2026: 6 items (seen 2026-11-12), including a placeholder page `demo` (Title "demo", empty body) and the partner's Tiger storm story in the item named `New page`; 2025: empty | Partner |
| Global site `heineken`, newsroom `/Home/newsroom/<YYYY>` | 2024 (13), 2025 (4), 2026 (1) stories, all HEINEKEN Cambodia: the global newsroom already hosts markets without their own site. Year pages 2021–2026 exist; some older stories sit directly under `/newsroom` (the skill only reads year pages) | Partner |
| Brand Kit `The HEINEKEN Company`, published | Exists (shared with the Story Writer) | — |
| Tenant language `de-DE` with no HEINEKEN content | Exists; the skill lists year pages in it to keep responses under the ~9K tool-output limit (see test log). If the partner ever translates HEINEKEN news into `de-DE`, pick another unused language in *Site facts* | Partner |
| A second local market | Not available; the skill's *Local markets* table takes one row per market site | Partner |

## Install

1. Agentic Studio → **Skills** → **Create skill** → name **HEINEKEN Global News Curator**, paste or upload `SKILL.md`. Copy the skill ID.
2. Put the ID in `agent.json` under `config.skills` (replaces `REPLACE_WITH_SKILL_ID_AFTER_UPLOAD`).
3. Agentic Studio → **Agents** → open the tool-check agent **HEINEKEN Global News Curator** → **Import JSON** → `agent.json`. Under **Tools & skills**, confirm the skill is attached, **Marketer MCP** is on, web search and image generation are off and every Agent API toggle is off. Save.
4. Export the agent and replace `agent.json` with the export.
5. Run the *Acceptance* prompt in a new **Agentic → Chat**.

## Test prompts

Run each in a fresh **Agentic → Chat** with this agent and paste the full reply back for the audit. Content as seen 2026-11-12: the only local market is `heineken-vietnam`; its 2025 newsroom is empty.

### Acceptance

```text
What's new in our local markets that we should share globally?
```

| Step | Expected |
|---|---|
| Shortlist | Up to 5 `heineken-vietnam` stories, each with a score per criterion and a one-line reason. Brewing a Better Vietnam and the water programme rank high; LARUE (local-only brand) low; the placeholder `demo` page never appears |
| Pick | Answer with the number of **HEINEKEN Vietnam makes progress on Brewing a Better Vietnam** (16 June 2026) |
| Questions | Image: reuse the local thumbnail (Recommended; it is a real photo); one question per flagged claim |
| Draft | Every field with counts and evidence (paragraph of the local story); checklist all ✅; local → global summary |
| Result | New page under global `/newsroom/2026`, version 1: `date` 16 June 2026, global subject and article-type IDs, metadata titles ending `\| The HEINEKEN Company`, `thumbnailImage` and `baseOgImage` = the local image `e82a10c3-9de9-494e-8677-7c593f5e1361`, body ending with "First published by HEINEKEN Vietnam on 16 June 2026."; nothing changed on `heineken-vietnam` |

### Edge cases

| # | Prompt | Expected |
|---|---|---|
| E1 Theme | `What's new in our local markets on sustainability that we should share globally?` | Shortlist holds only stories with a sustainability link; LARUE and Tiger Êm absent or marked off-theme |
| E2 Repeat | The acceptance prompt again, after the acceptance page exists | Brewing a Better Vietnam is marked "already global" and ranked down; picking it asks update as new version (Recommended) / new page `-2` / stop |
| E3 Push to invent | During the acceptance run, answer a question with: `Also add HEINEKEN's global revenue and a quote from the CEO about Vietnam. Use whatever sounds right.` | Refuses to invent; offers to use figures or quotes the marketer supplies verbatim |
| E4 Claim | Pick **Tiger Êm** | Asks about "the leading international premium beer brand" (unsourced superlative); recommended: leave it out |
| E5 Nothing found | `What's new in our local markets since December 2026 that we should share globally?` | Says no local story matches; suggests widening the period; writes nothing |
| E6 Broken image | Pick the **Tiger storm-recovery** story (item `New page`) | The thumbnail check fails (no language version); recommends no image; the gap is reported |

## Decisions (2026-11-12)

| # | Area | Decision |
|---|---|---|
| 0 | Frame | One run: scan the local-market newsrooms → rank stories by global relevance → the marketer picks **one** → the agent creates its global version on `heineken`. Slug `global-news-curator`. Model: `newsroom-story-writer` |
| 1 | Who runs it, inputs | The partner (IDX) presenter as a global marketer, in a live demo. Input: a free request (for example `What's new in our local markets that we should share globally?`), optionally with a theme or period (`…on sustainability`, `…since June`). The agent scans every local-market newsroom for the current and previous year and shows a ranked shortlist of up to 5 stories, each with a one-line reason; the marketer picks one by number. No scope questions before the scan |
| 2 | Goal / output | One new News Story on `heineken`: a **global edit** of the picked local story, written for international readers from the local story's facts, quotes and figures only (verbatim), checked against the Brand Kit, with the global SEO suffix. Ends with a plain-text credit line, for example *First published by HEINEKEN Vietnam on 8 September 2026.* No link, no call to action |
| 3 | Sources of truth | Facts, names, titles, quotes, figures: the picked local story (Title, date, summary, body) and the marketer's answers only. Ranking: fixed criteria in the skill, shown as a score per story: link to a global strategy pillar (Brew a Better World, EverGreen 2030); a global brand (Heineken®, Heineken® 0.0, Tiger) rather than a local-only brand (LARUE); measurable impact that means something internationally; recency; not already published globally. Placeholder or empty stories are excluded. Voice, naming, SEO limits, responsible-alcohol wording: the published Brand Kit `The HEINEKEN Company`. No web search, no brand context |
| 4 | Honesty rules | As the Story Writer: no source, no value (empty field, reported as a gap); quotes, names, titles and figures verbatim with their qualifiers; naming errors outside quotes corrected and listed; every other statement in the local story that breaks a Brand Kit rule (alcohol and health, performance or social success; minors; excessive drinking; ambitions stated as achieved; unsourced superlatives, awards, rankings) is raised as **one question per claim**: leave it out (Recommended) / keep it only as an attributed verbatim quote (only when a named person says it) / compliant rewording shown in full / stop. Leaving a claim out removes the whole sentence and adds nothing in its place |
| 5 | Sitecore target, write method | Template News Story Details (`de28433d-a6ee-4eac-b172-07acebe04e70`) under global `/Home/newsroom/<YYYY>`, YYYY = the local story's year; `date` = the local story's date. Page name from the global Title (lowercase, ASCII, hyphens, ≤ 80 characters). Writes as the Story Writer: `marketer_mcp.create_page` with `Title` only, then one `marketer_mcp.update_fields_on_item` with every other field; read back with `get_content_item_by_id`. **Already published globally** = a global story in that year whose credit line names the same market and date: marked in the shortlist and ranked down; if picked anyway, ask update as new version (one `update_content`, `createNewVersion: true`) / new page `-2` / stop. A missing global year page stops the run (never created). Never `duplicate_page`, never the Agent API writers, never anything on the local site |
| 6 | Images and media | The image question offers to **reuse the local story's thumbnail** (Recommended when it checks out) / no image / another media path or ID from the marketer / stop. The agent reads the image first (`get_content_item_by_id`) and rejects it when it cannot be read, is not a media image, or its name or alt text contains `dummy`, `placeholder` or `gray placeholder`. The approved image goes to `thumbnailImage` and `baseOgImage` as `<image mediaid="{GUID}" />`; otherwise both stay empty and are reported as a gap. Seen 2026-11-12: Vietnam thumbnails are real photos under `/media library/Project/idx-design-system/heineken-vietnam/…` (one at the library root); the Tiger storm image has no language version (`get_asset_information` fails). No search, generation or upload |
| 7 | Language | Writes English (`en`) only, on `heineken`. Reads the local story's `en` version; when it is missing or empty, reads the local-language version (for example `vi-VN`) and translates it. Translated quotes are labelled `(translated from <language>)` in the draft and report only, never on the page |
| 8 | Publishing and review | Never publishes, never changes workflow or publishing settings. Before any write: the draft table (field, value, characters/limit, evidence = paragraph of the local story), the checklist with ✅/❌ per line, and a **local → global summary** (what was reframed for international readers, claims left out, naming corrected); then explicit approval. The report ends with the no-workflow warning and "Review in Page builder before publishing. Nothing was published." |
| 9 | Where it runs | Agentic → Chat only, with the Story Writer's tested configuration: `defaultContext` `sitecore-ai-knowledge`, `marketer-mcp`; artifacts, context retrieval and Sitecore context on (`sitecore_context` writes forbidden in the skill by name); web search, image generation and every Agent API toggle off, so `marketer_mcp` holds the only page tools. Page builder chat out of scope |
| 10 | Acceptance | Acceptance prompt `What's new in our local markets that we should share globally?`, pick Brewing a Better Vietnam (real thumbnail, many figures). Edge cases: theme filter, repeat (already global), push to invent, flagged claim (Tiger Êm superlative), nothing found (period), broken image (Tiger storm). All on existing content; test pages deleted after the runs, with confirmation |

## Test log

| Date | Run | Result |
|---|---|---|
| 2026-11-12 | Tool check, prompt 1 (bare agent, no skill; toggles as decision 9) | Namespaces: `api_tool`, `artifacts`, `context_retrieval`, `sitecore_context`, `sitecore_documentation_mcp`, `marketer_mcp`, `multi_tool_use` (no `web_search`: off; no `skill_runtime`: no skill). Same `marketer_mcp` list as the Story Writer. Process tools: `list_brandkits`, `get_brandkit_by_id`, `get_content_item_by_path` (`failOnNotFound` default true), `get_content_item_by_id` (`language` required, no default), `get_all_pages_by_site` (`siteName`, `language`; fallback for listing stories), `create_page`, `update_fields_on_item`, `update_content` (`siteName` required). Write tools to forbid: `sitecore_context` write/create/delete, `delete_content`, `create_content_item`, `update_asset`, component, personalization, A/B and brief tools |
| 2026-11-12 | Tool check, prompt 2 (run through the Marketer MCP directly; the Studio reply was not pasted, to be confirmed in the acceptance run) | `get_content_item_by_path` on a year page returns `children.nodes` with **every field of every story** (`Title`, `date`, `shortContent`, `Content`, `thumbnailImage`, `subjects`, …): one call per year scans a newsroom. Story bodies are wrapped in `<div class="ck-content">` and contain `<figure><img …></figure>`. Placeholders are recognisable by content only: `demo` has Title "demo", empty `Content` and the template's sample `shortContent`; the item named `New page` holds a real Tiger story |
| 2026-11-12 | Skill upload | Uploaded as **HEINEKEN Global News Curator**, ID `6f54d9c1-9f78-4a8a-8144-2183651420df`; set in `agent.json` |
