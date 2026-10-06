# Issue 010: ArticleBody brand tokens and configurable subscribe recipient

**Label:** `ready-for-agent`

## Parent

Discovery findings during the agents restructure (ADR 0007). Independent of it.

## What to build

### ArticleBody uses hardcoded colours and copy
`src/components/uiim/article/ArticleBody.tsx` styles the key-takeaways callout and author link with fixed `blue-*` Tailwind classes, and renders the "Key Takeaways" heading as a hardcoded string. Every other uiim component uses the `--brand-*` CSS variables (`docs/ai/reference/brand-variables.md`), so ArticleBody ignores a client's theme in every demo.

- Replace `border-blue-500`, `bg-blue-50`, `text-blue-*` with brand variables and fallbacks, following the pattern in other uiim components (e.g. `border-[var(--brand-primary)]`, `bg-[var(--brand-muted)]`, `text-[var(--brand-fg)]`, link colour `var(--brand-primary)`).
- Make "Key Takeaways" (and any other visible UI chrome strings in the file) come from the dictionary with an English fallback, using the guarded-lookup pattern from `src/lib/search-ui/useSearchLabels.ts` (missing key → fallback, never `MISSING_MESSAGE`). It is UI chrome, not an authorable field, so a dictionary key — not a template field — is the right home.
- Update `ArticleBody.test.tsx` expectations accordingly; keep all existing variants (Default, WithSidebar, Wide) visually equivalent under the default theme.

### Subscribe route sends to a hardcoded personal address
`src/app/api/subscribe/route.ts` sets `RECIPIENT_EMAIL` to a personal Gmail address and the email body is branded for one past demo client.

- Read the recipient from an environment variable (e.g. `SUBSCRIBE_RECIPIENT_EMAIL`); if it or `RESEND_API_KEY` is missing, respond with a clear 503-style error instead of sending.
- Document it and `RESEND_API_KEY` (currently undocumented) in `.env.remote.example` (no real values).
- Leave the email template content for a separate decision, but note in a code comment that it is demo-specific.

## Acceptance criteria

- [ ] No `blue-*` classes or hardcoded user-facing strings remain in `ArticleBody.tsx`
- [ ] Applying a client `:root` theme in `globals.css` visibly changes the takeaways callout and author link
- [ ] Dictionary lookups never throw on a site without the new keys
- [ ] `/api/subscribe` has no hardcoded email address; missing configuration returns an error without calling Resend
- [ ] `.env.remote.example` documents `SUBSCRIBE_RECIPIENT_EMAIL` and `RESEND_API_KEY`
- [ ] `npm test` and `npm run type-check` pass

## Blocked by

None.
