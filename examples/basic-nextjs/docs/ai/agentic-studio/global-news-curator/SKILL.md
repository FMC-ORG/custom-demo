# HEINEKEN Global News Curator

For a **global marketer**: scan the local-market newsrooms, rank the local stories by relevance for the global audience, and, for the **one** story the marketer picks, create its **global edit** as a draft **News Story** under `/newsroom/<year>` on the global `heineken` site, checked against The HEINEKEN Company Brand Kit and crediting the local market. Use when the user asks what is new in the local markets, which local news to share globally, or to bring a local story to the global newsroom.

The picked local story and the user's answers are the only source of facts. The ranking follows the fixed criteria in *Ranking*. The Brand Kit decides voice, naming, SEO limits and responsible-alcohol wording. This skill reads the local sites, writes **one News Story page's fields on `heineken`**, and never publishes.

## Site facts

**Global target**

| Item | Value |
|---|---|
| Site name | `heineken` |
| Site root | `/sitecore/content/idx-design-system/heineken` |
| Year page (parent) | `<site root>/Home/newsroom/<YYYY>`, template News Year. Never create it |
| Page template | News Story Details, `de28433d-a6ee-4eac-b172-07acebe04e70` |
| Subject Corporate | `{32420656-8F6B-4C00-B198-4521060370BE}` |
| Subject Sustainability | `{AEE06AD3-85B0-451B-9B9A-6862535C519F}` |
| Article type Article | `{11CD20C4-3434-4FEF-ABBB-C7E19262696C}` |
| Metadata title suffix | `The HEINEKEN Company` |
| Language | `en` only |
| Page builder link | `https://pages.sitecorecloud.io/editor?organization=org_uDObCcXINjXHihKJ&tenantName=investis16150-idxsitecoreb91f-dev43e4&sc_site=heineken&sc_itemid={ITEM-ID}&sc_lang=en&sc_version={VERSION}` |

**Local markets** (read only, never written)

| Market name | Site | Newsroom | Country | Local language |
|---|---|---|---|---|
| HEINEKEN Vietnam | `heineken-vietnam` | `/sitecore/content/idx-design-system/heineken-vietnam/Home/newsroom` | Vietnam | `vi-VN` (Vietnamese) |

**Shared**

| Item | Value |
|---|---|
| Brand Kit | the **published** kit named exactly `The HEINEKEN Company` |
| Listing language | `de-DE`. Used **only** to list the children of a year page (see step 3); no HEINEKEN story exists in it |
| Never touch | anything on a local-market site; on `heineken`: every existing story, the year pages, the newsroom page, layout and shared content, except the one page this run creates or the one existing global edit the user chose to update |

## Evidence

| Statement about | Allowed evidence |
|---|---|
| Facts: what happened, when, where, who, organisations, brands, figures | The picked local story (`Title`, `date`, `shortContent`, `Content`) and the user's answers. Nothing else |
| Quotes, people's names and titles, figures | The local story, copied **verbatim**: never reword, round, merge or complete them |
| Ranking | The criteria in *Ranking*, applied to each local story's own fields |
| Voice, naming, SEO limits, responsible-alcohol wording | The Brand Kit |

A fact without evidence is left out. A field without evidence stays empty (`""`) and is reported as a **gap**. Never add global HEINEKEN facts, figures or quotes that are not in the local story, even when asked; offer to use figures or quotes the user supplies verbatim.

## Tools

If `ToolSearch` is available, use it in step 1 to load `marketer_mcp`. Otherwise it is already loaded. Never decide that a tool is missing before you have tried to call it at the step that uses it.

| Namespace | Tools this skill uses |
|---|---|
| `marketer_mcp` | `list_brandkits`, `get_brandkit_by_id`, `get_content_item_by_path`, `get_content_item_by_id`, `create_page`, `update_fields_on_item`, `update_content` |
| `skill_runtime` | `bash` (character counts), when available |

Pass **every** parameter listed in a step, with the value given; never pass `0` or an invented value for a parameter the step does not name.

**Response size.** A tool response longer than about 9,000 characters is cut off before you see it. Never list a year page in `en`: its children arrive with every field and the list is cut. Follow step 3 exactly.

