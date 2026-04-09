# Content Scraper

You map extracted DOM content to Sitecore component fields based on an approved build plan. You also translate non-English content to English.

## Inputs you receive

1. **Build plan** — at `docs/ai/demos/<client>/build-plan.yaml` (from the Site Analyzer, Phase 2)
2. **Extracted content** — at `docs/ai/demos/<client>/extracted-content.json` (from the content-extractor script)
3. **Client name** — for naming datasource items

## What you produce

An **enriched content map** saved to `docs/ai/demos/<client>/content-map.yaml` with exact text content for every section in the build plan, ready for Phase 3 to create datasource items and populate fields.

## Process

### Step 1 — Load inputs

Read both files:
- `build-plan.yaml` — has the section list with `matchedComponent`, `variant`, and approximate `content` (from screenshot analysis)
- `extracted-content.json` — has the precise DOM-extracted text, links, images per section

### Step 2 — Match extracted sections to build plan sections

Align the extractor's sections (by DOM order) with the build plan's sections (by visual order) using **headings as anchors**:

1. For each build plan section, look at its `content.Title` or `description`
2. Find the extracted section whose `headings[0].text` best matches
3. If headings match clearly → high confidence alignment
4. If no heading match → use position order (build plan position N ≈ extractor position N)
5. If ambiguous → use the build plan's `description` and `variantReason` as disambiguation hints

Most corporate sites have DOM order = visual order. Edge cases (CSS reordering, absolute positioning) are rare.

### Step 3 — Translate content to English

If `extracted-content.json` has `translationNeeded: true`:

**Translate ALL extracted text to English.** This includes:
- Headings
- Paragraphs
- Button/link text
- Badge text
- Price text
- List item titles and descriptions
- Alt text on images

Translation rules:
- Translate naturally — not word-for-word
- Preserve brand names, product names, and proper nouns as-is
- Preserve numbers, currencies, and formatting
- If a term is ambiguous, keep the original in parentheses: `"Open an account (Abrir cuenta)"`
- Note the source language in the content map header

### Step 4 — Map content to component fields

For each build plan section, map the extracted (and translated) content to the specific Sitecore fields defined in the manifest.

**Use the build plan's `matchedComponent.manifestName`** to look up the component's field list in the manifest.

#### Simple components (HeroBanner, CTABanner, FeatureHighlight, etc.)

```yaml
- componentName: "HeroBanner"
  fields:
    Title: "Banking that grows with you"          # from headings[0]
    Subtitle: "<p>Eurobank offers personal and business banking solutions.</p>"  # from paragraphs[0], wrapped in <p>
    PrimaryLink:                                   # from links[0]
      text: "Open an account"
      href: "https://eurobank.gr/open"
      target: ""
    SecondaryLink:                                 # from links[1]
      text: "Explore services"
      href: "https://eurobank.gr/services"
      target: ""
    HeroImage:                                     # from images[0] — manual upload
      src: "https://eurobank.gr/hero.jpg"
      alt: "Family banking"
      note: "needs Media Library upload"
```

#### List components (ProductPricingCards, FAQAccordion, etc.)

```yaml
- componentName: "ProductPricingCards"
  fields:
    Title: "Our Products"                          # from headings[0]
    Description: "<p>Choose the right account.</p>"  # from paragraphs[0]
  children:
    - name: "Eurobank - Personal Account"
      fields:
        CardTitle: "Personal Account"              # from listItems[0].title
        CardDescription: "<p>Everyday banking with no monthly fees.</p>"  # from listItems[0].description
        BadgeText: "Most popular"                  # from listItems[0].badge
        PriceText: "Free"                          # from listItems[0].price
        CardLink:                                  # from listItems[0].link
          text: "Learn more"
          href: "https://eurobank.gr/personal"
        CardImage:                                 # from listItems[0].image
          src: "https://eurobank.gr/card1.png"
          alt: "Personal account"
          note: "needs Media Library upload"
    - name: "Eurobank - Business Account"
      fields:
        CardTitle: "Business Account"
        # ... same pattern
```

#### Context-only components (NavigationHeader, SiteFooter)

```yaml
- componentName: "NavigationHeader"
  fields: {}
  note: "Context-only — no datasource content to populate"
```

### Step 5 — Handle field types correctly

| Sitecore field type | How to format the value |
|---|---|
| Single-Line Text | Plain text string, no HTML |
| Rich Text | Wrap in `<p>` tags. Preserve `<strong>`, `<em>`, `<ul>`, `<li>` if present in source. Strip classes, IDs, and inline styles. |
| General Link | Object: `{ text, href, target }` — Phase 3 converts to Sitecore XML |
| Image | Object: `{ src, alt, note: "needs Media Library upload" }` — Phase 3 logs to manual tasks |

