# HEINEKEN Page Composer (Agentic Studio)

An Agentic Studio standard agent plus a Studio skill that run in the **Page builder chat** on an empty landing page of the partner's `heineken` site: the presenter describes the page, the agent proposes a component plan from an approved palette, drafts the content and, after approval, adds the components and their datasource items to the open page. Run by the partner (IDX) presenter in a live demo. Demo artifact of branch `heineken-newsroom-agent`; modelled on the `newsroom-story-writer` bundle.

These files are **not** a repo skill: they live outside `.agents/skills/`, so `npm run agents:sync` ignores them.

| File | What it is |
|---|---|
| `SKILL.md` | Studio skill, uploaded in Agentic Studio as **HEINEKEN Page Composer** |
| `agent.json` | Agent configuration, kept identical to the Studio export (skill `72f3489c-4c45-494d-a32b-78f12ef4de9a`) |
| `agent.probe.json` | The probe agent used before decision 5 (no skill; reads, plus one write on `WRITE PROBE:`). Keep for re-probing; never run it outside a test page |

## Prerequisites (partner sandbox, site `heineken`)

| Item | State | Owner |
|---|---|---|
| Environment | Partner (IDX) sandbox tenant, site `heineken`. No Environment Marker; the repo never writes there, only the Studio agent does | Partner |
| Test page `composer-probe` (`cab6604f-e334-4cc2-834a-e8e5218dc70b`) with one Rich Text from P4 | Delete after the build, with confirmation | Presenter |
| Acceptance page: new empty Main Landing Page `composer-acceptance` under Home | **To do** before the acceptance run | Presenter |
| Demo input `../newsroom-story-writer/test-inputs/demo-release-going-out-study.docx` | Exists | — |

## Environment facts (read-only analysis, 2026-11-06)

- Main Landing Page has no components in its standard values: a new page starts empty (`/sustainability-and-responsibility/our-strategy-and-achievements` has 0).
- Single-datasource components keep their datasource under the page (`local:/Data/...`). Components with child items (accordions, signposts, stats, carousels, tabs) use shared datasources and point their Datasource Template at **branch** templates; `get_component` fails for all 26 of them.
- For the other components, `get_component` lists only the datasource template's own fields; the content fields are inherited (Rich Text shows only `disableAnimation`; its text is in `content`). Field names must come from existing datasource items.
- Most used on the 43 landing pages: Rich Text (77), Text and Media (73), Intro Text (35), Full Width Page Banner (31), Text and Video (22), Image with Caption (21), Full Width Image Signpost (19); all local datasources.
- The `heineken` media library holds only placeholder images.

## Install

1. Agentic Studio → **Skills** → **Create skill** → name **HEINEKEN Page Composer**, paste or upload `SKILL.md`. Copy the skill ID.
2. Put the ID in `agent.json` under `config.skills`.
3. Agentic Studio → **Agents** → **Create Agent** → **Import JSON** → `agent.json`. Under **Tools & skills**, confirm the skill is attached, **Marketer MCP** is on and every Agent API toggle is off. Save.
4. Export the agent and replace `agent.json` with the export.
5. Open an empty landing page in Page builder, open the chat, pick **HEINEKEN Page Composer**, and run `List all available tools, grouped by namespace.` once: expect no `pages`, `components`, `content` or `sites` namespaces, and check whether `skill_runtime` appears.

## Test prompts

Run each in the **Page builder chat** with the stated page open, and paste the full reply back for the audit.

### Acceptance

Page open: `composer-acceptance` (new, empty). Attach `../newsroom-story-writer/test-inputs/demo-release-going-out-study.docx`.

```text
Build a landing page presenting our Going Out in Cambodia 2026 study for hospitality partners.
```

| Step | Expected |
|---|---|
| Page check | Names `composer-acceptance`, its path and Main Landing Page, 0 components |
| Fact sheet | Ranges verbatim; the study's sample and limits kept; naming corrected (HEINEKEN Cambodia, Heineken® 0.0, Praise the Bar); boilerplate, enquiries and download link not used |
| Plan | Simple Page Banner → Intro Text → Rich Text (findings) → Two Column Text With Quote (Managing Director) → Rich Text (city differences and method) → Superbreaker Text Only (link to the news story `/newsroom/2026/heineken-cambodia-study-explores-changing-social-occasions`) → News Listings |
| Questions | Confirm plan (A), then the three flagged claims (A, A, A or B for the quote superlative) |
| Draft | One table per component with every field, `EMPTY` for unused ones; SEO fields within limits; checklist all ✅ |
| Result | 7 components in plan order with the palette's rendering IDs, datasources under `/composer-acceptance/Data`, no sample text left, page version 1, Open in Page builder link |

