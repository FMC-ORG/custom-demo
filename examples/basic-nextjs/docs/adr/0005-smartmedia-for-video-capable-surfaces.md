# 0005 — SmartMedia for video-capable surfaces

## Status

Accepted — 2026-06-03

## Context

Content Hub public URLs used as Sitecore Image field values do **not** carry width/height intrinsics. `next/image` (which `ContentSdkImage` wraps) requires either a `width`/`height` pair, a `fill` parent, or those values in the field XML — otherwise it throws at render time.

We hit this in the HCA demo build: ~30 image render sites across the uiim/ component library crashed once Content Hub URLs were authored. We patched those sites with explicit `width`/`height` props or `fill` + a sized parent. That fixed the crash and preserved Experience Editor editability (per rule `02-sitecore-implementation-standards`: never use plain `<img>` for Sitecore-managed fields).

Separately, several upcoming HCA surfaces want to render **video assets** from Content Hub through the same Sitecore Image fields (Content Hub identifies video assets via the `dam-content-type='video'` attribute on the asset). `ContentSdkImage` cannot render `<video>`.

The `gpn` branch introduced a `SmartMedia` wrapper that auto-detects video vs image from the field value and renders `<video>` or `<img>` accordingly, then swapped `ContentSdkImage → SmartMedia` across 15+ files. That branch's `SmartMedia` falls back to plain `<img>` when field-value dims are missing — which is the common case for Content Hub. Adopting that pattern as-is on HCA would silently regress editability across every Content Hub image render and violate the project rule.

## Decision

Introduce a refined `SmartMedia` at `src/components/uiim/media/SmartMedia.tsx`, scoped to **five video-capable surfaces only**:

- `HeroBanner`
- `HeroBannerCarousel` (main slide background only — the small thumbnail stays on `ContentSdkImage`)
- `CTABanner` (the `WithImage` background variant)
- `FeatureHighlight`
- `ArticleHero` (background image only — the 40×40 author avatar stays on `ContentSdkImage`)

Every other uiim/ component — logo clouds, testimonials, card grids, icons, avatars, footer/header marks — **stays on `ContentSdkImage`** with the explicit dim props added in the prior fix. A 48×48 icon slot should not be able to author an autoplay video.

`SmartMedia`'s API extends gpn's with `width`, `height`, `fill`, `sizes`, `priority`, `alt` props that pass through to `ContentSdkImage` on the image branch. This preserves the explicit-dim fix work and means today's `fill` / `width=…` props on the five target files keep working verbatim.

The image branch **never** renders plain `<img>`. When neither the field value carries dims **nor** the caller passes sizing props, `SmartMedia` injects default 1600×900 dims into `ContentSdkImage` and logs a `console.warn`. Editability is preserved on the fallback path. The image may aspect-shift if the real proportions are very different, but `object-cover` masks this on every current use site.

The video branch detects via `field.value['dam-content-type'] === 'video'` first, falling back to a `.mp4|.webm|.mov|.ogg` URL regex. In view mode it renders `<video autoPlay loop muted playsInline>`. In Experience Editor mode (`isEditing=true`) it renders `<video controls preload="metadata">` with **no autoplay** so authors aren't distracted while editing. When `fill=true`, the video element auto-applies `absolute inset-0 h-full w-full object-cover` to mimic `next/image`'s fill behavior.

## Consequences

### Positive

- Video assets render correctly on the five surfaces that need them.
- Today's explicit `width`/`height`/`fill` props on those surfaces survive — no regression.
- No plain `<img>` anywhere — Experience Editor editability stays intact for every image field, including Content Hub uploads missing dims.
- Icons, avatars, logos, and footer marks cannot accidentally render as autoplay videos.
- The `console.warn` on default-dim fallback gives developers a visible signal when the upload pipeline is producing dim-less field values.

### Negative

- Two image-rendering paths exist in the codebase (`SmartMedia` and `ContentSdkImage`). A future contributor may swap `ContentSdkImage → SmartMedia` in a logo/icon component "for consistency" and reintroduce the autoplay-in-icon risk. The scope boundary is documented here and in the SmartMedia source comment.
- When `SmartMedia`'s default-dim fallback fires, the image may aspect-shift slightly. `object-cover` masks this on every current use site, but if a future surface uses `object-contain` or no `object-*` class, layout bugs may appear.
- `<video>` elements bypass `next/image` optimization (no AVIF/WebP transcoding, no responsive `srcset`). Acceptable for the small set of hero/background surfaces that use video; not a strategy for image-heavy surfaces.
- Diverges from the `gpn` branch's `SmartMedia` implementation in two ways: (1) extended API with sizing props, (2) no plain `<img>` fallback. Merging `gpn → main` later will need a manual reconciliation of `SmartMedia.tsx`.

## Alternatives considered

1. **Adopt gpn's `SmartMedia` as-is, swap site-wide.** Rejected — violates the project's "no plain `<img>` for Sitecore fields" rule for every Content Hub image, regresses editability across the whole component library.
2. **Keep `ContentSdkImage` everywhere, refuse video.** Rejected — five surfaces have real video requirements for the HCA demo.
3. **Fix the upload pipeline first** (`docs/ai/scripts/upload-to-content-hub.mjs`) to probe asset dimensions on upload and write `width`/`height` into the Sitecore Image field XML, so `ContentSdkImage` works without explicit props. Deferred as future work — does not solve the video case, and the default-dim fallback handles the gap in the meantime. Once landed, the `console.warn` branch becomes near-dead and the explicit-dim props on non-`SmartMedia` surfaces could be retired.

## Future work

- Update `upload-to-content-hub.mjs` to populate `width`/`height` on Image field XML so the default-dim fallback rarely fires.
- If video is needed on a sixth surface, evaluate whether to extend the scope (and update this ADR) or keep `SmartMedia` constrained to the current five.
- Consider whether the video branch should accept an explicit `poster` prop for Experience Editor previews.
