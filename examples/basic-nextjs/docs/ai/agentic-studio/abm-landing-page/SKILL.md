# ABM Landing Page For One Account

Create or update a SitecoreAI **ABM landing page** for one target account (for example IKEA) on the Sitecore demo site. The page sells SitecoreAI to that account: what it gains, in its own context, and one clear next step. Use when the marketer names an organization and asks for a landing page, ABM page or account page for it.

The marketer is the authority on the account; the web fills the gaps. Sitecore is the trusted guide, the account is the protagonist. This skill writes **page fields only** and never publishes.

## Site facts

| Item | Value |
|---|---|
| Site name | `main-website` |
| Language | `en` (English only) |
| Landing pages parent `/Home/lp` | `af65681c-5c75-40d2-89a3-3779d5a47a27` |
| Page template | Landing Page Template, `50af6ec7-85fd-4b9b-adf7-1fde9d9136fe` |
| Example page (never change it, never duplicate it) | `Example Landing Page`, `ff0d2a81-31a5-4b8d-8a53-a1d03734c178` |
| Brand context (what Sitecore sells) | `Sitecore`, `43723db2-802c-4960-8d86-09fea574c117` (read it yourself, see step 1) |
| Brand Kit (how Sitecore writes) | the **published** kit named exactly `Sitecore Brand Kit` |
| Default goal | `Book a SitecoreAI briefing` → `https://www.sitecore.com/request-a-demo` |
| Secondary hero link | `Explore the platform` → `https://www.sitecore.com/platform` |
| Hero image tag | `abm-hero` |
| Page builder link | `https://pages.sitecorecloud.io/editor?organization=org_BMSdm6mLMr270Wnk&tenantName=sitecoresaabad7-fmccustomde3703-sitecoredem3db4&sc_site=main-website&sc_itemid={ITEM-ID}&sc_lang=en&sc_version={VERSION}` |

The page design (header, footer and the six landing sections with their variants) comes from the template. Never change the layout.

## Evidence

Every statement on the page is backed by **evidence**: a source you can name in the report.

| Statement about | Allowed evidence |
|---|---|
| The account | The marketer's answers (always win), then public web sources (official site, annual report, reputable press) |
| What Sitecore sells and how it sounds | Sitecore brand context documents; Sitecore Brand Kit for voice and terms |
| What a SitecoreAI capability does | Sitecore documentation search, then sitecore.com pages |
| Customer quotes and outcome figures | Customer evidence in the Sitecore brand context or a published sitecore.com customer story, copied verbatim |

A statement without evidence is left out. A field without evidence stays empty and is reported as a **gap**; empty fields are hidden on the live page.

## Tools

Tools load on demand: load these namespaces with `ToolSearch` in step 1.

| Namespace | Tools this skill uses |
|---|---|
| `marketer_mcp` | `get_brand_context`, `get_brand_context_items`, `list_brandkits`, `get_brandkit_by_id`, `get_content_item_by_path`, `get_content_item_by_id`, `search_assets`, `create_page`, `update_fields_on_item`, `update_content` |
| `web_search` | `web_search` |
| `sitecore_documentation_mcp` | `search_sitecore_knowledge_sources` |
| `skill_runtime` | `bash` (character counts) |

The **write tools** are `create_page`, `update_fields_on_item` and `update_content`, all in `marketer_mcp`. Call them only in step 6 and step 7, only on the confirmed target page, and only as the process describes. Page work goes through `marketer_mcp` alone: tools with similar names in other namespaces (`pages`, `content`) create page versions and are outside this skill.

The page open in Page builder, if any, is context only. It becomes the target only when it is this account's page and the marketer chose "update" in intake.

## Process

1. **Load tools and Sitecore context.**
   - Load the namespaces in *Tools* with `ToolSearch`. If `marketer_mcp` does not load, stop and tell the marketer: "The Marketer MCP is not available to this agent. Enable it under Tools & skills → MCP and run again."
   - Read the Sitecore brand context: `get_brand_context` with its ID, then `get_brand_context_items` for the documents on products, messaging and positioning, audiences, content and style guidelines, and customer evidence.
   - Call `list_brandkits` and load the published `Sitecore Brand Kit` with `get_brandkit_by_id`; if it does not exist, continue with the brand context for voice and note "Brand Kit not applied" for the report.

   Done when the tools are loaded, the brand context documents are read, and the Brand Kit is loaded or noted as missing.

2. **Research the account** with web search: identity and legal structure (which entity owns the brand and the websites), what it sells and where, scale, digital and marketing posture, recent moves (last 18 months), current web platform and martech signals, any public Sitecore relationship. Done when you have a **dossier** of 8–12 short facts, each with its source URL.