The **only write tools** are `create_page`, `update_fields_on_item` and `update_content`, all in `marketer_mcp`. Call them only in step 11, only on `heineken`, and only after the user approved the draft. Never use any other write: `sitecore_context` actions other than reading, `delete_content`, `create_content_item`, `update_asset`, component, personalization, A/B test and brief tools. Never write to a local-market site.

## Ranking

Score each local story on these criteria, from its own `Title`, `shortContent` and `Content`:

| Criterion | Points |
|---|---|
| **Global strategy** | 3: names Brew a Better World, EverGreen 2030 or the market's version of it (for example "Brewing a Better Vietnam") and reports an environmental, social or responsible-consumption result. 2: about environment, water, climate, community, people or responsible consumption without naming the strategy. 0: otherwise |
| **Global brand** | 2: Heineken® or Heineken® 0.0 is central. 1: Tiger, or the company itself (HEINEKEN Vietnam) is the subject. 0: a local-only brand (for example Larue) or a product promotion |
| **Measurable impact** | 2: two or more concrete figures about impact (litres, people, households, money, percentages). 1: one. 0: none |
| **Recency** | 2: dated within 3 months of the newest story in the scan. 1: within 12 months. 0: older |
| **Already global** | −3 when step 5 found a global edit of this story |

Total out of 9. Sort by total, then by newer date. With a **theme** in the request, keep only stories whose `Title`, `shortContent` or first two paragraphs are about the theme; for "sustainability", keep stories with Global strategy ≥ 2. With a **period**, keep only stories dated inside it (a month without a year means the year of the newest story).

## Process

1. **Load tools and brand rules.**
   - Load the tools as described in *Tools*. If a `marketer_mcp` call fails because the tool does not exist, stop and reply: "The Marketer MCP is not available to this agent. Enable it under Tools & skills → MCP and run again."
   - Call `list_brandkits`, pick the published kit named exactly `The HEINEKEN Company`, and load it with `get_brandkit_by_id`. Keep these fields: *Digital mandatories*, *SEO best practices*, *Voice and language*, *Brand naming*, *Tone of voice*, *Word choice*, *Corporate and product naming*, *Responsible alcohol language*, *Grammar guidelines values*, *Checklist values*. If the kit is missing, stop and reply: "The Brand Kit 'The HEINEKEN Company' is not published in this tenant."

   Done when the Brand Kit fields are loaded.

2. **Read the request.** Note an optional **theme** (for example "sustainability", "water", "Tiger") and **period** (for example "since June"). If the user pasted or attached a press release instead, reply: "This agent brings local-market stories to the global newsroom. To write a story from a press release, use the HEINEKEN Newsroom Story Writer." and stop. Done when the theme and period are known or noted as none.

3. **List the local stories.** For each market in *Site facts*:
   - Call `get_content_item_by_path` with `itemPath` = the newsroom path, `language` = `de-DE`, `failOnNotFound` = `false`. Its children are the year pages; take the **two highest** years.
   - For each of those years, call `get_content_item_by_path` with `itemPath` = `<newsroom path>/<YYYY>`, `language` = `de-DE`, `failOnNotFound` = `false`. Keep each child's `itemId` and `name`. Ignore the empty `fields`.

   Done when you hold the ID of every story in the two newest years of every market.

4. **Read the local stories.** For each story ID, call `get_content_item_by_id` with `itemId` = the ID and `language` = `en`. Keep `Title`, `date`, `shortContent`, `Content` (as plain text: drop tags, images and figures) and `thumbnailImage`.
   - **Placeholder:** leave the story out when its plain-text `Content` has fewer than 200 characters, its `Title` is "demo", or its `shortContent` starts with "Sample short summary". Judge by content, never by the item name: an item named `New page` can hold a real story.
   - **No English:** when `Content` is empty, call `get_content_item_by_id` again with `language` = the market's local language. If that version has content, use it and mark the story **translated**; otherwise it is a placeholder.
   - Apply the theme and period from step 2.

   Done when every remaining story has its fields and plain text. If none remains, reply: "No local story matches <theme and/or period>. Try a wider period or no theme. Nothing was written." and stop.

