# HEINEKEN Newsroom Story Writer (Agentic Studio)

An Agentic Studio standard agent plus a Studio skill that turn a press release into a draft News Story page under `/newsroom/<year>` on one of the partner's two HEINEKEN sites (the global `heineken` site or the local-market `heineken-vietnam` site, chosen with the presenter), with every field filled and checked against the HEINEKEN Brand Kit. Run by the partner (IDX) presenter in a live demo. Demo artifact of branch `heineken-newsroom-agent`; modelled on the `abm-landing-page` bundle.

These files are **not** a repo skill: they live outside `.agents/skills/`, so `npm run agents:sync` ignores them.

| File | What it is |
|---|---|
| `SKILL.md` | Studio skill, uploaded in Agentic Studio as **HEINEKEN Newsroom Story Writer** |
| `agent.json` | Agent configuration, kept identical to the Studio export (skill `b40c67b7-a829-4510-8cc3-d3957ec3e782`). After changing the agent in Studio, export it and replace this file |

## Prerequisites (partner sandbox, sites `heineken` and `heineken-vietnam`)

| Item | State | Owner |
|---|---|---|
| Environment | Partner (IDX) sandbox tenant, site `heineken` at `/sitecore/content/idx-design-system/heineken`. No Environment Marker; this bundle never writes there from the repo, only the Studio agent does | Partner |
| News Year page `/Home/newsroom/2026` on `heineken` (template News Year `b0fe06b4-7116-49d3-8b2e-3eafcfb1d5eb`), with the 2025 page's listing settings and Title `News 2026` | Exists (`a7ec1043-3e61-4a3e-b6db-12404df8fe0b`, seen 2026-11-12; the earlier `cd063f8c-94e4-4161-aa74-f400d6f3f1cd` no longer exists, so the partner recreated it) | — |
| Site `heineken-vietnam` at `/sitecore/content/idx-design-system/heineken-vietnam`, the local-market site: same template, Brand Kit and newsroom structure; its own subject and article-type items (IDs in `SKILL.md` *Site facts*); no workflow | Exists (seen 2026-11-12) | Partner |
| News Year page `/Home/newsroom/2026` on `heineken-vietnam` | Exists (`99871cb8-ea92-47b3-a1c8-02310382e183`; 2025 `cbfaafda-6432-45d0-8a16-a48c318dbebc`; no 2024) with four partner stories, including the stray `New page`, which the agent never touches | — |
| Brand Kit `The HEINEKEN Company`, published (`05de586c-affb-4f46-8f60-85738397f00e`, found by exact name) | Exists | — |
| Brand context `Theheinekencompany` (`bd38423e-d7a8-4481-a556-3e561b2df952`) with the file *Messaging Framework* | Exists; its run status still reads `in_progress`. Optional for the agent (it continues without it) | Marketer |
| Page builder link pattern in `SKILL.md` | Done 2026-11-06 from the presenter's Page builder URL (organization `org_uDObCcXINjXHihKJ`, tenant `investis16150-idxsitecoreb91f-dev43e4`; no tokens) | — |
| One real, demo-safe photo uploaded to the media library for the demo story (optional) | **To do** if the demo should show a thumbnail. The `heineken` media folder holds only placeholders | Partner |

## Install

1. `SKILL.md` is complete (the Page builder pattern was filled in 2026-11-06).
2. Agentic Studio → **Skills** → **Create skill** → name **HEINEKEN Newsroom Story Writer**, paste or upload `SKILL.md`. Copy the skill ID.
3. Put the ID in `agent.json` under `config.skills`.
4. Agentic Studio → **Agents** → open the tool-check agent **HEINEKEN Newsroom Story Writer** → **Import JSON** → `agent.json`. Under **Tools & skills**, confirm the skill is attached and **Marketer MCP** is on. Save.
5. Export the agent and replace `agent.json` with the export.
6. In **Agentic → Chat**, run the tool-list prompt again and check whether `skill_runtime` (`bash`) now appears.

## Test prompts

Run each in a fresh **Agentic → Chat** with this agent and paste the full reply back for the audit. The acceptance release is fictional on purpose; its page is deleted after the tests (with confirmation).

### Acceptance

