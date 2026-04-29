# Brand CSS Variable Contract

This document defines the `--brand-*` CSS custom properties that all 18 uiim template components consume. These variables are the bridge between the client theme (extracted by `sitecore-extract-theme`) and the component rendering.

## Architecture

```
globals.css          → @tailwind + defaults in @layer base (:root)
globals-brand.css    → optional: client :root overrides (build-demo Phase 4), imported from globals.css when that import is not dropped
components/*.tsx     → consume via var(--brand-*, fallback)
```

**Priority:** Client `--brand-*` values must **win over** the `@layer base` `:root` in `globals.css`. That usually means either (1) import `globals-brand.css` after the base layer so it loads later, or (2) if Next.js App Router silently omits that import, put the same unlayered `:root { ... }` block **above** `@layer base` in `globals.css` so cascade rules apply. See `docs/ai/skills/sitecore-build-demo.md` Phase 4.

## Complete Variable List

### Colors

| Variable | Purpose | Default source | Used by |
|----------|---------|---------------|---------|
| `--brand-primary` | Primary buttons, active states, links | `--primary` | All 18 components |
| `--brand-primary-foreground` | Text on primary backgrounds | `--primary-foreground` | Buttons, CTAs, badges |
| `--brand-accent` | Highlight color, alert bars, badges | `--accent` | AnnouncementBar, badges |
| `--brand-accent-foreground` | Text on accent backgrounds | `--accent-foreground` | AnnouncementBar |
| `--brand-dark` | Dark background token | `--foreground` | AnnouncementBar, dark sections |
| `--brand-dark-foreground` | Text on dark backgrounds | `--background` | AnnouncementBar, dark sections |
| `--brand-bg` | Page/section background (light) | `--background` | All section backgrounds |
| `--brand-fg` | Primary text color | `--foreground` | All text |
| `--brand-muted` | Alternating section backgrounds, card fills | `--muted` | CTABanner, cards, sections |
| `--brand-muted-foreground` | Secondary text, captions | `--muted-foreground` | TestimonialBlock, descriptions |
| `--brand-border` | Card borders, dividers, input borders | `--border` | TestimonialBlock, cards, forms |

### Section-Specific

| Variable | Purpose | Default source | Used by |
|----------|---------|---------------|---------|
| `--brand-header-bg` | Navigation header background | `--foreground` | NavigationHeader, HeroBanner (dark) |
| `--brand-header-fg` | Navigation header text | `--background` | NavigationHeader, HeroBanner (dark) |
| `--brand-footer-bg` | Footer background | `--foreground` | SiteFooter |
| `--brand-footer-fg` | Footer text and links | `--muted-foreground` | SiteFooter |

### Typography

| Variable | Purpose | Default | Used by |
|----------|---------|---------|---------|
| `--brand-heading-font` | Font family for h1-h6, section titles | `inherit` | 15+ components |
| `--brand-body-font` | Font family for body text, descriptions | `"Open Sans", Arial, sans-serif` | 15+ components |

### Shape

| Variable | Purpose | Default | Used by |
|----------|---------|---------|---------|
| `--brand-button-radius` | Border radius for buttons and CTAs | `var(--radius)` (0.5rem) | HeroBanner, CTABanner, NewsletterSignup |
| `--brand-card-radius` | Border radius for cards and panels | `calc(var(--radius) * 1.5)` (0.75rem) | ProductPricingCards, TestimonialBlock, FeatureCardsGrid |

## How the Theme Extractor Maps Values

The `sitecore-extract-theme` skill extracts values from the client site and maps them:

| Scraper output | Brand variable |
|---------------|----------------|
| `colors.primaryButtonBackground` | `--brand-primary` |
| `colors.primaryButtonColor` | `--brand-primary-foreground` |
| `colors.linkColor` | `--brand-accent` |
| `colors.bodyBackground` | `--brand-bg` |
| `colors.bodyColor` | `--brand-fg` |
| `colors.headerBackground` | `--brand-header-bg` |
| `colors.headerColor` | `--brand-header-fg` |
| `colors.footerBackground` | `--brand-footer-bg` |
| `colors.footerColor` | `--brand-footer-fg` |
| `meta.themeColor` | `--brand-primary` (fallback) |
| `typography.heading.fontFamily` | `--brand-heading-font` |
| `typography.body.fontFamily` | `--brand-body-font` |
| `shape.primaryButtonBorderRadius` | `--brand-button-radius` |
| `shape.cardBorderRadius` | `--brand-card-radius` |

## How to Apply a Client Theme

### Automated (via build-demo pipeline)

Phase 4 of `sitecore-build-demo` generates the CSS variable block from the theme YAML. It is written to `src/app/globals-brand.css` with an `@import` from `globals.css` **when that path works** in your environment. If the App Router CSS pipeline drops the import, write the same block unlayered at the top of `src/app/globals.css` instead (see Phase 4). Restart the dev server after changes.

### Manual

1. Open `src/app/globals-brand.css` (or the client `:root` section at the top of `src/app/globals.css` if you inlined for App Router)
2. Edit the `:root` block with the client's brand colors/fonts
3. If using Google Fonts, add the `<link>` tag to `src/app/layout.tsx`
4. Restart the dev server

### Reverting

Remove or comment out the client `:root` overrides (in `globals-brand.css` and/or the inlined block in `globals.css`). The defaults in `globals.css` (derived from shadcn tokens) take effect immediately.

## Adding New Variables

If a new component needs a brand variable not in this list:

1. Add the variable to `globals.css` with a sensible default derived from an existing shadcn token
2. Add the variable to this contract document
3. Update `docs/ai/templates/client-theme.template.yaml` if the theme extractor should produce it
4. Use the variable in the component with a fallback: `var(--brand-new-var, #fallback)`

## Fallback Pattern

All components use fallbacks for safety:

```tsx
// In className (Tailwind arbitrary values)
className="rounded-[var(--brand-card-radius,0.75rem)]"
className="font-[var(--brand-heading-font,inherit)]"

// In style prop
style={{ backgroundColor: 'var(--brand-primary)' }}
style={{ color: 'var(--brand-fg, #111111)' }}
```

The fallback values in components are last-resort defaults. In practice, `globals.css` always provides values, so the inline fallbacks rarely activate. They exist as a safety net if a variable is accidentally removed.
