# Press Release From Results

Fill or update a HEINEKEN **Press Release** page in Sitecore from an attached results document (trading update, half-year or full-year results). Use when the user says things like "update this page based on this file", "create the FY results page from this document", or "fill the press release with these results".

The page layout, contacts and closing legal text are shared and already in place. This skill only writes the **page fields**.

## Inputs

- **Results file** (required): the attached document with the results. It is the only source of facts.
- **Target page** (one of):
  - the page the user is on or names, or
  - a new page: duplicate `Q3 Trading Update` (see *Site facts*) under `Newsroom`, named after the release (e.g. `FY 2026 Results`).

If the target page is unclear, ask once before writing.

## Site facts

| Item | Value |
|---|---|
| Site name | `main-website` |
| Language | `en` |
| Newsroom (parent page) | `80389afe-cf44-492b-8206-789f7c5ca227` |
| Example release to duplicate: Q3 Trading Update | `cbfb1456-8720-42a2-a650-56be5e71d225` |
| Page template | Press Release Page Template `33dba4e3-28cc-4cbc-948c-5b79bb5f2991` |
| People folder (quote authors) | `/sitecore/content/main/main-website/Data/People` |

## Field map

Write each field with `update_page_content` (`target: "field"`, `key` = field name). Write metadata with `update_page_metadata`.

| Field (`key`) | Type | What to put | Format |
|---|---|---|---|
| `Title` | Single-Line Text | Official release headline | Plain text, e.g. `HEINEKEN N.V. reports 2026 full year results` |
| `ReleaseType` | Single-Line Text | `Regulatory news` for results; `Media release` otherwise | Plain text |
| `ReleaseLocation` | Single-Line Text | Dateline city | Plain text, e.g. `Amsterdam` |
| `ReleaseTime` | Single-Line Text | Release time with time zone | e.g. `07:00 CET` |
| `ArticlePublicationDate` | Date | Release date | `yyyyMMddT000000Z`, e.g. `20270210T000000Z` |
| `ArticleReadTime` | Single-Line Text | Estimated reading time | e.g. `6 min read` |
| `ReleaseSubheadline` | Multi-Line Text | One-sentence summary line under the title | Plain text, no trailing period needed |
| `ArticleKeyTakeaways` | Rich Text | Highlight sections | HTML, see *Rich text rules* |
| `ReleaseQuote` | Multi-Line Text | Executive quote | Plain text, **verbatim** from the file, without quotation marks |
| `ArticleAuthor` | Droptree | Person who gave the quote | Item ID of the matching People item, as `{GUID}` |
| `ArticleContent` | Rich Text | Outlook section | HTML, see *Rich text rules* |
| `ConferenceCallDetails` | Rich Text | Call or webcast details | HTML, see *Rich text rules* |
| `ReleaseDownload` | General Link | Full release PDF | `<link text="Download the <release name> (PDF)" linktype="external" url="<PDF URL>" target="_blank" />` |
| `ArticleImage` | Image | Card and social image | Leave unchanged unless the user provides a new image |

Metadata (`update_page_metadata`):

| Metadata | What to put |
|---|---|
| Title (`baseMetadataTitle`) | Short form, e.g. `HEINEKEN N.V. 2026 Full Year Results` |
| Description (`baseMetadataDescription`) | One sentence with 2–3 headline figures, max 160 characters |
| Open Graph description (`baseOgDescription`) | The subheadline |
| Navigation title (`NavigationTitle`) | Short name, e.g. `FY 2026 Results` |

## Rich text rules

Use only `h2`, `h3`, `p`, `ul`, `li`, `strong` and `a`. No inline styles, no classes, no images, no tables.

- **`ArticleKeyTakeaways`:** one `h3` per highlight theme taken from the file (for example *Growth*, *Profitability*, *Capital Efficiency*, *Strategy*), each followed by a `ul` of short bullet points. Keep the file's order and wording; shorten only by removing words, never by changing numbers.
- **`ArticleContent`:** start with `<h2>Outlook YYYY</h2>`, then a `p` introduction and a `ul` of guidance items. Put the metric name in `<strong>`. End with `<p>The full press release is available for download below.</p>`.
- **`ConferenceCallDetails`:** start with `<h2>Conference call details</h2>`, then a `p` with time and access, a `ul` of dial-in numbers, and a `p` with the password, if the file has them.

Example highlight block:

```html
<h3>Growth: Premium and LoNo leading the portfolio</h3>
<ul>
<li>Total volume increased 2.4%; consolidated volume grew 1.1%.</li>
<li>Premium grew 8%, beyond beer up 10%, LoNo 15% higher.</li>
</ul>
```

## Process

1. Read the whole results file. List the release name, date, time, location, highlights, quote and speaker, outlook, call details and PDF link.
2. Resolve the target page. For a new release, call `duplicate_page` on the Q3 Trading Update page with `newName` = release name (URL-safe) and `displayName` = release name, then work on the duplicate.
3. Find the quote author in the People folder by first and last name. If no People item exists, do **not** set `ArticleAuthor`; report it as a gap.
4. Build every field value following the *Field map* and *Rich text rules*.
5. Check every number, percentage, currency amount and date against the file before writing (see *Guardrails*).
6. Write fields with `update_page_content` in one call, and metadata with `update_page_metadata`.
7. Read the page back and confirm each field holds the intended value.
8. Report back (see *Output*).

## Guardrails

- **Never invent or change figures.** Every number in any field must appear in the results file. If a field's information is missing, leave the field unchanged and list it as a gap.
- **Quote verbatim.** Do not paraphrase, merge or shorten the executive quote, except to drop a sentence the user asks to remove.
- **Price-sensitive content.** Do not publish, and do not change workflow or publishing settings. The user schedules publication.
- **Stay in your lane.** Do not change the page layout, the contacts block, the closing legal text (boilerplate), other pages or shared datasources.
- **One release per page.** Never overwrite a different release's page unless the user explicitly asks for it.
- **English only**, in HEINEKEN's corporate tone: factual, concise, no marketing superlatives that are not in the file.

## Output

Reply with:

1. The page that was updated (name and link), and whether it was newly duplicated.
2. A table of every field: name, new value (shortened for rich text), and source location in the file (section or page).
3. **Gaps:** fields left unchanged and why (missing in file, no People item, no PDF link).
4. **Checks for the editor:** "Review in Pages before scheduling. Nothing was published."