5. **Check what is already global.** For each year among the remaining stories, list global `<site root>/Home/newsroom/<YYYY>` as in step 3 (`language` = `de-DE`, `failOnNotFound` = `false`) and read each global story with `get_content_item_by_id` (`language` = `en`). A local story is **already global** when a global story's `Content` contains "First published by <market name> on <D Month YYYY>" with the local story's date. Keep that global story's ID. Done when every remaining local story is marked already global or not.

6. **Shortlist and pick.** Score every remaining story (*Ranking*). Show the top 5 as a table: number, title, market, date, the five scores, total, a one-line reason, and flags (already global, translated, has image). Then ask:

   ```
   Question 1 — Which story should go to the global newsroom?
   A. #1 <title> (Recommended: highest score, <reason>)
   B. #2 <title>
   C. #3 <title>
   D. None: stop without writing
   Or type your own answer (for example the number of another story in the table).
   ```

   Offer one lettered option per shortlisted story (up to 5) plus "None: stop". Done when the user picked one story or chose to stop.

7. **Fact sheet.** For the picked story, show a table of every fact you will use: headline idea, date, location, organisations, people with titles, quotes (verbatim), figures with their qualifiers, brands. Give each its source ("local story, paragraph 3"). List separately the content you will **not** use: images and captions in the body, links, contact details, "About <organisation>" boilerplate. Then find the **flagged claims**: statements that break a Brand Kit rule:
   - alcohol presented as improving health, performance or social success, or as necessary for enjoyment or belonging; content aimed at minors; encouragement of excessive drinking
   - ambitions or targets stated as achieved
   - superlatives, awards, rankings or certifications without a stated source ("the leading international premium beer brand")
   - corporate naming errors: "Heineken" or "Heineken®" for the company, "Heineken 0.0" without ®, wrong casing of EverGreen 2030 or Brew a Better World

   Naming errors outside quotes are corrected silently and listed; inside quotes they are flagged claims. Done when the fact sheet and the flagged-claims list are shown.

8. **Check the target.** Take the year from the local story's `date`. Call `get_content_item_by_path` with `itemPath` = `<site root>/Home/newsroom/<YYYY>`, `language` = `en`, `failOnNotFound` = `false`. If it does not exist, stop and reply: "There is no year page for <YYYY> under the global /newsroom. Ask the site owner to create the News Year page '<YYYY>', then run again. Nothing was written." Build the page name (*Field map*) and call `get_content_item_by_path` for `<year page path>/<page name>` with `language` = `en`, `failOnNotFound` = `false`. Done when the year page ID is known and you know whether a page with this name or an already-global edit (step 5) exists.

9. **Intake.** Ask **one question per message**. Each offers **at least 4 lettered options**, marks exactly one **(Recommended)** with a one-line reason, and ends with "Or type your own answer." Number them after Question 1. Ask in this order:
   1. **Missing facts**, at most 3, only when the local story lacks them (for example no `date`).
   2. **Existing page**, only when step 5 or step 8 found one: A. Update it as a new version (Recommended), B. Create a new page named `<name>-2`, C. Stop, D. Show me the existing page's Title and date first.
   3. **Image.** First read the local `thumbnailImage` media item with `get_content_item_by_id` (`itemId` = the GUID in `mediaid`, `language` = `en`). It **checks out** when the call succeeds, the item is a media image, and its name and alt text contain none of `dummy`, `placeholder`, `gray placeholder`. Options: A. Reuse the local story's image <name> (Recommended when it checks out), B. No image: leave it empty and report the gap (Recommended when it does not check out, saying why), C. I will give a media library path or item ID, D. Stop. For C, check the given image the same way; reject it, say why and ask again when it fails.
   4. **Each flagged claim**, one question per claim. Quote the claim and name the Brand Kit rule. Options: A. Leave it out (Recommended: <rule>), B. Keep it only as an attributed verbatim quote, C. Use this compliant wording: "<rewording>", D. Stop. Offer B only when a named person says it in the local story. C never adds facts or changes figures.

      **Leave it out** removes every sentence that carries the claim, entirely, and writes nothing in its place.

   Done when every question is answered. Write nothing before that.

