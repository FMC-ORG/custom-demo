# Phase 4 — Theme Applied

## Files modified

| File | Change |
|------|--------|
| [src/app/globals-brand.css](../../../../src/app/globals-brand.css) | Replaced commented placeholder with Howdens `:root` brand overrides (21 CSS variables) |
| [src/app/layout.tsx](../../../../src/app/layout.tsx) | Added Google Fonts `<link>` for Poppins (500/700/900) and Inter (400/500/600) + preconnect tags |

## Brand variables applied

| Variable | Value | Usage |
|----------|-------|-------|
| `--brand-primary` | `#E2231A` | Howdens rooster red — accent badges, links, focus ring |
| `--brand-secondary` | `#2D3640` | Slate charcoal — hero, dark promo bands |
| `--brand-accent` | `#3CB54A` | Trade green — BOOK A DESIGN APPOINTMENT pill button |
| `--brand-bg` / `--brand-fg` | `#FFFFFF` / `#1F2933` | Default content sections |
| `--brand-muted` | `#F4F5F6` | Real Homes / Buying journey alternating bands |
| `--brand-header-bg` | `#FFFFFF` | Solid white nav |
| `--brand-footer-bg` | `#1A2230` | Deep navy footer |
| `--brand-heading-font` | `'Poppins', sans-serif` | Substitute for Howdens proprietary grotesk |
| `--brand-body-font` | `'Inter', sans-serif` | Body / paragraph text |
| `--brand-button-radius` | `9999px` | Pill buttons (matches green BOOK CTA) |
| `--brand-card-radius` | `0.5rem` | Mild rounding on cards |

## Notes

- Howdens uses a proprietary geometric grotesk on site. Substituted Poppins (closest free equivalent for trade/industrial feel) + Inter for body. Substitution noted in [docs/ai/themes/howdens.theme.yaml](../../themes/howdens.theme.yaml) `extraction.notes`.
- The theme takes effect on next dev server reload — all 18 components reference `var(--brand-*)` so no per-component edits required.
- Trustpilot green (`#00B67A`) and Howdens orange (`#F2784B`) are tracked under `colors.extra` in the theme YAML; the Howdens TestimonialBlock variant uses Trustpilot green inline.
