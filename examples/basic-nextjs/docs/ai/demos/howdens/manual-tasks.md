# Howdens Demo — Manual Tasks (SE Checklist)

The Sitecore Agent API (`user-marketer` MCP) cannot perform a few operations on its own. Before showing this demo to a client, complete the tasks below in **XM Cloud Pages** and the **Media Library**.

Estimated time: **15–25 minutes** (mostly image uploads).

---

## 1. Upload images to the Media Library

The agent populated all text, RichText and General Link fields, but image fields are empty because the MCP exposes no `upload_asset` tool. Upload each image below to the indicated Media Library path, then assign it to the listed Sitecore datasource items.

> Images are sourced from `https://www.howdens.com/...` — download from the live site, or substitute brand-appropriate stock photography. Match the `altText` exactly when uploading.

### 1.1 Hero (position 2)

| Datasource Item | Field | Source URL hint | Media Library Path | Alt text |
|-----------------|-------|-----------------|--------------------|----------|
| Howdens - Hero Banner (`{5FCED15B-24D0-4642-9753-B792C3729EE4}`) | `HeroImage` | `lamona-induction-hob` from howdens.com | `/sitecore/media library/Project/main/main-website/howdens/hero/lamona-induction-hob` | LAMONA induction hob with cooking pan, dark slate background |

### 1.2 Book a FREE design appointment (position 3)

| Item | Field | Source | MLP | Alt |
|---|---|---|---|---|
| Howdens - Book Design Appointment (`{A77BA6E5-D186-41D0-B7A4-F23FBEFCD760}`) | `FeatureImage` | `designer-with-customer-cooking` | `…/howdens/lifestyle/design-appointment` | Howdens designer planning a kitchen with customer at home |

### 1.3 Categories (position 4) — three children

| Child Item | Field | MLP | Alt |
|---|---|---|---|
| Howdens - Kitchens | `CardImage` | `…/howdens/categories/kitchens` | Modern blue kitchen with island |
| Howdens - Bedrooms | `CardImage` | `…/howdens/categories/bedrooms` | Fitted bedroom wardrobes in oak finish |
| Howdens - Joinery | `CardImage` | `…/howdens/categories/joinery` | Oak doors and stair joinery interior |

### 1.4 Real Homes Gallery (position 5)

| Item | Field | MLP | Alt |
|---|---|---|---|
| Howdens - Real Homes Gallery (`{E7764758-AE4C-466C-8E7F-BA846A4EFA3A}`) | `GalleryImage` | `…/howdens/galleries/real-homes` | Six-tile collage of real Howdens kitchens, bedrooms, bathrooms, utility rooms |

### 1.5 Howdens Quartz (position 7)

| Item | Field | MLP | Alt |
|---|---|---|---|
| Howdens - Howdens Quartz (`{C5AD17C8-65C7-42E7-A63F-4591293D7B80}`) | `FeatureImage` | `…/howdens/products/quartz-worktops` | Howdens Quartz worktop in a modern kitchen |

### 1.6 Brand promos (position 8) — three children

| Child | Field | MLP | Alt |
|---|---|---|---|
| Howdens - The Howdens Expo | `CardImage` | `…/howdens/promos/howdens-expo` | The Howdens Expo catalog cover |
| Howdens - Kitchen Visualiser | `CardImage` | `…/howdens/promos/kitchen-visualiser` | Howdens 3D Kitchen Visualiser tool |
| Howdens - Grand Designs Live | `CardImage` | `…/howdens/promos/grand-designs-live` | Grand Designs Live event banner |

### 1.7 New brochures banner (position 9)

| Item | Field | MLP | Alt |
|---|---|---|---|
| Howdens - New Brochures (`{86C1AF4D-51A0-4AD4-A7BC-D11F88B3090E}`) | `BackgroundImage` | `…/howdens/banners/brochures` | Collage of Howdens brochure covers (Kitchens / Bedrooms / Joinery) |

### 1.8 Product categories strip (position 10) — four children