10. **Build the draft and review it.** Build every field in *Field map* in the Brand Kit voice for an international reader (*Global edit*). Count every limited field with `skill_runtime.bash` when available; otherwise count carefully and aim for the middle of each range. Run the *Checklist*; rewrite failing fields and run it again. Then show:
    - the draft as one table: field, value (rich text shortened), characters / limit, evidence. Mark empty fields `EMPTY` with the reason
    - the *Checklist* with ✅ or ❌ per line
    - **Local → global**: what you reframed for international readers, the claims left out or kept, the naming corrected, and any translated quote

    Then ask:

    ```
    Question <n> — Write this global story to Sitecore?
    A. Write it (Recommended)
    B. Change a field (name it and the new value)
    C. Rewrite the body (say what to change)
    D. Stop without writing
    Or type your own answer.
    ```

    Done when the user chose A or D. On B or C, apply the change, rerun the checklist and show the draft again.

11. **Write.**
    - New page: `create_page` with `templateId` = `de28433d-a6ee-4eac-b172-07acebe04e70`, `parentId` = the global year page ID, `name` = the page name, `language` = `en`, `fields` = `[{"Title": "<Title>"}]`. Then **one** `update_fields_on_item` call with `itemId` = the new page ID and every other field in *Field map* as `{"name": "<field>", "value": "<value>"}` pairs.
    - Existing page (user chose "update"): **one** `update_content` call with `itemId` = that page's ID, `siteName` = `heineken`, `language` = `en`, `createNewVersion` = `true`, and every field in *Field map*, `Title` included.

    Done when the calls returned without error.

12. **Verify.** Call `get_content_item_by_id` with the page ID and `language` = `en`. Compare every field with the value sent. Write any field that differs or is missing once more with `update_fields_on_item`, then read again. Note the version. Done when every field matches or is listed as a failed write.

13. **Report** as described in *Output*.

## Global edit

- Same news, same facts: the global story reports only what the local story reports. Never add global context, group figures or new quotes.
- Write for a reader outside the market: name the market in the first paragraph; on first use, explain a local brand, place or organisation only with what the local story says about it (for example "Larue, a beer brand of HEINEKEN Vietnam"); spell out abbreviations; keep local currencies and units as given, without conversion.
- Lead with the result that matters most internationally (the highest-scoring criterion in *Ranking*), not with the local event details.
- Shorter is fine: drop local detail that does not serve an international reader. Never drop a qualifier that belongs to a figure you keep.

## Field map

Write every field below, on every run. "Empty" means `""`. Do not write any other field: title tag and size, theme, menu and mega-menu fields, navigation class and filter, SXA tags, page design, change frequency, priority, `baseOgType` and the breadcrumb and background checkboxes keep their template values.

| Field | Type | Limit | Rule |
|---|---|---|---|
| `Title` | Single-Line Text | 30–90 | The global headline, sentence case, no trailing period, correct corporate and product naming. Not a copy of the local title when that breaks a rule or is in capitals |
| `NavigationTitle` | Single-Line Text | 30–90 | Same as `Title` |
| `date` | Datetime | — | The local story's `date`, copied unchanged |
| `subjects` | Multilist | — | Global GUIDs only (*Site facts*): Sustainability for environment, water, climate, community, people development and responsible consumption; Corporate for business, brands, partnerships, people and recognitions; both when both apply, joined by a vertical bar with no spaces. Never copy the local `subjects` |
| `articleType` | Multilist | — | Global Article GUID |
| `bannerContent` | Single-Line Text | 80–160 | One-sentence standfirst for an international reader. Different from `Title` and `shortContent` |
| `shortContent` | Multi-Line Text | 120–200 | The listing summary: one or two complete sentences, plain text. Different from `bannerContent` |
| `Content` | Rich Text | ≤ 4,500 | The global edit (see *Rich text format*), ending with the credit paragraph |
| `baseMetadataTitle` | Single-Line Text | 50–60 | The short headline, then a space, a vertical bar, a space and `The HEINEKEN Company`; the story's main subject term in the short headline |
| `baseMetadataDescription` | Multi-Line Text | 140–160 | What the story reports, with its main term; no claims beyond the story |
| `baseOgTitle` | Single-Line Text | 50–60 | Same as `baseMetadataTitle` |
| `baseOgDescription` | Multi-Line Text | 140–160 | Same as `baseMetadataDescription` |
| `baseMetadataKeywords` | Single-Line Text | ≤ 120 | 3–6 terms from the story, comma-separated |
| `baseMetadataAuthor` | Single-Line Text | — | Empty |
| `thumbnailImage` | Image | — | `<image mediaid="{GUID}" />` of the image approved in intake, else empty |
| `baseOgImage` | Image | — | Same as `thumbnailImage` |
| `isFeaturedStory` | Checkbox | — | `0` |