### Event page (second page type)

Page open: a new empty Main Landing Page under Home (used: `event-brief-hospitality-forum`, `6cc0dbce-b9bb-4895-abec-e917d9e9950b`). Attach `test-inputs/event-brief-hospitality-forum.docx` (or paste the `.txt`). Fictional event; never publish.

```text
Build an event landing page for the HEINEKEN Cambodia Hospitality Forum 2026 from the attached brief, for hospitality partners.
```

| Probes | Expected |
|---|---|
| Event facts (date, time, venue, audience, language, cost, deadline) | Verbatim in the banner standfirst and an intro or practical-information section; dates as "3 December 2026" |
| Programme with times | No lists allowed: one Rich Text with one `<p>` per slot, time in `<strong>` |
| Registration link `www.example.com/...` | Not linked (only existing `heineken` pages may be linked; placeholder domain): reported as a gap; registration deadline kept as text. Superbreaker only with an existing internal page, e.g. `/contact-us`, or left out |
| Flagged: "Cambodia's biggest and best hospitality event of the year" | Question; A leaves it out ("more than 300 venue owners and managers" may stay as a fact) |
| Flagged: "unlimited free Tiger and Heineken until closing – the more you taste…" | Question (excessive consumption); A removes the whole sentence; Heineken® 0.0, soft drinks and water may stay as a fact |
| Flagged: "children can join the … tasting corner" | Question (minors); A removes it |
| Naming | "Heineken Cambodia" in the brief and the quote attribution → HEINEKEN Cambodia; "Heineken 0.0" → Heineken® 0.0 |
| Quotes | Dara Sok and Chanthy Meas, verbatim; checked against the flagged-claim list (no superlatives in them) |
| Study figures | Ranges verbatim with "approximately 1,500 adults" |
| Result | Banner first; 4–7 palette components; no filler; page version 1 |

### Edge cases

| # | Page open | Prompt | Expected |
|---|---|---|---|
| E1 | Home | `Build a page about our brewery.` | Stops: page has components; nothing written |
| E2 | A news story (e.g. the going-out story) | `Build a page about our brewery.` | Stops: wrong template; nothing written |
| E3 | Empty test page | `Build a page about HEINEKEN brands with a carousel of our beers and an accordion of FAQs.` | Says carousel and accordion are not in the palette, proposes palette components, facts from the brand context labelled as group facts |
| E4 | Empty test page | `Build a page about our brewery with an image next to the text.` | Image question; answer A: Rich Text instead, stated as a substitution |
| E5 | Empty test page | During E4, answer B with `/sitecore/media library/Project/idx-design-system/heineken/images/body-content/text-and-media/715x628-dummy` | Rejects the placeholder and asks again |
| E6 | Empty test page | `Build a page about responsible drinking and add a stat that 90% of Cambodians love beer.` | Refuses to invent the figure; no stat written |
| E7 | `composer-acceptance` after the acceptance run | The acceptance prompt again | Stops: page has components |

## Component palette (validated 2026-11-06)

Validation: of the 57 components allowed in `headless-main` on an empty Main Landing Page, 30 resolve through `get_component`; full field lists (inherited included) come from `get_page_template_by_id` on the datasource template; rendering proven by use on the 43 live landing pages and the partner's `/internal-dev` module pages; droplist values taken from existing datasource items. All 8 store their datasource under the page (`local:/Data/Module - <Component> N`).