3. **Intake.** Show the marketer the dossier, then ask about what is missing or uncertain: **one question per message, at most 5 questions**. Each question offers **at least 4 lettered options**, marks exactly one as **(Recommended)** with a one-line reason, and ends with "Or type your own answer." Build the options from the dossier, for example:

   ```
   Question 2 of 5 — Who is the page written for?
   A. Chief Digital Officer (Recommended: IKEA's digital transformation is led at CDO level)
   B. Chief Marketing Officer
   C. Head of E-commerce
   D. Head of Customer Experience
   Or type your own answer.
   ```

   Always ask:
   - **Goal**: what the page asks the account to do, with the exact URL. Options: the default goal (Recommended unless the marketer mentioned another), an event or webinar (name, date, URL), a meeting with a named account executive (calendar link), another URL. Check with web search that the URL exists; if you cannot confirm it, say so and offer the default goal again.
   - **Recipient**: the role the page is written for.
   - **Existing page**: read `/sitecore/content/main/main-website/Home/lp` with `get_content_item_by_path` and check its children. If a page for this account exists, ask: update it (new version), create a new page, or stop. Otherwise ask to confirm the page name, with `<account>-<goal>` in lowercase with hyphens as the recommended option, for example `ikea-briefing`.

   Ask about relationship status (prospect, existing customer, partner, unknown), known pains or the hero image only when research left them unclear. Done when the marketer has confirmed the dossier and answered every question. Write nothing to Sitecore before that.

4. **Choose the angle.** Pick the one SitecoreAI angle that best fits the account and recipient (see *Angles*). Map 2–3 account pains to SitecoreAI capabilities, each capability backed by evidence. Find one published Sitecore customer story for the testimonial, preferring the account's industry (retail, home and furnishing, consumer brands). Done when every feature, stat and FAQ answer you plan has its evidence.

5. **Build every field** as described in *Field map*, in the Brand Kit voice. Count the characters of every limited field with `bash` rather than estimating. Then run the *Checklist*; rewrite any failing field and run the full checklist again. Done when every check passes.

6. **Write.**
   - New page: `create_page` with `parentId` = landing pages parent, `templateId` = page template, `name` = confirmed page name, `language` = `en`, and `fields` = `[{"Title": "<Title value>"}]` (single-key objects keyed by field name). Then **one** `update_fields_on_item` call on the new page ID with every other field as `{"name": "<field>", "value": "<value>"}` pairs; it edits version 1 in place.
   - Existing page: **one** `update_content` call with `itemId` = page ID, `siteName`, `language` = `en`, `createNewVersion` = `true`, and every field as `{name, value}` pairs. The previous content stays in the earlier version.

7. **Verify.** Read the page back with `get_content_item_by_id`. Compare every field with the value you sent; write any field that differs or is missing once more with `update_fields_on_item`, and read it back again. Build the **Page builder link** from the pattern in *Site facts*: `{ITEM-ID}` = the page's item ID in lowercase with hyphens and no braces, `{VERSION}` = the version you wrote (`1` for a new page; the version returned by `update_content` for an update). Use only this link: preview URLs from other tools carry an access token. Done when every field matches or is listed as a failed write, and the link is built.

8. **Report** as described in *Output*.

## Angles

| Account profile | SitecoreAI angle |
|---|---|
| Consumer brand at global scale (retail, CPG, home, hospitality) | One brand, many markets: personalized, on-brand experiences per market and visitor, produced at content velocity without engineering overhead |
| Regulated industry (finance, healthcare, pharma) | Governed AI: content at scale inside approval, compliance and brand guardrails |
| B2B or enterprise technology | Account-based experiences: account-specific pages and journeys without a sprint |
| Digitally maturing or mid-market | A platform to grow into: composable content and AI personalization paced to the team |

Name only products and capabilities found in the brand context or Sitecore knowledge, with their current names.

## Field map

Write every field below on every run. "Empty" means the value `""`.

### Page

| Field | Type | Rule |
|---|---|---|
| `Title` | Single-Line Text | `<Account> and SitecoreAI` plus a short hook, max 70 chars (browser title) |
| `NavigationTitle` | Single-Line Text | `<Account>` |
| `ShowInNavigation` | Checkbox | `0` |

### Hero

| Field | Type | Limit | Rule |
|---|---|---|---|
| `heroEyebrow` | Single-Line Text | 40 | Short tag, e.g. `Prepared for IKEA` |
| `heroHeadline` | Single-Line Text | 80 | Names the account, benefit-led, no trailing period |
| `heroSubhead` | Single-Line Text | 200 | 1–2 sentences tied to a dossier fact |
| `heroPrimaryCta` | General Link | text 3–6 words | The goal: `<link text="…" linktype="external" url="<goal URL verbatim>" anchor="" target="_blank" />` |
| `heroSecondaryCta` | General Link | — | The secondary hero link from *Site facts* |
| `heroImage` | Image | — | The marketer's image if given; else the best `search_assets` result with `tags` = `["abm-hero"]` and `type` = image: `<image mediaid="{ASSET-ID}" />`; else empty |
| `heroVideo` | General Link | — | Empty unless the marketer supplies a video URL |

### Features (3)

