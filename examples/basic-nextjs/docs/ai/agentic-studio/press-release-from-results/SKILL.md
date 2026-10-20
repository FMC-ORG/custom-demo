# Press Release From Results

Fill or update a HEINEKEN **Press Release** page from an attached results document (trading update, half-year or full-year results). Use when the user says "update this page based on this file", "create the FY results page from this document", or "fill the press release with these results".

The layout, the contacts block and the closing legal text are shared and already on every Press Release page. This skill writes **page fields only**.

## Inputs

- **Results file** (required): the attached document. It is the only source of facts.
- **Target page**, one of:
  - the page the user is on or names;
  - a new page: duplicate the example release (see `references/field-map.md`, *Site facts*) under Newsroom, named after the release, e.g. `FY 2026 Results`.

If the target page is unclear, ask once before writing anything.

## Process

1. Read the whole results file. Note: release name, date, time, location, highlight sections, executive quote and speaker, outlook, conference-call details, PDF link.
2. Resolve the target page. For a new release, call `duplicate_page` on the example release with `newName` = release name in URL form (e.g. `fy-2026-results`) and `displayName` = release name. Work on the duplicate.
3. Find the quote speaker in the People folder by first and last name. If there is no People item, do **not** set `ArticleAuthor`; report it as a gap.
4. Build every value as described in `references/field-map.md`. Format rich text exactly as in `references/rich-text-format.md`.
5. Check every number, percentage, currency amount and date against the file (see *Guardrails*).
6. Write all page fields with one `update_page_content` call (`target: "field"`, `key` = field name). Write metadata with `update_page_metadata`.
7. Read the page back and confirm each field holds the intended value.
8. Reply as described in *Output*.

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
