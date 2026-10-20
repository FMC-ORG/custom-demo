# Press Release From Results

Fill or update a HEINEKEN **Press Release** page from an attached results document (trading update, half-year or full-year results). Use when the user says "update this page based on this file", "create the FY results page from this document", or "fill the press release with these results".

The layout, the contacts block and the closing legal text are shared and already on every Press Release page. This skill writes **page fields only**.

## Inputs

- **Results file** (required): the attached document. It is the only source of facts.
- **Target page**, one of:
  - the page the user is on or names;
  - a new page: duplicate the example release (see *Site facts*) under Newsroom, named after the release, e.g. `FY 2026 Results`.

If the target page is unclear, ask once before writing anything.

## Process

1. Read the whole results file. Note: release name, date, time, location, highlight sections, executive quote and speaker, outlook, conference-call details, PDF link.
2. Resolve the target page. For a new release, call `duplicate_page` on the example release with `newName` = release name in URL form (e.g. `fy-2026-results`) and `displayName` = release name. Work on the duplicate.
3. Find the quote speaker in the People folder by first and last name. If there is no People item, do **not** set `ArticleAuthor`; report it as a gap.
4. Build every value as described in *Field map*. Format rich text exactly as in *Rich text format*.
5. Check every number, percentage, currency amount and date against the file (see *Guardrails*).
6. Write all page fields with one `update_page_content` call (`target: "field"`, `key` = field name). Write metadata with `update_page_metadata`.
7. Read the page back and confirm each field holds the intended value.
8. Reply as described in *Output*.

## Field map

### Site facts

| Item | Value |
|---|---|
| Site name | `main-website` |
| Language | `en` |
| Newsroom (parent page) ID | `80389afe-cf44-492b-8206-789f7c5ca227` |
| Example release to duplicate: "Q3 Trading Update" | `cbfb1456-8720-42a2-a650-56be5e71d225` |
| Page template | Press Release Page Template, `33dba4e3-28cc-4cbc-948c-5b79bb5f2991` |
| People folder (quote speakers) | `/sitecore/content/main/main-website/Data/People` |

### Page fields (`update_page_content`, `target: "field"`)

| Field `key` | Type | Content | Format and example |
|---|---|---|---|
| `Title` | Single-Line Text | Official release headline | `HEINEKEN N.V. reports 2026 full year results` |
| `ReleaseType` | Single-Line Text | `Regulatory news` for results, otherwise `Media release` | `Regulatory news` |
| `ReleaseLocation` | Single-Line Text | Dateline city | `Amsterdam` |
| `ReleaseTime` | Single-Line Text | Release time and time zone | `07:00 CET` |
| `ArticlePublicationDate` | Date | Release date | `yyyyMMddT000000Z`, e.g. `20270210T000000Z` |
| `ArticleReadTime` | Single-Line Text | Estimated reading time (about 200 words per minute) | `6 min read` |
| `ReleaseSubheadline` | Multi-Line Text | The one-line summary under the headline | `Record premium growth and margin expansion as EverGreen 2030 delivers ahead of plan` |
| `ArticleKeyTakeaways` | Rich Text | Highlight sections | HTML, see *Rich text format* |
| `ReleaseQuote` | Multi-Line Text | Executive quote, verbatim | Plain text without surrounding quotation marks |
| `ArticleAuthor` | Droptree | Quote speaker | People item ID in braces, e.g. `{EA6217AC-C73B-48E6-AB64-3BA572FF323D}` |
| `ArticleContent` | Rich Text | Outlook section | HTML, see *Rich text format* |
| `ConferenceCallDetails` | Rich Text | Call or webcast details | HTML, see *Rich text format* |
| `ReleaseDownload` | General Link | Full release PDF | `<link text="Download the 2026 Full Year Results (PDF)" linktype="external" url="https://…" target="_blank" />` |
| `ArticleImage` | Image | Card and social image | Leave unchanged unless the user supplies a new image |

### Metadata (`update_page_metadata`)

| Field | Content |
|---|---|
| `baseMetadataTitle` | Short title, e.g. `HEINEKEN N.V. 2026 Full Year Results` |
| `baseMetadataDescription` | One sentence with 2–3 headline figures, max 160 characters |
| `baseOgDescription` | Same as `ReleaseSubheadline` |
| `NavigationTitle` | Short name, e.g. `FY 2026 Results` |

### Do not touch

- The page layout, and the contacts and boilerplate blocks (shared by all releases).
- Fields not listed above.

## Rich text format

Allowed tags only: `h2`, `h3`, `p`, `ul`, `li`, `strong`, `a`. No inline styles, classes, images or tables. Keep the file's order and wording; shorten only by removing words, never by changing numbers.

### `ArticleKeyTakeaways`: highlight sections

One `h3` per theme in the file (for example *Growth*, *Profitability*, *Capital Efficiency*, *Strategy*), each followed by a `ul` of short bullets.

```html
<h3>Growth: Premium and LoNo leading the portfolio</h3>
<ul>
<li>Total volume increased 2.4%; consolidated volume grew 1.1% and licensed volume up 19.8%.</li>
<li>Premium grew 8%, beyond beer up 10%, and low- and no-alcohol 15% higher.</li>
</ul>
<h3>Profitability: Third consecutive year of margin expansion</h3>
<ul>
<li>Operating profit grew 7.9%; operating profit margin expanded 70 bps to 15.3%.</li>
</ul>
```

### `ArticleContent`: outlook

Start with `<h2>Outlook YYYY</h2>`, then one introduction paragraph and a list of guidance items with the metric in `<strong>`. Always end with the download sentence.

```html
<h2>Outlook 2027</h2>
<p>We expect a gradually improving consumer environment in most of our markets. For 2027 we anticipate:</p>
<ul>
<li><strong>Operating profit</strong> to grow between 4% and 8%.</li>
<li>An <strong>effective tax rate (ETR)</strong> of around 27.5%.</li>
</ul>
<p>The full press release is available for download below.</p>
```

### `ConferenceCallDetails`

Start with `<h2>Conference call details</h2>`: one paragraph with time and access, a list of dial-in numbers, and a paragraph with the password, if the file has them.

```html
<h2>Conference call details</h2>
<p>HEINEKEN will host an analyst and investor conference call today at 10:00 CET / 09:00 GMT. A replay will be available after the call.</p>
<ul>
<li>United Kingdom (Local): 020 3936 0000</li>
<li>Netherlands (Local): 085 888 0000</li>
</ul>
<p>Participation password for all countries: 210227</p>
```

## Guardrails

- **Never invent or change figures.** Every number in any field must appear in the results file. If information for a field is missing, leave the field unchanged and list it as a gap.
- **Quote verbatim.** Do not paraphrase, merge or shorten the executive quote.
- **Do not publish** and do not change workflow or publishing settings. Results are price-sensitive; the editor schedules publication.
- **Page fields only.** Do not change the layout, the contacts block, the closing legal text, shared datasources or other pages.
- **One release per page.** Never overwrite another release's page unless the user explicitly asks.
- **English only**, in HEINEKEN's corporate tone: factual and concise. Add no claims or superlatives that are not in the file.

## Output

1. The page updated (name and link) and whether it was newly duplicated.
2. A table of every field: name, new value (shortened for rich text), and where it came from in the file.
3. **Gaps:** fields left unchanged and why (missing in the file, no People item, no PDF link).
4. The line: "Review in Pages before scheduling. Nothing was published."