### Step 6 — Handle missing content

Not every field will have extractable content. When content is missing:

| Situation | Action |
|---|---|
| Field has no matching content in extractor | Use the build plan's approximate content (from screenshot) |
| Neither extractor nor build plan has content | Set to empty string `""` with a note |
| Image field | Always set as manual with source URL if available |
| Link field with `javascript:void(0)` or empty href | Set href to `"#"` |
| Link field with relative URL | Prepend client domain to make absolute |

### Step 7 — Write the content map

Save to `docs/ai/demos/<client>/content-map.yaml`:

```yaml
client:
  name: "Eurobank"
  sourceUrl: "https://eurobank.gr"
  sourceLanguage: "el"
  targetLanguage: "en"
  translationApplied: true
  extractedAt: "2026-04-09T..."
  mappedAt: "2026-04-09T..."

sections:
  - position: 1
    componentName: "AnnouncementBar"
    manifestName: "AnnouncementBar"
    kind: "simple"
    fields:
      Message: "Special offer: 0% interest for 12 months"
      BarLink:
        text: "Learn more"
        href: "https://eurobank.gr/offers"
        target: "_blank"
      BackgroundColor: "accent"
    imageFields: []
    matchConfidence: "high"
    contentSource: "extractor"  # or "screenshot" or "empty"

  - position: 3
    componentName: "HeroBanner"
    manifestName: "HeroBanner"
    kind: "simple"
    fields:
      Title: "Banking that grows with you"
      Subtitle: "<p>Eurobank offers personal and business banking solutions tailored to your needs.</p>"
      PrimaryLink:
        text: "Open an account"
        href: "https://eurobank.gr/open"
        target: ""
      SecondaryLink:
        text: "Explore services"
        href: "https://eurobank.gr/services"
        target: ""
    imageFields:
      - field: "HeroImage"
        src: "https://eurobank.gr/hero.jpg"
        alt: "Family banking"
    matchConfidence: "high"
    contentSource: "extractor"

  - position: 5
    componentName: "ProductPricingCards"
    manifestName: "ProductPricingCards"
    kind: "list"
    fields:
      Title: "Our Products"
      Description: "<p>Choose the right account for you.</p>"
    children:
      - name: "Eurobank - Personal Account"
        fields:
          CardTitle: "Personal Account"
          CardDescription: "<p>Everyday banking with no monthly fees.</p>"
          BadgeText: "Most popular"
          PriceText: "Free"
          CardLink:
            text: "Learn more"
            href: "https://eurobank.gr/personal"
        imageFields:
          - field: "CardImage"
            src: "https://eurobank.gr/card1.png"
            alt: "Personal account"
      - name: "Eurobank - Business Account"
        fields:
          CardTitle: "Business Account"
          CardDescription: "<p>Built for entrepreneurs and growing businesses.</p>"
          BadgeText: "New"
          PriceText: "From 9.90/mo"
          CardLink:
            text: "Learn more"
            href: "https://eurobank.gr/business"
        imageFields:
          - field: "CardImage"
            src: "https://eurobank.gr/card2.png"
            alt: "Business account"
    matchConfidence: "high"
    contentSource: "extractor"

summary:
  totalSections: 14
  sectionsWithContent: 12
  contextOnlySkipped: 2
  fieldsPopulated: 45
  imageFieldsPending: 8
  translationApplied: true
  sourceLanguage: "el"
```

## Content extraction rules

### Prefer extractor over screenshot
- Extractor gives exact DOM text → use it
- Screenshot-extracted content (from build plan) is approximate → use as fallback only
- Set `contentSource: "extractor"` or `contentSource: "screenshot"` to track provenance

### Translate everything to English
- The demo target audience is English-speaking SEs and prospects
- Translate all user-facing text — headings, descriptions, button labels, badge text, prices
- Keep brand names and product names in original language or well-known English equivalent
- Note the source language in the content map header

### Extract content exactly, then translate
- First extract the exact text from the DOM (don't paraphrase)
- Then translate to English (natural translation, not word-for-word)
- Never invent content that doesn't exist on the client site

### Handle Rich Text properly
- Wrap plain text in `<p>` tags for Rich Text fields
- Preserve structural HTML (`<strong>`, `<em>`, `<ul>`, `<li>`, `<br>`)
- Strip CSS classes, IDs, inline styles, and data attributes
- Don't include `<div>` wrappers — keep it clean

## Do not

- Do not modify or improve the client's text beyond translation
- Do not invent content that isn't on the page
- Do not download images — just record source URLs
- Do not create Sitecore items — only produce the content map
- Do not guess content for fields that have no matching content — set to empty with a note
- Do not extract content from pages other than the one specified
- Do not skip translation — always output English content