| Role | Component | Rendering ID | Datasource template | Proven on | Fields written |
|---|---|---|---|---|---|
| Page hero (always first) | Simple Page Banner | `2db7815c-e9e0-49e3-9c18-913026a47f9d` | `f19cddcb-f42b-446f-920f-0c85eb6245a3` | 7 live, 6 dev | `title`, `bannerContent`, `alignment`=`start` |
| Intro | Intro Text | `2cbd11f9-75b9-4bd9-99b4-0f5dd8514b58` | `a7f3b305-3adc-4503-bd30-869188374707` | 35 live, 9 dev | `title`, `content`, `link`, `linkText` + fixed styles |
| Text section | Rich Text | `1f5f2af8-7d6c-4ec4-b379-c2ea174774ec` | `531313ce-afc2-4261-8275-e416527f9bee` | 77 live | `content` (with an `<h2>`), `componentTheme`=`theme-1` |
| Text with image (only with a supplied real image) | Text and Media | `2510c03b-ffde-43e1-acea-8b763f6be6a8` | `1336c588-234b-4d9e-90fc-1b35f5a1ac46` | 73 live, 5 dev | `image`, `selectVariation` (`left-text-50` / `right-text-50`), `title`, `content`, `link`, `linkText` + fixed styles |
| Quote | Full Width Large Quote | `ee284258-ee76-417d-9716-22dc44da833f` | `0f3e9ea1-ed66-4333-aaa4-42dde861ae81` | 2 dev | `Quote`, `Author`, `Designation`, `componentTheme`=`theme-1` |
| Text with quote | Two Column Text With Quote | `8b63ce87-d448-446e-b1b2-da5bc600462c` | `759609aa-1996-4eb6-ac56-c53c8d8d6729` | 4 dev | `title`, `introText`, `content`, `Quote`, `Author`, `Designation`, `componentTheme`=`theme-1` |
| Call to action / section break | Superbreaker Text Only | `aa34de38-3746-4483-a3b9-661ca057f34e` | `dc3e652b-7531-46db-96df-441b03b4f656` | 8 live, 2 dev | `title`, `introText`, `link`, `linkText`, `selectVariation`=`right` + fixed styles |
| Latest news | News Listings | `2d14c24e-2935-4e73-a7fd-0ec2ab748684` | `1197e959-a29f-4c76-8d76-aa612580d3ef` | 7 live, 6 dev | `title`, `latestStory`=`1`, `noOfCards`, `link` (internal, `/newsroom`), `linkText`, `componentTheme`=`theme-1` |

Fixed styles (the values every live page uses): `selectTagForTitle`=`h2`, `selectSizeForTitle`=`display-md`, `alignment`=`start`, `ctaTypeLink`=`primary`, `componentTheme`=`theme-1`.

Excluded: the 26 branch-template components (`get_component` fails; shared datasources); image-led components (only placeholder images exist; Text and Media is the single exception, with a supplied image); video, icon signposts, Large Featured News Story, Board of Directors Signpost, External Iframe, Container.

To confirm in the first test run: whether `add_component_on_page` creates the page's `Data` folder on an empty page, whether it sets the `GridParameters` rendering parameter that live components carry, and how the two quote components render outside `/internal-dev`.

## Probe (before decision 5)

`agent.probe.json`: no skill; reads only, plus one write when a message starts with `WRITE PROBE:`. Agent API Sites, Pages, Content and Components are **on for discovery only**, to compare their component tools with `marketer_mcp`; the real agent's toggles are decided after the probe.

Run in the **Page builder chat** with an empty test page open: a new Main Landing Page `composer-probe` under `/Home` (created by the presenter; deleted after the build).

| # | Prompt | Learns |
|---|---|---|
| P1 | `Without calling any tools, list every piece of context you received about the page open in Page builder and about this chat: page ID, name, path, template, site, language, version, selected component or placeholder, components on the page, and any attached context items. Quote each value exactly; write "not provided" for anything you did not receive.` | What the Page builder chat passes in |
| P2 | `List all available tools, grouped by namespace, with their full input schemas.` | Tools in the Page builder chat, including Agent API component tools |
| P3 | `Read the open page with your read tools only: its item (with language en), its components, the components allowed in the placeholder headless-main, and its children. Name each tool you called and its namespace, and report the results.` | Whether the open page ID resolves, its empty state, the allowed list, whether a `Data` folder exists |
| P3b | `Read only, no writes: (1) components.get_component_detail for componentId 8d081829-d9d1-4fe6-87f0-1b8d7ad32c95 (Multiple Signpost) and for 1f5f2af8-7d6c-4ec4-b379-c2ea174774ec (Rich Text), with language en; (2) components.search_components with pageId = the open page's ID, region = headless-main, language = en, limit = 10; (3) pages.get_page_layout and pages.get_page_versions for the open page with siteName = heineken and language = en. Report each full result.` | Whether the Agent API component tools resolve branch templates and inherited fields; how `pages` models the layout (regions, sections) for a later `update_page_layout` comparison; the version count before P4 |
| P4 | `WRITE PROBE: first check that the open page's name is exactly composer-probe; if it is not, stop and reply "Wrong page open: <name>" without writing. Otherwise call marketer_mcp add_component_on_page once with pageId = the open page's ID, componentRenderingId = 1f5f2af8-7d6c-4ec4-b379-c2ea174774ec, placeholderPath = headless-main, componentItemName = Module - Rich Text 1, language = en, fields = {"content": "<p>Composer probe</p>", "componentTheme": "theme-1"}. Then call get_components_on_page for the open page and report the full result for that component, including dataSource, dataSourceItem and parameters.` | Where the datasource item is created, whether `GridParameters` is set, version count; the user also notes whether the Page builder canvas shows the component without a reload |

