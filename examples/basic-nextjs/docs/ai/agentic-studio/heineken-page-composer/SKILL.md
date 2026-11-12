# HEINEKEN Page Composer

Build one landing page on the `heineken` site from a short request: plan the sections from a fixed palette of eight components, draft every field from evidence, and, after one approval, add the components and their datasource items to the **empty page open in Page builder**. Use when the user, in the Page builder chat, asks to build, compose, fill or lay out the open page ("build a landing page about…", "add sections for…").

The user's request decides the layout; facts come only from the user's attached text, their answers and the brand context. The Brand Kit decides voice, naming, SEO limits and responsible-alcohol wording. This skill writes components, their datasource items and five SEO fields of the open page, and never publishes.

## Site facts

| Item | Value |
|---|---|
| Site name | `heineken` |
| Language | `en` (English only) |
| Target | The page open in Page builder (see step 2). Allowed templates: Main Landing Page `a0d80fc5-d1cf-497d-90ab-9fe545dbd49c`, Secondary Landing Page `578c0bff-744b-41bc-aa41-d72881461781` |
| Placeholder | `headless-main` |
| Newsroom page (for News Listings links) | `/sitecore/content/idx-design-system/heineken/Home/newsroom`, `{3EB56520-C465-40EA-81DB-2575619DC97B}` |
| Brand Kit | the **published** kit named exactly `The HEINEKEN Company` |
| Brand context | `Theheinekencompany`, `bd38423e-d7a8-4481-a556-3e561b2df952` (describes the HEINEKEN group, not HEINEKEN Cambodia) |
| Page builder link | `https://pages.sitecorecloud.io/editor?organization=org_uDObCcXINjXHihKJ&tenantName=investis16150-idxsitecoreb91f-dev43e4&sc_site=heineken&sc_itemid={ITEM-ID}&sc_lang=en&sc_version={VERSION}` |

## Evidence

| Statement about | Allowed evidence |
|---|---|
| Facts, figures, names, quotes | First the user's attached or pasted text and their answers; then brand context documents, each fact cited by document name |
| HEINEKEN group facts from the brand context | Allowed only when labelled as group facts ("HEINEKEN, the group…"); never presented as HEINEKEN Cambodia facts |
| Quotes, names, titles, figures | Copied **verbatim** from the source, with qualifiers |
| Voice, naming, SEO limits, responsible-alcohol wording | The Brand Kit |
| Links | Only to existing pages of the `heineken` site, read with `get_content_item_by_path` before use |

A fact without evidence is left out. A field without evidence is written as `""` and reported as a **gap**. Headings and connecting sentences may be written freely, but they state no facts of their own. No web search.

## Tools

If `ToolSearch` is available, use it in step 1 to load `marketer_mcp`. Never decide a tool is missing before trying to call it at the step that uses it.

| Namespace | Tools this skill uses |
|---|---|
| `marketer_mcp` | `list_brandkits`, `get_brandkit_by_id`, `get_brand_context`, `get_brand_context_items`, `get_content_item_by_id`, `get_content_item_by_path`, `get_components_on_page`, `add_component_on_page`, `update_fields_on_item` |
| `skill_runtime` | `bash` (character counts), when available |

The **only write tools** are `add_component_on_page` and `update_fields_on_item`, both in `marketer_mcp`. Call them only in step 8 and step 9, only on the confirmed open page and its new datasource items, and only after the user approved the draft.

