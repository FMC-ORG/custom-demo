# Phase 6 — Page Assembly Log

Target page: `/sitecore/content/main/main-website/Home` — `{E2124310-F817-4644-8671-BFF8E72B66D7}`
Placeholder: `headless-main`

## Components added (in order)

| # | Position | Rendering | Instance ID | Datasource ID | Datasource Item |
|---|----------|-----------|-------------|---------------|-----------------|
| 1 | 2 | HeroBanner | `{F37C34D8-CBEB-4618-A68F-3303CDC0838D}` | `{5FCED15B-24D0-4642-9753-B792C3729EE4}` | Howdens - Hero Banner |
| 2 | 3 | FeatureHighlight | `{2C3A6B2B-9B71-45A4-8865-57D2B5CE4000}` | `{A77BA6E5-D186-41D0-B7A4-F23FBEFCD760}` | Howdens - Book Design Appointment |
| 3 | 4 | FeatureCardsGrid | `{BFE8CFEE-AF3D-442C-A9F4-4076CBBA8446}` | `{314FBD72-38BA-4D2D-958D-E05B1D1487C7}` | Howdens - Categories |
| 4 | 5 | ImageGallery | `{BCC2A45F-50CD-4C61-A08B-E800B24427E0}` | `{E7764758-AE4C-466C-8E7F-BA846A4EFA3A}` | Howdens - Real Homes Gallery |
| 5 | 6 | ValuePropositionGrid | `{DF2B00D5-A4B9-4EE8-B68D-333A6C552DFE}` | `{5D4E3D2C-CE68-4C61-BF3D-C48AB645672D}` | Howdens - Kitchens by Colour |
| 6 | 7 | FeatureHighlight | `{6619C89B-7C61-4EED-8194-48306C4FC7B1}` | `{C5AD17C8-65C7-42E7-A63F-4591293D7B80}` | Howdens - Howdens Quartz |
| 7 | 8 | FeatureCardsGrid | `{6BE95976-51F4-43B8-B626-833A94CFA484}` | `{4C6DD308-4360-4928-B5A0-6C5A27B09B28}` | Howdens - Brand Promos |
| 8 | 9 | CTABanner | `{ADF74BF0-A40F-4C3B-B89A-7AFB1FCC05E0}` | `{86C1AF4D-51A0-4AD4-A7BC-D11F88B3090E}` | Howdens - New Brochures |
| 9 | 10 | FeatureCardsGrid | `{3195A080-0470-46B7-9B4E-7A97BFEC0360}` | `{B1307596-B529-4699-AF7E-C1AC791FB08F}` | Howdens - Product Categories |
| 10 | 11 | CTABanner | `{D38D2412-34A7-4149-9434-EEFDA71D4243}` | `{B79CFC1D-C0F6-4A92-BD92-178526656B0A}` | Howdens - Bedroom Inspiration |
| 11 | 12 | FeatureCardsGrid | `{C475DF06-8439-4A2B-A70F-761995BF97F8}` | `{D32A4177-8B2C-4957-BFF3-A54A93D2C3D8}` | Howdens - Buying from Howdens |
| 12 | 13 | ValuePropositionGrid | `{0A012586-86EF-4593-B021-34FC56AFA5FF}` | `{CB9038C2-5D4C-46EF-AEEC-90D2F3762233}` | Howdens - Three CTAs |
| 13 | 14 | TestimonialBlock | `{68372DAB-A587-421A-BBB3-D75AD7D154C2}` | `{A853E936-8FA6-4491-AC91-956740CBE028}` | Howdens - Trustpilot Reviews |

## Summary

- **Components added:** 13/13 (matches build plan `phase1_sitecore`)
- **Datasources wired:** 13/13
- **Order:** preserved via sequential add (each appended to end of `headless-main`)
- **Existing OOB components on Home before this run:** 0 (no cleanup needed)
- **Headless Variant assignment:** must be done manually in Pages editor — see `variant-checklist.md`

## Manual placements (context-only)

These components are part of the page chrome / partial design and must be placed manually if not already wired:

- **NavigationHeader** — position 1
- **SiteFooter** — position 15
