# Field map: Press Release page

## Site facts

| Item | Value |
|---|---|
| Site name | `main-website` |
| Language | `en` |
| Newsroom (parent page) ID | `80389afe-cf44-492b-8206-789f7c5ca227` |
| Example release to duplicate: "Q3 Trading Update" | `cbfb1456-8720-42a2-a650-56be5e71d225` |
| Page template | Press Release Page Template, `33dba4e3-28cc-4cbc-948c-5b79bb5f2991` |
| People folder (quote speakers) | `/sitecore/content/main/main-website/Data/People` |

## Page fields (`update_page_content`, `target: "field"`)

| Field `key` | Type | Content | Format and example |
|---|---|---|---|
| `Title` | Single-Line Text | Official release headline | `HEINEKEN N.V. reports 2026 full year results` |
| `ReleaseType` | Single-Line Text | `Regulatory news` for results, otherwise `Media release` | `Regulatory news` |
| `ReleaseLocation` | Single-Line Text | Dateline city | `Amsterdam` |
| `ReleaseTime` | Single-Line Text | Release time and time zone | `07:00 CET` |
| `ArticlePublicationDate` | Date | Release date | `yyyyMMddT000000Z`, e.g. `20270210T000000Z` |
| `ArticleReadTime` | Single-Line Text | Estimated reading time (about 200 words per minute) | `6 min read` |
| `ReleaseSubheadline` | Multi-Line Text | The one-line summary under the headline | `Record premium growth and margin expansion as EverGreen 2030 delivers ahead of plan` |
| `ArticleKeyTakeaways` | Rich Text | Highlight sections | HTML, see `rich-text-format.md` |
| `ReleaseQuote` | Multi-Line Text | Executive quote, verbatim | Plain text without surrounding quotation marks |
| `ArticleAuthor` | Droptree | Quote speaker | People item ID in braces, e.g. `{EA6217AC-C73B-48E6-AB64-3BA572FF323D}` |
| `ArticleContent` | Rich Text | Outlook section | HTML, see `rich-text-format.md` |
| `ConferenceCallDetails` | Rich Text | Call or webcast details | HTML, see `rich-text-format.md` |
| `ReleaseDownload` | General Link | Full release PDF | `<link text="Download the 2026 Full Year Results (PDF)" linktype="external" url="https://…" target="_blank" />` |
| `ArticleImage` | Image | Card and social image | Leave unchanged unless the user supplies a new image |

## Metadata (`update_page_metadata`)

| Field | Content |
|---|---|
| `baseMetadataTitle` | Short title, e.g. `HEINEKEN N.V. 2026 Full Year Results` |
| `baseMetadataDescription` | One sentence with 2–3 headline figures, max 160 characters |
| `baseOgDescription` | Same as `ReleaseSubheadline` |
| `NavigationTitle` | Short name, e.g. `FY 2026 Results` |

## Do not touch

- The page layout, and the contacts and boilerplate blocks (shared by all releases).
- Fields not listed above.