Never call: `search_components`, `get_component_detail` or `list_components` (they return same-named components from other sites; use the palette's fixed rendering IDs), `create_component_ds`, `set_component_datasource`, `remove_component_on_page`, `move_component_on_page`, `delete_content`, `create_page`, `create_content_item`, `update_content`, or any `pages`, `content` or `sites` write tool.

## Process

1. **Load tools and brand rules.**
   - Load the tools as described in *Tools*. If a `marketer_mcp` call fails because the tool does not exist, stop: "The Marketer MCP is not available to this agent. Enable it under Tools & skills → MCP and run again."
   - Call `list_brandkits`, pick the published kit named exactly `The HEINEKEN Company`, load it with `get_brandkit_by_id`. Keep *Digital mandatories*, *SEO best practices*, *Voice and language*, *Brand naming*, *Tone of voice*, *Word choice*, *Corporate and product naming*, *Responsible alcohol language*, *Grammar guidelines values*, *Checklist values*. If it is missing, stop: "The Brand Kit 'The HEINEKEN Company' is not published in this tenant."
   - Call `get_brand_context` with the brand context ID and keep its tree. Read documents later, in step 4, only when needed.

   Done when the Brand Kit is loaded and the brand context tree is known.

2. **Identify the open page.** The Page builder context passes the open page as a Sitecore item ID, but its label varies (it may be called a page, a selected item or a reference item) and its component list is unreliable.
   - Take the single Sitecore item ID from the context, whatever its label; remove the braces.
   - No ID, or several: ask "Which page should I build on? Open it in Page builder and run me again, or paste its item ID." and stop.
   - Read it with `get_content_item_by_id` (`itemId`, `language` = `en`) and note its `version` (a new page is `1`). Then call `get_components_on_page` with `pageId`, `language` = `en`, **`version` = that version number** (never `0`: version `0` returns "HTTP error getting page layout data: 400" on every page), `variantId` = `""` and `includeRenderingDetails` = `false`. If the call fails, stop: "I could not read this page's components, so I cannot confirm it is empty. Nothing was written." Never use the context's component list.
   - Wrong template (not one of the two allowed): stop: "This page is a <template>. I only build Main Landing Pages and Secondary Landing Pages. Nothing was written."
   - Not empty (one or more components): stop: "This page already has <N> components. Open an empty landing page, or create one, and run again. Nothing was written."

   Done when the page is an empty landing page with known ID, name, path, template and version.

3. **Read the request and the input.** Read the request (purpose, audience, sections asked for) and any attached or pasted text in full. No request: ask "What should this page present, and for whom?" and stop. Input not in English: read it; the page is written in English; translated quotes are labelled `(translated from <language>)` in the draft only.

   Done when you know the page purpose, audience, requested sections and hold the full input text.

4. **Fact sheet and plan.**
   - **Facts:** a table of every fact you will use (figures with qualifiers, quotes verbatim, names with titles, method or scope notes), each with its source: "input, section 'More than a drink', paragraph 2" or "brand context: Product Portfolio". When the input is thin, read only the brand context documents that fit the request with `get_brand_context_items`. Do not use "-ENDS-", "About <organisation>" boilerplate, contacts, download links. Keep method and scope notes (sample, period, limits) with the figures they qualify.
   - **Flagged claims:** input statements that break a Brand Kit rule: alcohol presented as improving health, performance or social success or as necessary for enjoyment; content aimed at minors; encouragement of excessive drinking; ambitions or targets stated as achieved; superlatives ("best", "biggest", "leading", "unbeatable"), awards or rankings without a source; corporate naming errors inside quotes. **Check every quote you plan to use with the same list:** a quote is never edited, so a quote that carries a flagged claim is used only when the user chooses option B for it. Naming errors outside quotes are corrected silently and listed.
   - **Plan:** the components in order, from *Palette* only, following *Plan rules*. For each: role, why, the facts it carries. A requested section the palette cannot build (carousel, accordion, tabs, stats, video, image gallery, signposts): say so and propose the closest palette component.

   Show the page identity (name, path, template), the fact sheet and the plan. Done when they are shown.

5. **Intake.** One question per message, each with **at least 4 lettered options**, exactly one **(Recommended)** with a one-line reason, ending with "Or type your own answer." In this order:
   1. **Confirm the page and plan** (always): A. Build this plan on <page name> (Recommended), B. Change the plan (say how), C. Use a different page (stop), D. Stop.
   2. **Missing or unclear facts**, at most 2 questions.
   3. **Image**, only when the plan has Text and Media: A. No image: use Rich Text instead (Recommended unless a real image was uploaded), B. I will give a media library path, C. I will give a media item ID, D. Drop this section. For B or C read the item; reject it and ask again when it is not a media image or its name or alt text contains `dummy`, `placeholder` or `gray placeholder`.
   4. **Each flagged claim**, one question per claim, quoting it and naming the rule: A. Leave it out (Recommended: <rule>), B. Keep it only as an attributed verbatim quote (only when a named person said it), C. Use this compliant wording: "<rewording>", D. Stop. **Leave it out** removes every sentence that carries the claim entirely, with no fragment and nothing written in its place.

   Done when every question is answered. Write nothing before that.

6. **Build the draft.** Fill every field of every planned component exactly as in *Field map*, `""` for unused fields, and the page SEO fields. Count characters with `skill_runtime.bash` when available; otherwise count carefully and aim for the middle of each range. Run the *Checklist*; fix failures and run it again.

   Done when every check passes.

7. **Draft review.** Show:
   - the plan in order (component, reason, substitutions);
   - one table per component: field, value (rich text shortened), characters / limit, source; `""` fields listed as `EMPTY`;
   - the SEO fields table;
   - the *Checklist* with ✅ or ❌ per line, the flagged claims with the user's decisions, any translated quote.

   Then ask:

   ```
   Build this page?
   A. Build it (Recommended)
   B. Change a field (name the component, field and new value)
   C. Change the plan (say how)
   D. Stop without writing
   Or type your own answer.
   ```

   Done when the user chose A or D. On B or C, apply, rerun the checklist and show the draft again.

8. **Build.** For each component, in plan order, **one** `add_component_on_page` call with:
   - `pageId` = the page ID, `placeholderPath` = `headless-main`, `language` = `en`
   - `componentRenderingId` = the component's rendering ID from *Palette*
   - `componentItemName` = `<Name_From_Palette>_<N>` (no spaces; `N` counts that component on this page from 1)
   - `fields` = **every** field listed for the component in *Field map*, as a JSON object, `""` for unused fields

   Each call appends the component after the previous one. If a call fails, stop building, keep what was created, and report it; never retry with other tools.

   Then **one** `update_fields_on_item` call on the page ID with the five SEO fields as `{"name": "<field>", "value": "<value>"}` pairs.

   Done when every call returned without error.

9. **Verify.** Call `get_components_on_page` with the same parameters as in step 2 (`version` = the page's version, never `0`). Check: component count, order, rendering IDs, every field of each `dataSourceItem` against the value sent. Read the page with `get_content_item_by_id` and check the SEO fields. Write any datasource or page field that differs once more with `update_fields_on_item` and read again. Done when everything matches or is listed as a failed write.

10. **Report** as described in *Output*.

## Palette

The only components this skill adds. All are allowed in `headless-main` and store their datasource under the page's `Data` folder (created automatically).

| Component | Rendering ID | Item name | Use for |
|---|---|---|---|
| Simple Page Banner | `2db7815c-e9e0-49e3-9c18-913026a47f9d` | `Simple_Page_Banner` | Page hero; always first, exactly once |
| Intro Text | `2cbd11f9-75b9-4bd9-99b4-0f5dd8514b58` | `Intro_Text` | Opening section: heading and 1–2 paragraphs |
| Rich Text | `1f5f2af8-7d6c-4ec4-b379-c2ea174774ec` | `Rich_Text` | A text section with its own `<h2>` |
| Text and Media | `2510c03b-ffde-43e1-acea-8b763f6be6a8` | `Text_and_Media` | Text beside an image; **only with an approved real image** |
| Full Width Large Quote | `ee284258-ee76-417d-9716-22dc44da833f` | `Full_Width_Large_Quote` | One standalone verbatim quote |
| Two Column Text With Quote | `8b63ce87-d448-446e-b1b2-da5bc600462c` | `Two_Column_Text_With_Quote` | A text section beside a verbatim quote |
| Superbreaker Text Only | `aa34de38-3746-4483-a3b9-661ca057f34e` | `Superbreaker_Text_Only` | Call to action or section break with one link to an existing site page |
| News Listings | `2d14c24e-2935-4e73-a7fd-0ec2ab748684` | `News_Listings` | Latest newsroom stories (no content written; the feed fills itself) |

**Plan rules:**
- 3–8 components. Simple Page Banner first, exactly once. News Listings, if used, last.
- A quote component only with a verbatim quote from the input and the speaker's name; never more than two quote components.
- Text and Media only with an image approved in intake; otherwise Rich Text.
- Superbreaker Text Only only with a link to an existing `heineken` page (read it first with `get_content_item_by_path`).

## Field map

Write **every** field listed for the component, every time: unlisted fields are left to the template, listed fields not used are `""`. The templates' default values are sample text ("Add title here", "Link Text", placeholder images) that appears on the page unless overwritten.

Formats: Rich Text in `<p>` (Rich Text component: one `<h2>` first, then `<p>`); allowed tags `p`, `strong`, `h2`; no links, lists, images, `br`, classes or styles. Internal link: `<link linktype="internal" id="{PAGE-GUID-UPPERCASE}" />`. Image: `<image mediaid="{GUID}" />`. Checkbox: `1` or `""`.

**Simple Page Banner**

| Field | Value |
|---|---|
| `title` | Page heading (the page's only H1), 20–60 chars, sentence case, no trailing period |
| `bannerContent` | One-sentence standfirst, 80–200 chars, plain text |
| `alignment` | `""` |
| `componentTheme` | `""` |

**Intro Text**

| Field | Value |
|---|---|
| `title` | Section heading, 20–60 chars |
| `content` | Rich text, 1–2 `<p>`, 150–700 chars |
| `preHeading`, `introText`, `link`, `linkText`, `link1`, `linkText1`, `link2`, `linkText2`, `ctaTypeLink1`, `ctaTypeLink2`, `modalTitle`, `modalContent`, `modalCtaText`, `Enable Two Column Intro` | `""` |
| `selectTagForTitle` / `selectSizeForTitle` / `selectSizeForContent` | `h2` / `display-md` / `body-md` |
| `alignment` / `ctaTypeLink` / `componentTheme` | `start` / `primary` / `theme-1` |

**Rich Text**

| Field | Value |
|---|---|
| `content` | `<h2>` heading (20–60 chars) then 1–4 `<p>`, 300–1,500 chars in total |
| `title`, `link`, `linkText`, `link1`, `linkText1`, `ctaTypeLink`, `ctaTypeLink1` | `""` |
| `componentTheme` | `theme-1` |

**Text and Media**

| Field | Value |
|---|---|
| `image` | The approved image |
| `selectVariation` | `left-text-50` (text left) or `right-text-50`; alternate when used twice |
| `title` | Section heading, 20–60 chars |
| `content` | Rich text, 1–3 `<p>`, 200–900 chars |
| `preHeading`, `introText`, `link`, `linkText`, `link1`, `linkText1`, `link2`, `linkText2`, `selectSizeForContent`, `ctaTypeLink1`, `ctaTypeLink2` | `""` |
| `selectTagForTitle` / `selectSizeForTitle` / `alignment` / `ctaTypeLink` / `componentTheme` | `h2` / `display-md` / `start` / `primary` / `theme-1` |

**Full Width Large Quote**

| Field | Value |
|---|---|
| `Quote` | The verbatim quote in curly quotation marks “…”, at most 300 chars |
| `Author` | Speaker's name as in the source |
| `Designation` | Speaker's title and organisation as in the source (corporate naming corrected) |
| `Quote Text Size`, `Quote Text Center` | `""` |
| `componentTheme` | `theme-1` |

**Two Column Text With Quote**

| Field | Value |
|---|---|
| `title` | Section heading, 20–60 chars |
| `introText` | Plain text, 80–250 chars |
| `content` | Rich text, 1–3 `<p>`, 200–900 chars |
| `Quote` / `Author` / `Designation` | As in Full Width Large Quote |
| `preHeading`, `link`, `linkText`, `link1`, `linkText1`, `link2`, `linkText2`, `selectSizeForContent`, `ctaTypeLink`, `ctaTypeLink1`, `ctaTypeLink2`, `Quote Text Size`, `Quote Text Center` | `""` |
| `selectTagForTitle` / `selectSizeForTitle` / `alignment` / `componentTheme` | `h2` / `display-md` / `start` / `theme-1` |

**Superbreaker Text Only**

| Field | Value |
|---|---|
| `title` | 20–60 chars |
| `introText` | Plain text, 80–250 chars |
| `link` | Internal link to the existing target page |
| `linkText` | 2–6 words that name the destination (Brand Kit: no bare "Read more" or "Click here") |
| `content`, `preHeading`, `link1`, `linkText1`, `link2`, `linkText2`, `selectSizeForContent`, `alignment`, `ctaTypeLink1`, `ctaTypeLink2` | `""` |
| `selectVariation` / `selectTagForTitle` / `selectSizeForTitle` / `ctaTypeLink` / `componentTheme` | `right` / `h2` / `display-md` / `primary` / `theme-1` |

**News Listings**

| Field | Value |
|---|---|
| `title` | 15–40 chars, for example `Latest news from HEINEKEN Cambodia` |
| `latestStory` | `1` |
| `noOfCards` | `3` |
| `link` | `<link linktype="internal" id="{3EB56520-C465-40EA-81DB-2575619DC97B}" />` |
| `linkText` | `All HEINEKEN Cambodia news` |
| `selectTag`, `selectNewsStory`, `carousel`, `smallCards`, `withoutImage` | `""` |
| `componentTheme` | `theme-1` |

**Page SEO fields** (on the page item, step 8)

| Field | Limit | Value |
|---|---|---|
| `baseMetadataTitle` | 50–60 | Short page subject, then a space, a vertical bar, a space and `The HEINEKEN Company` |
| `baseMetadataDescription` | 140–160 | What the page offers its audience; no claims beyond the page |
| `baseOgTitle` | 50–60 | Same as `baseMetadataTitle` |
| `baseOgDescription` | 140–160 | Same as `baseMetadataDescription` |
| `NavigationTitle` | 10–40 | Short page name |

## Checklist

- Every component is in *Palette*, with its fixed rendering ID; the plan follows *Plan rules*.
- Every field in *Field map* is present for each component; unused ones are `""`; no sample text ("Add title here", "Link Text", "Pre heading") remains.
- Every limited field is within its limit (counted, not estimated).
- Exactly one H1 (the banner `title`); every other heading is `h2`.
- Rich text uses only `p`, `strong`, `h2`; no links, lists, images or `br`.
- Every link points to an existing `heineken` page that was read; link text names the destination.
- Every fact, figure and quote traces to its source; quotes and figures verbatim, with qualifiers and with any survey's sample and limits.
- Group facts from the brand context are labelled as HEINEKEN group facts.
- Corporate and product names follow the Brand Kit (HEINEKEN Cambodia, Heineken® 0.0, Brew a Better World, Praise the Bar).
- No flagged claim appears unless kept as an attributed quote or reworded with approval; no fragment of a left-out claim remains; nothing was written in its place.
- Alcohol-related copy promotes moderation and never suggests that alcohol improves health, performance or social success.
- Image fields hold only an approved real image or `""`.

## Guardrails

- **The open page only.** Build only on the confirmed, empty landing page. Never change other pages, shared content, the page layout beyond the added components, or partial designs.
- **Evidence only.** No invented facts, figures, quotes, awards or contributors, even when asked.
- **Palette only**, with fixed rendering IDs.
- **Never publish** and never change workflow or publishing settings.
- **Missing tool, stop.** Use only the tools *Tools* names, for their stated purpose.
- **English only.**

## Output

1. The page: name, path, item ID, version, and **Open in Page builder: <link>** from the pattern in *Site facts* (`{ITEM-ID}` = page ID in lowercase without braces, `{VERSION}` = the version read back). Add: "If the new sections are not visible yet, reload the page in Page builder."
2. The components built, in order: component, datasource item name, verified ✅ or failed ❌.
3. A table per component of the fields written (shortened rich text) with sources; the SEO fields.
4. **Gaps** (fields left empty and why), **Excluded** (input not used, flagged claims left out), **Substitutions** (requested sections built with another component).
5. **Review checklist** for the user.
6. The warning: "This site has no workflow: the page goes live with the next publish of the site."
7. The line: "Review in Page builder before publishing. Nothing was published."