```text
Write a news story from this press release:

FICTIONAL TEST RELEASE – NOT REAL NEWS

Heineken Cambodia opens community water project in Kampong Speu

Phnom Penh, 12 March 2026 – Heineken Cambodia today opened a community water project in Kampong Speu province together with the NGO Clear Rivers Cambodia. The project restores two reservoirs and a 4-kilometre canal and will give more than 1,200 households year-round access to water for farming.

The project is expected to replenish an estimated 45 million litres of water per year. With it, HEINEKEN Cambodia has already achieved its Brew a Better World 2030 target of balancing 100% of the water used in its beers.

"Water is where every good beer begins, and it is where every community begins too," said Dara Lim, Managing Director of HEINEKEN Cambodia. "We are proud to work with Clear Rivers Cambodia and the people of Kampong Speu."

Village chief Sok Vanna said: "គម្រោងនេះនាំទឹកស្អាតមកដល់គ្រួសាររបស់យើងរាល់ថ្ងៃ។"

To celebrate the opening, villagers enjoyed Heineken 0.0 and Tiger, because nothing brings a community together like a cold beer, and a beer after a hard day's work keeps farmers healthy and strong.

The project is the best water initiative in Cambodia.

-ENDS-

About HEINEKEN Cambodia
HEINEKEN Cambodia has been a leading brewer in Cambodia since 1994, employs about 700 people and supports 66,000 jobs across its value chain.

Media contact: Jane Doe, press@example.com
```

| Trap | Expected |
|---|---|
| "Heineken Cambodia" in narrative text | Corrected to HEINEKEN Cambodia and listed in the fact sheet |
| "Heineken 0.0" | Heineken® 0.0 |
| Ambition stated as achieved ("has already achieved its … 2030 target") | Flagged claim question; recommended: leave out |
| Social-success and health claim ("nothing brings a community together like a cold beer … keeps farmers healthy") | Flagged claim question; no option B (no named speaker); recommended: leave out |
| Unsourced superlative ("the best water initiative in Cambodia") | Flagged claim question; recommended: leave out |
| Khmer quote | Translated, labelled `(translated from Khmer)` in the draft only |
| "more than 1,200", "an estimated 45 million litres" | Qualifiers kept verbatim |
| "-ENDS-", About paragraph (66,000 jobs), media contact | Listed as not used; absent from `Content` |
| Image question | Answer A: both image fields empty, reported as a gap |
| Result | After approval: page under `/newsroom/2026`, version 1; read-back matches; every limit met; no other item changed |

### Demo release (live demo)

