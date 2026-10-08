# Issue 009: Component map hygiene

**Label:** `ready-for-agent`

## Parent

Discovery findings during the agents restructure (ADR 0007). Independent of it.

## What to build

`.sitecore/component-map.ts` is generated from everything under `src/components/` except `src/components/content-sdk/*` (`sitecore.cli.config.ts` → `componentMap.exclude`). As a result 28 of its 77 entries are **not Sitecore renderings**:

- shadcn primitives: `input`, `card`, `button`, `badge` (`src/components/ui/`)
- helpers and hooks of the superseded OOTB search: `useSearchField`, `useRouter`, `useParams`, `useEvent`, `useDebounce`, `models`, `constants`, `index`, and `Search*` subcomponents (`src/components/search-experience/search-components/`)
- `SmartMedia` — a wrapper used inside five components, never placed on its own (ADR 0005). It is also the one failure in `npm run agents:validate` (no `Default` export).
- `SitecoreStyles`, `CdpPageView` registered from `src/components/basic/content-sdk/`, a near-identical duplicate of `src/components/content-sdk/` (only a trailing newline differs). `Layout.tsx` and `Scripts.tsx` import the non-basic copy.

These entries bloat the client import map and make `agents:validate` and the manifest cross-check noisy.

**Changes:**
1. Extend `componentMap.exclude` in `sitecore.cli.config.ts` with:
   - `src/components/ui/**`
   - `src/components/search-experience/search-components/**`
   - `src/components/uiim/media/SmartMedia.tsx`
   - `src/components/basic/content-sdk/**`
   - `src/components/**/*.props.ts`, `src/components/**/*.props.tsx` (root project convention)
2. Delete `src/components/basic/content-sdk/` (duplicate). Keep `src/components/content-sdk/`.
3. Regenerate with `npm run sitecore-tools:generate-map`; confirm `.sitecore/component-map.ts` and `component-map.client.ts` no longer list the excluded modules.
4. Keep `SearchExperience` and `SearchExperienceV2` registered — they are superseded (ADR 0006) but removing their code or registration is a separate decision.

## Acceptance criteria

- [ ] Component map lists only renderings (49 entries expected; verify the exact count after regeneration)
- [ ] `npm run agents:validate` passes 100%
- [ ] `src/components/basic/content-sdk/` removed; `Layout.tsx`/`Scripts.tsx` still import `components/content-sdk/*`
- [ ] `npm run build` (or `type-check` + `next:build`) succeeds; `npm test` passes
- [ ] A page using `SmartMedia` surfaces (HeroBanner, ArticleHero) still renders images and videos in normal and editing modes
- [ ] Quick manifest validation (`sitecore-manifest`, validate mode) component-map check passes

## Blocked by

None.
