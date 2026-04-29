# Howdens — Headless Variant Checklist (Pages editor, ~2 min)

The Sitecore Agent API can place renderings and wire datasources, but **cannot set rendering parameters** (which variant a rendering renders). Use this checklist in **XM Cloud Pages** to switch each rendering to its Howdens-branded variant.

Open `Home` (`/sitecore/content/main/main-website/Home`) in the Pages editor, click each component, and in the right-hand **Properties / Headless Variant** dropdown choose the indicated variant.

| # | Page Order | Component (instance ID) | Set "Headless Variant" to | Variant Definition Item ID |
|---|------------|--------------------------|---------------------------|----------------------------|
| 1 | 1 | HeroBanner — `Howdens - Hero Banner` (`{F37C34D8-CBEB-4618-A68F-3303CDC0838D}`) | **Howdens** | `{BDAC170B-CDE4-4A57-91D5-3BC134A3C386}` |
| 2 | 2 | FeatureHighlight — `Howdens - Book Design Appointment` (`{2C3A6B2B-9B71-45A4-8865-57D2B5CE4000}`) | **Howdens** | `{5B08A2B9-794E-40F4-BEA3-1CDA19760388}` |
| 3 | 3 | FeatureCardsGrid — `Howdens - Categories` (`{BFE8CFEE-AF3D-442C-A9F4-4076CBBA8446}`) | **Howdens** | `{24FC77BC-E347-49B9-97F6-E27A6793DFE6}` |
| 4 | 4 | ImageGallery — `Howdens - Real Homes Gallery` (`{BCC2A45F-50CD-4C61-A08B-E800B24427E0}`) | **Gallery** (existing) | `{CF1F5876-5157-441C-A6FB-7BF150651345}` |
| 5 | 5 | ValuePropositionGrid — `Howdens - Kitchens by Colour` (`{DF2B00D5-A4B9-4EE8-B68D-333A6C552DFE}`) | **Howdens** | `{530F92AD-4BD2-4277-B137-F1564532EFEF}` |
| 6 | 6 | FeatureHighlight — `Howdens - Howdens Quartz` (`{6619C89B-7C61-4EED-8194-48306C4FC7B1}`) | **HowdensQuartz** | `{D7335B84-7550-4017-A742-B9655FD6973A}` |
| 7 | 7 | FeatureCardsGrid — `Howdens - Brand Promos` (`{6BE95976-51F4-43B8-B626-833A94CFA484}`) | **WithImages** (existing — exact match) | `{0378DF47-C562-4BE1-8BA7-DFE429A2015A}` |
| 8 | 8 | CTABanner — `Howdens - New Brochures` (`{ADF74BF0-A40F-4C3B-B89A-7AFB1FCC05E0}`) | **Howdens** | `{AEB3C3CB-C429-4ECB-9A23-E7855349153F}` |
| 9 | 9 | FeatureCardsGrid — `Howdens - Product Categories` (`{3195A080-0470-46B7-9B4E-7A97BFEC0360}`) | **HowdensCompact** | `{83745481-598A-424B-BF84-0BCBAB4A30A7}` |
| 10 | 10 | CTABanner — `Howdens - Bedroom Inspiration` (`{D38D2412-34A7-4149-9434-EEFDA71D4243}`) | **Howdens** | `{AEB3C3CB-C429-4ECB-9A23-E7855349153F}` |
| 11 | 11 | FeatureCardsGrid — `Howdens - Buying from Howdens` (`{C475DF06-8439-4A2B-A70F-761995BF97F8}`) | **HowdensJourney** | `{ADFD2B69-DBC2-4463-B9DD-B488507B6DC6}` |
| 12 | 12 | ValuePropositionGrid — `Howdens - Three CTAs` (`{0A012586-86EF-4593-B021-34FC56AFA5FF}`) | **HowdensCTA** | `{2DCD6F4B-E20E-4D6E-84D0-DC3FC08B5A7E}` |
| 13 | 13 | TestimonialBlock — `Howdens - Trustpilot Reviews` (`{68372DAB-A587-421A-BBB3-D75AD7D154C2}`) | **HowdensTrustpilot** | `{409BD6DC-90E1-4B62-AB8B-1769C6BDAA6D}` |

## Context-only components

These two are not added on the Home page directly — they're partial-design / chrome elements. Set their variants where placed.

| # | Component | Variant | Variant Definition Item ID |
|---|-----------|---------|----------------------------|
| 14 | NavigationHeader | **Howdens** | `{8C5E014A-420C-4380-ADF7-F7A543EB4989}` |
| 15 | SiteFooter | **Howdens** | `{B001FC97-555C-406A-8121-CDBE445DD6CF}` |

## Tips

- After switching a variant, click **Save** then refresh the canvas to see the new layout.
- The page will look unstyled in the canvas if the React dev server is not running — start it with `npm run dev` from `examples/basic-nextjs`.
- Image fields are intentionally empty until manually uploaded — see `manual-tasks.md`.