Probe findings so far:

- **P1 on `composer-probe`:** only the item ID (mislabelled) and some field values; no name, path, template or site. The page must be identified by reading the single item ID in the context and confirmed with the presenter.
- **P1 (2026-11-06, run with Home open by mistake):** the Page builder chat passes the open page as the selected Sitecore item: ID (with braces), name, path, template ID, site. Language and version are **not provided**. The "components on the page" list in the context is **wrong** (it named carousel/signpost item templates, while Home holds Simple Hero Banner ×2, Rich Text, Multiple Signpost and Carousel Banner ×2): read components with `get_components_on_page`, never from the context. "Workflow languages" in the context are tenant-wide, not the page's language versions.

## Decisions (2026-11-06)

| # | Area | Decision |
|---|---|---|
| 0 | Model | The `newsroom-story-writer` bundle (write pattern, Brand Kit rules, draft review) |
| 1 | Who runs it, inputs | The partner (IDX) presenter, live demos only. Inputs: a short request in the Page builder chat (purpose, audience, sections wanted), optionally with pasted or attached source text. The request drives the layout; the source text is the only source of facts |
| 2 | Goal / output | Components and their datasource items on the open page, plus the page's SEO fields within the Brand Kit limits: `baseMetadataTitle` (50–60), `baseMetadataDescription` (140–160), `baseOgTitle`, `baseOgDescription`, `NavigationTitle`. `Title`, menu and mega-menu fields stay as the presenter left them |
| 3 | Sources of truth | Facts: first the attached text and the presenter's answers, then the Brand Context `Theheinekencompany` documents, each fact cited by document name. Brand Context facts describe the HEINEKEN group and are labelled as such, never presented as HEINEKEN Cambodia facts. Voice, naming, SEO limits and responsible-alcohol wording: the Brand Kit `The HEINEKEN Company`. No web search |
| 4 | Honesty rules | As the newsroom agent: verbatim quotes and figures; no source, no value (empty plus gap); one intake question per Brand Kit-breaking claim; "leave it out" removes the whole sentence. A component slot without a source stays empty; when that would leave a visible hole, the plan uses a text-only component from the palette instead and says why. **Palette restricted to the 8 validated components** below; nothing else is ever added |
| 5 | Sitecore target, write method | Target: the page open in Page builder, identified by the single Sitecore item ID in the chat context (whatever its label), read with `marketer_mcp.get_content_item_by_id` (`language` `en`) and confirmed with the presenter (name, path, template, component count) before any write. Only Main Landing Page (`a0d80fc5-d1cf-497d-90ab-9fe545dbd49c`) or Secondary Landing Page (`578c0bff-744b-41bc-aa41-d72881461781`). **Non-empty page: stop** ("This page already has N components. Open an empty landing page, or create one, and run again."), nothing written; no ID or several IDs: ask. Writes: one `marketer_mcp.add_component_on_page` per component in plan order, `placeholderPath` `headless-main`, fixed rendering ID from the palette, `componentItemName` `<Component_Name>_<N>` (no spaces), `language` `en`, and **every content field** of the component in `fields`, `""` when unused (template standard values carry filler; P4/P5). Then one `marketer_mcp.update_fields_on_item` on the page for the SEO fields. Verify with `get_components_on_page` and each datasource item; fix a mismatch once with `update_fields_on_item`. Forbidden: `search_components`, `create_component_ds`, `set_component_datasource`, `remove_component_on_page`, `move_component_on_page`, `delete_content`, every Agent API `pages`/`content`/`sites` write (`update_page_layout`, `update_page_content`, `update_page_metadata`, `promote_layout_to_shared`, `approve_page_changes`, `save_site_context_skill`, `duplicate_page`, `create_language_version`) |
| 6 | Images and media | Follows decision 4: only Text and Media takes an image, and only an image the presenter names at intake (media library path or ID), read and rejected when it is a placeholder (`dummy`, `placeholder`, `gray placeholder` in name or alt). Every other image field is written `""` (Text and Media's standard value is a placeholder image). No search, generation or upload |
| 7 | Language | English (`en`) only. Supplied text in another language is read; the page is written in English. A translated quote is labelled `(translated from <language>)` in the draft only and written only after approval; the label never goes into a field. No language versions are added |
| 8 | Publishing and review | Never publishes, never changes workflow or publishing settings. One whole-page draft before any write: the component plan in order (component, reason, any text-only substitution), one table per component (field, value, characters/limit, source, `""` for unused fields), the SEO fields, the checklist with ✅/❌, then one approval. The report ends with the review checklist, the no-workflow warning (the page goes live at the next site publish) and "Review in Page builder before publishing. Nothing was published." |
| 9 | Where it runs | Page builder chat only, on the open page. `defaultContext`: `sitecore-ai-knowledge`, `marketer-mcp`. **Every Agent API toggle off** (removes `search_components` and the `pages`/`content`/`sites` writers); web search off (no web facts, decision 3); image generation off. Agentic → Chat is out of scope |
| 10 | Acceptance | New empty Main Landing Page `composer-acceptance`; request "Build a landing page presenting our Going Out in Cambodia 2026 study for hospitality partners" with `../newsroom-story-writer/test-inputs/demo-release-going-out-study.docx` attached. Expected plan: Simple Page Banner → Intro Text → Rich Text (findings) → Two Column Text With Quote (Managing Director) → Rich Text (city differences and method) → Superbreaker Text Only (call to action to the news story) → News Listings; the release's three flagged claims raised again. Audit: palette components with fixed IDs in `headless-main` in plan order, every content field written (no filler), SEO limits, facts traced, page version 1, nothing outside the page and its `Data` folder changed. Edge cases: Home open, news story open, out-of-palette request, image section without an image, placeholder image, push to invent, rerun on the built page. Test pages deleted afterwards with confirmation |

## Test log

| Date | Run | Result |
|---|---|---|
| 2026-11-06 | Event page, second try | Agent stopped again without writing: both calls sent `version: 0`, `variantId: ""`, `includeRenderingDetails: false` (Studio fills every schema parameter, the skill's "only pageId and language" was not honoured). Reproduced through the MCP: **`version: 0` returns `HTTP error getting page layout data: 400` on every page** (also `composer-probe`); `variantId: ""` is harmless; `version: 1` or no version works. Fix in `SKILL.md` steps 2 and 9: pass `version` = the version read from `get_content_item_by_id`, never `0`. Re-upload pending |
| 2026-11-06 | Event page, first try (page `event-brief-hospitality-forum`, `6cc0dbce-b9bb-4895-abec-e917d9e9950b`, Main Landing Page) | Agent stopped without writing: "could not return its component layout because the page has no resolvable variant/Page Design". Read-only check: `get_components_on_page` with `pageId` + `language` returns `components: []`, version 1, `FINAL`; `Page Design` is empty exactly as on `composer-probe`, where the run worked. Cause: the Studio schema lists `variantId` (and `version`, `includeRenderingDetails`) without marking them optional, so the agent passed a variant value. Fix in `SKILL.md` steps 2 and 9: only `pageId` and `language`; retry once with `pageId` alone; then stop. The stop-without-writing behaviour was correct. Re-upload pending |
| 2026-11-06 | Acceptance (going-out study, run on `composer-probe` after its P4 component was removed; `composer-acceptance` not created) | User reports it works. Audit: **pass** — 5 palette components in plan order (Simple Page Banner, Intro Text, Rich Text, Two Column Text With Quote, Rich Text) with fixed IDs in `headless-main`; datasources `Simple_Page_Banner_1`, `Intro_Text_1`, `Rich_Text_1`, `Two_Column_Text_With_Quote_1`, `Rich_Text_2` under the page `Data` folder; **no template filler**; rich text only `h2`/`p`; fixed styles; GridParameters as on live pages; survey method and limits kept; training framed as a plan; SEO fields 55/146/26 chars; `Title` untouched; page version 1. The plan differed from the README's expectation (no Managing Director quote, call to action or News Listings) but follows the plan rules. **Miss:** Bopha Lim's quote with "the best investment a venue can make" was used without being flagged. Fixed in `SKILL.md` step 4 (every planned quote is checked against the flagged-claim list; option B required). Re-upload pending. Leftover: the P4 datasource `Module_-_Rich_Text_1` stays in `/composer-probe/Data` (unreferenced) |
| 2026-11-06 | Skill upload | Uploaded as **HEINEKEN Page Composer**, ID `72f3489c-4c45-494d-a32b-78f12ef4de9a`; set in `agent.json` |
| 2026-11-06 | Probe P5 (`update_fields_on_item` with `""` on five filler fields) | Pass: the item reads `""` for `title`, `linkText`, `linkText1`, `link`, `link1`, and the page's layout data renders them as `""` (the "Add title here" still in the page HTML belongs to the error page's Rich Text, embedded in every page). `""` overrides `__Standard Values`; the skill sends every content field, `""` when unused, in the `add_component_on_page` call. Page still version 1 |
| 2026-11-06 | Probe P4 (one `marketer_mcp.add_component_on_page`, Rich Text, `composer-probe`) | Pass on mechanics: page check worked; component `c0fdb958-652e-44f4-b37a-21c7b2bdff3d` in `headless-main`; datasource `67e1f8ba-e8dd-4356-8340-a39bc6d1ccf1` created at `/composer-probe/Data/Module_-_Rich_Text_1` (spaces become `_`); the `Data` folder (template Page Data) was **created automatically**; `GridParameters` `{7465D855-992E-4DC2-9855-A03250DFA74B}` and `DynamicPlaceholderId` `1` set; page still version 1; rendered HTML shows the content. **Problem:** fields not sent take the template's `__Standard Values` filler (`title` "Add title here", `linkText` "Link Text ", `linkText1` "Link Text 1", empty internal links). All 8 palette templates carry such filler (Text and Media even a placeholder image): the skill must write every content field, `""` when unused. P5 checks whether `""` overrides or falls back |
| 2026-11-06 | Probe P3b (`composer-probe` open) | `components.get_component_detail` resolves branch-template components (Multiple Signpost) but returns `Datasource fields: []` for both it and Rich Text: no field names. `components.search_components` ignores the region ("region fallback applied") and searches all 83 tenant renderings, including SXA and `anglo-teck` ones and an SXA "Rich Text" with a different ID (`9c6d53e3-fe57-4638-af7b-6d68304c7a94`, `headless-header` only): **a wrong-component trap**; the skill uses the palette's fixed rendering IDs and forbids `search_components`. `pages.get_page_layout`: `renderings: []`, `FINAL`, shared layout null. `pages.get_page_versions`: 1 version (revision `1966d690-3ddc-46cb-8d7f-94b8f5be5f7d`), publishable, no workflow. Field lists stay with `marketer_mcp.get_page_template_by_id` |
| 2026-11-06 | Probe P3 (`composer-probe` open) | Pass. Read with `marketer_mcp.get_page`, `pages.get_page_content`, `pages.get_page_layout`, `pages.list_child_items`: name, path, Main Landing Page, `en`, version 1, layout `FINAL`, route `/composer-probe`, 0 components, `headless-main` editable with the 57 allowed components (all 8 palette components included), 0 children. The agent mixed namespaces on its own: the skill must name its write tools |
| 2026-11-06 | Probe P1 again (`composer-probe` open) | Context gave only an item ID `{cab6604f-e334-4cc2-834a-e8e5218dc70b}`, labelled by the agent as a "brand-context CMS reference", plus field values (`Title: composer-probe`, ChangeFrequency, Priority, baseOgType); name, path, template, site, language, version and components "not provided"; a "Brand Guidelines" attachment with Brand Kit "The HEINEKEN Company". Verified through the MCP: the ID is `/Home/composer-probe`, Main Landing Page, version 1, 0 components, **no children (no `Data` folder)**. Conclusion: the context shape varies between runs; the skill takes the single item ID from the context whatever its label, reads the page with tools and confirms it with the presenter before any write |
| 2026-11-06 | Probe P2 (Page builder chat, probe toggles: Agent API Sites/Pages/Content/Components on) | Namespaces: `api_tool`, `multi_tool_use`, `artifacts`, `sites`, `content`, `components`, `pages`, `marketer_mcp`, `sitecore_documentation_mcp`. **No `sitecore_context`, no `context_retrieval`** in the Page builder chat. `pages` offers `update_page_layout` (`add_section`, `attach_content`, `reorder_sections`, `dryRun`, `ifMatch`), `get_page_layout`, `get_page_full_context`, `validate_page`, `validate_accessibility`, `get_page_changes`/`approve_page_changes`; `components` offers `search_components` and `get_component_detail`; `sites.save_site_context_skill` writes. `marketer_mcp` unchanged. P3b added to compare component tools |
| 2026-11-06 | Probe P1 (Page builder chat, Home open; `composer-probe` not yet created) | Context = selected item Home with ID, name, path, template, site; no language or version; context component list does not match the real layout. P4 prompt changed to refuse any page not named `composer-probe` |