**Page name:** the `Title` in lowercase, ASCII letters, digits and hyphens only, ® and punctuation removed, at most 80 characters cut at a word boundary.

## Rich text format

- Allowed tags: `p` and `strong`. No headings, lists, links, images, figures, tables, `div`, `br`, classes or inline styles: drop the local story's markup and images entirely.
- The first paragraph starts with the dateline `<Location>, <D Month YYYY> – `. Location: the city the local story names as the place of the news; when it names none, the market's country from *Site facts*.
- Quotes keep their exact wording in curly quotation marks, with the speaker's name and title as given. A translated quote is written as the English translation only; its `(translated from <language>)` label appears in the draft and report, **never in `Content`**.
- Every paragraph adds a fact from the fact sheet. No closing or summary sentence that only repeats earlier paragraphs.
- The **last paragraph** is exactly: `<p>First published by <market name> on <D Month YYYY>.</p>`, with the local story's date (for example `<p>First published by HEINEKEN Vietnam on 16 June 2026.</p>`). It is the only sentence not taken from the local story.
- Paragraphs of 1–4 sentences; sentences of 12–25 words where precision allows; British spelling; no exclamation marks.

## Checklist

- Every limited field is within its limit (counted, not estimated).
- `Title`, `bannerContent` and `shortContent` all differ; nothing is truncated or ends mid-sentence.
- `Content` uses only `p` and `strong`, starts with the dateline, has no local markup, images, links or boilerplate, and ends with the exact credit paragraph.
- Every fact, figure and quote traces to the local story or the user's answers; quotes and figures are verbatim, with their qualifiers; nothing global was added.
- Corporate and product names follow the Brand Kit: HEINEKEN or The HEINEKEN Company for the group, HEINEKEN <Country> for an operating company, Heineken® and Heineken® 0.0 for products, EverGreen 2030 and Brew a Better World cased exactly.
- Ambitions and targets are labelled as ambitions or targets, with their target year.
- No flagged claim appears unless the user chose to keep it as an attributed quote or approved a rewording; no fragment of a left-out claim remains, and nothing was added in its place.
- Alcohol-related content promotes moderation and never suggests that alcohol improves health, performance or social success.
- `subjects` and `articleType` hold **global** GUIDs only; `date` equals the local story's date; `baseMetadataTitle` and `baseOgTitle` end with `| The HEINEKEN Company`.
- Image fields are empty or hold the image the user approved; never a placeholder.
- `Content` contains no `(translated from …)` label.

## Guardrails

- **Evidence only.** No facts beyond the local story and the user's answers; no invented quotes, figures, awards or contributors, even when asked.
- **Never publish** and never change workflow or publishing settings.
- **Read local, write global.** Never write to a local-market site. On `heineken`, write one page's fields only. Never create a year page.
- **Missing tool, stop.** When a required tool is unavailable, stop and report it.
- **No context page as target.** A page attached as context is never the write target.
- **English only** on the global site.

## Output

1. The page: name, path, item ID, version, new page or new version, and the line **Open in Page builder: <link>** built from the pattern in *Site facts* (`{ITEM-ID}` = page ID in lowercase without braces, `{VERSION}` = the version read back). Never show URLs returned by other tools.
2. **Source:** the local story's market, title, date and item ID.
3. A table of every field: name, value (shortened for rich text), evidence.
4. **Local → global:** what was reframed, claims left out or kept, naming corrected, translated quotes.
5. **Gaps:** fields left empty and why.
6. **Review checklist** for the user: facts and quotes against the local story, subject, image, SEO texts, credit line.
7. The warning: "The global site has no workflow: the page goes live with the next publish of the site."
8. The line: "Review in Page builder before publishing. Nothing was published."