| Child | Field | MLP | Alt |
|---|---|---|---|
| Howdens - Oak Wall Panelling | `CardImage` | `…/howdens/products/oak-wall-panelling` | Oak wall panelling in a living room |
| Howdens - Oak Doors | `CardImage` | `…/howdens/products/oak-doors` | Oak internal door |
| Howdens - Bedroom Lighting | `CardImage` | `…/howdens/products/bedroom-lighting` | Bedroom with built-in lighting |
| Howdens - Oak Flooring | `CardImage` | `…/howdens/products/oak-flooring` | Oak flooring in a hallway |

### 1.9 Bedroom inspiration banner (position 11)

| Item | Field | MLP | Alt |
|---|---|---|---|
| Howdens - Bedroom Inspiration (`{B79CFC1D-C0F6-4A92-BD92-178526656B0A}`) | `BackgroundImage` | `…/howdens/banners/bedroom-inspiration` | Fitted bedroom with built-in wardrobes and styling |

### 1.10 Buying from Howdens (position 12) — three children

| Child | Field | MLP | Alt |
|---|---|---|---|
| Howdens - Tell Us Your Needs | `CardImage` | `…/howdens/journey/tell-us-needs` | Howdens designer talking with customer |
| Howdens - Get a 3D Plan | `CardImage` | `…/howdens/journey/3d-plan` | 3D kitchen plan being created on screen |
| Howdens - Order and Fit | `CardImage` | `…/howdens/journey/order-and-fit` | Howdens depot pickup with tradesperson |

### 1.11 Trustpilot reviews (position 14)

The Trustpilot variant (`HowdensTrustpilot`) does not require per-review images — it uses inline-styled green stars. Author images and company logos are **left empty by design**.

---

## 2. Set Headless Variants in Pages editor (~2 min)

The Agent API cannot set rendering parameters. For every component on the Home page, switch the **Headless Variant** dropdown in the Pages right-hand Properties pane to the Howdens-specific variant.

See [`variant-checklist.md`](variant-checklist.md) for the full table — 13 components to update on Home, plus NavigationHeader and SiteFooter.

---

## 3. Place context-only components (NavigationHeader + SiteFooter)

These two are not added on the Home page directly. Either:

- They're already wired into the **partial design** for the site — verify by opening any page in Pages editor and confirming the header/footer render. Just switch their Headless Variant to **Howdens** there.
- Or add them at the appropriate placeholder (`headless-header` / `headless-footer`) on the partial design / shared layout.

| Component | Variant | Variant Definition Item |
|-----------|---------|-------------------------|
| NavigationHeader | Howdens | `{8C5E014A-420C-4380-ADF7-F7A543EB4989}` |
| SiteFooter | Howdens | `{B001FC97-555C-406A-8121-CDBE445DD6CF}` |

---

## 4. Optional polish

- **OOB starter-kit components on Home** — none were present at start (Home was empty), so nothing to remove.
- **Personalization datasource templates** — for future variant tests, clone any `Howdens - <Component>` item into `Howdens - <Component> - <Segment>` and use the Personalization rules engine to swap them per audience.
- **Trustpilot rating header** — the variant uses `#00B67A` (Trustpilot green) inline because Trustpilot is a third-party brand element. If the rating count changes, edit the `SectionTitle` field on `Howdens - Trustpilot Reviews`.

---

## 5. Verify

1. Run the dev server: `npm run dev` from `examples/basic-nextjs`.
2. Open the Home page in the Pages canvas — all 13 sections should render with Howdens look-and-feel once images are uploaded and variants are selected.
3. Confirm:
   - Hero shows dark slate split with red guarantee badge over induction hob image
   - Categories render as 3-up image cards with white pill labels
   - Colour swatches render as 6 round circles with correct hex fills
   - Trustpilot section shows green Excellent badge + 5-star row + horizontal quote-card carousel
   - Footer is dark navy 4-column with crown logo
4. Re-run `node docs/ai/scripts/validate-components.mjs` — should be 18/18 PASS.