| Field | Type | Limit | Rule |
|---|---|---|---|
| `feature{1,2,3}IconName` | Single-Line Text | — | One of: `Sparkles`, `Brain`, `Bot`, `Wand2`, `Zap`, `Rocket`, `Globe`, `Languages`, `Layers`, `Workflow`, `Users`, `Target`, `ShieldCheck`, `Gauge`, `BarChart3`, `LineChart`, `Store`, `ShoppingCart`, `Boxes`, `Clock`, `Lightbulb` |
| `feature{1,2,3}Title` | Single-Line Text | 40 | 2–4 words, outcome-led |
| `feature{1,2,3}Description` | Rich Text | 100–180 chars inside `<p>` | One account pain → the SitecoreAI capability that solves it, as an outcome. Name the account in at least 2 of the 3 |

### Stats (3)

| Field | Type | Limit | Rule |
|---|---|---|---|
| `stat{1,2,3}Number` | Single-Line Text | 8 | A Sitecore outcome figure from a published source, copied exactly |
| `stat{1,2,3}Label` | Single-Line Text | 30 | What it measures, with the customer name when it fits |

Stats describe Sitecore outcomes only; account facts belong in the copy. A slot without a sourced figure stays empty (both fields).

### Social proof

| Field | Type | Rule |
|---|---|---|
| `testimonialQuote` | Rich Text | A published Sitecore customer quote, verbatim, in `<p>`, without surrounding quotation marks |
| `testimonialAuthorName` | Single-Line Text | The person's name as published |
| `testimonialAuthorTitle` | Single-Line Text | `<Role>, <Company>` as published, max 80 chars |
| `testimonialAuthorImage` | Image | Empty unless the asset library holds that person's approved photo |
| `partnerLogosImage` | Image | Empty unless the marketer supplies the image |

No published quote found: all five fields empty, reported as a gap.

### FAQ (5)

| Field | Type | Limit | Rule |
|---|---|---|---|
| `faq{1..5}Question` | Single-Line Text | 140 | A question the recipient would ask. At least 3 of 5 name the account |
| `faq{1..5}Answer` | Rich Text | 1–3 sentences in `<p>` | Direct and concrete, backed by evidence |

Cover, in this order: time to value or migration; integration with the account's stack (from the dossier); security, compliance and data residency; AI governance and brand control; the goal (`faq5`: what the account gets from the briefing, event or meeting, naming it).

### Final CTA

| Field | Type | Limit | Rule |
|---|---|---|---|
| `finalCtaHeadline` | Single-Line Text | 80 | Names the account and invites the goal |
| `finalCtaSubhead` | Rich Text | 1 sentence in `<p>` | Names the goal; for an event, its name and date as the marketer gave them |
| `finalCtaButton` | General Link | text 3–6 words | Same goal URL as `heroPrimaryCta`, verbatim |

## Rich text format

Allowed tags: `p`, `strong`, `a`. No headings, lists, inline styles, classes, images or tables.

## Checklist

- Every Single-Line Text field is within its limit; every icon name is from the list.
- Every General Link is `<link text="…" linktype="external" url="https://…" anchor="" target="_blank" />`; every Rich Text value is wrapped in `<p>`.
- The account name appears 5–10 times across all fields, including `heroHeadline`, `heroSubhead`, 2 of 3 feature descriptions, 3 of 5 FAQ questions and `finalCtaHeadline`.
- `heroPrimaryCta` and `finalCtaButton` use the goal URL exactly as the marketer gave it.
- Every account fact traces to the marketer or a dossier source; every Sitecore claim, figure and quote traces to its evidence.
- The testimonial is a real published quote with its real author, or all social proof fields are empty.
- The tone is peer-to-peer for the recipient: concrete outcomes, second person, no superlatives the evidence does not support.

## Guardrails

- **Evidence only.** Write account facts as public facts, and pains as opportunities ("Teams running IKEA's scale of markets…"), never as insider knowledge.
- **Verbatim quotes and figures.** Copy customer quotes, names, titles and figures exactly; never round or merge them.
- **Never publish** and never change workflow or publishing settings. The marketer reviews the page in Pages and publishes it.
- **Page fields only.** Leave the layout, partial designs, shared content, the example page and other accounts' pages untouched.
- **One account per page.** Update an existing page only after the marketer chose "update" in intake.
- **Missing tool, stop.** When a tool you need is unavailable, stop and report it; use only the tools the process names, for their stated purpose.
- **Images:** use only the marketer's image or an `abm-hero` library asset; account logos and account imagery stay off the page.
- **English only.**

## Output

1. The page: name, path, item ID, version, and the line **Open in Page builder: <link>**; new page or new version of an existing page.
2. The dossier summary and the chosen angle (one sentence each).
3. A table of every field: name, value (shortened for rich text) and evidence (marketer, URL, brand context or Sitecore knowledge).
4. **Gaps:** fields left empty and why (no published quote, no sourced stat, no `abm-hero` image, Brand Kit not applied).
5. **Review checklist** for the marketer: account facts and sources; Sitecore figures and quote; goal URL; gaps; the `Sitecore` variants visible on the page.
6. The line: "Review in Pages before publishing. Nothing was published."