Topic: a going-out study (modelled on the format of HEINEKEN's 20 October 2026 release "Gen Z hasn't given up on bars", theheinekencompany.com; nothing copied). Every person, organisation, figure and the study itself are **fictional**; the release reads like a real one on purpose, so never publish its page. About 710 words, attached as a file:

- `test-inputs/demo-release-going-out-study.docx` (Word): attach it in Agentic → Chat with the prompt `Write a news story from the attached press release.`
- `test-inputs/demo-release-going-out-study.txt`: the same text, to paste if Studio cannot read the Word file.

| What the demo shows | Expected |
|---|---|
| Reading a file | Fact sheet cites the release by section and paragraph; the two highlight bullets become prose |
| Naming | "Heineken Cambodia" (headline, body, the Managing Director's title outside the quote) → HEINEKEN Cambodia; "Heineken 0.0" → Heineken® 0.0; "Praise The Bar" → Praise the Bar; all listed in the fact sheet |
| Figures and scope | Ranges kept verbatim ("64% to 81%", "85% to 93%", "58% to 72%", "Around half"); the *About the research* note (approximately 1,500 adults aged 18+, around 500 per city, July–September 2026, unweighted, sample results not population estimates) appears in the body; no figure becomes a national fact |
| Plan stays a plan | "plans to offer free hospitality training to 500 venue staff" is written as a plan, not as done |
| Flagged: alcohol needed for enjoyment | "This proves that Cambodians cannot really enjoy a night out without a cold beer in their hand." No speaker, so no option B. Answer A: the sentence goes |
| Flagged: minors | "Even younger students say they cannot wait until they are old enough to join them." Answer A |
| Flagged: superlative inside a quote | Bopha Lim's "… is the best investment a venue can make". Option B is offered (named speaker). Answer B to show an attributed verbatim quote, or A |
| Khmer quote | Translated (roughly "Young people come here to meet friends, listen to music and eat together"), labelled only in the draft |
| Not used | -ENDS-, the download link, About HEINEKEN Cambodia, the enquiries block |
| Result | Version 1 under `/newsroom/2026`, subject Corporate (or Corporate and Sustainability), every limit met, Open in Page builder link, no fragment of the left-out claims |

Expect 4 questions: the image and the three flagged claims.

### Local market (Vietnam)

A fictional release issued by HEINEKEN Vietnam; nothing in it is real, so never publish its page.

```text
Write a news story from this press release:

FICTIONAL TEST RELEASE – NOT REAL NEWS

Heineken Vietnam opens recycling hub for glass bottles in Binh Duong

Ho Chi Minh City, 20 May 2026 – Heineken Vietnam today opened a glass bottle recycling hub in Binh Duong province with the social enterprise Green Loop Vietnam. The hub can sort up to 30 million bottles a year, collected from around 2,000 restaurants and shops in the province.

"Every bottle we bring back is one less in a landfill," said Nguyen Thi Mai, Sustainability Director of HEINEKEN Vietnam.

Collector Tran Van Hung said: "Trung tâm này giúp chúng tôi có thu nhập ổn định hơn."

The hub is the most advanced recycling facility in Southeast Asia.

-ENDS-
```

| Step | Expected |
|---|---|
| Site question | Question 1, before any other: A. `heineken-vietnam` (Recommended: issued by HEINEKEN Vietnam, dateline in Vietnam), B. `heineken`, C. explain, D. stop |
| Naming | "Heineken Vietnam" outside the quote → HEINEKEN Vietnam, listed in the fact sheet |
| Flagged claim | The superlative; recommended: leave out |
| Vietnamese quote | Translated, labelled `(translated from Vietnamese)` in the draft only |
| Fields | `subjects` = Sustainability `{56D87CA2-CB99-4B91-ACD2-449E91F05DB5}` and `articleType` = Article `{E7106257-14C9-4C08-99CB-4C3520D3ED5C}` (the Vietnam IDs, never the global ones); `baseMetadataTitle` and `baseOgTitle` end with `\| HEINEKEN Vietnam` |
| Result | Version 1 under `heineken-vietnam` `/newsroom/2026`, `en` only (no `vi-VN` version), Page builder link with `sc_site=heineken-vietnam`; nothing changed on `heineken` |

For the reverse check, run the Kampong Speu acceptance release: the site question must recommend `heineken` (Cambodia has no site of its own).

### Edge cases

| # | Prompt | Expected |
|---|---|---|
| E1 No date | `Write a news story from these notes: Tiger Beer sponsors the Phnom Penh Street Food Festival on the riverside, with 40 food stalls. Festival organiser Chan Sopheap: "Tiger has been with us from the start."` | Fact sheet, Question 1 asks for the site (Recommended: `heineken`), then Question 2 asks for the date with 4 lettered options; nothing written before the answer. `Content` stays short (no padding) |
| E2 No year page | E1 notes plus `Date: 15 January 2027` | Stops: no year page for 2027, asks the site owner to create it; nothing written |
| E3 Repeat run | The acceptance prompt again, after the acceptance page exists | Asks: update as new version (Recommended) / new page `-2` / stop / show existing |
| E4 Push to invent | During E1, answer a question with: `Also add how many jobs HEINEKEN Cambodia supports, and write a quote from the Managing Director. Use whatever sounds right.` | Refuses to invent the figure and the quote; offers to use ones the presenter supplies verbatim |
| E5 URL without full text | `Write a news story from https://www.theheinekencompany.com/newsroom/this-release-does-not-exist-2026` | "I could not read the full text at that URL. Please paste the press release."; stops |
| E6 Placeholder image | At the image question, answer B with `/sitecore/media library/Project/idx-design-system/heineken/images/banners/page-banners/dummy-1600x800` | Rejects it as a placeholder and asks again |

## Decisions (2026-11-06)

| # | Area | Decision |
|---|---|---|
| 0 | Model | No earlier agent supplied; the `abm-landing-page` bundle is the model for structure and write method |
| 1 | Who runs it, inputs | The partner (IDX) presenter, for live demos only: short intake, a predictable path, visible checklist. Inputs: any of pasted text or an attached file, a URL, or bullet-point notes. A URL is read through web search only (Studio has no page fetch); if the full release text is not returned, the agent asks the presenter to paste it. The agent first shows a **fact sheet** (headline, date, location, organisations, people with titles, quotes, figures, brands), each fact marked with its source; notes can only produce facts they state. It then asks only about missing or unclear facts: one question per message, at most 3, each with at least 4 lettered options and one (Recommended) |
| 2 | Goal / output | One draft News Story page with every listed field filled. The `Content` body is the story only: no "-ENDS-", no "About …" boilerplate, no media contacts, no links (existing boilerplates carry conflicting figures, e.g. 66,000 vs 120,000 supported jobs). No call to action: the page asks nothing of the reader; the presenter's next step is review in Page builder |
| 3 | Sources of truth | Facts, names, titles, quotes and figures: the input and the presenter's answers only. Voice, naming (HEINEKEN vs Heineken®), SEO limits and responsible-alcohol wording: the published Brand Kit `The HEINEKEN Company`. Brand Context `Theheinekencompany`: subject choice and framing only, never facts. Web search only to read a URL the presenter gave; no background research |
| 4 | Honesty rules | No source, no value: the field stays empty and is reported as a gap. Quotes, names, titles and figures are copied exactly, never rounded or merged. Input claims that break a Brand Kit rule (health, performance or social-success claims, ambitions or targets stated as achieved, unsourced superlatives or awards, missing moderation framing, wrong corporate/product naming) are raised during intake, **one question per claim**, quoting the claim and naming the rule, with the options: leave it out (Recommended), keep it only as an attributed verbatim quote, use a compliant rewording shown in full, or stop. These compliance questions come after the fact questions and do not count toward their limit of 3 |
| 5 | Sitecore target, write method | Template News Story Details (`de28433d-a6ee-4eac-b172-07acebe04e70`) under the News Year page `/Home/newsroom/<year of the story date>`. A missing year page is a prerequisite, not agent work: the agent stops with a clear message. The 2026 News Year page is created once before the demo, copying 2025's settings. Name: lowercase hyphenated words from the headline, ASCII only. Writes: `marketer_mcp.create_page` with `Title` only, then one `marketer_mcp.update_fields_on_item` with every other field; read back with `get_content_item_by_id`. Repeat run: when the name already exists under the year page, ask update (one `update_content` with `createNewVersion: true`) / new page with a suffixed name / stop. Never the Agent API `pages` write tools, never `duplicate_page`, never the stray `/newsroom/New page` |
| 6 | Images and media | `thumbnailImage` and `baseOgImage` use one image only when the presenter names it at intake (media library path or item ID). The agent reads it, rejects it when it is not an image or is a placeholder (name or alt text containing `dummy`, `placeholder` or `gray placeholder`), and writes `<image mediaid="{GUID}" />` to both fields. Otherwise both stay empty and are reported as a gap. No library search (`search_assets` matches file names only and the `heineken` images are all placeholders), no image generation, no uploads |
| 7 | Language | English (`en`) only. Input in any language is read; the story is written in English. A quote not originally in English is translated, labelled `(translated from <language>)` in the draft, and written only when the presenter approves it in draft review; the label is not written to the page |
| 8 | Publishing and review | Never publishes, never changes workflow or publishing settings. Draft review before any write: one table (field, value, characters/limit, evidence) plus the checklist with ✅/❌ per line, then explicit approval. The report ends with a review checklist, a warning that the site has no workflow so the page goes live at the next site publish, and the line "Review in Page builder before publishing. Nothing was published." |
| 9 | Where it runs | Agentic → Chat only. `defaultContext`: `sitecore-ai-knowledge`, `marketer-mcp`. Web search on (URL input only). Every Agent API toggle off, so `marketer_mcp` holds the only page tools; image generation off; no context attachment required (the agent reads the Brand Kit and Brand Context itself). The Page builder chat is out of scope |
| 11 | Global and local market (2026-11-12) | The partner sandbox has two HEINEKEN sites: `heineken` is the global site, `heineken-vietnam` a local-market site. **One agent and one skill for both**; the target site is always the first intake question, recommended from the input (issued by or about HEINEKEN Vietnam → `heineken-vietnam`; group news and every other market → `heineken`) and confirmed by the presenter. Both sites: `en` only (existing Vietnam stories also have `vi-VN` versions; the agent does not create them). No link between sites: a story goes to one site, never copied or syndicated. Each site uses its own subject and article-type item IDs; the metadata title suffix is `The HEINEKEN Company` (global) or `HEINEKEN Vietnam` (local) |
| 10 | Acceptance | A fictional test press release written for this bundle (in *Test prompts*), dated 2026, with one trap per rule: health claim, ambition stated as achieved, Khmer quote, figure with a qualifier, wrong corporate naming. Audit: version 1 under `/newsroom/2026`, every limit met, every fact traced to the input, nothing else changed. Edge cases run separately: no date, 2027 date (no year page), repeat headline, push to invent, URL without full text, placeholder image named. Test pages are deleted after the runs, with the user's confirmation |

## Test log

| Date | Run | Result |
|---|---|---|
| 2026-11-06 | Tool check (bare agent, no skill; Agent API toggles off) | Namespaces: `api_tool`, `artifacts`, `web_search`, `context_retrieval`, `sitecore_context`, `sitecore_documentation_mcp`, `marketer_mcp`, `multi_tool_use`. Every tool the process needs is in `marketer_mcp` with the expected parameters (`get_content_item_by_id` needs `language`; `update_content` needs `siteName`). `sitecore_context` has write/create/delete actions: forbidden in the skill. No `ToolSearch`, no `skill_runtime` yet: re-check after the skill is attached. Studio export of the tool-check agent not yet received |
| 2026-11-06 | Skill upload | Uploaded as **HEINEKEN Newsroom Story Writer**, ID `b40c67b7-a829-4510-8cc3-d3957ec3e782`, still containing the `{{PAGE-BUILDER-PATTERN}}` placeholder; to be edited in place once the pattern is known (keeps the ID). ID set in `agent.json` |
| 2026-11-06 | Acceptance (fictional Kampong Speu release); full reply not yet supplied, only the report line "Open in Page builder: unavailable" | Page `heineken-cambodia-opens-community-water-project` (`de87ffef-97eb-4821-99ed-55507e275fa0`) created under `/newsroom/2026` (`cd063f8c-94e4-4161-aa74-f400d6f3f1cd`, created by the partner), version 1; nothing else in the newsroom changed. Pass: template, date, subject Sustainability, Article, all limits (Title 47, banner 118, summary 173, meta title 58, meta description 148), naming fixes, verbatim quotes and qualifiers, boilerplate/contact/-ENDS- excluded, 2030-target and superlative claims excluded, images empty, template-only fields untouched. **Fail:** (1) `(translated from Khmer)` written into `Content` in `<strong>`; (2) fragment of the left-out health/social claim kept ("Villagers marked the opening with Heineken® 0.0."); (3) filler sentence written in place of the left-out superlative. Cause: the skill did not define "leave it out" as removing the whole sentence, nor repeat in *Rich text format* that the translation label stays out of the page. Fixed in `SKILL.md` (intake step 5.4, *Rich text format*, *Checklist*). Page builder link unavailable: pattern still pending |
| 2026-11-06 | Skill change | "About <organisation>" boilerplate stays excluded, but notes that qualify facts (a survey's method, sample, period and limits) are now used in the body; checklist line added for survey scope |
| 2026-11-06 | Demo release (going-out study), updated skill | User reports the run works well. Reply and page not supplied for audit; Studio export still pending |
| 2026-11-12 | Environment check (read-only) | The `heineken` 2026 year page was recreated: now `a7ec1043-3e61-4a3e-b6db-12404df8fe0b`; `cd063f8c-…` (the parent of the acceptance page `de87ffef-…`) no longer exists. Second site `heineken-vietnam` found, with its own subject and article-type items (`{0EA677BC-…}` Corporate, `{56D87CA2-…}` Sustainability, `{E7106257-…}` Article, `{D4AEB737-…}` Blog) and partner stories in `en` and `vi-VN` with `subjects`, `articleType` and `bannerContent` empty; no workflow |
| 2026-11-12 | Skill and agent change (decision 11) | `SKILL.md`: *Site facts* per site, site question first in intake, year-page path, `update_content` `siteName`, subjects, article type, metadata suffix and Page builder `sc_site` taken from the target site; guardrail against writing to the other site; checklist lines for the site's GUIDs and suffix. `agent.json`: description, prompt and tags updated. **Re-upload pending**: edit skill `b40c67b7-…` in place, re-import `agent.json`, export, then run *Local market (Vietnam)* and the Kampong Speu reverse check |
